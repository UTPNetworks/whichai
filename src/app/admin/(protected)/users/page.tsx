import { createAdminClient } from '@/lib/admin';
import UsersTable from './_components/UsersTable';

export const dynamic = 'force-dynamic';

type ProfileRow = {
  id: string;
  email: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  tier: string | null;
  avatar_url: string | null;
  created_at: string;
  suspended: boolean | null;
  shadowbanned: boolean | null;
  deleted_at: string | null;
};

type AuthUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  app_metadata?: { provider?: string } | null;
};

async function fetchUsers(query: string, filter: string) {
  const client = createAdminClient();

  // 1) Pull profiles directly (avoids the admin_user_overview view, which
  //    fails because service_role lacks SELECT on auth.users under
  //    security_invoker semantics).
  let q = client
    .from('profiles')
    .select(
      'id, email, username, first_name, last_name, tier, avatar_url, created_at, suspended, shadowbanned, deleted_at'
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (query) {
    q = q.or(
      `email.ilike.%${query}%,username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`
    );
  }
  if (filter === 'suspended') q = q.eq('suspended', true);
  if (filter === 'shadowbanned') q = q.eq('shadowbanned', true);
  if (filter === 'deleted') q = q.not('deleted_at', 'is', null);

  const { data: profiles, error } = await q;
  if (error) {
    console.error('[admin/users] profiles fetch error:', error);
    return [];
  }
  const profileRows = (profiles || []) as ProfileRow[];
  if (profileRows.length === 0) return [];

  const ids = profileRows.map((p) => p.id);

  // 2) Pull last_sign_in_at + provider from auth.users in a single batched
  //    call via the admin API. Paginate up to the 200-row limit.
  const authIndex = new Map<string, AuthUserRow>();
  try {
    // listUsers pages at 1000 by default — one page covers our 200 cap.
    const { data: userList } = await client.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    for (const u of userList?.users || []) {
      if (ids.includes(u.id)) {
        authIndex.set(u.id, {
          id: u.id,
          email: u.email || null,
          created_at: u.created_at,
          last_sign_in_at: (u as unknown as { last_sign_in_at?: string | null }).last_sign_in_at || null,
          app_metadata: (u.app_metadata || null) as { provider?: string } | null,
        });
      }
    }
  } catch (err) {
    console.error('[admin/users] listUsers failed (non-fatal):', err);
  }

  // 3) Listing counts per user — cheap batched aggregate.
  const listingCounts = new Map<string, { total: number; active: number }>();
  try {
    const { data: listingRows } = await client
      .from('user_listings')
      .select('user_id, status, hidden, deleted_at')
      .in('user_id', ids)
      .is('deleted_at', null);
    for (const row of (listingRows || []) as Array<{
      user_id: string;
      status: string | null;
      hidden: boolean | null;
      deleted_at: string | null;
    }>) {
      const entry = listingCounts.get(row.user_id) || { total: 0, active: 0 };
      entry.total += 1;
      if (row.status === 'active' && !row.hidden) entry.active += 1;
      listingCounts.set(row.user_id, entry);
    }
  } catch (err) {
    console.error('[admin/users] listing count fetch failed (non-fatal):', err);
  }

  // 4) Shape to the UsersTable contract.
  return profileRows.map((p) => {
    const auth = authIndex.get(p.id);
    const counts = listingCounts.get(p.id) || { total: 0, active: 0 };
    return {
      user_id: p.id,
      email: p.email || auth?.email || '(no email)',
      username: p.username,
      first_name: p.first_name,
      last_name: p.last_name,
      tier: p.tier,
      avatar_url: p.avatar_url,
      signed_up_at: auth?.created_at || p.created_at,
      last_sign_in_at: auth?.last_sign_in_at || null,
      provider: auth?.app_metadata?.provider || null,
      suspended: !!p.suspended,
      shadowbanned: !!p.shadowbanned,
      deleted_at: p.deleted_at,
      listing_count: counts.total,
      active_listing_count: counts.active,
    };
  });
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const filter = params.filter || 'all';
  const users = await fetchUsers(query, filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">Users</h1>
        <p className="text-sm text-slate-500">
          {users.length.toLocaleString()} {filter !== 'all' ? filter : 'total'} &middot; most recent 200 shown
        </p>
      </div>

      <form method="get" className="flex items-center gap-2 mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search email, username, name..."
          className="flex-1 max-w-md px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm"
        />
        <select
          name="filter"
          defaultValue={filter}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
        >
          <option value="all">All users</option>
          <option value="suspended">Suspended</option>
          <option value="shadowbanned">Shadowbanned</option>
          <option value="deleted">Deleted</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold"
        >
          Search
        </button>
      </form>

      <UsersTable users={users as any} />
    </div>
  );
}
