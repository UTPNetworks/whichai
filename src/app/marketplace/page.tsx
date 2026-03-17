"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Tag,
  ArrowRight,
  Cpu,
  Key,
  MessageSquare,
  Flame,
  GraduationCap,
  Star,
  Clock,
  ExternalLink,
  Sparkles,
  Loader2,
  Code2,
  Eye,
  Mic,
  Image,
  Globe,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  marketplaceDeals,
  marketplaceCategories,
  getDiscountPct,
  getAllProducts,
  formatPrice,
  type MarketplaceCategory,
  type MarketplaceDeal,
  type AIProduct,
} from "@/lib/data";

// ── Deals section ─────────────────────────────────────────────────────────────

const categoryIcons: Record<MarketplaceCategory, typeof Key> = {
  "api-tokens": Key,
  "llm-subscriptions": MessageSquare,
  "gpu-deals": Cpu,
};

const badgeStyles: Record<string, string> = {
  "Hot Deal": "from-red-500 to-orange-500",
  Popular: "from-purple-500 to-pink-500",
  New: "from-cyan-500 to-blue-500",
  "Student Special": "from-violet-500 to-purple-500",
  "Best Value": "from-emerald-500 to-green-500",
  "Team Deal": "from-blue-500 to-indigo-500",
  Limited: "from-amber-500 to-yellow-500",
  "Budget Pick": "from-teal-500 to-cyan-500",
};

const providerInitials: Record<string, { letter: string; bg: string }> = {
  OpenAI: { letter: "O", bg: "from-green-400 to-emerald-500" },
  Anthropic: { letter: "A", bg: "from-orange-400 to-amber-500" },
  Google: { letter: "G", bg: "from-blue-400 to-indigo-500" },
  "Google Cloud": { letter: "G", bg: "from-blue-400 to-cyan-500" },
  Mistral: { letter: "M", bg: "from-purple-400 to-violet-500" },
  "Lambda Cloud": { letter: "λ", bg: "from-pink-400 to-rose-500" },
  CoreWeave: { letter: "C", bg: "from-cyan-400 to-teal-500" },
  RunPod: { letter: "R", bg: "from-indigo-400 to-blue-500" },
};

