"use client";

import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Loader2, ShoppingBag, Tag,
  Star, Shield, Zap, Users, DollarSign, Package, GraduationCap,
  ChevronRight, BadgeCheck, Upload, HandCoins, CheckCircle2,
  Brain, Cpu, Monitor, Rocket, Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getFeaturedListings, type MarketplaceListing } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-gray-200 shadow-sm">
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

// ── Star Rating ────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3 h-3 ${
            n <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"
          }`}
        />
      ))}
      <span className="text-[11px] text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Category badge colors ───────────────────────────────────────
const catBadgeStyle: Record<string, string> = {
  "digital-assets": "bg-purple-100 text-purple-700",
  "compute-hub": "bg-cyan-100 text-cyan-700",
  "hardware-corner": "bg-emerald-100 text-emerald-700",
};
const catBadgeLabel: Record<string, string> = {
  "digital-assets": "Digital Asset",
  "compute-hub": "Compute Hub",
  "hardware-corner": "Hardware",
};
const listingBadgeGradients: Record<string, string> = {
  Bestseller: "from-amber-400 to-orange-500",
  Verified: "from-emerald-400 to-teal-500",
  Hot: "from-red-400 to-orange-500",
  Student: "from-violet-400 to-purple-500",
  "Best Value": "from-emerald-400 to-green-500",
  "Verified HW": "from-blue-400 to-indigo-500",
  "Certified Refurb": "from-blue-400 to-cyan-500",
  Professional: "from-slate-500 to-slate-600",
  Popular: "from-pink-400 to-rose-500",
  New: "from-cyan-400 to-blue-500",
};

// ── Featured Listing Card ──────────────────────────────────────
function ListingCard({ listing, index }: { listing: MarketplaceListing; index: number }) {
  const discountPct = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.09)" }}
      className="relative bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-200 transition-all duration-300 flex flex-col"
    >
      {discountPct && (
        <div className="absolute -top-2.5 -right-2.5 z-10 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
          -{discountPct}%
        </div>
      )}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${catBadgeStyle[listing.bigCategory]}`}>
          {catBadgeLabel[listing.bigCategory]}
        </span>
        {listing.badge && (
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold text-white bg-gradient-to-r ${listingBadgeGradients[listing.badge] ?? "from-slate-400 to-slate-500"}`}>
            {listing.badge}
          </span>
        )}
      </div>
      <div className="flex items-start gap-3 mb-2">
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${catBadgeStyle[listing.bigCategory]}`}>
          {listing.bigCategory === "digital-assets" && <Brain className="w-5 h-5" />}
          {listing.bigCategory === "compute-hub" && <Cpu className="w-5 h-5" />}
          {listing.bigCategory === "hardware-corner" && <Monitor className="w-5 h-5" />}
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{listing.name}</h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">{listing.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {listing.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-3">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-slate-700">{listing.seller.name}</span>
            {listing.seller.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
          </div>
          <StarRating rating={listing.seller.rating} />
        </div>
        <span className="text-[10px] text-slate-400">{listing.seller.reviews} reviews</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl font-black text-slate-900">${listing.price.toFixed(2)}</span>
          <span className="text-xs text-slate-400 ml-1">{listing.unit}</span>
          {listing.originalPrice && (
            <div className="text-[11px] text-slate-400 line-through">${listing.originalPrice.toFixed(2)}</div>
          )}
        </div>
        <Link
          href="/marketplace"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all"
        >
          View Deal <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Hero Search Bar ────────────────────────────────────────────
function HeroSearchBar() {
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
    router.push(`/search?q=${encodeURIComponent(term)}`);
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
  const featuredListings = getFeaturedListings().slice(0, 6);

  const stats = [
    { value: "15K+", label: "Listings", icon: Package },
    { value: "$3.2M", label: "Traded", icon: DollarSign },
    { value: "6.4K", label: "Sellers", icon: Users },
    { value: "99%", label: "Satisfaction", icon: Star },
  ];

  const pillars = [
    {
      icon: Brain,
      iconBg: "bg-purple-100 text-purple-600",
      title: "Digital Assets",
      description: "Prompt bundles, custom AI agents, fine-tuned models & LoRAs for every use case.",
      tags: ["Prompts", "Agents", "Fine-tuned Models", "LoRAs"],
      href: "/marketplace?cat=digital-assets",
      gradient: "from-purple-50 to-indigo-50",
      border: "border-purple-200",
      tagStyle: "bg-purple-100 text-purple-700",
      linkStyle: "text-purple-600 hover:text-purple-800",
      count: "8,200+ listings",
    },
    {
      icon: Cpu,
      iconBg: "bg-cyan-100 text-cyan-600",
      title: "Compute Hub",
      description: "P2P GPU rentals, discounted API tokens, and group-buy AI subscriptions.",
      tags: ["GPU Rentals", "API Credits", "Subscriptions", "Cloud Compute"],
      href: "/marketplace?cat=compute-hub",
      gradient: "from-cyan-50 to-sky-50",
      border: "border-cyan-200",
      tagStyle: "bg-cyan-100 text-cyan-700",
      linkStyle: "text-cyan-600 hover:text-cyan-800",
      count: "4,100+ listings",
    },
    {
      icon: Monitor,
      iconBg: "bg-emerald-100 text-emerald-600",
      title: "Hardware Corner",
      description: "Verified used GPUs, AI edge kits, and pre-configured AI laptops & servers.",
      tags: ["Used GPUs", "AI Kits", "Laptops", "Servers"],
      href: "/marketplace?cat=hardware-corner",
      gradient: "from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      tagStyle: "bg-emerald-100 text-emerald-700",
      linkStyle: "text-emerald-600 hover:text-emerald-800",
      count: "2,700+ listings",
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: "List Your Item",
      desc: "Add a prompt, model, hardware listing, or GPU slot in minutes. We verify all sellers.",
      color: "text-purple-500 bg-purple-50",
      num: "01",
    },
    {
      icon: Users,
      title: "Connect with Buyers",
      desc: "Reach 15,000+ verified AI developers, students, and startups worldwide.",
      color: "text-cyan-500 bg-cyan-50",
      num: "02",
    },
    {
      icon: HandCoins,
      title: "Get Paid Instantly",
      desc: "Secure escrow payments. Funds released on delivery. 0% fee on your first 3 sales.",
      color: "text-emerald-500 bg-emerald-50",
      num: "03",
    },
  ];

  const studentPerks = [
    "50% off Claude Pro",
    "GPU credits for finals",
    "Free agent templates",
    "Study group compute pools",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <Navbar />
      </div>

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

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-14 md:pt-14 md:pb-20 text-center">
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
          <HeroSearchBar />

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link
              href="/marketplace"
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
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
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
      <div>

          {/* ── CATEGORY PILLARS ─────────────────────────────────────── */}
          <section className="bg-white py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
                  What can you trade on{" "}
                  <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                    WhichAi?
                  </span>
                </h2>
                <p className="text-slate-500 text-base">Three categories. Infinite possibilities.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {pillars.map((pillar, i) => (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`group relative overflow-hidden rounded-3xl p-7 border-2 ${pillar.border} bg-gradient-to-br ${pillar.gradient} transition-all duration-300 hover:shadow-xl`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${pillar.iconBg} flex items-center justify-center mb-4`}>
                      <pillar.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{pillar.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{pillar.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {pillar.tags.map((tag) => (
                        <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${pillar.tagStyle}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{pillar.count}</span>
                      <Link
                        href={pillar.href}
                        className={`flex items-center gap-1 text-sm font-semibold ${pillar.linkStyle} transition-colors`}
                      >
                        Browse <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURED LISTINGS ─────────────────────────────────────── */}
          <section className="bg-gray-50 py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-8"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Featured Listings</h2>
                  <p className="text-slate-500 mt-1 text-sm">Handpicked by the WhichAi team</p>
                </div>
                <Link
                  href="/marketplace"
                  className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredListings.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ── STUDENT SWAP ───────────────────────────────────────────── */}
          <section className="relative overflow-hidden py-16 px-6 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 max-w-2xl mx-auto text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-5">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">The Student Swap</h2>
              <p className="text-purple-200 text-base mb-7 leading-relaxed">
                A dedicated space for university students to trade AI credits, borrow GPU power for final
                projects, and unlock verified student discounts — using your{" "}
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">.edu</code> email.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 mb-7">
                {studentPerks.map((perk) => (
                  <span key={perk} className="flex items-center gap-1.5 text-sm text-purple-100 bg-white/10 px-4 py-2 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                    {perk}
                  </span>
                ))}
              </div>
              <Link
                href={user ? "/marketplace" : "/auth/signup"}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-purple-700 bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
              >
                <GraduationCap className="w-5 h-5" />
                {user ? "Go to Student Swap" : "Join with .edu Email"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </section>

          {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
          <section className="bg-white py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">How it works</h2>
                <p className="text-slate-500 text-base">Start buying or selling in under 5 minutes.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="text-center"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className="w-7 h-7" />
                    </div>
                    <div className="text-5xl font-black text-slate-100 mb-2 leading-none">{step.num}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── BOTTOM CTA ─────────────────────────────────────────────── */}
          <section className="bg-white py-14 px-6 border-t border-gray-100">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-7 h-7 text-purple-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
                Ready to join the AI economy?
              </h2>
              <p className="text-slate-500 mb-7 text-base">
                Whether you&apos;re buying your first prompt or renting out an H100, WhichAi is built for you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-7">
                <Link
                  href="/marketplace"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_30px_rgba(168,85,85,247,0.4)] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Browse Marketplace
                </Link>
                <Link
                  href={user ? "/marketplace" : "/auth/signup"}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-slate-700 border-2 border-slate-200 hover:border-purple-300 hover:text-purple-600 transition-all"
                >
                  <Tag className="w-4 h-4" />
                  {user ? "List Your Item" : "Sign Up Free"}
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Escrow Protected</span>
                <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" /> Verified Sellers</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Instant Delivery</span>
              </div>
            </motion.div>
          </section>

      </div>{/* end main content */}

      <VisitorCounter />
    </div>
  );
}
