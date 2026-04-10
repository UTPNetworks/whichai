import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

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

  return NextResponse.json({ ok: true });
}
