import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

/**
 * Impersonation:
 * We DO NOT mint a real session for the target user (that would be
 * full-blown account takeover if abused). Instead we set a
 * `admin_impersonating` cookie carrying the target email. The admin layout
 * and any page that checks this cookie can show the banner + use the
 * target's ID in read-only views.
 *
 * For write operations the admin stays authenticated as themselves — the
 * target's sessions are untouched. This gives us "shadow browse" without
 * any credential risk.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'support' });
  if (guard instanceof NextResponse) return guard;

  const { user_id } = await req.json();
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const client = createAdminClient();
  const { data: profile } = await client
    .from('profiles')
    .select('id, email, username')
    .eq('id', user_id)
    .single();

  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await logAdminAction(guard, 'user.impersonate_start', {
    targetType: 'user',
    targetId: user_id,
    metadata: { target_email: profile.email },
  });

  const res = NextResponse.json({ ok: true, target: profile });
  res.cookies.set('admin_impersonating', profile.email || user_id, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour cap
    path: '/',
  });
  res.cookies.set('admin_impersonating_id', user_id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60,
    path: '/',
  });
  return res;
}
