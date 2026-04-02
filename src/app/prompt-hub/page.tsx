'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Heart, Download, Star, Copy, Check, ChevronRight,
  ArrowRight, Sparkles, Filter, Tag, Eye, Gift, ShoppingCart,
  BookOpen, MessageSquare, Zap, TrendingUp, Crown, BadgeCheck,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// ── Categories ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All Prompts', emoji: '✨', color: 'from-violet-500 to-purple-600' },
  { id: 'marketing', label: 'Marketing', emoji: '📢', color: 'from-pink-500 to-rose-600' },
  { id: 'coding', label: 'Coding', emoji: '💻', color: 'from-cyan-500 to-blue-600' },
  { id: 'writing', label: 'Writing', emoji: '✍️', color: 'from-emerald-500 to-green-600' },
  { id: 'business', label: 'Business', emoji: '💼', color: 'from-amber-500 to-orange-600' },
  { id: 'education', label: 'Education', emoji: '🎓', color: 'from-indigo-500 to-violet-600' },
  { id: 'seo', label: 'SEO', emoji: '🔍', color: 'from-teal-500 to-cyan-600' },
  { id: 'image-gen', label: 'Image Gen', emoji: '🎨', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡', color: 'from-yellow-500 to-amber-600' },
  { id: 'sales', label: 'Sales', emoji: '🤝', color: 'from-blue-500 to-indigo-600' },
  { id: 'hr', label: 'HR & Hiring', emoji: '👥', color: 'from-rose-500 to-red-600' },
  { id: 'data', label: 'Data & Analytics', emoji: '📊', color: 'from-green-500 to-emerald-600' },
];

// ── Quick filter tags ──────────────────────────────────────────
const QUICK_TAGS = [
  'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'GPT-4', 'Stable Diffusion',
  'DALL-E', 'Free', 'Beginner', 'Advanced', 'Package', 'Top Rated',
];

