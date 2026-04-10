import { redirect } from 'next/navigation';
import { getAdminIdentity, createAdminClient } from '@/lib/admin';
import AdminsTable, { AdminRow } from './_components/AdminsTable';

export const dynamic = 'force-dynamic';

export default async function AdminsPage() {
  const me = await getAdminIdentity();
  if (!me) redirect('/admin/login');

  const client = createAdminClient();

  // Pull every admin row, then enrich with email + created_at from auth.users
  const { data: adminsRaw } = await client
    .from('admins')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: true });

  const rows: AdminRow[] = [];
  for (const a of adminsRaw || []) {
    let email = '(unknown)';
    let hasMfa = false;
    try {
      const { data: userRes } = await client.auth.admin.getUserById(a.user_id);
      email = userRes?.user?.email || '(no email)';
      // factors live on the user object via admin API
      const factors = (userRes?.user as unknown as {
        factors?: Array<{ factor_type: string; status: string }>;
      })?.factors;
      hasMfa = !!factors?.some((f) => f.factor_type === 'totp' && f.status === 'verified');
    } catch {
      /* keep defaults */
    }
    rows.push({
      user_id: a.user_id,
      email,
      role: a.role as AdminRow['role'],
      created_at: a.created_at,
      has_mfa: hasMfa,
      is_self: a.user_id === me.userId,
    });
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-1">Admin Accounts</h1>
        <p className="text-sm text-slate-500">
          Manage who has access to the admin console. Adding, removing, or
          changing a role requires <code className="text-amber-300">owner</code> role
          and step-up verification.
        </p>
      </div>

      <AdminsTable admins={rows} myRole={me.role} />
    </>
  );
}
