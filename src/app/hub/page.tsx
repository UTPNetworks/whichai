"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Brain, BookOpen, Briefcase, ArrowRight, Sparkles,
  Zap, TrendingUp, Globe, ExternalLink, RefreshCw, Home, Search,
  ChevronRight, Loader2, MessageSquare, Users, Check, Clock, Shield,
  BarChart3, Monitor, Star, DollarSign, Tag, Cpu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";

// ── Universal Search Bar with per-tile popups ──────────────────────────
const SEARCH_CATEGORIES = [
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, href: "/marketplace", color: "from-violet-500 to-purple-600", count: "15K+", desc: "AI assets, compute & hardware" },
  { id: "know-your-ai", label: "Know Your AI", icon: Brain, href: "/know-your-ai", color: "from-cyan-500 to-blue-600", count: "200+", desc: "AI models & benchmarks" },
  { id: "learning-hub", label: "Learning Hub", icon: BookOpen, href: "/learning-hub", color: "from-emerald-500 to-green-600", count: "50+", desc: "Courses & hands-on labs" },
  { id: "ai-forge", label: "AI Forge", icon: Briefcase, href: "/ai-task-board", color: "from-amber-500 to-orange-600", count: "500+", desc: "AI dev tasks & bounties" },
  { id: "prompt-hub", label: "Prompt Hub", icon: MessageSquare, href: "/prompt-hub", color: "from-pink-500 to-rose-600", count: "4,800+", desc: "Buy, sell & share prompts" },
  { id: "community", label: "Community", icon: Users, href: "/community", color: "from-indigo-500 to-violet-600", count: "52K+", desc: "Discuss, learn & connect" },
  { id: "compute-exchange", label: "Compute Exchange", icon: Cpu, href: "/gpurentals", color: "from-slate-800 to-slate-950", count: "1.2K+", desc: "Rent GPUs & host rigs" },
];

