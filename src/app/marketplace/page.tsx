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
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  marketplaceDeals,
  marketplaceCategories,
  getDiscountPct,
  type MarketplaceCategory,
  type MarketplaceDeal,
} from "@/lib/data";

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
      {/* Discount badge - top right */}
      <div className="absolute -top-2.5 -right-2.5 z-10">
        <div className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
          -{discountPct}%
        </div>
      </div>

      {/* Header: provider icon + name */}
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

      {/* Badge */}
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

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
        {deal.description}
      </p>

      {/* Pricing */}
      <div className="flex items-end gap-2 mb-4">
        <span className="text-2xl font-bold text-slate-900">
          ${deal.discounted_price.toFixed(2)}
        </span>
        <span className="text-sm text-slate-400 line-through mb-0.5">
          ${deal.original_price.toFixed(2)}
        </span>
        <span className="text-xs text-slate-400 mb-0.5">{deal.unit}</span>
      </div>

      {/* CTA */}
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

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | null>(null);

  const filteredDeals = activeCategory
    ? marketplaceDeals.filter((d) => d.category === activeCategory)
    : marketplaceDeals;

  // Sort featured first
  const sortedDeals = [...filteredDeals].sort(
    (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-pink-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-sm">
        <Navbar />
      </div>

      <main className="relative z-10 px-6 md:px-12 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-sm font-medium mb-4">
            <Store className="w-4 h-4" />
            AI Marketplace
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
            Exclusive Deals on{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-gradient-animate">
              AI Infrastructure
            </span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Discounted API tokens, subscriptions, and GPU rentals — curated for developers, researchers, and teams.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
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
        </motion.div>

        {/* Deals Grid */}
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
