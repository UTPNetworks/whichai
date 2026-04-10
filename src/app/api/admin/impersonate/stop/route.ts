import { NextRequest, NextResponse } from 'next/server';
import { getAdminIdentity, logAdminAction } from '@/lib/admin';
import { cookies } from 'next/headers';

async function stopImpersonating() {
  const identity = await getAdminIdentity();
  if (!identity) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const cookieStore = await cookies();
  const targetId = cookieStore.get('admin_impersonating_id')?.value || null;

  await logAdminAction(identity, 'user.impersonate_stop', {
    targetType: 'user',
    targetId,
  });

  return identity;
}

export async function POST() {
  const result = await stopImpersonating();
  if (result instanceof NextResponse) return result;

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_impersonating', '', { maxAge: 0, path: '/' });
  res.cookies.set('admin_impersonating_id', '', { maxAge: 0, path: '/' });
  return res;
}

// Also support GET so the "Exit" link in the impersonation banner just works.
export async function GET(req: NextRequest) {
  const result = await stopImpersonating();
  if (result instanceof NextResponse) return result;

  const url = new URL('/admin', req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set('admin_impersonating', '', { maxAge: 0, path: '/' });
  res.cookies.set('admin_impersonating_id', '', { maxAge: 0, path: '/' });
  return res;
}
