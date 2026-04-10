import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient, logAdminAction } from '@/lib/admin';

/**
 * Clear all MFA factors for another admin.
 *
 * Owner-only. Step-up required. After this runs, the target admin will
 * be forced back through `/admin/setup-mfa` the next time they log in,
 * because the `(protected)` layout redirects anyone without a verified
 * factor to the setup page.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin({ role: 'owner', stepUp: true });
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const userId = body?.user_id;
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  const client = createAdminClient();

  // List factors for this user. The service-role admin API exposes
  // `mfa.listFactors`, but availability varies by SDK version, so we
  // also fall back to reading them off the user record itself.
  let factorIds: string[] = [];
  try {
    const listFactors = (
      client.auth.admin as unknown as {
        mfa?: {
          listFactors?: (args: { userId: string }) => Promise<{
            data?: { factors?: Array<{ id: string }> } | null;
            error?: { message: string } | null;
          }>;
        };
      }
    ).mfa?.listFactors;
    if (typeof listFactors === 'function') {
      const { data } = await listFactors.call(client.auth.admin, { userId });
      factorIds = (data?.factors || []).map((f) => f.id);
    }
  } catch {
    /* fall through */
  }

  if (factorIds.length === 0) {
    // Fallback: pull factors from the user record directly.
    try {
      const { data: userRes } = await client.auth.admin.getUserById(userId);
      const rawFactors =
        (userRes?.user as unknown as { factors?: Array<{ id: string }> })
          ?.factors || [];
      factorIds = rawFactors.map((f) => f.id);
    } catch {
      /* keep empty */
    }
  }

  // Delete each factor via the admin API. Some SDK versions expose
  // `deleteFactor({ userId, id })`, others only accept `id`.
  const errors: string[] = [];
  for (const id of factorIds) {
    try {
      const deleteFactor = (
        client.auth.admin as unknown as {
          mfa?: {
            deleteFactor?: (
              args: { userId?: string; id: string } | string
            ) => Promise<{ error?: { message: string } | null }>;
          };
        }
      ).mfa?.deleteFactor;
      if (typeof deleteFactor === 'function') {
        const { error } = await deleteFactor.call(client.auth.admin, {
          userId,
          id,
        });
        if (error) errors.push(error.message);
      } else {
        errors.push('deleteFactor API not available in this SDK');
        break;
      }
    } catch (err) {
      errors.push((err as Error).message);
    }
  }

  // Kick the user out so they're forced to re-enroll on next login.
  try {
    await client.auth.admin.signOut(userId, 'global');
  } catch {
    /* best-effort */
  }

  await logAdminAction(guard, 'admin.reset_mfa', {
    targetType: 'admin',
    targetId: userId,
    metadata: { cleared: factorIds.length, errors: errors.length ? errors : undefined },
  });

  if (errors.length && factorIds.length && errors.length === factorIds.length) {
    return NextResponse.json(
      { error: `Failed to clear factors: ${errors.join('; ')}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, cleared: factorIds.length });
}
