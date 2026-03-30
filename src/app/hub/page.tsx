"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag, Brain, BookOpen, Briefcase, ArrowRight, Sparkles,
  Zap, TrendingUp, Globe, ExternalLink, RefreshCw, Home,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

// ââ NeuralPulse: fixed tab set & light category colors âââââââââââââââââââââ
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

// ââ NeuralPulse Banner (white theme) âââââââââââââââââââââââââââââââââââââââ
function NeuralPulseBanner() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [filter, setFilter] = useState("All");

  async function fetchNews(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/ai-news", { cache: "no-store" });
      const data = await res.json();
      setNews(Array.isArray(data) ? data : (data.articles || []));
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("News fetch failed", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(false), 1800000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "All" ? news : news.filter((n) => n.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-10 rounded-2xl overflow-hidden border border-gray-200/80 shadow-lg shadow-gray-100/80 bg-white"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-violet-50/70 via-white to-white">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-md shadow-violet-300/40">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">NeuralPulse</h2>
            <p className="text-[9px] text-slate-400 font-medium tracking-widest uppercase">AI News Feed</p>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-slate-400">Live Â· Updated {lastUpdated || "loading..."}</span>
          </div>
        </div>

        {/* Fixed category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 px-1">
          {FIXED_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                filter === tab
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-300/50"
                  : "bg-gray-100 text-slate-500 hover:bg-gray-200 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={() => fetchNews(true)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-all shrink-0 ${refreshing ? "animate-spin" : ""}`}
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* News grid â 3 columns Ã 2 rows */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse px-5 py-4 border-b border-r border-gray-100">
              <div className="h-2 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm">
          No {filter} stories right now â try another tab or refresh.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-x divide-y divide-gray-100">
          {filtered.slice(0, 6).map((item, idx) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group px-5 py-4 hover:bg-violet-50/40 transition-colors flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["General AI"]}`}>
                  {item.category}
                </span>
                <span className="text-[9px] text-slate-400 shrink-0">{item.time}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-700 leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-3 text-[9px] text-slate-400 mt-auto">
                <span className="flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{item.points}</span>
                <span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" />{item.source}</span>
                <ExternalLink className="w-2.5 h-2.5 ml-auto text-slate-300 group-hover:text-violet-400 transition-colors" />
              </div>
            </motion.a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2 border-t border-gray-100 bg-gray-50/50">
        <p className="text-[9px] text-slate-400 text-center">
          RSS + Supabase · auto-refreshes every 6 hours
        </p>
      </div>
    </motion.div>
  );
}

// ââ Hub destination data âââââââââââââââââââââââââââââââââââââââââââââââââââ
const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    label: "Marketplace",
    tagline: "The Hub",
    description:
      "Buy and sell AI prompts, agents, fine-tuned models, GPU compute, and hardware â all in one place.",
    g1: "#3b0764", g2: "#6d28d9", g3: "#a78bfa",
    shimmer: "rgba(167,139,250,0.25)",
    bannerEmojis: [
      { e: "ð¤", x: "10%", y: "15%", r: "-12deg", s: 1.1 },
      { e: "ð", x: "80%", y: "10%", r: "8deg",  s: 0.9 },
      { e: "â¡", x: "20%", y: "70%", r: "5deg",  s: 1.2 },
      { e: "ð§ ", x: "70%", y: "65%", r: "-8deg", s: 1.0 },
      { e: "â¨", x: "50%", y: "40%", r: "15deg", s: 0.8 },
      { e: "ð", x: "90%", y: "45%", r: "-5deg", s: 0.95 },
    ],
    cta: "Enter Marketplace",
    tags: ["Digital Assets", "Compute Hub", "Hardware"],
    stats: [{ val: "15K+", label: "listings" }, { val: "4.8â", label: "avg rating" }, { val: "99%", label: "satisfaction" }],
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    icon: Brain,
    label: "Know Your AI",
    tagline: "Discover & Compare",
    description:
      "Explore, benchmark, and compare AI models across categories. Find the perfect model for your use case.",
    g1: "#0c4a6e", g2: "#0284c7", g3: "#22d3ee",
    shimmer: "rgba(34,211,238,0.2)",
    bannerEmojis: [
      { e: "ð¬", x: "12%", y: "20%", r: "6deg",   s: 1.1 },
      { e: "ð", x: "78%", y: "12%", r: "-10deg", s: 0.9 },
      { e: "ð¯", x: "22%", y: "72%", r: "-6deg",  s: 1.15 },
      { e: "ð", x: "68%", y: "68%", r: "10deg",  s: 1.0 },
      { e: "ð¡", x: "48%", y: "38%", r: "-15deg", s: 0.85 },
      { e: "ð", x: "88%", y: "50%", r: "8deg",   s: 0.95 },
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
    description:
      "Courses, guides, and hands-on labs to master prompt engineering, AI development, and ML fundamentals.",
    g1: "#064e3b", g2: "#059669", g3: "#34d399",
    shimmer: "rgba(52,211,153,0.2)",
    bannerEmojis: [
      { e: "ð", x: "10%", y: "18%", r: "-8deg",  s: 1.1 },
      { e: "ð", x: "80%", y: "14%", r: "12deg",  s: 0.9 },
      { e: "ð", x: "18%", y: "68%", r: "6deg",   s: 1.2 },
      { e: "ð»", x: "72%", y: "70%", r: "-10deg", s: 1.0 },
      { e: "ð", x: "50%", y: "42%", r: "18deg",  s: 0.8 },
      { e: "ð", x: "88%", y: "42%", r: "-4deg",  s: 0.95 },
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
    description:
      "Post any AI task â custom LLMs, fine-tuned models, AI agents, chatbots â and get it done by vetted AI developers. Pay only on delivery.",
    g1: "#78350f", g2: "#d97706", g3: "#fbbf24",
    shimmer: "rgba(251,191,36,0.2)",
    bannerEmojis: [
      { e: "ð ï¸", x: "10%", y: "16%", r: "10deg",  s: 1.1 },
      { e: "ð¤", x: "80%", y: "10%", r: "-8deg",  s: 0.9 },
      { e: "ð¼", x: "20%", y: "72%", r: "-6deg",  s: 1.15 },
      { e: "âï¸", x: "70%", y: "68%", r: "12deg",  s: 1.0 },
      { e: "ð°", x: "50%", y: "38%", r: "-12deg", s: 0.85 },
      { e: "ð", x: "88%", y: "48%", r: "5deg",   s: 0.95 },
    ],
    cta: "Post a Task",
    tags: ["AI Development", "Bounties", "Escrow"],
    stats: [{ val: "500+", label: "AI devs" }, { val: "48hr", label: "avg delivery" }, { val: "Escrow", label: "protected" }],
  },
];

// ââ Hub Page âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function HubPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-14">

        {/* ââ NeuralPulse Banner âââââââââââââââââââââââââââââââ */}
        <NeuralPulseBanner />

        {/* ââ Header ââââââââââââââââââââââââââââââââââââââââââ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            Welcome to WhichAi.cloud
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-slate-900">
            Where do you want to go?
          </h1>
          <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed mb-6">
            Your AI journey starts here. Pick a destination below.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* ââ 4 Hub Cards âââââââââââââââââââââââââââââââââââââ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="h-full"
                style={{ transition: "box-shadow 0.3s" }}
              >
                <Link href={hub.href} className="block h-full group">
                  <div
                    className="relative rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-500 h-full"
                  >
                    {/* Full gradient background */}
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(160deg, ${hub.g1} 0%, ${hub.g2} 55%, ${hub.g3} 100%)` }}
                    />

                    {/* Subtle dot pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Hover shimmer overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                      style={{ background: `radial-gradient(ellipse at 50% 0%, ${hub.shimmer}, transparent 70%)` }}
                    />

                    {/* Floating emojis */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {hub.bannerEmojis.map((em, ei) => (
                        <span
                          key={ei}
                          className="absolute text-2xl select-none opacity-20 group-hover:opacity-30 transition-opacity duration-500"
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
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg group-hover:bg-white/30 transition-colors duration-300">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                          {hub.tagline}
                        </span>
                      </div>

                      {/* Stats â hero numbers */}
                      <div className="flex gap-4 mb-5">
                        {hub.stats.map((stat) => (
                          <div key={stat.label}>
                            <div className="text-xl font-black text-white leading-none tracking-tight">
                              {stat.val}
                            </div>
                            <div className="text-[10px] text-white/50 mt-0.5 font-medium">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Frosted glass panel at bottom */}
                      <div className="mt-auto bg-black/25 backdrop-blur-md rounded-2xl p-4 border border-white/15 group-hover:bg-black/30 transition-colors duration-300 flex flex-col">
                        <h2 className="text-[15px] font-black text-white mb-1.5 tracking-tight">
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
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-white/75 font-semibold border border-white/10 group-hover:bg-white/15 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* CTA row */}
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[13px] font-bold text-white">{hub.cta}</span>
                          <div className="w-7 h-7 rounded-full bg-white/20 border border-white/20 flex items-center justify-center group-hover:bg-white/35 group-hover:scale-110 group-hover:border-white/40 transition-all duration-200">
                            <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
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
    </div>
  );
}
