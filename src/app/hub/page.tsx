"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Brain, BookOpen, Briefcase, ArrowRight, Sparkles,
  Zap, TrendingUp, Globe, ExternalLink, RefreshCw, Home, Search,
  ChevronRight, Loader2, MessageSquare, Users,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState, useRef, useCallback } from "react";

// ── NeuralPulse: fixed tab set & light category colors ──────────────────
const FIXED_TABS = ["All", "LLMs", "Startups", "Products", "Research"];

const CATEGORY_COLORS: Record<string, string> = {
  "LLMs":        "bg-violet-100 text-violet-700",
  "Startups":    "bg-emerald-100 text-emerald-700",
  "Products":    "bg-blue-100 text-blue-700",
  "Research":    "bg-amber-100 text-amber-700",
  "General AI":  "bg-slate-100 text-slate-500",
};

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string;
  points: number;
  comments: number;
  time: string;
}

// ── NeuralPulse Ticker (edge-to-edge marquee) ───────────────────────────
function NeuralPulseTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  async function fetchNews() {
    try {
      const res = await fetch("/api/ai-news", { cache: "no-store" });
      const data = await res.json();
      setNews(Array.isArray(data) ? data : (data.articles || []));
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("News fetch failed", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), 1800000);
    return () => clearInterval(interval);
  }, []);

  // Filter by active tab, then duplicate for seamless infinite scroll
  const filteredNews = activeTab === "All" ? news : news.filter((item) => item.category === activeTab);
  const tickerItems = filteredNews.length > 0 ? [...filteredNews, ...filteredNews, ...filteredNews] : [];

  return (
    <div
      className="w-screen relative left-1/2 -translate-x-1/2 border-b border-indigo-200/60 bg-gradient-to-r from-indigo-50 via-white to-violet-50 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-300/40">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-black text-slate-800 tracking-tight">NeuralPulse</span>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Live · {lastUpdated || "..."}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {FIXED_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`hidden md:inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? "text-violet-700 bg-violet-100 border-violet-300 shadow-sm"
                  : "text-slate-400 border-slate-200 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="relative h-10 overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-indigo-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-violet-50 to-transparent z-10 pointer-events-none" />

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
            <span className="text-xs text-slate-400 ml-2">Loading news...</span>
          </div>
        ) : tickerItems.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-400">
            No stories right now
          </div>
        ) : (
          <div
            className="flex items-center h-full gap-8 whitespace-nowrap"
            style={{
              animation: `marquee ${Math.max(filteredNews.length * 5, 30)}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {tickerItems.map((item, idx) => (
              <a
                key={`${item.id}-${idx}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 shrink-0 group"
              >
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["General AI"]}`}>
                  {item.category}
                </span>
                <span className="text-[12px] font-semibold text-slate-700 group-hover:text-violet-600 transition-colors max-w-[380px] truncate">
                  {item.title}
                </span>
                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />{item.points}
                </span>
                <span className="text-slate-200">│</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* CSS keyframe for marquee */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

// ── Universal Search Bar ────────────────────────────────────────────────
const SEARCH_CATEGORIES = [
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, href: "/marketplace", color: "from-violet-500 to-purple-600", count: "15K+", desc: "AI assets, compute & hardware" },
  { id: "know-your-ai", label: "Know Your AI", icon: Brain, href: "/know-your-ai", color: "from-cyan-500 to-blue-600", count: "200+", desc: "AI models & benchmarks" },
  { id: "learning-hub", label: "Learning Hub", icon: BookOpen, href: "/learning-hub", color: "from-emerald-500 to-green-600", count: "50+", desc: "Courses & hands-on labs" },
  { id: "ai-task-board", label: "AI Task Board", icon: Briefcase, href: "/ai-task-board", color: "from-amber-500 to-orange-600", count: "500+", desc: "AI dev tasks & bounties" },
  { id: "prompt-hub", label: "Prompt Hub", icon: MessageSquare, href: "/prompt-hub", color: "from-pink-500 to-rose-600", count: "4,800+", desc: "Buy, sell & share prompts" },
  { id: "community", label: "Community", icon: Users, href: "/community", color: "from-indigo-500 to-violet-600", count: "52K+", desc: "Discuss, learn & connect" },
];

function UniversalSearchBar() {
  const [query, setQuery] = useState("");
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
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search input */}
      <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-300 bg-white shadow-lg ${
        focused ? "border-violet-400 shadow-violet-100/50 shadow-xl" : "border-gray-200 hover:border-gray-300"
      }`}>
        <Search className={`absolute left-4 w-5 h-5 transition-colors ${focused ? "text-violet-500" : "text-slate-400"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search across Marketplace, AI Models, Courses, Tasks..."
          className="w-full pl-12 pr-4 py-4 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none rounded-2xl"
        />
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded-lg">ESC</span>
          </button>
        )}
      </div>

      {/* Quick Results dropdown */}
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
              <p className="text-xs font-semibold text-slate-500">
                Search &quot;{query}&quot; across all sections
              </p>
            </div>
            <div className="p-2">
              {SEARCH_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`${cat.href}?search=${encodeURIComponent(query)}`}
                    onClick={() => setFocused(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                      <CatIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors">
                        {cat.label}
                      </p>
                      <p className="text-xs text-slate-400">{cat.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
                        {cat.count} listings
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
            <div className="px-4 py-2.5 bg-slate-50 border-t border-gray-100">
              <p className="text-[10px] text-slate-400 text-center">
                Press Enter to search all · Click a category to filter
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Hub destination data ────────────────────────────────────────────────
const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    label: "Marketplace",
    tagline: "The Hub",
    description: "Buy and sell AI prompts, agents, fine-tuned models, GPU compute, and hardware — all in one place.",
    g1: "#3b0764", g2: "#6d28d9", g3: "#a78bfa",
    glow: "rgba(139, 92, 246, 0.4)",
    shimmer: "rgba(167,139,250,0.25)",
    bannerEmojis: [
      { e: "🤖", x: "10%", y: "15%", r: "-12deg", s: 1.1 },
      { e: "🔗", x: "80%", y: "10%", r: "8deg", s: 0.9 },
      { e: "⚡", x: "20%", y: "70%", r: "5deg", s: 1.2 },
      { e: "🧠", x: "70%", y: "65%", r: "-8deg", s: 1.0 },
      { e: "✨", x: "50%", y: "40%", r: "15deg", s: 0.8 },
      { e: "🚀", x: "90%", y: "45%", r: "-5deg", s: 0.95 },
    ],
    cta: "Enter Marketplace",
    tags: ["Digital Assets", "Compute Hub", "Hardware"],
    stats: [{ val: "15K+", label: "listings" }, { val: "4.8★", label: "avg rating" }, { val: "99%", label: "satisfaction" }],
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    icon: Brain,
    label: "Know Your AI",
    tagline: "Discover & Compare",
    description: "Explore, benchmark, and compare AI models across categories. Find the perfect model for your use case.",
    g1: "#0c4a6e", g2: "#0284c7", g3: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.35)",
    shimmer: "rgba(34,211,238,0.2)",
    bannerEmojis: [
      { e: "🔬", x: "12%", y: "20%", r: "6deg", s: 1.1 },
      { e: "📊", x: "78%", y: "12%", r: "-10deg", s: 0.9 },
      { e: "🎯", x: "22%", y: "72%", r: "-6deg", s: 1.15 },
      { e: "🔍", x: "68%", y: "68%", r: "10deg", s: 1.0 },
      { e: "💡", x: "48%", y: "38%", r: "-15deg", s: 0.85 },
      { e: "📈", x: "88%", y: "50%", r: "8deg", s: 0.95 },
    ],
    cta: "Explore AI",
    tags: ["Model Explorer", "Benchmarks", "Side-by-Side"],
    stats: [{ val: "200+", label: "models" }, { val: "Live", label: "benchmarks" }, { val: "Daily", label: "updates" }],
  },
  {
    id: "learning-hub",
    href: "/learning-hub",
    icon: BookOpen,
    label: "Learning Hub",
    tagline: "Grow Your Skills",
    description: "Courses, guides, and hands-on labs to master prompt engineering, AI development, and ML fundamentals.",
    g1: "#064e3b", g2: "#059669", g3: "#34d399",
    glow: "rgba(52, 211, 153, 0.35)",
    shimmer: "rgba(52,211,153,0.2)",
    bannerEmojis: [
      { e: "📚", x: "10%", y: "18%", r: "-8deg", s: 1.1 },
      { e: "🎓", x: "80%", y: "14%", r: "12deg", s: 0.9 },
      { e: "🧪", x: "18%", y: "68%", r: "6deg", s: 1.2 },
      { e: "💻", x: "72%", y: "70%", r: "-10deg", s: 1.0 },
      { e: "🏆", x: "50%", y: "42%", r: "18deg", s: 0.8 },
      { e: "📝", x: "88%", y: "42%", r: "-4deg", s: 0.95 },
    ],
    cta: "Start Learning",
    tags: ["Prompt Engineering", "AI Courses", "Free Labs"],
    stats: [{ val: "50+", label: "courses" }, { val: "Hands-on", label: "labs" }, { val: "Free", label: "to start" }],
  },
  {
    id: "ai-task-board",
    href: "/ai-task-board",
    icon: Briefcase,
    label: "AI Task Board",
    tagline: "Get It Built",
    description: "Post any AI task — custom LLMs, fine-tuned models, AI agents, chatbots — and get it done by vetted AI developers.",
    g1: "#78350f", g2: "#d97706", g3: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.35)",
    shimmer: "rgba(251,191,36,0.2)",
    bannerEmojis: [
      { e: "🛠️", x: "10%", y: "16%", r: "10deg", s: 1.1 },
      { e: "🤖", x: "80%", y: "10%", r: "-8deg", s: 0.9 },
      { e: "💼", x: "20%", y: "72%", r: "-6deg", s: 1.15 },
      { e: "✏️", x: "70%", y: "68%", r: "12deg", s: 1.0 },
      { e: "💰", x: "50%", y: "38%", r: "-12deg", s: 0.85 },
      { e: "🎯", x: "88%", y: "48%", r: "5deg", s: 0.95 },
    ],
    cta: "Post a Task",
    tags: ["AI Development", "Bounties", "Escrow"],
    stats: [{ val: "500+", label: "AI devs" }, { val: "48hr", label: "avg delivery" }, { val: "Escrow", label: "protected" }],
  },
  {
    id: "prompt-hub",
    href: "/prompt-hub",
    icon: MessageSquare,
    label: "Prompt Hub",
    tagline: "Prompts Marketplace",
    description: "Buy, sell, learn, and donate AI prompt packages. The largest collection of battle-tested prompts for ChatGPT, Claude, Gemini & more.",
    g1: "#831843", g2: "#e11d48", g3: "#fb7185",
    glow: "rgba(225, 29, 72, 0.35)",
    shimmer: "rgba(251,113,133,0.2)",
    bannerEmojis: [
      { e: "✍️", x: "10%", y: "16%", r: "-10deg", s: 1.1 },
      { e: "💬", x: "80%", y: "12%", r: "8deg", s: 0.9 },
      { e: "🎯", x: "20%", y: "70%", r: "6deg", s: 1.15 },
      { e: "📝", x: "70%", y: "68%", r: "-12deg", s: 1.0 },
      { e: "🔥", x: "48%", y: "38%", r: "15deg", s: 0.85 },
      { e: "💎", x: "88%", y: "48%", r: "-5deg", s: 0.95 },
    ],
    cta: "Browse Prompts",
    tags: ["Buy & Sell", "Free Prompts", "Packages"],
    stats: [{ val: "4,800+", label: "prompts" }, { val: "12", label: "categories" }, { val: "Free", label: "& paid" }],
  },
  {
    id: "community",
    href: "/community",
    icon: Users,
    label: "Community",
    tagline: "The Signal",
    description: "Ask, learn, gossip, and build together. The only AI community where your reputation follows you to the marketplace.",
    g1: "#312e81", g2: "#6366f1", g3: "#a5b4fc",
    glow: "rgba(99, 102, 241, 0.35)",
    shimmer: "rgba(165,180,252,0.2)",
    bannerEmojis: [
      { e: "💬", x: "10%", y: "16%", r: "-8deg", s: 1.1 },
      { e: "🧠", x: "80%", y: "12%", r: "10deg", s: 0.9 },
      { e: "🔥", x: "20%", y: "70%", r: "6deg", s: 1.15 },
      { e: "⚡", x: "70%", y: "68%", r: "-10deg", s: 1.0 },
      { e: "🏆", x: "48%", y: "38%", r: "12deg", s: 0.85 },
      { e: "📡", x: "88%", y: "48%", r: "-6deg", s: 0.95 },
    ],
    cta: "Join Community",
    tags: ["Spaces", "Q&A", "Leaderboard"],
    stats: [{ val: "52K+", label: "members" }, { val: "10", label: "spaces" }, { val: "Live", label: "chat" }],
  },
];

// ── Hub Page ────────────────────────────────────────────────────────────
export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* ── NeuralPulse Ticker (edge-to-edge) ──────────────── */}
      <NeuralPulseTicker />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-14">

        {/* ── Header + Search ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            Welcome to WhichAi.cloud
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-slate-900">
            Where do you want to go?
          </h1>
          <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed mb-8">
            Your AI journey starts here. Pick a destination below.
          </p>

          {/* ── Universal Search Bar ── */}
          <UniversalSearchBar />

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </motion.div>

        {/* ── 4 Hub Cards (revamped with glow + lift) ──────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 auto-rows-fr">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="h-full"
              >
                <Link href={hub.href} className="block h-full group">
                  <div
                    className="relative rounded-3xl overflow-hidden cursor-pointer h-full transition-all duration-500 bg-white/10 backdrop-blur-md border border-white/20 hover:shadow-[0_0_20px_5px_var(--hub-glow-color)]"
                    style={{
                      boxShadow: `0 4px 20px -2px ${hub.glow}, 0 2px 8px -2px rgba(0,0,0,0.1)`,
                      '--hub-glow-color': `${hub.glow}60`,
                    } as React.CSSProperties}
                  >
                    {/* Animated gradient background */}
                    <div
                      className="absolute inset-0 transition-all duration-700"
                      style={{
                        background: `linear-gradient(160deg, ${hub.g1} 0%, ${hub.g2} 55%, ${hub.g3} 100%)`,
                        backgroundSize: "200% 200%",
                      }}
                    />

                    {/* Animated glow ring on hover */}
                    <div
                      className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
                      style={{ background: `linear-gradient(160deg, ${hub.g2}, ${hub.g3})` }}
                    />

                    {/* Subtle dot pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Hover shimmer sweep */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{
                        background: `linear-gradient(105deg, transparent 30%, ${hub.shimmer} 50%, transparent 70%)`,
                        backgroundSize: "200% 100%",
                        animation: "shimmerSweep 2s ease-in-out infinite",
                      }}
                    />

                    {/* Floating emojis */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {hub.bannerEmojis.map((em, ei) => (
                        <span
                          key={ei}
                          className="absolute text-2xl select-none opacity-15 group-hover:opacity-30 transition-all duration-700 group-hover:scale-110"
                          style={{
                            left: em.x,
                            top: em.y,
                            transform: `rotate(${em.r}) scale(${em.s})`,
                          }}
                        >
                          {em.e}
                        </span>
                      ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-5 flex flex-col h-full">

                      {/* Top row: icon + tagline pill */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg group-hover:bg-white/30 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <Icon className="w-5.5 h-5.5 text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                          {hub.tagline}
                        </span>
                      </div>

                      {/* Stats — hero numbers with higher contrast */}
                      <div className="flex gap-4 mb-5">
                        {hub.stats.map((stat) => (
                          <div key={stat.label}>
                            <div className="text-2xl font-black text-white leading-none tracking-tight drop-shadow-sm">
                              {stat.val}
                            </div>
                            <div className="text-[10px] text-white/60 mt-1 font-semibold uppercase tracking-wider">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Frosted glass panel at bottom */}
                      <div className="mt-auto bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/15 group-hover:bg-black/35 group-hover:border-white/25 transition-all duration-300 flex flex-col">
                        <h2 className="text-base font-black text-white mb-1.5 tracking-tight">
                          {hub.label}
                        </h2>
                        <p className="text-white/65 text-[11px] leading-relaxed mb-3 line-clamp-3">
                          {hub.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3.5">
                          {hub.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-semibold border border-white/15 group-hover:bg-white/20 group-hover:text-white transition-all duration-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* CTA row */}
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[13px] font-bold text-white">{hub.cta}</span>
                          <div className="w-8 h-8 rounded-full bg-white/25 border border-white/25 flex items-center justify-center group-hover:bg-white/40 group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 shadow-lg">
                            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-slate-400 text-xs mt-8"
        >
          You can always switch between sections from the navbar.
        </motion.p>
      </main>

      {/* Global animation keyframes */}
      <style jsx global>{`
        @keyframes shimmerSweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
