-- whichai.cloud Database Schema
-- PostgreSQL / Supabase

-- AI Products table
CREATE TABLE ai_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  category TEXT, -- 'chatbot', 'image', 'code', 'multimodal'
  provider TEXT, -- 'OpenAI', 'Anthropic', 'Google', etc.
  base_price_monthly DECIMAL(10,2),
  base_price_annual DECIMAL(10,2),
  student_discount_pct INTEGER DEFAULT 0,
  free_tier BOOLEAN DEFAULT false,
  free_tier_limits TEXT,
  context_window INTEGER, -- max tokens
  features JSONB, -- voice, vision, image_gen, code_interpreter, max_output_tokens, api_available, plugins, etc.
  hidden_caps TEXT, -- gotchas and hidden limits
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI News table
CREATE TABLE ai_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Pricing Tiers table (normalized pricing)
CREATE TABLE ai_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES ai_products(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL, -- 'Free', 'Plus', 'Pro', 'Team', 'Enterprise'
  price_monthly DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  features JSONB,
  is_popular BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_ai_products_slug ON ai_products(slug);
CREATE INDEX idx_ai_products_category ON ai_products(category);
CREATE INDEX idx_ai_products_provider ON ai_products(provider);
CREATE INDEX idx_ai_news_published_at ON ai_news(published_at DESC);
CREATE INDEX idx_ai_pricing_tiers_product_id ON ai_pricing_tiers(product_id);
