import { createAdminClient } from '@/lib/admin';
import TrashTable from './_components/TrashTable';

export const dynamic = 'force-dynamic';

async function fetchTrash(filter: string) {
  const client = createAdminClient();
  let q = client
    .from('admin_trash')
    .select('*')
    .order('deleted_at', { ascending: false })
    .limit(200);

  if (filter === 'user') q = q.eq('resource_type', 'user');
  if (filter === 'listing') q = q.eq('resource_type', 'listing');

  const { data, error } = await q;
  if (error) {
    console.error('[admin/trash] fetch error:', error);
    return [];
  }
  return data || [];
}

export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter || 'all';
  const items = await fetchTrash(filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">Trash</h1>
        <p className="text-sm text-slate-500">
          Soft-deleted items live here for 30 days, then purge permanently. Restore brings them back as-was.
        </p>
      </div>

      <form method="get" className="flex items-center gap-2 mb-6">
        <select
          name="filter"
          defaultValue={filter}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
        >
          <option value="all">All trash</option>
          <option value="user">Users</option>
          <option value="listing">Listings</option>
        </select>
        <button type="submit" className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold">
          Filter
        </button>
      </form>

      <TrashTable items={items as any} />
    </div>
  );
}
