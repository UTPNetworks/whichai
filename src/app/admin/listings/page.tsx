import { createAdminClient } from '@/lib/admin';
import ListingsTable from './_components/ListingsTable';

export const dynamic = 'force-dynamic';

async function fetchListings(query: string, filter: string) {
  const client = createAdminClient();
  let q = client
    .from('user_listings')
    .select(
      'id, user_id, title, category, price, status, hidden, hidden_reason, deleted_at, created_at, photo_urls, profiles:profiles!user_listings_user_id_fkey(email, username)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (query) {
    q = q.or(`title.ilike.%${query}%,category.ilike.%${query}%`);
  }
  if (filter === 'hidden') q = q.eq('hidden', true);
  if (filter === 'deleted') q = q.not('deleted_at', 'is', null);
  if (filter === 'active') q = q.eq('hidden', false).is('deleted_at', null);

  const { data, error } = await q;
  if (error) {
    console.error('[admin/listings] fetch error:', error);
    return [];
  }
  return data || [];
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const filter = params.filter || 'all';
  const listings = await fetchListings(query, filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">Listings</h1>
        <p className="text-sm text-slate-500">
          {listings.length.toLocaleString()} {filter !== 'all' ? filter : 'total'} &middot; most recent 200 shown
        </p>
      </div>

      <form method="get" className="flex items-center gap-2 mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search title or category..."
          className="flex-1 max-w-md px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm"
        />
        <select
          name="filter"
          defaultValue={filter}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
        >
          <option value="all">All listings</option>
          <option value="active">Active only</option>
          <option value="hidden">Hidden</option>
          <option value="deleted">Deleted</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold"
        >
          Search
        </button>
      </form>

      <ListingsTable listings={listings as any} />
    </div>
  );
}
