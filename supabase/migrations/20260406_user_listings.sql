-- ============================================================
-- user_listings table
-- ============================================================
create table if not exists public.user_listings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users on delete cascade,

  -- Core listing fields
  title            text not null,
  description      text,
  category         text,
  subcategory      text,
  price            numeric not null default 0,
  pricing_type     text not null default 'one-time'
                     check (pricing_type in ('one-time', 'free', 'subscription', 'negotiable')),
  condition        text,
  tags             text[] default '{}',
  license          text,
  demo_url         text,
  frameworks       text,
  delivery_method  text not null default 'digital',
  location         text,
  photo_urls       text[] default '{}',
  status           text not null default 'active'
                     check (status in ('active', 'paused', 'draft', 'sold')),

  -- Engagement counters
  views            integer not null default 0,
  saves            integer not null default 0,
  inquiries        integer not null default 0,

  -- Boost
  is_boosted       boolean not null default false,
  boost_tier       text,
  boost_expires_at timestamptz,

  -- AI enrichment (added via 20260405_listing_enrichment.sql but table was missing)
  enrichment_status  text default 'pending'
                       check (enrichment_status in ('pending', 'processing', 'complete', 'failed')),
  enrichment_step    text,
  ai_generated       boolean default false,
  refined_title      text,
  refined_description text,
  technical_specs    jsonb,
  ai_compatibility   jsonb,
  suggested_hashtags jsonb,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_user_listings_user_id
  on public.user_listings (user_id);

create index if not exists idx_user_listings_status
  on public.user_listings (status);

create index if not exists idx_user_listings_category
  on public.user_listings (category);

create index if not exists idx_user_listings_created_at
  on public.user_listings (created_at desc);

create index if not exists idx_user_listings_enrichment_status
  on public.user_listings (enrichment_status)
  where enrichment_status in ('pending', 'processing');

-- ── Row Level Security ────────────────────────────────────────
alter table public.user_listings enable row level security;

-- Owners can do everything with their own listings
create policy "Owners can select own listings"
  on public.user_listings for select
  using (auth.uid() = user_id);

create policy "Owners can insert own listings"
  on public.user_listings for insert
  with check (auth.uid() = user_id);

create policy "Owners can update own listings"
  on public.user_listings for update
  using (auth.uid() = user_id);

create policy "Owners can delete own listings"
  on public.user_listings for delete
  using (auth.uid() = user_id);

-- Anyone (including anon) can read active listings (marketplace browse)
create policy "Public can view active listings"
  on public.user_listings for select
  using (status = 'active');

-- ── updated_at trigger ────────────────────────────────────────
create trigger user_listings_updated_at
  before update on public.user_listings
  for each row execute function public.update_updated_at();
