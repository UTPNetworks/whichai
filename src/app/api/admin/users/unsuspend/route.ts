import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'moderator' });
  if (guard instanceof NextResponse) return guard;

  const { user_id } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const client = createAdminClient();
  const { error } = await client
    .from('profiles')
    .update({
      suspended: false,
      suspended_until: null,
      suspension_reason: null,
    })
    .eq('id', user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(guard, 'user.unsuspend', {
    targetType: 'user',
    targetId: user_id,
  });

  return NextResponse.json({ ok: true });
}
