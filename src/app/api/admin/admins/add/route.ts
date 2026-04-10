import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

/**
 * Promote an existing user to admin.
 *
 * - Owner role only.
 * - Step-up required (destructive in the sense that it grants superpowers).
 * - The user must already have a WhichAi account; we look them up by
 *   email via the service-role auth admin API.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'owner', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = body?.role;

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }
  if (!['owner', 'support', 'moderator'].includes(role)) {
    return NextResponse.json({ error: 'invalid role' }, { status: 400 });
  }

  const client = createAdminClient();

  // Find the existing user by email. Supabase's admin API exposes a
  // listUsers endpoint that supports filtering. We paginate because the
  // built-in filter is not always reliable across versions.
  let targetUserId: string | null = null;
  try {
    // First try the direct-lookup call if available in this SDK version.
    const directLookup = (client.auth.admin as unknown as {
      getUserByEmail?: (e: string) => Promise<{ data: { user: { id: string } | null } | null }>;
    }).getUserByEmail;
    if (typeof directLookup === 'function') {
      const { data } = await directLookup.call(client.auth.admin, email);
      targetUserId = data?.user?.id || null;
    }
  } catch {
    /* fall through to listUsers */
  }

  if (!targetUserId) {
    // Fall back to paginated listUsers — slow but universal.
    const perPage = 1000;
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await client.auth.admin.listUsers({ page, perPage });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const match = data.users.find((u) => (u.email || '').toLowerCase() === email);
      if (match) {
        targetUserId = match.id;
        break;
      }
      if (data.users.length < perPage) break;
    }
  }

  if (!targetUserId) {
    return NextResponse.json(
      {
        error:
          'No user found with that email. They must create a WhichAi account first.',
      },
      { status: 404 }
    );
  }

  // Upsert into the admins table. If they already exist, update the role.
  const { error: upsertError } = await client
    .from('admins')
    .upsert(
      { user_id: targetUserId, role, created_by: guard.userId },
      { onConflict: 'user_id' }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  await logAdminAction(guard, 'admin.add', {
    targetType: 'admin',
    targetId: targetUserId,
    metadata: { email, role },
  });

  return NextResponse.json({ ok: true, user_id: targetUserId });
}
