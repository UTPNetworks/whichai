import { createAdminClient } from '@/lib/admin';
import ListingsTable from './_components/ListingsTable';

export const dynamic = 'force-dynamic';

type ListingRow = {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  price: number;
  status: string;
  hidden: boolean | null;
  hidden_reason: string | null;
  deleted_at: string | null;
  created_at: string;
  photo_urls: string[] | null;
};

async function fetchListings(query: string, filter: string) {
  const client = createAdminClient();

  // Step 1 — fetch listings directly (no profiles embed; the FK resolution
  // for `profiles!user_listings_user_id_fkey` fails because that constraint
  // actually references auth.users, not public.profiles).
  let q = client
    .from('user_listings')
    .select(
      'id, user_id, title, category, price, status, hidden, hidden_reason, deleted_at, created_at, photo_urls'
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

  const listings = (data || []) as ListingRow[];
  if (listings.length === 0) return [];

  // Step 2 — enrich with owner email / username from profiles in one batch.
  const userIds = Array.from(new Set(listings.map((l) => l.user_id)));
  const profileMap = new Map<string, { email: string | null; username: string | null }>();
  try {
    const { data: profiles, error: profErr } = await client
      .from('profiles')
      .select('id, email, username')
      .in('id', userIds);
    if (profErr) {
      console.error('[admin/listings] profiles fetch error:', profErr);
    } else {
      for (const p of (profiles || []) as Array<{ id: string; email: string | null; username: string | null }>) {
        profileMap.set(p.id, { email: p.email, username: p.username });
      }
    }
  } catch (err) {
    console.error('[admin/listings] profiles enrich failed (non-fatal):', err);
  }

  return listings.map((l) => ({
    ...l,
    profiles: profileMap.get(l.user_id) || { email: null, username: null },
  }));
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