function DealCard({ deal, index }: { deal: MarketplaceDeal; index: number }) {
  const discountPct = getDiscountPct(deal.original_price, deal.discounted_price);
  const provider = providerInitials[deal.provider] || {
    letter: deal.provider[0],
    bg: "from-slate-400 to-slate-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`relative bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col ${
        deal.featured
          ? "border-purple-200 animate-neon-breathe"
          : "border-gray-200 hover:border-purple-200"
      }`}
    >
      <div className="absolute -top-2.5 -right-2.5 z-10">
        <div className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
          -{discountPct}%
        </div>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${provider.bg} flex items-center justify-center text-white font-bold text-lg shrink-0 group-hover:scale-110 transition-transform`}
        >
          {provider.letter}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-purple-600 transition-colors">
            {deal.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{deal.provider}</p>
        </div>
      </div>

      {deal.badge && (
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${
              badgeStyles[deal.badge] || "from-slate-400 to-slate-500"
            }`}
          >
            {deal.badge === "Hot Deal" && <Flame className="w-3 h-3" />}
            {deal.badge === "Student Special" && <GraduationCap className="w-3 h-3" />}
            {deal.badge === "Best Value" && <Star className="w-3 h-3" />}
            {deal.badge === "Limited" && <Clock className="w-3 h-3" />}
            {deal.badge}
          </span>
        </div>
      )}

      <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
        {deal.description}
      </p>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-2xl font-bold text-slate-900">
          ${deal.discounted_price.toFixed(2)}
        </span>
        <span className="text-sm text-slate-400 line-through mb-0.5">
          ${deal.original_price.toFixed(2)}
        </span>
        <span className="text-xs text-slate-400 mb-0.5">{deal.unit}</span>
      </div>

      <a
        href={deal.claim_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all group/btn"
      >
        {deal.category === "gpu-deals" ? "Rent Now" : "Claim Discount"}
        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </a>
    </motion.div>
  );
}

// ── AI Tools section ──────────────────────────────────────────────────────────

const TOOL_CATEGORIES = [
  { value: "all", label: "All Tools", Icon: Sparkles },
  { value: "code", label: "Code", Icon: Code2 },
  { value: "vision", label: "Vision", Icon: Eye },
  { value: "voice", label: "Voice", Icon: Mic },
  { value: "image", label: "Image Gen", Icon: Image },
  { value: "chatbot", label: "Chat / Web", Icon: Globe },
  { value: "multimodal", label: "Multimodal", Icon: Zap },
];

function ToolCard({ product, index }: { product: AIProduct; index: number }) {
  const featureKeys = ["vision", "voice", "image_gen", "code_interpreter", "web_browsing", "api_available"];
  const activeFeatures = featureKeys.filter((k) => product.features[k] === true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all duration-300 group flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-slate-800 font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
          {product.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-400">{product.provider}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize shrink-0">
          {product.category}
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">
        {product.description}
      </p>

      {activeFeatures.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {activeFeatures.slice(0, 4).map((f) => (
            <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
              {f.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm font-bold text-slate-900">
          {formatPrice(product.base_price_monthly)}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all"
        >
          View Details
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | null>(null);
  const [toolFilter, setToolFilter] = useState("all");
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    getAllProducts().then((prods) => {
      setProducts(prods);
      setLoadingTools(false);
    });
  }, []);

  const filteredDeals = activeCategory
    ? marketplaceDeals.filter((d) => d.category === activeCategory)
    : marketplaceDeals;
  const sortedDeals = [...filteredDeals].sort(
    (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
  );

  const filteredTools =
    toolFilter === "all"
      ? products
      : products.filter((p) => {
          if (toolFilter === "voice") return p.features.voice === true;
          if (toolFilter === "vision") return p.features.vision === true;
          return p.category === toolFilter;
        });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-pink-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-sm">
        <Navbar />
      </div>

      <main className="relative z-10 px-6 md:px-12 py-8 max-w-7xl mx-auto">

        {/* ── Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl mb-10 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-px bg-gradient-animate"
        >
          <div className="bg-white rounded-2xl px-8 py-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-sm font-medium mb-3">
              <Store className="w-4 h-4" />
              AI Marketplace
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
              Welcome to the World&apos;s Biggest{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-gradient-animate">
                AI Marketplace
              </span>
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
              Discover, compare, and unlock the best AI tools — from chatbots to code assistants, image generators to voice models.
            </p>
          </div>
        </motion.div>

        {/* ── AI Tools Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-slate-900">AI Tools</h2>
          </div>

          {/* Tool category filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TOOL_CATEGORIES.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setToolFilter(value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  toolFilter === value
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-500 border border-gray-200 hover:border-purple-200 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {loadingTools ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={toolFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredTools.map((product, i) => (
                  <ToolCard key={product.id} product={product} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loadingTools && filteredTools.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No tools found in this category.</p>
            </div>
          )}
        </motion.div>

        {/* ── Deals Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Tag className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900">Exclusive Deals</h2>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Discounted API tokens, subscriptions, and GPU rentals — curated for developers, researchers, and teams.
          </p>

          {/* Deal category tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === null
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-500 border border-gray-200 hover:border-purple-200 hover:text-slate-900"
              }`}
            >
              All Deals
            </button>
            {marketplaceCategories.map((cat) => {
              const Icon = categoryIcons[cat.value];
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white text-slate-500 border border-gray-200 hover:border-purple-200 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory || "all"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {sortedDeals.map((deal, i) => (
                <DealCard key={deal.id} deal={deal} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {sortedDeals.length === 0 && (
            <div className="text-center py-16">
              <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No deals found in this category.</p>
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate">
            <div className="bg-white rounded-2xl px-8 py-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Want custom volume pricing?
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Teams processing 10M+ tokens/month qualify for enterprise rates.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
