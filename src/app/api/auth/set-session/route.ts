import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/** 24 hours — how long a successful MFA verification keeps the admin
 *  console accessible before another TOTP challenge is required. Must be
 *  short enough to matter, long enough that a token refresh inside the
 *  window doesn't lock the admin out (Supabase refresh tokens drop aal2
 *  back to aal1, which is the root cause this cookie exists to paper over).
 */
const ADMIN_MFA_OK_TTL_SECONDS = 60 * 60 * 24;

/**
 * Persist a fresh Supabase session (access_token + refresh_token) into
 * the SSR cookie store.
 *
 * This exists specifically for flows that obtain new tokens via direct
 * REST calls to the Supabase auth factors verify endpoint — the browser-side
 * `supabase.auth.setSession(...)` helper would be the natural choice,
 * but it acquires the GoTrue internal lock, which this codebase has
 * been systematically bypassing everywhere for deadlock reasons. Doing
 * the setSession in a server route handler uses a fresh SSR client per
 * request, so there's no shared-lock state to hang on.
 *
 * When the new session is at aal2 (i.e. this came from a successful MFA
 * verify), we also stamp an `admin_mfa_ok` cookie. The admin layout
 * accepts that cookie in lieu of a live aal2 claim because Supabase
 * refresh tokens silently downgrade sessions back to aal1 — without this
 * cookie, admins would get kicked back to the MFA gate on every access
 * token expiry (typically once an hour).
 */
export async function POST(req: NextRequest) {
  let body: { access_token?: string; refresh_token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { access_token, refresh_token } = body || {};
  if (!access_token || !refresh_token) {
    return NextResponse.json(
      { error: 'access_token and refresh_token are required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Detect whether this new session is at aal2 (i.e. came from a fresh
  // TOTP verify). If so, stamp the long-lived MFA-ok cookie. We check the
  // assurance level via the SDK (server-side, fresh client, no shared
  // lock). If the check fails or returns something other than aal2, the
  // cookie is left alone and the user continues under whatever previous
  // MFA state they had.
  const response = NextResponse.json({ ok: true });
  try {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === 'aal2') {
      const expiresAt = Date.now() + ADMIN_MFA_OK_TTL_SECONDS * 1000;
      response.cookies.set('admin_mfa_ok', String(expiresAt), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: ADMIN_MFA_OK_TTL_SECONDS,
      });
    }
  } catch {
    /* non-fatal — worst case admin re-verifies MFA sooner than necessary */
  }

  return response;
}