function UniversalSearchBar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showResults = focused && query.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[725px] mx-auto">
      <div className={`relative flex items-center rounded-[26px] border-2 transition-all duration-300 bg-white shadow-lg ${
        focused ? "border-violet-400 shadow-violet-100/50 shadow-xl scale-[1.01]" : "border-gray-200 hover:border-gray-300"
      }`}>
        <Search className={`absolute left-6 w-6 h-6 transition-colors ${focused ? "text-violet-500" : "text-slate-400"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search across Marketplace, AI Models, Courses, Tasks..."
          className="w-full pl-16 pr-6 py-[22px] bg-transparent text-lg text-slate-800 placeholder:text-slate-400 outline-none rounded-[26px]"
        />
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="absolute right-5 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded-lg">ESC</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-slate-500">Search &quot;{query}&quot; across all sections</p>
            </div>
            <div className="p-2">
              {SEARCH_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <Link key={cat.id} href={`${cat.href}?search=${encodeURIComponent(query)}`} onClick={() => setFocused(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                      <CatIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{cat.label}</p>
                      <p className="text-xs text-slate-400">{cat.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">{cat.count} listings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
            <div className="px-4 py-2.5 bg-slate-50 border-t border-gray-100">
              <p className="text-[10px] text-slate-400 text-center">Press Enter to search all · Click a category to filter</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Hub tile data (image-card style) ───────────────────────────────────
const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    label: "Marketplace",
    tagline: "The Hub",
    description: "Buy and sell AI prompts, agents, fine-tuned models, GPU compute, and hardware — all in one place.",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&h=420&fit=crop&q=80",
    categoryColor: "bg-violet-600/80",
    tagBg: "bg-violet-50", tagText: "text-violet-700",
    arrowBg: "bg-violet-50", arrowText: "text-violet-600",
    popupBorder: "border-l-violet-600",
    popupCountColor: "text-violet-600",
    cta: "Enter Marketplace",
    tags: ["Digital Assets", "Compute Hub", "Hardware"],
    stats: [{ val: "15K+", label: "listings" }, { val: "4.8★", label: "rated" }],
    details: [
      { icon: Check, text: "Verified sellers with escrow protection" },
      { icon: Zap, text: "Instant delivery for digital assets" },
      { icon: Globe, text: "Global marketplace, 40+ countries" },
    ],
    keywords: { nvidia: 342, gpu: 1205, llm: 890, chatgpt: 156, openai: 230, model: 560, agent: 410, hardware: 780, compute: 920, api: 345 },
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    label: "Know Your AI",
    tagline: "Discover & Compare",
    description: "Explore, benchmark, and compare AI models across categories. Find the perfect model for your use case.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=420&fit=crop&q=80",
    categoryColor: "bg-cyan-600/80",
    tagBg: "bg-cyan-50", tagText: "text-cyan-700",
    arrowBg: "bg-cyan-50", arrowText: "text-cyan-600",
    popupBorder: "border-l-cyan-600",
    popupCountColor: "text-cyan-600",
    cta: "Explore AI",
    tags: ["Model Explorer", "Benchmarks", "Side-by-Side"],
    stats: [{ val: "200+", label: "models" }, { val: "Live", label: "benchmarks" }],
    details: [
      { icon: BarChart3, text: "Side-by-side model comparisons" },
      { icon: Zap, text: "Real-time scores, updated daily" },
      { icon: Shield, text: "Community-verified ratings" },
    ],
    keywords: { nvidia: 45, gpu: 78, llm: 195, chatgpt: 42, openai: 88, model: 200, agent: 30, benchmark: 150, compare: 120, api: 60 },
  },
  {
    id: "learning-hub",
    href: "/learning-hub",
    label: "Learning Hub",
    tagline: "Grow Your Skills",
    description: "Courses, guides, and hands-on labs to master prompt engineering, AI development, and ML fundamentals.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=420&fit=crop&q=80",
    categoryColor: "bg-emerald-600/80",
    tagBg: "bg-emerald-50", tagText: "text-emerald-700",
    arrowBg: "bg-emerald-50", arrowText: "text-emerald-600",
    popupBorder: "border-l-emerald-600",
    popupCountColor: "text-emerald-600",
    cta: "Start Learning",
    tags: ["Prompt Engineering", "AI Courses", "Free Labs"],
    stats: [{ val: "50+", label: "courses" }, { val: "Hands-on", label: "labs" }],
    details: [
      { icon: Monitor, text: "Interactive coding environments" },
      { icon: Check, text: "Certificates upon completion" },
    ],
    keywords: { nvidia: 12, gpu: 25, llm: 85, chatgpt: 68, openai: 35, model: 45, agent: 22, prompt: 95, course: 50, tutorial: 40 },
  },
  {
    id: "ai-forge",
    href: "/ai-task-board",
    label: "AI Forge",
    tagline: "Get It Built",
    description: "Post any AI task — custom LLMs, fine-tuned models, AI agents, chatbots — and get it built by vetted developers.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=420&fit=crop&q=80",
    categoryColor: "bg-amber-600/85",
    tagBg: "bg-amber-50", tagText: "text-amber-700",
    arrowBg: "bg-amber-50", arrowText: "text-amber-600",
    popupBorder: "border-l-amber-600",
    popupCountColor: "text-amber-600",
    cta: "Post a Task",
    tags: ["AI Development", "Bounties", "Escrow"],
    stats: [{ val: "500+", label: "AI devs" }, { val: "48hr", label: "delivery" }],
    details: [
      { icon: Shield, text: "Escrow-protected payments" },
      { icon: Users, text: "Vetted AI-specialist developers" },
      { icon: Clock, text: "Average 48-hour turnaround" },
    ],
    keywords: { nvidia: 18, gpu: 35, llm: 120, chatgpt: 90, openai: 55, model: 85, agent: 190, build: 150, custom: 110, finetune: 75 },
  },
  {
    id: "prompt-hub",
    href: "/prompt-hub",
    label: "Prompt Hub",
    tagline: "Prompts Marketplace",
    description: "Buy, sell, learn, and donate AI prompt packages. The largest collection of battle-tested prompts for ChatGPT, Claude, Gemini & more.",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=600&h=420&fit=crop&q=80",
    categoryColor: "bg-pink-600/80",
    tagBg: "bg-pink-50", tagText: "text-pink-700",
    arrowBg: "bg-pink-50", arrowText: "text-pink-600",
    popupBorder: "border-l-pink-600",
    popupCountColor: "text-pink-600",
    cta: "Browse Prompts",
    tags: ["Buy & Sell", "Free Prompts", "Packages"],
    stats: [{ val: "4,800+", label: "prompts" }, { val: "12", label: "categories" }],
    details: [
      { icon: Check, text: "Quality-tested with output previews" },
      { icon: Tag, text: "Organized by model & use case" },
      { icon: DollarSign, text: "Earn royalties selling prompts" },
    ],
    keywords: { nvidia: 8, gpu: 5, llm: 280, chatgpt: 420, openai: 310, model: 120, agent: 95, prompt: 4800, template: 350, midjourney: 180 },
  },
  {
    id: "community",
    href: "/community",
    label: "Community",
    tagline: "The Signal",
    description: "Ask, learn, gossip, and build together. The only AI community where your reputation follows you to the marketplace.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=420&fit=crop&q=80",
    categoryColor: "bg-indigo-600/80",
    tagBg: "bg-indigo-50", tagText: "text-indigo-700",
    arrowBg: "bg-indigo-50", arrowText: "text-indigo-600",
    popupBorder: "border-l-indigo-600",
    popupCountColor: "text-indigo-600",
    cta: "Join Community",
    tags: ["Spaces", "Q&A", "Leaderboard"],
    stats: [{ val: "52K+", label: "members" }, { val: "Live", label: "chat" }],
    details: [
      { icon: Zap, text: "Live discussions with AI builders" },
      { icon: Star, text: "Reputation tied to marketplace" },
      { icon: BarChart3, text: "Leaderboards, Q&A, topic spaces" },
    ],
    keywords: { nvidia: 65, gpu: 40, llm: 320, chatgpt: 280, openai: 195, model: 110, agent: 75, discussion: 500, space: 250, thread: 180 },
  },
  {
    id: "compute-exchange",
    href: "/gpurentals",
    label: "Compute & GPU Exchange",
    tagline: "Infrastructure",
    description: "The world's first decentralized AI compute marketplace. Rent high-performance H100s, A100s, and RTX clusters, or monetize your own idle hardware by hosting a rig.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=400&fit=crop&q=80",
    categoryColor: "bg-slate-900/80",
    tagBg: "bg-cyan-50", tagText: "text-cyan-700",
    arrowBg: "bg-cyan-50", arrowText: "text-cyan-600",
    popupBorder: "border-l-cyan-600",
    popupCountColor: "text-cyan-600",
    cta: "Exchange Compute",
    tags: ["Rent GPUs", "Host Your Rig", "Server Credits"],
    stats: [{ val: "1.2k", label: "nodes" }, { val: "99.9%", label: "uptime" }],
    details: [
      { icon: Zap, text: "Instant SSH/Jupyter access" },
      { icon: Cpu, text: "Multi-cloud & P2P nodes" },
      { icon: Shield, text: "Secure, encrypted workloads" },
    ],
    keywords: { nvidia: 890, gpu: 1560, h100: 420, a100: 580, rtx: 920, cluster: 340, node: 1200, rent: 450, host: 310, compute: 2100 },
    isLarge: true,
  },
];

// ── Search popup for each tile ─────────────────────────────────────────
function TileSearchPopup({ hub, query }: { hub: typeof hubs[0]; query: string }) {
  const [displayCount, setDisplayCount] = useState(0);

  const matchCount = useMemo(() => {
    if (!query.trim()) return 0;
    const q = query.trim().toLowerCase();
    let count = 0;
    for (const [keyword, val] of Object.entries(hub.keywords)) {
      if (keyword.includes(q) || q.includes(keyword)) count += val;
    }
    return count;
  }, [query, hub.keywords]);

  useEffect(() => {
    if (matchCount === 0) { setDisplayCount(0); return; }
    let current = 0;
    const step = Math.ceil(matchCount / 20);
    const interval = setInterval(() => {
      current += step;
      if (current >= matchCount) { current = matchCount; clearInterval(interval); }
      setDisplayCount(current);
    }, 30);
    return () => clearInterval(interval);
  }, [matchCount]);

  if (!query.trim() || matchCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`absolute top-2.5 right-2.5 z-30 bg-white/95 backdrop-blur-xl rounded-[11px] py-1.5 px-3 flex items-center gap-2 shadow-lg border border-gray-100/80 border-l-[3px] ${hub.popupBorder}`}
    >
      <span className="text-[12px]">🔍</span>
      <span className={`text-[15px] font-black ${hub.popupCountColor}`}>{displayCount.toLocaleString()}</span>
      <span className="text-[8.5px] font-semibold text-slate-500">{query.trim()} results</span>
    </motion.div>
  );
}

// ── Hub Page ────────────────────────────────────────────────────────────
export default function HubPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Soft ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(ellipse 600px 500px at 5% 25%, rgba(196,181,253,0.1) 0%, transparent 70%),
          radial-gradient(ellipse 500px 400px at 95% 20%, rgba(251,191,206,0.08) 0%, transparent 70%),
          radial-gradient(ellipse 450px 350px at 50% 90%, rgba(165,224,243,0.06) 0%, transparent 70%)
        `
      }} />

      <main className="relative z-10 max-w-[1280px] mx-auto px-6 py-10 md:py-14">

        {/* ── Header + Search ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-[7px] rounded-full bg-gradient-to-r from-violet-500/[0.08] to-pink-500/[0.06] border border-violet-200/60 text-violet-700 text-sm font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            Welcome to WhichAi.cloud
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-slate-900">
            Where do you want to go?
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed mb-9">
            Your AI journey starts here. Pick a destination below.
          </p>

          <UniversalSearchBar query={searchQuery} setQuery={setSearchQuery} />

          <p className="text-[11.5px] text-slate-400 mt-4 mb-6">
            Try typing <span className="text-violet-600 font-bold">nvidia</span>, <span className="text-violet-600 font-bold">gpu</span>, or <span className="text-violet-600 font-bold">llm</span> to see matches across all tiles
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* ── Hub Cards Grid (3 cols, image-card style, 25% smaller) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hubs.map((hub, i) => (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.08, duration: 0.5, ease: "easeOut" }}
              className={(hub as any).isLarge ? "col-span-1 md:col-span-3" : ""}
            >
              <Link href={hub.href} className="block group">
                <div className={`relative rounded-2xl overflow-hidden bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] transition-all duration-400 group-hover:-translate-y-1.5 group-hover:scale-[1.005] ${
                  (hub as any).isLarge ? "bg-gradient-to-r from-slate-950 via-purple-950 to-cyan-950 border-cyan-500/20" : ""
                }`}>
                  
                  {/* High-tech animated glow for large card */}
                  {(hub as any).isLarge && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 animate-gradient-x opacity-40" />
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                    </div>
                  )}

                  {/* ── Image area ── */}
                  <div className={`relative w-full overflow-hidden ${(hub as any).isLarge ? "h-[120px] md:h-[180px]" : "h-[158px]"}`}>
                    <img
                      src={hub.image}
                      alt={hub.label}
                      className={`w-full h-full object-cover transition-all duration-600 group-hover:scale-[1.08] group-hover:brightness-105 ${(hub as any).isLarge ? "opacity-50 grayscale hover:grayscale-0" : ""}`}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.1] pointer-events-none" />

                    {/* Category pill */}
                    <span className={`absolute top-2.5 left-2.5 z-10 text-[8.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white backdrop-blur-xl border border-white/30 ${hub.categoryColor} transition-transform duration-300 group-hover:scale-105`}>
                      {hub.tagline}
                    </span>

                    {/* Stat chips */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex gap-1.5">
                      {hub.stats.map((stat) => (
                        <span key={stat.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.88] backdrop-blur-lg border border-white/50 text-[9.5px] font-bold text-slate-700 shadow-sm transition-all duration-300 group-hover:bg-white/95 group-hover:-translate-y-0.5">
                          <span className="font-black">{stat.val}</span> {stat.label}
                        </span>
                      ))}
                    </div>

                    {/* Search popup */}
                    <AnimatePresence>
                      <TileSearchPopup hub={hub as any} query={searchQuery} />
                    </AnimatePresence>
                  </div>

                  {/* ── White body (or transparent for large) ── */}
                  <div className={`p-3.5 pt-3.5 ${(hub as any).isLarge ? "bg-white/90 backdrop-blur-sm" : ""}`}>
                    <div className={(hub as any).isLarge ? "flex flex-col md:flex-row md:items-center justify-between gap-4" : ""}>
                      <div className="flex-1">
                        <h2 className={`text-sm font-extrabold mb-1 tracking-tight transition-colors ${(hub as any).isLarge ? "text-slate-900 md:text-lg" : "text-slate-900 group-hover:text-indigo-600"}`}>
                          {hub.label}
                        </h2>
                        <p className={`text-[11px] leading-relaxed mb-2.5 transition-all ${(hub as any).isLarge ? "text-slate-600 md:text-sm md:max-w-2xl" : "text-slate-500 line-clamp-2 group-hover:line-clamp-none group-hover:text-slate-600"}`}>
                          {hub.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {hub.tags.map((tag) => (
                            <span key={tag} className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${hub.tagBg} ${hub.tagText} transition-transform duration-300 group-hover:-translate-y-px`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CTA for large card desktop */}
                      {(hub as any).isLarge && (
                        <div className="hidden md:flex flex-col items-end gap-3">
                          <div className="flex gap-4">
                            {hub.details.map((detail, di) => {
                              const DetailIcon = detail.icon;
                              return (
                                <div key={di} className="flex items-center gap-1.5">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center ${hub.tagBg}`}>
                                    <DetailIcon className={`w-3 h-3 ${hub.tagText}`} />
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-600">{detail.text}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all">
                            {hub.cta} <ArrowRight size={14} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover details (hidden for large since they are in the row) */}
                    {!(hub as any).isLarge && (
                      <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-[120px] group-hover:opacity-100 transition-all duration-400">
                        <div className="pt-2 border-t border-slate-100 mt-0.5">
                          {hub.details.map((detail, di) => {
                            const DetailIcon = detail.icon;
                            return (
                              <div key={di} className="flex items-center gap-1.5 mb-1">
                                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${hub.tagBg}`}>
                                  <DetailIcon className={`w-2.5 h-2.5 ${hub.tagText}`} />
                                </div>
                                <span className="text-[9.5px] text-slate-500">{detail.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CTA Mobile / Normal */}
                    <div className={`flex items-center justify-between pt-2.5 border-t border-slate-100 ${(hub as any).isLarge ? "md:hidden" : ""}`}>
                      <span className="text-[11px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{hub.cta}</span>
                      <div className={`w-7 h-7 rounded-full ${hub.arrowBg} flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-110`}>
                        <ArrowRight className={`w-3.5 h-3.5 ${hub.arrowText}`} />
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-slate-400 text-xs mt-9"
        >
          You can always switch between sections from the navbar.
        </motion.p>
      </main>

      <style jsx global>{`
        @keyframes shimmerSweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
