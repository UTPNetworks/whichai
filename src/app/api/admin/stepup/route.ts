import { NextRequest, NextResponse } from 'next/server';
import { getAdminIdentity, logAdminAction } from '@/lib/admin';
import { createClient as createServerClient } from '@/lib/supabase-server';

/**
 * Step-up verification.
 * The admin POSTs a fresh TOTP code; on success we set an `admin_stepup`
 * cookie carrying the expiry epoch (ms). Destructive route handlers check
 * this cookie via requireAdmin({ stepUp: true }).
 *
 * The cookie expires after 5 minutes — every truly destructive action
 * requires a fresh TOTP, which is the whole point of step-up.
 */
const STEPUP_TTL_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { code } = await req.json();
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'TOTP code required' }, { status: 400 });
  }

  // Use the user's own session client to challenge & verify.
  const supabase = await createServerClient();
  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError) return NextResponse.json({ error: factorsError.message }, { status: 500 });

  const totp = factors?.totp?.find((f: { status: string }) => f.status === 'verified');
  if (!totp) {
    return NextResponse.json(
      { error: 'No verified TOTP factor on this admin account. Enroll one in /auth/security first.' },
      { status: 400 }
    );
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totp.id });
  if (challengeError || !challenge) {
    return NextResponse.json({ error: challengeError?.message || 'Challenge failed' }, { status: 500 });
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: totp.id,
    challengeId: challenge.id,
    code,
  });
  if (verifyError) {
    return NextResponse.json({ error: verifyError.message || 'Invalid code' }, { status: 401 });
  }

  const expiry = Date.now() + STEPUP_TTL_MS;
  const res = NextResponse.json({ ok: true, expires_at: expiry });
  res.cookies.set('admin_stepup', String(expiry), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Math.floor(STEPUP_TTL_MS / 1000),
    path: '/',
  });

  await logAdminAction(identity, 'admin.stepup_verify', {
    targetType: 'admin',
    targetId: identity.userId,
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_stepup', '', { maxAge: 0, path: '/' });
  return res;
}
