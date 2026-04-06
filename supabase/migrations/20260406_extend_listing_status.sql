-- ============================================================
-- Extend user_listings.status to include 'hidden' and 'archived'
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop the existing check constraint (name may vary — using IF EXISTS pattern)
ALTER TABLE public.user_listings
  DROP CONSTRAINT IF EXISTS user_listings_status_check;

-- Re-add with the full set of valid statuses
ALTER TABLE public.user_listings
  ADD CONSTRAINT user_listings_status_check
  CHECK (status IN ('active', 'paused', 'draft', 'sold', 'hidden', 'archived'));

-- Index to support filtering on hidden/archived tabs
CREATE INDEX IF NOT EXISTS idx_user_listings_status_hidden_archived
  ON public.user_listings (status)
  WHERE status IN ('hidden', 'archived');
