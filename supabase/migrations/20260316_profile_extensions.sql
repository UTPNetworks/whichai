-- Add extended profile fields
alter table public.profiles
  add column if not exists bio text,
  add column if not exists avatar_url text,
  add column if not exists preferred_categories text[] default '{}';
