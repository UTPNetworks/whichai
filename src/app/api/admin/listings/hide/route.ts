import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'moderator' });
  if (guard instanceof NextResponse) return guard;

  const { listing_id, reason } = await req.json();
  if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });

  const client = createAdminClient();
  const { error } = await client
    .from('user_listings')
    .update({
      hidden: true,
      hidden_reason: reason || null,
      hidden_by: guard.userId,
      hidden_at: new Date().toISOString(),
    })
    .eq('id', listing_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(guard, 'listing.hide', {
    targetType: 'listing',
    targetId: listing_id,
    reason,
  });

  return NextResponse.json({ ok: true });
}
