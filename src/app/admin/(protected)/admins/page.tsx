import { redirect } from 'next/navigation';
import { getAdminIdentity, createAdminClient } from '@/lib/admin';
import AdminsTable, { AdminRow } from './_components/AdminsTable';

export const dynamic = 'force-dynamic';

export default async function AdminsPage() {
  const me = await getAdminIdentity();
  if (!me) redirect('/admin/login');

  const client = createAdminClient();

  // Pull admin rows — service role bypasses the recursive `admins` RLS.
  const { data: adminsRaw, error: adminsErr } = await client
    .from('admins')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: true });

  if (adminsErr) {
    console.error('[admin/admins] admins fetch error:', adminsErr);
  }

  // Batch-fetch every auth user in one shot instead of per-admin getUserById
  // (the N+1 loop is slow and can hang the whole page render).
  type AuthUserLite = {
    id: string;
    email?: string | null;
    factors?: Array<{ factor_type: string; status: string }> | null;
  };
  const userIndex = new Map<string, AuthUserLite>();
  try {
    const { data: list, error: listErr } = await client.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) {
      console.error('[admin/admins] listUsers error:', listErr);
    }
    for (const u of (list?.users || []) as unknown as AuthUserLite[]) {
      userIndex.set(u.id, u);
    }
  } catch (err) {
    console.error('[admin/admins] listUsers threw (non-fatal):', err);
  }

  const rows: AdminRow[] = (adminsRaw || []).map((a) => {
    const u = userIndex.get(a.user_id);
    const factors = u?.factors || [];
    const hasMfa = factors.some(
      (f) => f.factor_type === 'totp' && f.status === 'verified'
    );
    return {
      user_id: a.user_id,
      email: u?.email || '(unknown)',
      role: a.role as AdminRow['role'],
      created_at: a.created_at,
      has_mfa: hasMfa,
      is_self: a.user_id === me.userId,
    };
  });

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
