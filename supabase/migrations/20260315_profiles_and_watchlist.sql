-- ============================================================
-- Profiles table
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  tier text not null default 'Free' check (tier in ('Free', 'Student', 'Pro')),
  savings_total numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- Watchlist table
-- ============================================================
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_id text not null,
  added_at timestamptz not null default now(),
  unique(user_id, product_id)
);

alter table public.watchlist enable row level security;

create policy "Users can view own watchlist"
  on public.watchlist for select
  using (auth.uid() = user_id);

create policy "Users can insert own watchlist"
  on public.watchlist for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlist for delete
  using (auth.uid() = user_id);
