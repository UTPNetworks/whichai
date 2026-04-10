import { NextResponse } from 'next/server';

/**
 * Legacy step-up endpoint.
 *
 * Step-up TOTP verification is no longer enforced. The admin area is
 * already MFA-gated at the layout level, and an additional per-action
 * TOTP prompt was causing friction + false "Not authorized" errors
 * whenever the Supabase session refresh-token cycle silently downgraded
 * the session's aal.
 *
 * These endpoints are kept as no-ops purely so that any stale clients
 * don't error out — POST always returns success, DELETE always returns
 * success.
 */

export async function POST() {
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  return NextResponse.json({ ok: true, expires_at: expiry });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_stepup', '', { maxAge: 0, path: '/' });
  return res;
}
