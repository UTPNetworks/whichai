import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase-server';

/**
 * Sign an admin out of the admin subdomain. Clears the Supabase session
 * cookies and the step-up cookie, then redirects to /admin/login.
 *
 * Supports GET (for plain <a href> links in the sidebar) and POST
 * (for fetch() callers).
 */
async function doSignout() {
  const supabase = await createServerClient();
  try {
    await supabase.auth.signOut();
  } catch {
    /* best-effort — we still clear the cookies below */
  }
  const res = NextResponse.redirect(new URL('/admin/login', 'https://placeholder'), { status: 303 });
  res.cookies.set('admin_stepup', '', { maxAge: 0, path: '/' });
  res.cookies.set('admin_impersonating', '', { maxAge: 0, path: '/' });
  res.cookies.set('admin_mfa_ok', '', { maxAge: 0, path: '/' });
  return res;
}

// Using absolute URLs in redirects is finicky across hosts; use a relative
// path response that the browser will resolve against the current origin.
function relativeRedirect(path: string) {
  const res = new NextResponse(null, { status: 303, headers: { Location: path } });
  res.cookies.set('admin_stepup', '', { maxAge: 0, path: '/' });
  res.cookies.set('admin_impersonating', '', { maxAge: 0, path: '/' });
  res.cookies.set('admin_mfa_ok', '', { maxAge: 0, path: '/' });
  return res;
}

export async function GET() {
  const supabase = await createServerClient();
  try {
    await supabase.auth.signOut();
  } catch {
    /* noop */
  }
  return relativeRedirect('/admin/login');
}

export async function POST() {
  const supabase = await createServerClient();
  try {
    await supabase.auth.signOut();
  } catch {
    /* noop */
  }
  return NextResponse.json({ ok: true });
}
