-- ============================================================
-- Admin Console schema
-- Creates the tables, RLS policies, and helper functions that
-- power the super-admin console at admin.whichai.cloud.
-- ============================================================

-- ============================================================
-- 1. admins — allowlist of users who can access the admin console
-- ============================================================
create table if not exists public.admins (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'owner'
                 check (role in ('owner', 'support', 'moderator')),
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id),
  notes        text
);

alter table public.admins enable row level security;

-- Admins can see the admin list; nobody else can.
create policy "Admins can view admins"
  on public.admins for select
  using (auth.uid() in (select user_id from public.admins));

-- Only owners can add/remove other admins.
create policy "Owners can manage admins"
  on public.admins for all
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Helper function — used by other policies and server code.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (select 1 from public.admins where user_id = uid);
$$;

create or replace function public.admin_role(uid uuid)
returns text
language sql
stable
security definer
as $$
  select role from public.admins where user_id = uid;
$$;

-- ============================================================
-- 2. system_flags — the kill switch and friends (singleton row)
-- ============================================================
create table if not exists public.system_flags (
  id                        int primary key default 1 check (id = 1),
  site_kill_switch          boolean not null default false,
  read_only_mode            boolean not null default false,
  signups_disabled          boolean not null default false,
  marketplace_frozen        boolean not null default false,
  oauth_google_disabled     boolean not null default false,
  forums_disabled           boolean not null default false,
  comments_disabled         boolean not null default false,
  ai_compare_disabled       boolean not null default false,
  maintenance_banner        text,
  jwt_min_issued_at         timestamptz,
  updated_at                timestamptz not null default now(),
  updated_by                uuid references auth.users(id)
);

-- Ensure exactly one row exists.
insert into public.system_flags (id) values (1)
  on conflict (id) do nothing;

alter table public.system_flags enable row level security;

-- Everyone (anon + authed) can read flags — middleware needs this on every request.
create policy "Anyone can read system flags"
  on public.system_flags for select
  using (true);

-- Only admins can update flags.
create policy "Admins can update system flags"
  on public.system_flags for update
  using (public.is_admin(auth.uid()));

-- ============================================================
-- 3. admin_audit_log — immutable record of every admin action
-- ============================================================
create table if not exists public.admin_audit_log (
  id            uuid primary key default gen_random_uuid(),
  admin_id      uuid not null references auth.users(id),
  admin_email   text not null,
  action        text not null,     -- e.g. 'user.suspend', 'listing.hide', 'flag.kill_switch'
  target_type   text,                -- 'user', 'listing', 'flag', 'system'
  target_id     text,
  reason        text,
  metadata      jsonb,
  ip_address    text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_created_at
  on public.admin_audit_log (created_at desc);
create index if not exists idx_admin_audit_log_admin_id
  on public.admin_audit_log (admin_id);
create index if not exists idx_admin_audit_log_target
  on public.admin_audit_log (target_type, target_id);

alter table public.admin_audit_log enable row level security;

-- Only admins can read the log.
create policy "Admins can read audit log"
  on public.admin_audit_log for select
  using (public.is_admin(auth.uid()));

-- Only admins can insert (server routes use service role, but this doubles as defence-in-depth).
create policy "Admins can insert audit log"
  on public.admin_audit_log for insert
  with check (public.is_admin(auth.uid()));

-- Log is immutable — no update or delete policies.

-- ============================================================
-- 4. admin_trash — 30-day soft-delete recovery
-- ============================================================
create table if not exists public.admin_trash (
  id              uuid primary key default gen_random_uuid(),
  resource_type   text not null check (resource_type in ('user', 'listing')),
  resource_id     text not null,
  resource_data   jsonb not null,
  deleted_by      uuid references auth.users(id),
  deleted_by_email text,
  reason          text,
  deleted_at      timestamptz not null default now(),
  purge_after     timestamptz not null default (now() + interval '30 days'),
  restored_at     timestamptz
);

create index if not exists idx_admin_trash_purge_after
  on public.admin_trash (purge_after);
create index if not exists idx_admin_trash_resource
  on public.admin_trash (resource_type, resource_id);

alter table public.admin_trash enable row level security;

create policy "Admins can read trash"
  on public.admin_trash for select
  using (public.is_admin(auth.uid()));

create policy "Admins can manage trash"
  on public.admin_trash for all
  using (public.is_admin(auth.uid()));

-- ============================================================
-- 5. Moderation columns on profiles
-- ============================================================
alter table public.profiles
  add column if not exists suspended         boolean not null default false,
  add column if not exists suspended_until   timestamptz,
  add column if not exists suspension_reason text,
  add column if not exists shadowbanned      boolean not null default false,
  add column if not exists deleted_at        timestamptz;

create index if not exists idx_profiles_suspended
  on public.profiles (suspended) where suspended = true;
create index if not exists idx_profiles_shadowbanned
  on public.profiles (shadowbanned) where shadowbanned = true;

-- Admins can read / update any profile (for moderation).
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin(auth.uid()));

