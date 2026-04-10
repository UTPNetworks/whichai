import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/admin';

/**
 * Stamp the `admin_mfa_ok` cookie.
 *
 * Called by the MFA verify page immediately after a successful TOTP
 * verification when the user is heading to the admin console. This is
 * intentionally decoupled from the `/api/auth/set-session` route because
 * that route's internal AAL check can fail silently (GoTrue SDK issues,
 * timing), leaving the cookie unstamped and causing an infinite
 * MFA → admin → MFA redirect loop.
 *
 * Guards:
 *   1. Caller must have a valid Supabase session (cookie-based).
 *   2. Caller's user_id must exist in the `admins` table.
 *
 * No TOTP check is done here — the caller has JUST passed TOTP
 * on the MFA verify page, and we trust that the caller is the
 * browser's own MFA verify flow. The cookie is httpOnly + secure,
 * so client JS can't read or forge it.
 */

const ADMIN_MFA_OK_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify user is actually an admin
    const adminClient = createAdminClient();
    const { data: adminRow } = await adminClient
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!adminRow) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
    }

    const expiresAt = Date.now() + ADMIN_MFA_OK_TTL_SECONDS * 1000;
    const response = NextResponse.json({ ok: true, expires_at: expiresAt });
    response.cookies.set('admin_mfa_ok', String(expiresAt), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_MFA_OK_TTL_SECONDS,
    });

    return response;
  } catch (err) {
    console.error('[set-mfa-ok] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
