/**
 * Server-side admin helpers.
 *
 * This file is ONLY safe to import from Route Handlers, Server Components,
 * or Server Actions. It uses the Supabase service role key, which must
 * never reach the browser.
 */
import 'server-only';
import { createClient as createServerClient } from './supabase-server';
import { createClient as createJsClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-only Supabase client with service-role privileges.
 * Bypasses RLS. Use with caution and always after an admin identity check.
 */
export function createAdminClient() {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createJsClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type AdminRole = 'owner' | 'support' | 'moderator';

export interface AdminIdentity {
  userId: string;
  email: string;
  role: AdminRole;
  /** 'aal1' (password only) or 'aal2' (password + MFA verified this session) */
  aal: 'aal1' | 'aal2' | null;
  /** True if this user already has a verified TOTP factor enrolled. */
  hasMfaFactor: boolean;
}

/**
 * Resolve the current admin from the request cookies.
 * Returns null if the caller is not signed in or not in the admins table.
 *
 * Detects MFA assurance level correctly:
 *   - aal1 = signed in with password only
 *   - aal2 = password + MFA challenge verified in the current session
 */
export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const supabase = await createServerClient();

  // getUser() is the only critical call — if it fails, we can't identify
  // the caller. The middleware session refresh should keep the token fresh,
  // but wrap in try-catch for safety.
  let user;
  try {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('[getAdminIdentity] getUser() error:', userError.message);
    }
    user = data.user;
  } catch (err) {
    console.error('[getAdminIdentity] getUser() threw:', err);
    return null;
  }
  if (!user) {
    console.error('[getAdminIdentity] getUser() returned null user (no session in cookies)');
    return null;
  }

  // MFA checks are best-effort — if they fail or hang, we still want to
  // return the identity. The layout + admin_mfa_ok cookie handle MFA
  // gating independently of these fields.
  let aal: 'aal1' | 'aal2' | null = null;
  let hasMfaFactor = false;

  // Run both MFA checks in parallel with a hard 3s timeout so a hung
  // GoTrue call never blocks the page render.
  try {
    const timeout = <T>(p: Promise<T>, ms: number): Promise<T | null> =>
      Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

    const [aalResult, factorsResult] = await Promise.all([
      timeout(supabase.auth.mfa.getAuthenticatorAssuranceLevel(), 3000),
      timeout(supabase.auth.mfa.listFactors(), 3000),
    ]);

    if (aalResult && 'data' in aalResult) {
      const aalData = (aalResult as { data?: { currentLevel?: string } }).data;
      aal = (aalData?.currentLevel as 'aal1' | 'aal2' | undefined) || null;
    }

    if (factorsResult && 'data' in factorsResult) {
      const factors = (factorsResult as { data?: { totp?: Array<{ status: string }> } }).data;
      hasMfaFactor = !!factors?.totp?.some((f) => f.status === 'verified');
    }
  } catch {
    // Both fields keep their defaults (null / false). The layout
    // will fall back to the admin_mfa_ok cookie for MFA gating.
  }

  // Check the admins table using the service-role client.
  const admin = createAdminClient();
  const { data: adminRow, error } = await admin
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[getAdminIdentity] admins table query error:', error.message);
    return null;
  }
  if (!adminRow) {
    console.error('[getAdminIdentity] user', user.id, user.email, 'has no row in admins table');
    return null;
  }

  return {
    userId: user.id,
    email: user.email || '',
    role: adminRow.role as AdminRole,
    aal,
    hasMfaFactor,
  };
}

/**
 * Guard a Route Handler — returns the admin identity or a 403 response.
 * Usage:
 *   const guard = await requireAdmin({ role: 'owner', mfaRequired: true });
 *   if (guard instanceof NextResponse) return guard;
 *   const admin = guard;
 */
