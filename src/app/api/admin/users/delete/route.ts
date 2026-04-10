import { NextRequest, NextResponse } from 'next/server';
import {
  requireAdmin, createAdminClient, logAdminAction, snapshotToTrash,
} from '@/lib/admin';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'owner', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const { user_id, reason } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const client = createAdminClient();

  // Snapshot the profile and listings into admin_trash first
  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();
  const { data: listings } = await client
    .from('user_listings')
    .select('*')
    .eq('user_id', user_id);

  await snapshotToTrash(
    guard,
    'user',
    user_id,
    { profile, listings },
    reason
  );

  // Soft-delete: mark profile and listings, revoke sessions. We DO NOT
  // delete the auth.users row — that's a 30-day wait for permanent purge.
  const nowIso = new Date().toISOString();
  await client.from('profiles').update({ deleted_at: nowIso, suspended: true }).eq('id', user_id);
  await client.from('user_listings').update({ deleted_at: nowIso, hidden: true }).eq('user_id', user_id);

  try {
    await client.auth.admin.signOut(user_id, 'global');
  } catch (e) {
    console.error('[admin] signout during delete failed:', e);
  }

  await logAdminAction(guard, 'user.delete', {
    targetType: 'user',
    targetId: user_id,
    reason,
    metadata: {
      profile_snapshot: !!profile,
      listings_snapshot_count: listings?.length || 0,
    },
  });

  return NextResponse.json({ ok: true });
}
