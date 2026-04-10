import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'moderator', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const { user_id, reason, duration_hours } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const suspendedUntil = duration_hours
    ? new Date(Date.now() + duration_hours * 3600 * 1000).toISOString()
    : null;

  const client = createAdminClient();
  const { error } = await client
    .from('profiles')
    .update({
      suspended: true,
      suspended_until: suspendedUntil,
      suspension_reason: reason || null,
    })
    .eq('id', user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also invalidate their sessions so they're immediately signed out
  try {
    await client.auth.admin.signOut(user_id, 'global');
  } catch (e) {
    console.error('[admin] failed to sign out user:', e);
  }

  await logAdminAction(guard, 'user.suspend', {
    targetType: 'user',
    targetId: user_id,
    reason,
    metadata: { duration_hours },
  });

  return NextResponse.json({ ok: true });
}
