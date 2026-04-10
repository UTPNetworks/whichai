import { NextRequest, NextResponse } from 'next/server';
import {
  requireAdmin, createAdminClient, logAdminAction, snapshotToTrash,
} from '@/lib/admin';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'moderator', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const { listing_id, reason } = await req.json();
  if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });

  const client = createAdminClient();

  // Snapshot the listing to admin_trash first so we can restore within 30 days
  const { data: listing } = await client
    .from('user_listings')
    .select('*')
    .eq('id', listing_id)
    .single();

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

  await snapshotToTrash(guard, 'listing', listing_id, listing, reason);

  // Soft-delete: mark deleted_at and hide from public views
  const { error } = await client
    .from('user_listings')
    .update({
      deleted_at: new Date().toISOString(),
      hidden: true,
      hidden_reason: reason || 'Deleted by admin',
      hidden_by: guard.userId,
      hidden_at: new Date().toISOString(),
    })
    .eq('id', listing_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(guard, 'listing.delete', {
    targetType: 'listing',
    targetId: listing_id,
    reason,
    metadata: { title: listing.title, user_id: listing.user_id },
  });

  return NextResponse.json({ ok: true });
}
