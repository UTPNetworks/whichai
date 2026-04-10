import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'moderator' });
  if (guard instanceof NextResponse) return guard;

  const { user_id } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const client = createAdminClient();
  const { error, count } = await client
    .from('user_listings')
    .update({
      hidden: true,
      hidden_reason: 'bulk hide by admin',
      hidden_by: guard.userId,
      hidden_at: new Date().toISOString(),
    }, { count: 'exact' })
    .eq('user_id', user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(guard, 'user.hide_all_listings', {
    targetType: 'user',
    targetId: user_id,
    metadata: { count },
  });

  return NextResponse.json({ ok: true, count });
}