export async function requireAdmin(options: {
  role?: AdminRole;
  mfaRequired?: boolean;
  /**
   * @deprecated Step-up TOTP is no longer enforced per-action. Once an admin
   * has passed MFA at login (tracked via the `admin_mfa_ok` cookie / aal2
   * session), every destructive action runs without an additional prompt.
   * This option is kept in the signature so existing callers keep compiling,
   * but it is a no-op.
   */
  stepUp?: boolean;
} = {}): Promise<AdminIdentity | NextResponse> {
  const identity = await getAdminIdentity();
  if (!identity) {
    console.error('[requireAdmin] identity is null — returning 403. Options:', JSON.stringify(options));
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (options.role) {
    const rank: Record<AdminRole, number> = { moderator: 1, support: 2, owner: 3 };
    if (rank[identity.role] < rank[options.role]) {
      return NextResponse.json(
        { error: `Requires ${options.role} role` },
        { status: 403 }
      );
    }
  }

  // MFA-at-login is sufficient. We do NOT re-check aal here, because
  // Supabase silently downgrades aal2 → aal1 on token refresh roughly once
  // an hour — which would lock admins out of destructive actions mid-session
  // for no good reason. The admin area is already MFA-gated at the layout,
  // using a long-lived `admin_mfa_ok` cookie stamped on successful TOTP
  // verify (see src/app/api/auth/set-session/route.ts + (protected)/layout).
  void options.mfaRequired;
  void options.stepUp;

  return identity;
}

/**
 * Write an entry to the admin audit log. Never throws — if the log insert
 * fails we still want the underlying action to complete; the log failure is
 * itself surfaced via console.error so ops can see it.
 */
export async function logAdminAction(
  admin: AdminIdentity,
  action: string,
  details: {
    targetType?: 'user' | 'listing' | 'flag' | 'system' | 'admin';
    targetId?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    const hdrs = await headers();
    const ipAddress =
      hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      hdrs.get('x-real-ip') ||
      null;
    const userAgent = hdrs.get('user-agent') || null;

    const client = createAdminClient();
    await client.from('admin_audit_log').insert({
      admin_id: admin.userId,
      admin_email: admin.email,
      action,
      target_type: details.targetType || null,
      target_id: details.targetId || null,
      reason: details.reason || null,
      metadata: details.metadata || null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (err) {
    console.error('[audit-log] failed to write entry:', err);
  }

  // Best-effort webhook fire-and-forget for critical actions.
  if (CRITICAL_ACTIONS.has(action)) {
    void fireWebhookAlert(admin, action, details);
  }
}

const CRITICAL_ACTIONS = new Set<string>([
  'flag.site_kill_switch',
  'flag.read_only_mode',
  'flag.signups_disabled',
  'flag.emergency_logout_all',
  'user.delete',
  'user.suspend',
  'admin.login.new_ip',
]);

/**
 * Fire-and-forget alert to a Slack or Discord webhook, if configured.
 * Uses ADMIN_WEBHOOK_URL (supports both Slack and Discord formats).
 */
async function fireWebhookAlert(
  admin: AdminIdentity,
  action: string,
  details: Record<string, unknown>
): Promise<void> {
  const url = process.env.ADMIN_WEBHOOK_URL;
  if (!url) return;

  const payload = {
    // Slack-compatible
    text: `🚨 *${action}*\nby \`${admin.email}\`\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
    // Discord-compatible (Discord ignores `text`, uses `content`)
    content: `🚨 **${action}** by \`${admin.email}\`\n\`\`\`json\n${JSON.stringify(details, null, 2)}\n\`\`\``,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    console.error('[webhook] alert failed:', err);
  }
}

/**
 * Snapshot a record into admin_trash before a destructive operation.
 */
export async function snapshotToTrash(
  admin: AdminIdentity,
  resourceType: 'user' | 'listing',
  resourceId: string,
  resourceData: Record<string, unknown>,
  reason?: string
): Promise<void> {
  const client = createAdminClient();
  await client.from('admin_trash').insert({
    resource_type: resourceType,
    resource_id: resourceId,
    resource_data: resourceData,
    deleted_by: admin.userId,
    deleted_by_email: admin.email,
    reason: reason || null,
  });
}
