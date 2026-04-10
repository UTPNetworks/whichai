import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

/**
 * Change an admin's role. Owner-only. Step-up required. Can't demote the
 * last remaining owner.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'owner', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const userId = body?.user_id;
  const role = body?.role;
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }
  if (!['owner', 'support', 'moderator'].includes(role)) {
    return NextResponse.json({ error: 'invalid role' }, { status: 400 });
  }

  const client = createAdminClient();

  // If demoting an owner, make sure we aren't orphaning the site.
  if (role !== 'owner') {
    const { data: existing } = await client
      .from('admins')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    if (existing?.role === 'owner') {
      const { count: ownerCount } = await client
        .from('admins')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'owner');
      if ((ownerCount || 0) <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last remaining owner.' },
          { status: 400 }
        );
      }
    }
  }

  const { error } = await client
    .from('admins')
    .update({ role })
    .eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(guard, 'admin.change_role', {
    targetType: 'admin',
    targetId: userId,
    metadata: { new_role: role },
  });

  return NextResponse.json({ ok: true });
}
