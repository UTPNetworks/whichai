"use client";

import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, ShoppingBag, Tag,
  Star, Shield, Zap, Users, DollarSign, Package,
  BadgeCheck, Upload, HandCoins,
  Rocket, Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import MarketplaceAssetsBar from "@/components/MarketplaceAssetsBar";

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

  const stats = [
    { value: "15K+", label: "Listings", icon: Package },
    { value: "$3.2M", label: "Traded", icon: DollarSign },
    { value: "6.4K", label: "Sellers", icon: Users },
    { value: "99%", label: "Satisfaction", icon: Star },
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

          {/* ── MARKETPLACE ASSETS ─────────────────────────────────────── */}
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
            </div>
            <MarketplaceAssetsBar />
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

    </div>
  );
}