// ── Prompt data ────────────────────────────────────────────────
const PROMPTS = [
  {
    id: 'p1', title: 'Ultimate Blog Post Generator', description: 'Generate SEO-optimized, engaging blog posts on any topic. Includes headline options, meta descriptions, and internal linking suggestions.',
    category: 'writing', model: 'ChatGPT', price: 0, type: 'free',
    rating: 4.9, reviews: 342, downloads: 12400, saves: 890,
    tags: ['Blog', 'SEO', 'Content'], creator: 'PromptMaster', verified: true, badge: 'Top Rated',
    preview: 'Write a comprehensive blog post about [TOPIC]. Include: 1) An attention-grabbing headline with a power word...',
  },
  {
    id: 'p2', title: 'SaaS Landing Page Copy Pack', description: 'Complete landing page copy framework: hero, features, social proof, FAQ, and CTA sections. Tested on 50+ SaaS products.',
    category: 'marketing', model: 'Claude', price: 4.99, type: 'paid',
    rating: 4.8, reviews: 218, downloads: 5600, saves: 720,
    tags: ['SaaS', 'Landing Page', 'Conversion'], creator: 'CopyGenius', verified: true, badge: 'Bestseller',
  },
  {
    id: 'p3', title: 'React Component Builder', description: 'Generate production-ready React components with TypeScript, Tailwind CSS, proper error handling, and accessibility built in.',
    category: 'coding', model: 'Claude', price: 0, type: 'free',
    rating: 4.7, reviews: 567, downloads: 18200, saves: 1340,
    tags: ['React', 'TypeScript', 'Tailwind'], creator: 'DevPrompts', verified: true, badge: 'Popular',
  },
  {
    id: 'p4', title: 'LinkedIn Content Machine', description: 'Create viral LinkedIn posts, carousel scripts, and comment strategies. Includes 30 proven hook templates.',
    category: 'marketing', model: 'ChatGPT', price: 2.99, type: 'paid',
    rating: 4.6, reviews: 189, downloads: 7800, saves: 560,
    tags: ['LinkedIn', 'Social Media', 'Hooks'], creator: 'SocialAI', verified: false, badge: null,
  },
  {
    id: 'p5', title: 'Full-Stack API Generator', description: 'Design and generate complete REST APIs with authentication, validation, error handling, and database schemas.',
    category: 'coding', model: 'GPT-4', price: 7.99, type: 'paid',
    rating: 4.9, reviews: 134, downloads: 3200, saves: 410,
    tags: ['API', 'Node.js', 'Database'], creator: 'CodeForge', verified: true, badge: 'Top Rated',
  },
  {
    id: 'p6', title: 'Midjourney Cinematic Pack', description: '50 battle-tested Midjourney prompts for photorealistic, cinematic scenes. Includes lighting, camera angle, and style modifiers.',
    category: 'image-gen', model: 'Midjourney', price: 9.99, type: 'paid',
    rating: 4.8, reviews: 456, downloads: 9100, saves: 1200,
    tags: ['Cinematic', 'Photorealistic', '50 Prompts'], creator: 'ArtisanAI', verified: true, badge: 'Bestseller',
  },
  {
    id: 'p7', title: 'SEO Keyword Research Assistant', description: 'Extract high-intent keywords, group them by topic clusters, and generate content briefs — all from a single seed keyword.',
    category: 'seo', model: 'ChatGPT', price: 0, type: 'free',
    rating: 4.5, reviews: 298, downloads: 11500, saves: 780,
    tags: ['Keywords', 'Topic Clusters', 'Brief'], creator: 'SEOWizard', verified: true, badge: 'Popular',
  },
  {
    id: 'p8', title: 'Investor Pitch Deck Writer', description: 'Generate a complete investor pitch deck narrative: problem, solution, market size, traction, team, and ask slides.',
    category: 'business', model: 'Claude', price: 12.99, type: 'paid',
    rating: 4.9, reviews: 87, downloads: 2100, saves: 340,
    tags: ['Pitch Deck', 'Startup', 'Fundraising'], creator: 'VCReady', verified: true, badge: 'Top Rated',
  },
  {
    id: 'p9', title: 'Lesson Plan Creator', description: 'Design engaging lesson plans for any subject and grade level. Includes learning objectives, activities, assessments, and differentiation strategies.',
    category: 'education', model: 'ChatGPT', price: 0, type: 'free',
    rating: 4.7, reviews: 412, downloads: 15600, saves: 920,
    tags: ['K-12', 'Lesson Plans', 'Curriculum'], creator: 'EduPrompts', verified: false, badge: 'Popular',
  },
  {
    id: 'p10', title: 'Cold Email Sequence Builder', description: '5-email cold outreach sequence with personalization slots, follow-up timing, and A/B test variations. 40%+ open rate tested.',
    category: 'sales', model: 'ChatGPT', price: 5.99, type: 'paid',
    rating: 4.6, reviews: 156, downloads: 4300, saves: 380,
    tags: ['Cold Email', 'Outreach', 'B2B'], creator: 'SalesHacker', verified: true, badge: null,
  },
  {
    id: 'p11', title: 'Data Dashboard Storyteller', description: 'Turn raw data and charts into executive-ready narratives. Identifies trends, anomalies, and actionable insights automatically.',
    category: 'data', model: 'GPT-4', price: 3.99, type: 'paid',
    rating: 4.5, reviews: 98, downloads: 2800, saves: 210,
    tags: ['Analytics', 'Reports', 'Insights'], creator: 'DataNerd', verified: false, badge: null,
  },
  {
    id: 'p12', title: 'Daily Productivity System', description: 'AI-powered daily planning prompt: prioritize tasks, time-block your calendar, set focus intentions, and do an end-of-day review.',
    category: 'productivity', model: 'Claude', price: 0, type: 'free',
    rating: 4.8, reviews: 523, downloads: 19800, saves: 1560,
    tags: ['Planning', 'Focus', 'GTD'], creator: 'ProductiveAI', verified: true, badge: 'Top Rated',
  },
  {
    id: 'p13', title: 'HR Job Description Generator', description: 'Create inclusive, compelling job descriptions with clear requirements, benefits, and culture sections. Removes bias automatically.',
    category: 'hr', model: 'ChatGPT', price: 0, type: 'free',
    rating: 4.4, reviews: 167, downloads: 6700, saves: 430,
    tags: ['Job Posts', 'Inclusive', 'Hiring'], creator: 'HireRight', verified: true, badge: null,
  },
  {
    id: 'p14', title: 'DALL-E Product Photography', description: '25 optimized DALL-E 3 prompts for e-commerce product photography. Includes lifestyle shots, flat lays, and studio setups.',
    category: 'image-gen', model: 'DALL-E', price: 6.99, type: 'paid',
    rating: 4.7, reviews: 231, downloads: 5400, saves: 670,
    tags: ['E-commerce', 'Product Photos', '25 Prompts'], creator: 'VisualAI', verified: true, badge: 'Popular',
  },
  {
    id: 'p15', title: 'Python Debugging Assistant', description: 'Paste any Python error and get a step-by-step fix with explanation. Handles common libraries: pandas, numpy, flask, django, fastapi.',
    category: 'coding', model: 'GPT-4', price: 0, type: 'free',
    rating: 4.6, reviews: 389, downloads: 14300, saves: 1090,
    tags: ['Python', 'Debugging', 'Error Fix'], creator: 'PyHelper', verified: false, badge: 'Popular',
  },
  {
    id: 'p16', title: 'Complete Content Calendar', description: 'Generate a 30-day content calendar with post ideas, captions, hashtags, and optimal posting times for any niche.',
    category: 'marketing', model: 'Claude', price: 8.99, type: 'paid',
    rating: 4.8, reviews: 276, downloads: 8900, saves: 950,
    tags: ['Content Calendar', '30 Days', 'Social Media'], creator: 'ContentPro', verified: true, badge: 'Bestseller',
  },
];

