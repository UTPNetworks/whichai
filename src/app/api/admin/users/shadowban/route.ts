import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'moderator', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const { user_id, shadowban } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const client = createAdminClient();
  const { error } = await client
    .from('profiles')
    .update({ shadowbanned: !!shadowban })
    .eq('id', user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(guard, shadowban ? 'user.shadowban' : 'user.unshadowban', {
    targetType: 'user',
    targetId: user_id,
  });

  return NextResponse.json({ ok: true });
}
