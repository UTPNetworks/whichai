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
    name: 'ChatGPT Pro â Student Deal',
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
    name: 'Claude Pro â Student Plan',
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
    name: 'Gemini Advanced â Annual',
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
    name: 'Team Bulk Seats â ChatGPT',
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
    name: 'RTX 4090 Cluster â 4x GPUs',
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

// ============================================================
// Full AI Marketplace â v2 Listings
// ============================================================

export type BigCategory = 'digital-assets' | 'compute-hub' | 'hardware-corner';

export interface SellerProfile {
  name: string;
  rating: number;
  reviews: number;
  verified: boolean;
  badge?: 'top-seller' | 'new' | 'student';
}

export interface MarketplaceListing {
  id: string;
  name: string;
  description: string;
  bigCategory: BigCategory;
  subcategory: string;
  price: number;
  originalPrice?: number;
  unit: string;
  seller: SellerProfile;
  badge?: string;
  featured: boolean;
  tags: string[];
  emoji: string;
}

export const allListings: MarketplaceListing[] = [
  // ââ Digital Assets ââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'listing-1',
    name: 'Ultimate ChatGPT Prompt Bundle',
    description: '500+ battle-tested system prompts for marketing, coding, legal, and creative tasks. Organized by use case with usage examples.',
    bigCategory: 'digital-assets',
    subcategory: 'prompt-bundle',
    price: 29,
    originalPrice: 49,
    unit: 'one-time',
    seller: { name: 'PromptMaster_Jay', rating: 4.9, reviews: 312, verified: true, badge: 'top-seller' },
    badge: 'Bestseller',
    featured: true,
    tags: ['GPT-4', 'prompts', 'productivity'],
    emoji: 'ð',
  },
  {
    id: 'listing-2',
    name: 'Legal Assistant GPT Agent',
    description: 'Specialized AI agent trained on US contract law. Drafts NDAs, reviews clauses, explains legal jargon. Not a substitute for a lawyer.',
    bigCategory: 'digital-assets',
    subcategory: 'custom-agent',
    price: 49,
    unit: '/mo',
    seller: { name: 'LexTech_AI', rating: 4.7, reviews: 88, verified: true },
    badge: 'Verified',
    featured: true,
    tags: ['legal', 'agent', 'GPT-4'],
    emoji: 'âï¸',
  },
  {
    id: 'listing-3',
    name: 'Anime LoRA â Studio Ghibli Style',
    description: 'Fine-tuned LoRA for SDXL that generates beautiful Ghibli-inspired scenes. Works with ComfyUI and A1111. Includes 20 trigger words.',
    bigCategory: 'digital-assets',
    subcategory: 'fine-tuned-model',
    price: 15,
    unit: 'one-time',
    seller: { name: 'PixelDreamer_88', rating: 4.8, reviews: 204, verified: false },
    badge: undefined,
    featured: false,
    tags: ['LoRA', 'SDXL', 'image-gen', 'anime'],
    emoji: 'ð¨',
  },
  {
    id: 'listing-4',
    name: 'Medical Transcription Fine-tune',
    description: 'Whisper v3 fine-tuned on 50K medical recordings. Achieves 97% accuracy on clinical terminology. HIPAA-aware prompt structure included.',
    bigCategory: 'digital-assets',
    subcategory: 'fine-tuned-model',
    price: 89,
    unit: 'one-time',
    seller: { name: 'MedAI_Solutions', rating: 5.0, reviews: 41, verified: true },
    badge: 'Professional',
    featured: false,
    tags: ['Whisper', 'medical', 'transcription'],
    emoji: 'ð¥',
  },
  {
    id: 'listing-5',
    name: 'E-commerce Product Desc AI',
    description: 'Claude-based agent that writes SEO-optimized product descriptions from a photo + bullets. Integrates with Shopify & WooCommerce.',
    bigCategory: 'digital-assets',
    subcategory: 'custom-agent',
    price: 24,
    unit: '/mo',
    seller: { name: 'ShopBoost_AI', rating: 4.3, reviews: 67, verified: false },
    badge: 'New',
    featured: false,
    tags: ['ecommerce', 'Shopify', 'Claude', 'SEO'],
    emoji: 'ðï¸',
  },
  {
    id: 'listing-6',
    name: 'NRI Tax Bot â Indian Expats (US)',
    description: 'AI assistant specialized in DTAA, FEMA compliance, and NRI investment rules. Answers tax questions for Indians in the US.',
    bigCategory: 'digital-assets',
    subcategory: 'custom-agent',
    price: 39,
    unit: '/mo',
    seller: { name: 'NRIFinance_Pro', rating: 4.9, reviews: 156, verified: true, badge: 'top-seller' },
    badge: 'Popular',
    featured: true,
    tags: ['tax', 'NRI', 'India', 'agent'],
    emoji: 'ð®ð³',
  },
  // ââ Compute Hub ââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'listing-7',
    name: 'RTX 4090 â On-Demand Rental',
    description: 'Idle RTX 4090 24GB for rent. ~180 TFLOPS FP16. Great for inference, image gen, and LoRA training. Available 9amâ9pm PST.',
    bigCategory: 'compute-hub',
    subcategory: 'p2p-gpu',
    price: 4.20,
    originalPrice: 5.50,
    unit: '/hr',
    seller: { name: 'TechFarm_TX', rating: 4.9, reviews: 428, verified: true, badge: 'top-seller' },
    badge: 'Hot',
    featured: true,
    tags: ['RTX 4090', 'GPU', 'rental', 'inference'],
    emoji: 'â¡',
  },
  {
    id: 'listing-8',
    name: 'OpenAI API Credits â $100 Bundle',
    description: 'Excess OpenAI API credits from a startup plan. Valid for GPT-4o, o3, DALL-E 3, and Whisper. Transfer via org invite.',
    bigCategory: 'compute-hub',
    subcategory: 'api-tokens',
    price: 88,
    originalPrice: 100,
    unit: 'bundle',
    seller: { name: 'StartupTokens', rating: 4.8, reviews: 93, verified: true },
    badge: undefined,
    featured: true,
    tags: ['OpenAI', 'credits', 'API', 'GPT-4o'],
    emoji: 'ð',
  },
  {
    id: 'listing-9',
    name: 'Claude Pro â Student Seat',
    description: 'Verified student discount for Claude Pro. 5x usage, Claude Opus access. Requires .edu email verification through our portal.',
    bigCategory: 'compute-hub',
    subcategory: 'subscription',
    price: 10,
    originalPrice: 20,
    unit: '/mo',
    seller: { name: 'EduAI_Deals', rating: 4.6, reviews: 201, verified: true },
    badge: 'Student',
    featured: false,
    tags: ['Claude', 'student', 'Pro', 'Anthropic'],
    emoji: 'ð',
  },
  {
    id: 'listing-10',
    name: 'A100 40GB â Spot Instance',
    description: 'NVIDIA A100 PCIe 40GB spot instance. Ideal for fine-tuning 7Bâ70B models. SSH or Jupyter access included.',
    bigCategory: 'compute-hub',
    subcategory: 'cloud-gpu',
    price: 1.29,
    originalPrice: 1.89,
    unit: '/hr',
    seller: { name: 'CloudSlice_AI', rating: 4.5, reviews: 312, verified: true, badge: 'top-seller' },
    badge: undefined,
    featured: false,
    tags: ['A100', 'GPU', 'fine-tuning', 'cloud'],
    emoji: 'ð¥ï¸',
  },
  {
    id: 'listing-11',
    name: 'Gemini Advanced â Group Buy',
    description: 'Shared-seat access to Gemini 2.5 Ultra. 2M context window, Google ecosystem, Gems feature. Pay monthly.',
    bigCategory: 'compute-hub',
    subcategory: 'subscription',
    price: 12.50,
    originalPrice: 20,
    unit: '/mo',
    seller: { name: 'AIDeals_Pro', rating: 4.7, reviews: 178, verified: true },
    badge: 'Best Value',
    featured: true,
    tags: ['Gemini', 'Google', 'subscription', 'group-buy'],
    emoji: 'â¨',
  },
  // ââ Hardware Corner ââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'listing-12',
    name: 'RTX 4090 24GB â Like New',
    description: 'ASUS ROG STRIX RTX 4090 OC. Used 3 months, light gaming only. No mining. Original box, cables, GPU sag bracket. Ships insured.',
    bigCategory: 'hardware-corner',
    subcategory: 'used-gpu',
    price: 1299,
    originalPrice: 1999,
    unit: 'each',
    seller: { name: 'GamingUpgrade_Sam', rating: 5.0, reviews: 54, verified: true },
    badge: 'Verified HW',
    featured: true,
    tags: ['RTX 4090', 'GPU', 'NVIDIA', 'used'],
    emoji: 'ð',
  },
  {
    id: 'listing-13',
    name: 'NVIDIA Jetson Orin Nano Kit',
    description: 'Jetson Orin Nano 8GB dev kit â 40 TOPS AI. Includes fan, SD card with JetPack 6, camera module, and carry case.',
    bigCategory: 'hardware-corner',
    subcategory: 'ai-kit',
    price: 249,
    unit: 'each',
    seller: { name: 'MakerHub_Store', rating: 4.8, reviews: 132, verified: true },
    badge: undefined,
    featured: false,
    tags: ['Jetson', 'NVIDIA', 'edge-AI', 'kit'],
    emoji: 'ð¤',
  },
  {
    id: 'listing-14',
    name: 'MacBook Pro M3 Max â AI Ready',
    description: '16" MacBook Pro M3 Max, 48GB RAM, 1TB SSD. Pre-loaded with Ollama, LM Studio, and local LLM setup guide.',
    bigCategory: 'hardware-corner',
    subcategory: 'ai-laptop',
    price: 2299,
    originalPrice: 3999,
    unit: 'each',
    seller: { name: 'CertifiedRefurb_AI', rating: 4.9, reviews: 29, verified: true, badge: 'top-seller' },
    badge: 'Certified Refurb',
    featured: true,
    tags: ['MacBook', 'Apple Silicon', 'M3', 'local LLM'],
    emoji: 'ð»',
  },
  {
    id: 'listing-15',
    name: 'Raspberry Pi AI Hat+ Bundle',
    description: 'RPi 5 8GB + AI HAT+ (13 TOPS) bundle. Hailo 8L chip. Runs vision models, voice assistants, object detection out of the box.',
    bigCategory: 'hardware-corner',
    subcategory: 'ai-kit',
    price: 129,
    unit: 'kit',
    seller: { name: 'EdgeAI_Supply', rating: 4.4, reviews: 87, verified: false },
    badge: 'New',
    featured: false,
    tags: ['Raspberry Pi', 'edge-AI', 'HAT', 'vision'],
    emoji: 'ð«',
  },
];

export function getListingsByCategory(cat?: BigCategory): MarketplaceListing[] {
  if (!cat) return allListings;
  return allListings.filter((l) => l.bigCategory === cat);
}

export function getFeaturedListings(): MarketplaceListing[] {
  return allListings.filter((l) => l.featured);
}