const BADGE_STYLES: Record<string, string> = {
  'Top Rated': 'from-amber-400 to-orange-500',
  'Bestseller': 'from-emerald-400 to-green-500',
  'Popular': 'from-violet-400 to-purple-500',
  'New': 'from-cyan-400 to-blue-500',
};

const MODEL_COLORS: Record<string, string> = {
  'ChatGPT': 'bg-emerald-100 text-emerald-700',
  'Claude': 'bg-violet-100 text-violet-700',
  'GPT-4': 'bg-blue-100 text-blue-700',
  'Gemini': 'bg-cyan-100 text-cyan-700',
  'Midjourney': 'bg-indigo-100 text-indigo-700',
  'DALL-E': 'bg-pink-100 text-pink-700',
  'Stable Diffusion': 'bg-amber-100 text-amber-700',
};

// ── Prompt Card ────────────────────────────────────────────────
function PromptCard({ prompt, index }: { prompt: typeof PROMPTS[0]; index: number }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    if (prompt.preview) {
      navigator.clipboard.writeText(prompt.preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/40 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Badge */}
      {prompt.badge && (
        <div className={`absolute top-3 right-3 z-10 text-[10px] font-bold text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${BADGE_STYLES[prompt.badge] || 'from-slate-400 to-slate-500'} shadow-sm`}>
          {prompt.badge}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Model + Price row */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${MODEL_COLORS[prompt.model] || 'bg-slate-100 text-slate-600'}`}>
            {prompt.model}
          </span>
          {prompt.type === 'free' ? (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Free</span>
          ) : (
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">${prompt.price?.toFixed(2)}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-violet-700 transition-colors">
          {prompt.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2 flex-1">
          {prompt.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
              {tag}
            </span>
          ))}
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 mb-3 py-2 border-t border-gray-100">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold">
            {prompt.creator[0]}
          </div>
          <span className="text-xs text-slate-600 font-medium">{prompt.creator}</span>
          {prompt.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-4">
          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{prompt.rating}</span>
          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{(prompt.downloads / 1000).toFixed(1)}k</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{prompt.reviews} reviews</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          {prompt.type === 'free' ? (
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>}
            </button>
          ) : (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition-all shadow-sm hover:shadow-md">
              <ShoppingCart className="w-3.5 h-3.5" /> Buy — ${prompt.price?.toFixed(2)}
            </button>
          )}
          <button
            onClick={() => setSaved(!saved)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              saved ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-gray-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Stats Section ──────────────────────────────────────────────
const HERO_STATS = [
  { val: '4,800+', label: 'Prompts', icon: MessageSquare },
  { val: '12', label: 'Categories', icon: Tag },
  { val: '2,100+', label: 'Creators', icon: Crown },
  { val: '50K+', label: 'Downloads', icon: Download },
];

// ── Main Page ──────────────────────────────────────────────────
export default function PromptHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredPrompts = useMemo(() => {
    let results = [...PROMPTS];

    // Category filter
    if (activeCategory !== 'all') {
      results = results.filter((p) => p.category === activeCategory);
    }

    // Price filter
    if (priceFilter === 'free') results = results.filter((p) => p.type === 'free');
    if (priceFilter === 'paid') results = results.filter((p) => p.type === 'paid');

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.model.toLowerCase().includes(q) ||
          p.creator.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (activeTags.length > 0) {
      results = results.filter((p) =>
        activeTags.some(
          (tag) =>
            p.model === tag ||
            p.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())) ||
            (tag === 'Free' && p.type === 'free') ||
            (tag === 'Top Rated' && p.badge === 'Top Rated') ||
            (tag === 'Beginner' && true) ||
            (tag === 'Advanced' && p.price && p.price > 5) ||
            (tag === 'Package' && p.tags.some((t) => t.includes('Prompt')))
        )
      );
    }

    // Sort
    if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'newest') results.reverse();
    else results.sort((a, b) => b.downloads - a.downloads);

    return results;
  }, [searchQuery, activeCategory, activeTags, priceFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-violet-50 border-b border-gray-200/60">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/30 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/25 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-12 text-center">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-5">
            <Link href="/hub" className="text-xs text-slate-400 hover:text-violet-600 transition-colors">Hub</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-xs text-violet-600 font-semibold">Prompt Hub</span>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Prompt{' '}
            <span className="bg-gradient-to-r from-rose-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Hub
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-500 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Buy, sell, learn, and donate AI prompt packages. Battle-tested prompts for ChatGPT, Claude, Gemini, Midjourney & more.
          </motion.p>

          {/* ── Search Bar ──────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative max-w-2xl mx-auto mb-6">
            <div className="relative flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts, categories, creators..."
                className="flex-1 pl-12 pr-4 py-4 text-sm text-slate-900 bg-transparent rounded-2xl focus:outline-none placeholder-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* ── Quick Tags (sub-bubbles) ────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  activeTags.includes(tag)
                    ? 'bg-violet-100 text-violet-700 border-violet-300 shadow-sm'
                    : 'bg-white text-slate-500 border-gray-200 hover:border-violet-200 hover:text-violet-600 hover:bg-violet-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* ── Stats ───────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {HERO_STATS.map(({ val, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-0.5">{val}</div>
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <Icon className="w-3 h-3" /> {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ── Category pills + Filters ─────────────────── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-600 border-gray-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Price filter */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
              {(['all', 'free', 'paid'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPriceFilter(f)}
                  className={`px-3 py-2 text-xs font-semibold transition-all ${
                    priceFilter === f
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'free' ? '🆓 Free' : '💰 Paid'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl text-slate-600 focus:outline-none focus:border-violet-300 cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* ── Results count ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredPrompts.length}</span> prompts
            {activeCategory !== 'all' && (
              <> in <span className="font-bold text-violet-600">{CATEGORIES.find((c) => c.id === activeCategory)?.label}</span></>
            )}
          </p>
          {(activeTags.length > 0 || searchQuery) && (
            <button
              onClick={() => { setActiveTags([]); setSearchQuery(''); setActiveCategory('all'); setPriceFilter('all'); }}
              className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Prompt Grid ──────────────────────────────── */}
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No prompts found</h3>
            <p className="text-sm text-slate-400">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPrompts.map((prompt, i) => (
              <PromptCard key={prompt.id} prompt={prompt} index={i} />
            ))}
          </div>
        )}

        {/* ── Contribute CTA ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Share Your Best Prompts</h2>
            <p className="text-violet-200 text-base mb-7 max-w-lg mx-auto leading-relaxed">
              Got a prompt that works like magic? Sell it, share it for free, or donate it to the community. Join 2,100+ creators on the Prompt Hub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-violet-700 bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Sell a Prompt
              </Link>
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all">
                <Gift className="w-4 h-4" />
                Donate for Free
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
