-- Migration: AI Enrichment columns for user_listings
-- Run: supabase db push  (or paste into Supabase SQL editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enrichment workflow columns
ALTER TABLE user_listings
  ADD COLUMN IF NOT EXISTS enrichment_status  TEXT    DEFAULT 'pending'
    CHECK (enrichment_status IN ('pending', 'processing', 'complete', 'failed')),
  ADD COLUMN IF NOT EXISTS enrichment_step    TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_generated       BOOLEAN DEFAULT FALSE;

-- 2. Claude-generated content columns
ALTER TABLE user_listings
  ADD COLUMN IF NOT EXISTS refined_title       TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refined_description TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS technical_specs     JSONB   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_compatibility    JSONB   DEFAULT NULL,   -- TEXT[]
  ADD COLUMN IF NOT EXISTS suggested_hashtags  JSONB   DEFAULT NULL;   -- TEXT[]

-- 3. Index to quickly find listings that still need enrichment
CREATE INDEX IF NOT EXISTS idx_user_listings_enrichment_status
  ON user_listings (enrichment_status)
  WHERE enrichment_status IN ('pending', 'processing');

-- 4. Comment on new columns for visibility in Supabase Studio
COMMENT ON COLUMN user_listings.enrichment_status  IS 'AI enrichment pipeline state: pending | processing | complete | failed';
COMMENT ON COLUMN user_listings.enrichment_step    IS 'Current step surfaced to the frontend status UI';
COMMENT ON COLUMN user_listings.ai_generated       IS 'True once Claude has enriched this listing; cleared after seller approves';
COMMENT ON COLUMN user_listings.refined_title      IS 'Claude-generated listing title (reviewed by seller before going live)';
COMMENT ON COLUMN user_listings.refined_description IS 'Claude-generated Markdown description';
COMMENT ON COLUMN user_listings.technical_specs    IS 'JSONB: { vram, architecture, interface, cooling, tflops }';
COMMENT ON COLUMN user_listings.ai_compatibility   IS 'JSONB array of AI model compatibility strings';
COMMENT ON COLUMN user_listings.suggested_hashtags IS 'JSONB array of 10 SEO hashtags';
