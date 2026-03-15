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

// ============================================================
// Marketplace types & data
// ============================================================

export type MarketplaceCategory = 'api-tokens' | 'llm-subscriptions' | 'gpu-deals';

export interface MarketplaceDeal {
  id: string;
  name: string;
  description: string;
  category: MarketplaceCategory;
  original_price: number;
  discounted_price: number;
  provider: string;
  badge: string | null;
  featured: boolean;
  claim_url: string;
  unit: string; // e.g. "credits", "/mo", "/hr"
}

export const marketplaceCategories = [
  { label: 'API Tokens', value: 'api-tokens' as const },
  { label: 'LLM Subscriptions', value: 'llm-subscriptions' as const },
  { label: 'GPU & Server Deals', value: 'gpu-deals' as const },
] as const;

export const marketplaceDeals: MarketplaceDeal[] = [
  // API Tokens
  {
    id: 'deal-1',
    name: 'OpenAI API Credits Bundle',
    description: 'Get $100 worth of OpenAI API credits for just $90. Valid for GPT-5, DALL-E 4, and Whisper v3.',
    category: 'api-tokens',
    original_price: 100,
    discounted_price: 90,
    provider: 'OpenAI',
    badge: 'Hot Deal',
    featured: true,
    claim_url: '#',
    unit: 'credits',
  },
  {
    id: 'deal-2',
    name: 'Anthropic Claude Credits',
    description: 'Bundle of Anthropic API credits at a discount. Works with Claude 4.6 Opus and Sonnet models.',
    category: 'api-tokens',
    original_price: 150,
    discounted_price: 120,
    provider: 'Anthropic',
    badge: 'Popular',
    featured: true,
    claim_url: '#',
    unit: 'credits',
  },
  {
    id: 'deal-3',
    name: 'Google AI Studio Credits',
    description: 'Prepaid credits for Gemini 2.5 API, Imagen 4, and Veo. Includes priority queue access.',
    category: 'api-tokens',
    original_price: 200,
    discounted_price: 160,
    provider: 'Google',
    badge: null,
    featured: false,
    claim_url: '#',
    unit: 'credits',
  },
  {
    id: 'deal-4',
    name: 'Mistral API Starter Pack',
    description: '50M tokens for Mistral Large 3. EU-hosted, GDPR compliant, no data retention.',
    category: 'api-tokens',
    original_price: 75,
    discounted_price: 55,
    provider: 'Mistral',
    badge: 'New',
    featured: false,
    claim_url: '#',
    unit: 'pack',
  },

  // LLM Subscriptions
  {
    id: 'deal-5',
    name: 'ChatGPT Pro — Student Deal',
    description: 'Full ChatGPT Pro access with GPT-5, code interpreter, DALL-E, and advanced voice. Verified .edu required.',
    category: 'llm-subscriptions',
    original_price: 200,
    discounted_price: 100,
    provider: 'OpenAI',
    badge: 'Student Special',
    featured: true,
    claim_url: '#',
    unit: '/mo',
  },
  {
    id: 'deal-6',
    name: 'Claude Pro — Student Plan',
    description: 'Unlimited Claude 4.6 Opus access with 5x usage limits. Available to verified students.',
    category: 'llm-subscriptions',
    original_price: 20,
    discounted_price: 12,
    provider: 'Anthropic',
    badge: 'Student Special',
    featured: false,
    claim_url: '#',
    unit: '/mo',
  },
  {
    id: 'deal-7',
    name: 'Gemini Advanced — Annual',
    description: 'Gemini 2.5 Ultra with 2M context, Gems, and Google ecosystem integration. Save with annual billing.',
    category: 'llm-subscriptions',
    original_price: 240,
    discounted_price: 180,
    provider: 'Google',
    badge: 'Best Value',
    featured: true,
    claim_url: '#',
    unit: '/yr',
  },
  {
    id: 'deal-8',
    name: 'Team Bulk Seats — ChatGPT',
    description: '10-seat team bundle for ChatGPT Team with shared workspace, admin console, and priority support.',
    category: 'llm-subscriptions',
    original_price: 300,
    discounted_price: 225,
    provider: 'OpenAI',
    badge: 'Team Deal',
    featured: false,
    claim_url: '#',
    unit: '/mo',
  },

  // GPU & Server Deals
  {
    id: 'deal-9',
    name: 'NVIDIA H100 80GB Instance',
    description: 'On-demand H100 SXM5 instance with 80GB HBM3, 400Gbps InfiniBand. NVLink ready for multi-GPU.',
    category: 'gpu-deals',
    original_price: 3.99,
    discounted_price: 2.49,
    provider: 'Lambda Cloud',
    badge: 'Hot Deal',
    featured: true,
    claim_url: '#',
    unit: '/hr',
  },
  {
    id: 'deal-10',
    name: 'NVIDIA A100 40GB Rental',
    description: 'A100 PCIe with 40GB HBM2e. Great for fine-tuning 7B-70B parameter models. Spot pricing available.',
    category: 'gpu-deals',
    original_price: 1.89,
    discounted_price: 1.29,
    provider: 'CoreWeave',
    badge: null,
    featured: false,
    claim_url: '#',
    unit: '/hr',
  },
  {
    id: 'deal-11',
    name: 'Google TPU v5e Pod Slice',
    description: '8-chip TPU v5e pod slice optimized for training and serving. Includes JAX/PyTorch support.',
    category: 'gpu-deals',
    original_price: 12.00,
    discounted_price: 8.40,
    provider: 'Google Cloud',
    badge: 'Limited',
    featured: false,
    claim_url: '#',
    unit: '/hr',
  },
  {
    id: 'deal-12',
    name: 'RTX 4090 Cluster — 4x GPUs',
    description: '4x RTX 4090 with NVLink, 512GB RAM, 2TB NVMe. Perfect for inference and small-scale training.',
    category: 'gpu-deals',
    original_price: 2.40,
    discounted_price: 1.68,
    provider: 'RunPod',
    badge: 'Budget Pick',
    featured: true,
    claim_url: '#',
    unit: '/hr',
  },
];

export function getMarketplaceDeals(category?: MarketplaceCategory): MarketplaceDeal[] {
  if (!category) return marketplaceDeals;
  return marketplaceDeals.filter((d) => d.category === category);
}

export function getDiscountPct(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

export const categories = [
  { label: 'All', value: 'all' },
  { label: 'Chatbots', value: 'chatbot' },
  { label: 'Image Gen', value: 'image' },
  { label: 'Code', value: 'code' },
  { label: 'Multimodal', value: 'multimodal' },
] as const;
