import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

/**
 * Remove an admin. The user's account stays; they just lose admin access.
 * Owner-only. Step-up required. You can't remove yourself (footgun guard).
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'owner', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const userId = body?.user_id;
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }
  if (userId === guard.userId) {
    return NextResponse.json(
      { error: "You can't remove yourself. Ask another owner to do it." },
      { status: 400 }
    );
  }

  const client = createAdminClient();

  // Safety check: never leave the site with zero owners.
  const { data: targetRow } = await client
    .from('admins')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  if (targetRow?.role === 'owner') {
    const { count: ownerCount } = await client
      .from('admins')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'owner');
    if ((ownerCount || 0) <= 1) {
      return NextResponse.json(
        { error: 'Cannot remove the last remaining owner. Promote someone else first.' },
        { status: 400 }
      );
    }
  }

  const { error } = await client.from('admins').delete().eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Immediately invalidate their session so they lose access right away.
  try {
    await client.auth.admin.signOut(userId, 'global');
  } catch {
    /* best-effort */
  }

  await logAdminAction(guard, 'admin.remove', {
    targetType: 'admin',
    targetId: userId,
  });

  return NextResponse.json({ ok: true });
}
