import { supabase } from './supabase';

// ============================================================
// Types
// ============================================================

export interface AIProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  category: 'chatbot' | 'image' | 'code' | 'multimodal';
  provider: string;
  base_price_monthly: number | null;
  base_price_annual: number | null;
  student_discount_pct: number;
  free_tier: boolean;
  free_tier_limits: string | null;
  context_window: number | null;
  features: {
    voice?: boolean;
    vision?: boolean;
    image_gen?: boolean;
    code_interpreter?: boolean;
    max_output_tokens?: number | null;
    api_available?: boolean;
    plugins?: boolean;
    web_browsing?: boolean;
    file_upload?: boolean;
    [key: string]: boolean | number | string | null | undefined;
  };
  hidden_caps: string | null;
  website_url: string;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  id: string;
  product_id: string;
  tier_name: string;
  price_monthly: number | null;
  price_annual: number | null;
  features: Record<string, unknown>;
  is_popular: boolean;
}

export interface AINewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

// ============================================================
// Data fetching functions (Supabase)
// ============================================================

export async function getAllProducts(): Promise<AIProduct[]> {
  const { data, error } = await supabase
    .from('ai_products')
    .select('*')
    .order('name');
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as AIProduct[];
}

export async function getProductBySlug(slug: string): Promise<AIProduct | null> {
  const { data, error } = await supabase
    .from('ai_products')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data as AIProduct;
}

export async function getProductTiers(productId: string): Promise<PricingTier[]> {
  const { data, error } = await supabase
    .from('ai_pricing_tiers')
    .select('*')
    .eq('product_id', productId)
    .order('price_monthly', { ascending: true, nullsFirst: false });
  if (error) {
    console.error('Error fetching tiers:', error);
    return [];
  }
  return data as PricingTier[];
}

export async function getProductsByCategory(category: string): Promise<AIProduct[]> {
  if (category === 'all') return getAllProducts();
  const { data, error } = await supabase
    .from('ai_products')
    .select('*')
    .eq('category', category)
    .order('name');
  if (error) {
    console.error('Error fetching by category:', error);
    return [];
  }
  return data as AIProduct[];
}

export async function searchProducts(query: string): Promise<AIProduct[]> {
  const q = query.toLowerCase().trim();
  if (!q) return getAllProducts();
  const { data, error } = await supabase
    .from('ai_products')
    .select('*')
    .or(`name.ilike.%${q}%,provider.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%`)
    .order('name');
  if (error) {
    console.error('Error searching products:', error);
    return [];
  }
  return data as AIProduct[];
}

export async function getAllNews(): Promise<AINewsArticle[]> {
  const { data, error } = await supabase
    .from('ai_news')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  return data as AINewsArticle[];
}

// ============================================================
// Helper functions (unchanged)
// ============================================================

export function formatPrice(price: number | null): string {
  if (price === null) return 'Contact Sales';
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}/mo`;
}

export function formatContextWindow(tokens: number | null): string {
  if (!tokens) return 'N/A';
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(tokens % 1000000 === 0 ? 0 : 1)}M tokens`;
  return `${(tokens / 1000).toFixed(0)}K tokens`;
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export const categories = [
  { label: 'All', value: 'all' },
  { label: 'Chatbots', value: 'chatbot' },
  { label: 'Image Gen', value: 'image' },
  { label: 'Code', value: 'code' },
  { label: 'Multimodal', value: 'multimodal' },
] as const;
