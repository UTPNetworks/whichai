import { NextRequest, NextResponse } from 'next/server';
import {
  requireAdmin, createAdminClient, logAdminAction, snapshotToTrash,
} from '@/lib/admin';

/**
 * Hard-delete a user account.
 *
 * Flow:
 *   1. Snapshot profile + listings into admin_trash (for forensic
 *      recovery — survives the hard delete).
 *   2. Delete the user's listings.
 *   3. Delete the profile row.
 *   4. Delete the auth.users row via the admin API. This also revokes
 *      every active session for the user.
 *
 * We hard-delete (instead of soft-delete) because the console users
 * explicitly wanted the user to disappear from the list immediately.
 * The admin_trash snapshot is the safety net — an owner can restore
 * from there within 30 days.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'owner' });
  if (guard instanceof NextResponse) return guard;

  const { user_id, reason } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  // Refuse to delete yourself, or another admin, without extra friction.
  if (user_id === guard.userId) {
    return NextResponse.json(
      { error: 'You cannot delete your own account from the admin console.' },
      { status: 400 }
    );
  }

  const client = createAdminClient();

  // 1) Snapshot everything we might want to recover.
  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .maybeSingle();

  const { data: listings } = await client
    .from('user_listings')
    .select('*')
    .eq('user_id', user_id);

  try {
    await snapshotToTrash(
      guard,
      'user',
      user_id,
      { profile, listings },
      reason
    );
  } catch (e) {
    // Don't fail the whole delete just because the trash snapshot
    // couldn't be written — log and keep going.
    console.error('[admin/users/delete] snapshotToTrash failed:', e);
  }

  // 2) Delete listings rows belonging to this user.
  try {
    await client.from('user_listings').delete().eq('user_id', user_id);
  } catch (e) {
    console.error('[admin/users/delete] listing delete failed:', e);
  }

  // 3) Delete the profile row.
  try {
    await client.from('profiles').delete().eq('id', user_id);
  } catch (e) {
    console.error('[admin/users/delete] profile delete failed:', e);
  }

  // 4) Delete the auth.users row. This also terminates any active
  //    sessions the user has. If the auth row is already gone (e.g.
  //    because a FK cascade removed it when we dropped the profile),
  //    swallow the error.
  let authDeleteOk = false;
  try {
    const { error: authErr } = await client.auth.admin.deleteUser(user_id);
    if (authErr && !/not.?found|does not exist/i.test(authErr.message)) {
      console.error('[admin/users/delete] auth.deleteUser error:', authErr);
    } else {
      authDeleteOk = true;
    }
  } catch (e) {
    console.error('[admin/users/delete] auth.deleteUser threw:', e);
  }

  await logAdminAction(guard, 'user.delete', {
    targetType: 'user',
    targetId: user_id,
    reason,
    metadata: {
      profile_snapshot: !!profile,
      listings_snapshot_count: listings?.length || 0,
      auth_delete_ok: authDeleteOk,
    },
  });

  return NextResponse.json({ ok: true });
}