-- ============================================================
-- 6. Moderation columns on user_listings
-- ============================================================
alter table public.user_listings
  add column if not exists hidden          boolean not null default false,
  add column if not exists hidden_reason   text,
  add column if not exists hidden_by       uuid references auth.users(id),
  add column if not exists hidden_at       timestamptz,
  add column if not exists deleted_at      timestamptz;

create index if not exists idx_user_listings_hidden
  on public.user_listings (hidden) where hidden = true;

-- Update the public "active listings" policy to also exclude hidden/deleted.
drop policy if exists "Public can view active listings" on public.user_listings;
create policy "Public can view active listings"
  on public.user_listings for select
  using (status = 'active' and hidden = false and deleted_at is null);

-- Shadowban filter — shadowbanned users' listings are only visible to themselves.
drop policy if exists "Owners can select own listings" on public.user_listings;
create policy "Owners can select own listings"
  on public.user_listings for select
  using (auth.uid() = user_id);

-- Admins can read / update any listing (for moderation).
create policy "Admins can view all listings"
  on public.user_listings for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update any listing"
  on public.user_listings for update
  using (public.is_admin(auth.uid()));

create policy "Admins can delete any listing"
  on public.user_listings for delete
  using (public.is_admin(auth.uid()));

-- ============================================================
-- 7. Helper view — admin user summary
-- Convenient join of auth.users + profiles + listing counts.
-- Only admins can query it.
-- ============================================================
create or replace view public.admin_user_overview
with (security_invoker = true)
as
  select
    u.id                                    as user_id,
    u.email                                 as email,
    u.created_at                            as signed_up_at,
    u.last_sign_in_at                       as last_sign_in_at,
    u.raw_app_meta_data->>'provider'        as provider,
    p.username,
    p.first_name,
    p.last_name,
    p.tier,
    p.avatar_url,
    p.onboarding_completed,
    p.suspended,
    p.suspended_until,
    p.suspension_reason,
    p.shadowbanned,
    p.deleted_at,
    (
      select count(*) from public.user_listings l
       where l.user_id = u.id and l.deleted_at is null
    ) as listing_count,
    (
      select count(*) from public.user_listings l
       where l.user_id = u.id and l.status = 'active' and l.hidden = false and l.deleted_at is null
    ) as active_listing_count
  from auth.users u
  left join public.profiles p on p.id = u.id;

comment on view public.admin_user_overview is
  'Admin-only view joining auth.users, profiles, and listing counts. Access gated by RLS on profiles/user_listings via security_invoker.';

-- ============================================================
-- 8. Seed the first admin (YOU)
-- Replace the email below with yours, or run separately.
-- This is idempotent — safe to re-run.
-- ============================================================
do $$
declare
  me uuid;
begin
  select id into me from auth.users where email = 'admin.bhuvi@gmail.com' limit 1;
  if me is not null then
    insert into public.admins (user_id, role, notes)
    values (me, 'owner', 'Primary owner — seeded by 20260409_admin_console.sql')
    on conflict (user_id) do nothing;
  end if;
end $$;
