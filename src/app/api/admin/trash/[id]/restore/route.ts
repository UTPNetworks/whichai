import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin({ role: 'support' });
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const client = createAdminClient();

  const { data: item, error: fetchError } = await client
    .from('admin_trash')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Trash entry not found' }, { status: 404 });
  }

  if (item.resource_type === 'user') {
    // Restore the user profile and listings
    const { error } = await client
      .from('profiles')
      .update({
        deleted_at: null,
        suspended: false,
        suspended_until: null,
        suspension_reason: null,
      })
      .eq('id', item.resource_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Best-effort: undelete listings that were soft-deleted at the same time
    await client
      .from('user_listings')
      .update({
        deleted_at: null,
        hidden: false,
        hidden_reason: null,
        hidden_by: null,
        hidden_at: null,
      })
      .eq('user_id', item.resource_id);
  } else if (item.resource_type === 'listing') {
    const { error } = await client
      .from('user_listings')
      .update({
        deleted_at: null,
        hidden: false,
        hidden_reason: null,
        hidden_by: null,
        hidden_at: null,
      })
      .eq('id', item.resource_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: 'Unknown resource type' }, { status: 400 });
  }

  // Remove from trash
  await client.from('admin_trash').delete().eq('id', id);

  await logAdminAction(guard, 'trash.restore', {
    targetType: item.resource_type as 'user' | 'listing',
    targetId: item.resource_id,
    metadata: { trash_id: id },
  });

  return NextResponse.json({ ok: true });
}
