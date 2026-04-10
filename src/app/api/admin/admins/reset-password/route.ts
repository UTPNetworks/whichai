import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

/**
 * Trigger a Supabase password-recovery email for another admin.
 * Owner-only. Step-up required.
 *
 * We use the admin-side `generateLink({ type: 'recovery' })` which both
 * creates the recovery link AND delivers it via the configured SMTP if
 * the project has email sending enabled. Falls back to
 * `resetPasswordForEmail` if the admin API call fails for any reason.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'owner', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const userId = body?.user_id;
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  const client = createAdminClient();

  // Look up the target admin's email so we can send them a recovery link.
  const { data: userRes, error: lookupError } = await client.auth.admin.getUserById(userId);
  if (lookupError || !userRes?.user) {
    return NextResponse.json(
      { error: lookupError?.message || 'User not found' },
      { status: 404 }
    );
  }
  const email = userRes.user.email;
  if (!email) {
    return NextResponse.json(
      { error: 'Target user has no email on file.' },
      { status: 400 }
    );
  }

  // Prefer the admin API: it generates the link AND sends the email
  // (if SMTP is configured) without requiring a logged-in session.
  let sent = false;
  try {
    const { error } = await client.auth.admin.generateLink({
      type: 'recovery',
      email,
    });
    if (!error) sent = true;
  } catch {
    /* fall through */
  }

  if (!sent) {
    // Fallback — requires public site to have recovery URL set up.
    const origin = req.headers.get('origin') || undefined;
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: origin ? `${origin}/auth/reset-password` : undefined,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await logAdminAction(guard, 'admin.reset_password', {
    targetType: 'admin',
    targetId: userId,
    metadata: { email },
  });

  return NextResponse.json({ ok: true });
}
