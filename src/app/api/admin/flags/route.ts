import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

const ALLOWED_KEYS = new Set([
  'site_kill_switch',
  'read_only_mode',
  'signups_disabled',
  'marketplace_frozen',
  'oauth_google_disabled',
  'forums_disabled',
  'comments_disabled',
  'ai_compare_disabled',
  'maintenance_banner',
  'jwt_min_issued_at',
]);

// Flags that require owner role (the nuclear ones)
const OWNER_ONLY = new Set([
  'site_kill_switch',
  'jwt_min_issued_at',
]);

export async function POST(req: NextRequest) {
  const { key, value } = await req.json();

  if (!key || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: 'invalid flag key' }, { status: 400 });
  }

  const role = OWNER_ONLY.has(key) ? 'owner' : 'support';
  const stepUp = key !== 'maintenance_banner'; // banner text isn't destructive

  const guard = await requireAdmin({ role, stepUp });
  if (guard instanceof NextResponse) return guard;

  const client = createAdminClient();
  const { error } = await client
    .from('system_flags')
    .update({
      [key]: value,
      updated_at: new Date().toISOString(),
      updated_by: guard.email,
    })
    .eq('id', 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(guard, `flag.${key}`, {
    targetType: 'flag',
    targetId: key,
    metadata: { value },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const client = createAdminClient();
  const { data, error } = await client.from('system_flags').select('*').eq('id', 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ flags: data });
}
