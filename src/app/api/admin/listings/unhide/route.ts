import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'moderator' });
  if (guard instanceof NextResponse) return guard;

  const { listing_id } = await req.json();
  if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });

  const client = createAdminClient();
  const { error } = await client
    .from('user_listings')
    .update({
      hidden: false,
      hidden_reason: null,
      hidden_by: null,
      hidden_at: null,
    })
    .eq('id', listing_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(guard, 'listing.unhide', {
    targetType: 'listing',
    targetId: listing_id,
  });

  return NextResponse.json({ ok: true });
}
