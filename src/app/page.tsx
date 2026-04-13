"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, ShoppingBag, Tag,
  Star, Shield, Zap, Users, DollarSign, Package,
  BadgeCheck, Upload, HandCoins,
  Rocket, Search, Lock, Eye, TrendingUp, X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import MarketplaceAssetsBar from "@/components/MarketplaceAssetsBar";
import { allListingsV3 } from "@/lib/data";

// ── Auth Gate Modal ───────────────────────────────────────────
function AuthGateModal({ isOpen, onClose, context }: { isOpen: boolean; onClose: () => void; context: "marketplace" | "search" }) {
  if (!isOpen) return null;

  const headlines = {
    marketplace: "Your AI marketplace awaits",
    search: "Unlock full search results",
  };

  const descriptions = {
    marketplace: "Sign in to browse 15K+ listings — AI prompts, GPU rentals, fine-tuned models, and more. All verified, all secure.",
    search: "Create a free account to explore detailed listings, compare prices, and connect with verified sellers worldwide.",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Gradient header */}
            <div className="relative bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 px-8 pt-10 pb-14 text-center overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, damping: 15, stiffness: 200 }}
                className="relative z-10 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/30"
              >
                <Lock className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="relative z-10 text-2xl font-extrabold text-white mb-2">
                {headlines[context]}
              </h2>
              <p className="relative z-10 text-white/80 text-sm leading-relaxed max-w-xs mx-auto">
                {descriptions[context]}
              </p>
            </div>

            {/* Content */}
            <div className="px-8 pb-8 -mt-6">
              {/* Stats preview card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-slate-50 to-purple-50/50 rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm"
              >
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-black text-slate-900">15K+</div>
                    <div className="text-[10px] text-slate-500 font-medium">Listings</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-900">6.4K</div>
                    <div className="text-[10px] text-slate-500 font-medium">Sellers</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-900">99%</div>
                    <div className="text-[10px] text-slate-500 font-medium">Satisfaction</div>
                  </div>
                </div>
              </motion.div>

              {/* CTA buttons */}
              <Link
                href="/auth/signup"
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all duration-300 mb-3"
              >
                <Sparkles className="w-4 h-4" />
                Create Free Account
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl text-base font-bold text-slate-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
              >
                Sign In
              </Link>

              <p className="text-center text-[11px] text-slate-400 mt-4">
                Free to join · No credit card required
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Search Preview Modal ──────────────────────────────────────
function SearchPreviewModal({
  isOpen,
  onClose,
  query,
  resultCount,
  categoryBreakdown,
}: {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  resultCount: number;
  categoryBreakdown: { label: string; count: number; color: string }[];
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-8 pt-8 pb-2 text-center">
              {/* Animated search icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.05, damping: 15, stiffness: 200 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center mx-auto mb-4"
              >
                <Eye className="w-7 h-7 text-purple-600" />
              </motion.div>

              <h2 className="text-xl font-extrabold text-slate-900 mb-1">
                We found results for you!
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                Matching &ldquo;<span className="font-semibold text-purple-600">{query}</span>&rdquo;
              </p>
            </div>

            {/* Result count highlight */}
            <div className="mx-8 mb-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl p-5 border border-purple-100 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 12 }}
                  className="text-5xl font-black bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-1"
                >
                  {resultCount}
                </motion.div>
                <p className="text-sm text-slate-600 font-medium">
                  {resultCount === 1 ? "listing matches" : "listings match"} your search
                </p>
              </motion.div>
            </div>

            {/* Category breakdown — blurred teaser */}
            <div className="mx-8 mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Results by category
              </p>
              <div className="space-y-2">
                {categoryBreakdown.map((cat, i) => (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="text-sm text-slate-600 flex-1">{cat.label}</span>
                    <span className="text-sm font-bold text-slate-900">{cat.count}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Blurred preview hint */}
            <div className="mx-8 mb-5 relative overflow-hidden rounded-xl">
              <div className="space-y-2 blur-[6px] pointer-events-none select-none opacity-50">
                <div className="bg-gray-100 rounded-lg h-12 flex items-center px-4 gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-12" />
                </div>
                <div className="bg-gray-100 rounded-lg h-12 flex items-center px-4 gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-1.5" />
                    <div className="h-2 bg-gray-200 rounded w-2/5" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-12" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-gray-200 shadow-sm">
                  <Lock className="w-3 h-3 text-purple-500" />
                  <span className="text-xs font-semibold text-slate-600">Sign in to view</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-8 pb-8">
              <Link
                href="/auth/signup"
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all duration-300 mb-3"
              >
                <Sparkles className="w-4 h-4" />
                Sign Up to See Results
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Visitor Counter ────────────────────────────────────────────
function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function trackVisit() {
      const alreadyCounted = sessionStorage.getItem("whichai_counted");
      if (!alreadyCounted) {
        const { data, error } = await supabase.rpc("increment_visitor_count");
        if (!error && data) {
          setCount(data as number);
          sessionStorage.setItem("whichai_counted", "1");
        }
      } else {
        const { data, error } = await supabase.rpc("get_visitor_count");
        if (!error && data) setCount(data as number);
      }
    }
    trackVisit();
  }, []);

  if (count === null) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="border-b border-gray-100"
    >
      <div className="px-6 py-1.5 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{count.toLocaleString()}</span> Total Visitors
        </span>
      </div>
    </motion.div>
  );
}


// ── Helper: count search results by category ─────────────────
function getSearchPreview(query: string) {
  const lower = query.toLowerCase();
  const matches = allListingsV3.filter(
    (l) =>
      l.name.toLowerCase().includes(lower) ||
      l.description.toLowerCase().includes(lower) ||
      l.tags.some((t) => t.toLowerCase().includes(lower)) ||
      l.bigCategory.toLowerCase().includes(lower) ||
      (l.seller?.name || "").toLowerCase().includes(lower) ||
      (l.location?.city || "").toLowerCase().includes(lower)
  );

  const catCounts: Record<string, number> = {};
  matches.forEach((l) => {
    const cat = l.bigCategory;
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });

  const catLabels: Record<string, { label: string; color: string }> = {
    "digital-assets": { label: "Digital Assets", color: "bg-purple-500" },
    "compute-hub": { label: "Compute Hub", color: "bg-cyan-500" },
    "hardware-corner": { label: "Hardware Corner", color: "bg-emerald-500" },
  };

  const breakdown = Object.entries(catCounts).map(([key, count]) => ({
    label: catLabels[key]?.label || key,
    count,
    color: catLabels[key]?.color || "bg-gray-400",
  }));

  return { total: matches.length, breakdown };
}

// ── Hero Search Bar ────────────────────────────────────────────
function HeroSearchBar({ onSearchGated }: { onSearchGated: (query: string, total: number, breakdown: { label: string; count: number; color: string }[]) => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    "ChatGPT API credits",
    "Stable Diffusion prompts",
    "H100 GPU rental",
    "Claude Pro subscription",
    "LLaMA fine-tuned model",
    "DALL-E 3 prompt pack",
    "Midjourney prompts",
    "GPT-4 Turbo API",
    "AI coding assistant",
    "Whisper transcription",
  ];

  const popular = ["ChatGPT API", "GPU Rentals", "AI Prompts", "H100", "Fine-tuned Models"];

  const filteredSuggestions = suggestions.filter(
    (s) => inputValue.trim() && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSearch = (q?: string) => {
    const term = (q || inputValue).trim();
    if (!term) return;

    // If user is authenticated, go straight to search results
    if (user) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
      return;
    }

    // Otherwise, show the gated preview popup with result count
    const preview = getSearchPreview(term);
    onSearchGated(term, preview.total, preview.breakdown);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative max-w-2xl mx-auto mb-10"
    >
      {/* Search input */}
      <div className="relative flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => { if (e.key === "Enter") { handleSearch(); setShowSuggestions(false); } }}
          placeholder="Search ChatGPT API, GPU rentals, AI prompts..."
          className="flex-1 pl-12 pr-4 py-4 text-base text-slate-900 bg-transparent rounded-2xl focus:outline-none placeholder-slate-400"
        />
        <button
          onClick={() => { handleSearch(); setShowSuggestions(false); }}
          className="m-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-300 shrink-0"
        >
          Search
        </button>
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
        >
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => { e.preventDefault(); handleSearch(s); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {s}
            </button>
          ))}
        </motion.div>
      )}

      {/* Popular search tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        <span className="text-xs text-slate-400 font-medium">Popular:</span>
        {popular.map((tag) => (
          <button
            key={tag}
            onClick={() => handleSearch(tag)}
            className="px-3 py-1 rounded-full text-xs bg-white border border-gray-200 text-slate-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm"
          >
            {tag}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();

  // Modal states
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateContext, setAuthGateContext] = useState<"marketplace" | "search">("marketplace");
  const [showSearchPreview, setShowSearchPreview] = useState(false);
  const [searchPreviewQuery, setSearchPreviewQuery] = useState("");
  const [searchPreviewCount, setSearchPreviewCount] = useState(0);
  const [searchPreviewBreakdown, setSearchPreviewBreakdown] = useState<{ label: string; count: number; color: string }[]>([]);

  const handleExploreClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthGateContext("marketplace");
      setShowAuthGate(true);
    }
  };

  const handleSearchGated = (query: string, total: number, breakdown: { label: string; count: number; color: string }[]) => {
    setSearchPreviewQuery(query);
    setSearchPreviewCount(total);
    setSearchPreviewBreakdown(breakdown);
    setShowSearchPreview(true);
  };

  const stats = [
    { value: "15K+", label: "Listings", icon: Package },
    { value: "$3.2M", label: "Traded", icon: DollarSign },
    { value: "6.4K", label: "Sellers", icon: Users },
    { value: "99%", label: "Satisfaction", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Visitor counter — below navbar */}
      <VisitorCounter />

      {/* ── HERO — full width ─────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] bg-purple-200/40 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-pink-200/25 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.4) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-4 pb-6 md:pt-6 md:pb-10 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-50 text-purple-600 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            World&apos;s First AI Marketplace — Est. 2025
          </motion.div>

          {/* Headline — 10% smaller than original 84px */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[46px] md:text-[60px] lg:text-[76px] font-black text-slate-900 leading-[0.9] tracking-tight mb-5"
          >
            BUY. SELL.
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              BUILD THE
              <br />
              FUTURE OF AI.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            The global marketplace for AI prompts, custom agents, fine-tuned models, GPU
            power, and AI hardware — made for builders, students &amp; startups.
          </motion.p>

          {/* ── SEARCH BAR ─────────────────────────────────────────── */}
          <HeroSearchBar onSearchGated={handleSearchGated} />

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Link
              href="/marketplace"
              onClick={handleExploreClick}
              className="flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.35)] transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              Explore Marketplace
            </Link>
            <Link
              href={user ? "/marketplace" : "/auth/signup"}
              className="flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-slate-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              <Tag className="w-5 h-5" />
              {user ? "Start Selling" : "Join Free"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-0 pb-0"
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{value}</div>
                <div className="text-slate-500 text-sm flex items-center justify-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="mt-[-2rem] relative z-20">

          {/* ── MARKETPLACE ASSETS ─────────────────────────────────────── */}
          <section className="bg-white mt-0 pt-0 pb-12 px-6">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-0 pt-0 mb-6"
              >
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0 pt-0 mb-2 leading-[1.1]">
                  What can you trade on{" "}
                  <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                    WhichAi?
                  </span>
                </h2>
                <p className="text-slate-500 text-base">Three categories. Infinite possibilities.</p>
              </motion.div>
            </div>
            <MarketplaceAssetsBar />
          </section>

      </div>{/* end main content */}

      {/* Auth gate modals */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        context={authGateContext}
      />
      <SearchPreviewModal
        isOpen={showSearchPreview}
        onClose={() => setShowSearchPreview(false)}
        query={searchPreviewQuery}
        resultCount={searchPreviewCount}
        categoryBreakdown={searchPreviewBreakdown}
      />
    </div>
  );
}
