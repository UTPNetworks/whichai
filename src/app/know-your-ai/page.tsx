"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ArrowLeft, Zap, Search, BarChart3, Layers,
  Star, Code, Music, Video, Sparkles, MessageSquare,
  Image, ChevronRight, TrendingUp, Shield, Globe, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── AI Model Database ────────────────────────────────────────────────────
const AI_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.8, description: "OpenAI's flagship multimodal model with text, vision, and audio capabilities.", badge: "Popular" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code"], pricing: "$", rating: 4.5, description: "Affordable, fast version of GPT-4o for everyday tasks.", badge: null },
  { id: "chatgpt-plus", name: "ChatGPT Plus", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning", "Image Gen"], pricing: "$$", rating: 4.9, description: "Premium ChatGPT with GPT-4o, DALL-E, browsing, and plugins.", badge: "Top Rated" },
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", category: "LLM", capability: ["Chat", "Code", "Reasoning", "Vision"], pricing: "$$$", rating: 4.9, description: "Anthropic's most powerful model for complex analysis and coding.", badge: "Top Rated" },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", category: "LLM", capability: ["Chat", "Code", "Reasoning", "Vision"], pricing: "$$", rating: 4.7, description: "Balanced performance and speed for most tasks.", badge: "Popular" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.7, description: "Google's most capable model with 1M token context.", badge: "New" },
  { id: "llama-3.1-405b", name: "Llama 3.1 405B", provider: "Meta", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "Free", rating: 4.6, description: "Meta's largest open-source model, rivaling proprietary models.", badge: "Open Source" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", category: "LLM", capability: ["Reasoning", "Code", "Chat"], pricing: "$", rating: 4.6, description: "Reasoning-focused model competitive with o1.", badge: "New" },
  { id: "dall-e-3", name: "DALL-E 3", provider: "OpenAI", category: "Image", capability: ["Image Gen"], pricing: "$$", rating: 4.6, description: "Advanced text-to-image generation with high fidelity.", badge: "Popular" },
  { id: "midjourney-v6", name: "Midjourney v6", provider: "Midjourney", category: "Image", capability: ["Image Gen"], pricing: "$$", rating: 4.8, description: "Industry-leading aesthetic quality for image generation.", badge: "Top Rated" },
  { id: "sora", name: "Sora", provider: "OpenAI", category: "Video", capability: ["Video Gen"], pricing: "$$$", rating: 4.5, description: "Text-to-video generation with cinematic quality.", badge: "New" },
  { id: "claude-code", name: "Claude Code", provider: "Anthropic", category: "Code", capability: ["Code", "Chat", "Reasoning"], pricing: "$$", rating: 4.8, description: "Agentic coding tool that works directly in your terminal.", badge: "New" },
];

const CATEGORY_ICONS: Record<string, typeof Brain> = {
  LLM: MessageSquare,
  Image: Image,
  Video: Video,
  Audio: Music,
  Code: Code,
};

const PROVIDER_COLORS: Record<string, string> = {
  "OpenAI": "bg-emerald-100 text-emerald-700",
  "Anthropic": "bg-orange-100 text-orange-700",
  "Google": "bg-blue-100 text-blue-700",
  "Meta": "bg-indigo-100 text-indigo-700",
  "Mistral": "bg-amber-100 text-amber-700",
  "DeepSeek": "bg-cyan-100 text-cyan-700",
  "xAI": "bg-slate-100 text-slate-700",
  "Midjourney": "bg-purple-100 text-purple-700",
  "Stability AI": "bg-violet-100 text-violet-700",
};

const BADGE_COLORS: Record<string, string> = {
  "Popular": "bg-violet-100 text-violet-700",
  "Top Rated": "bg-amber-100 text-amber-700",
  "New": "bg-cyan-100 text-cyan-700",
  "Open Source": "bg-emerald-100 text-emerald-700",
};

const features = [
  {
    icon: Search,
    title: "Model Explorer",
    desc: "Search and browse 30+ AI models by category, capability, and price. Click any model for a full feature deep-dive.",
    color: "from-cyan-500 to-blue-600",
    iconBg: "bg-cyan-500/10 text-cyan-400",
    href: "/know-your-ai/models",
    tag: "32 Models",
  },
  {
    icon: BarChart3,
    title: "Benchmarks",
    desc: "Real performance data across coding, reasoning, creativity, and more — updated regularly.",
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500/10 text-blue-400",
    href: "/know-your-ai/benchmarks",
    tag: "Live Data",
  },
  {
    icon: Layers,
    title: "Side-by-Side Compare",
    desc: "Compare any models head-to-head on the metrics that matter. See pricing, speed, and scores at a glance.",
    color: "from-indigo-500 to-violet-600",
    iconBg: "bg-indigo-500/10 text-indigo-400",
    href: "/know-your-ai/compare",
    tag: "Multi-Model",
  },
  {
    icon: Zap,
    title: "Use-Case Matcher",
    desc: "Tell us what you need to do — we'll recommend the best AI model for the job instantly.",
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/10 text-violet-400",
    href: "/know-your-ai/matcher",
    tag: "AI Powered",
  },
];

const trendingModels = [
  { name: "Claude Opus 4", trend: "+12%", provider: "Anthropic", color: "text-orange-500" },
  { name: "Gemini 2.5 Pro", trend: "+18%", provider: "Google", color: "text-blue-500" },
  { name: "DeepSeek R1", trend: "+24%", provider: "DeepSeek", color: "text-cyan-500" },
  { name: "GPT-4o", trend: "+8%", provider: "OpenAI", color: "text-emerald-500" },
];

function PricingBadge({ pricing }: { pricing: string }) {
  const color = pricing === "Free" ? "text-emerald-400" : pricing === "$" ? "text-slate-400" : pricing === "$$" ? "text-amber-400" : "text-rose-400";
  return <span className={`text-xs font-bold ${color}`}>{pricing === "Free" ? "Free" : pricing}</span>;
}

export default function KnowYourAIPage() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return AI_MODELS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.capability.some((c) => c.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
        <Navbar />
      </div>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[100px]" />
          <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-blue-500/8 rounded-full blur-[80px]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex justify-start mb-10">
            <Link href="/hub" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Hub
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            AI Intelligence Hub — 32+ Models Tracked
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tight mb-5"
          >
            Know Your
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="text-white/50 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Explore, benchmark, and compare every major AI model so you always
            pick the right tool for the job.
          </motion.p>

          {/* ── Search Bar ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative max-w-2xl mx-auto mb-6"
            ref={containerRef}
          >
            <div
              className={`relative rounded-2xl border transition-all duration-300 ${
                focused
                  ? "border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                  : "border-white/10 hover:border-white/20"
              } bg-white/5 backdrop-blur-md`}
            >
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused ? "text-cyan-400" : "text-white/30"}`} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                placeholder='Search AI models... try "ChatGPT", "image generation", "open source"...'
                className="w-full pl-13 pr-6 py-4 text-base bg-transparent outline-none text-white placeholder:text-white/30 rounded-2xl"
                style={{ paddingLeft: "3.25rem" }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick tags */}
            {!showDropdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2 mt-4 justify-center"
              >
                {["ChatGPT", "Claude", "Gemini", "Image Gen", "Open Source", "Code"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setQuery(tag); setFocused(true); inputRef.current?.focus(); }}
                    className="px-3 py-1.5 text-xs font-semibold text-white/50 bg-white/5 border border-white/10 rounded-full hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Search Dropdown */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                  {results.length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-sm">No models found for &ldquo;{query}&rdquo;</div>
                  ) : (
                    <>
                      <div className="px-5 py-3 border-b border-white/5">
                        <span className="text-xs font-bold text-white/30 uppercase tracking-wider">
                          {results.length} model{results.length !== 1 ? "s" : ""} found
                        </span>
                      </div>
                      <div className="max-h-[360px] overflow-y-auto">
                        {results.map((model, i) => {
                          const CatIcon = CATEGORY_ICONS[model.category] || Sparkles;
                          return (
                            <Link
                              key={model.id}
                              href={`/know-your-ai/models?highlight=${model.id}`}
                              onClick={() => setFocused(false)}
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 group"
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${PROVIDER_COLORS[model.provider] || "bg-slate-100 text-slate-600"}`}>
                                  <CatIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-bold text-white text-sm">{model.name}</span>
                                    {model.badge && (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[model.badge] || ""}`}>
                                        {model.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-white/30">
                                    <span>{model.provider}</span>
                                    <span>·</span>
                                    <span>{model.capability.slice(0, 3).join(", ")}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="flex items-center gap-0.5 text-xs text-amber-400">
                                    <Star className="w-3 h-3 fill-amber-400" />{model.rating}
                                  </span>
                                  <PricingBadge pricing={model.pricing} />
                                </div>
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="px-5 py-3 border-t border-white/5">
                        <Link
                          href="/know-your-ai/models"
                          onClick={() => setFocused(false)}
                          className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                        >
                          View all models <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-8 mt-10"
          >
            {[
              { value: "32+", label: "AI Models" },
              { value: "15+", label: "Providers" },
              { value: "5", label: "Categories" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/30 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE CARDS ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Link href={f.href} className="block group">
                  <div className="relative flex gap-4 p-6 rounded-2xl border border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5 transition-all duration-300 h-full overflow-hidden">
                    {/* Gradient accent */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.iconBg} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="relative flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors">{f.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/8 text-white/40 ml-2 shrink-0">{f.tag}</span>
                      </div>
                      <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-white/25 group-hover:text-cyan-400 transition-colors font-semibold">
                        Explore <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── TRENDING + TOP PICKS ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Trending This Week */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-white/8 bg-white/3 p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Trending This Week</h3>
            </div>
            <div className="space-y-3">
              {trendingModels.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white/20 w-5">{i + 1}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{m.name}</div>
                      <div className="text-xs text-white/30">{m.provider}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${m.color}`}>{m.trend}</span>
                </div>
              ))}
            </div>
            <Link href="/know-your-ai/models" className="flex items-center gap-1 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors mt-5 font-semibold">
              View all models <ChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Why Use Know Your AI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl border border-white/8 bg-white/3 p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Why Know Your AI?</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: Globe, title: "Unbiased Data", desc: "No sponsorships. Pure performance metrics from real benchmarks." },
                { icon: Zap, title: "Always Updated", desc: "New model releases and pricing changes tracked in real time." },
                { icon: Layers, title: "Deep Comparisons", desc: "Go beyond specs — see how models perform on YOUR use case." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs text-white/35 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative rounded-2xl overflow-hidden border border-white/10 text-center p-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Brain className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Start exploring AI models today
            </h2>
            <p className="text-white/40 mb-7 max-w-lg mx-auto text-sm leading-relaxed">
              Don&apos;t overpay or underperform. Find the perfect AI model for your needs — from a quick chat to enterprise-grade coding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/know-your-ai/models"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all"
              >
                <Search className="w-4 h-4" />
                Browse Model Explorer
              </Link>
              <Link
                href="/know-your-ai/compare"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white/70 border border-white/10 hover:border-white/20 hover:text-white transition-all"
              >
                <Layers className="w-4 h-4" />
                Compare Models
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
