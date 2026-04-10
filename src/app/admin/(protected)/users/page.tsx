import { createAdminClient } from '@/lib/admin';
import UsersTable from './_components/UsersTable';

export const dynamic = 'force-dynamic';

async function fetchUsers(query: string, filter: string) {
  const client = createAdminClient();
  let q = client.from('admin_user_overview').select('*').order('signed_up_at', { ascending: false }).limit(200);

  if (query) {
    // ilike across email + username + first/last name
    q = q.or(
      `email.ilike.%${query}%,username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`
    );
  }
  if (filter === 'suspended') q = q.eq('suspended', true);
  if (filter === 'shadowbanned') q = q.eq('shadowbanned', true);
  if (filter === 'deleted') q = q.not('deleted_at', 'is', null);

  const { data, error } = await q;
  if (error) {
    console.error('[admin/users] fetch error:', error);
    return [];
  }
  return data || [];
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
