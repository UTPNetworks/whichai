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
import { cookies, headers } from 'next/headers';
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Determine the user's current assurance level. Supabase exposes this
  // via mfa.getAuthenticatorAssuranceLevel() — currentLevel reflects the
  // level of the live session.
  let aal: 'aal1' | 'aal2' | null = null;
  try {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    aal = (aalData?.currentLevel as 'aal1' | 'aal2' | undefined) || null;
  } catch {
    aal = null;
  }

  // Does the user have any verified TOTP factor?
  let hasMfaFactor = false;
  try {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    hasMfaFactor = !!factors?.totp?.some((f) => f.status === 'verified');
  } catch {
    hasMfaFactor = false;
  }

  const admin = createAdminClient();
  const { data: adminRow, error } = await admin
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !adminRow) return null;

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
  stepUp?: boolean;   // require fresh TOTP verification for destructive actions
} = {}): Promise<AdminIdentity | NextResponse> {
  const identity = await getAdminIdentity();
  if (!identity) {
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

  if (options.mfaRequired && identity.aal !== 'aal2') {
    return NextResponse.json(
      { error: 'MFA required', code: 'mfa_required' },
      { status: 403 }
    );
  }

  if (options.stepUp) {
    const cookieStore = await cookies();
    const stepUpCookie = cookieStore.get('admin_stepup');
    const exp = stepUpCookie?.value ? parseInt(stepUpCookie.value, 10) : 0;
    if (!exp || exp < Date.now()) {
      return NextResponse.json(
        { error: 'Step-up verification required', code: 'stepup_required' },
        { status: 403 }
      );
    }
  }

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
