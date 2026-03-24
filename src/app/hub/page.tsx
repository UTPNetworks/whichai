"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag, Brain, BookOpen, Briefcase, ArrowRight, Sparkles,
  Zap, TrendingUp, Globe, ExternalLink, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

// ── NeuralPulse category badge colors (dark-mode) ─────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  "OpenAI":      "bg-emerald-900/60 text-emerald-300",
  "Google AI":   "bg-blue-900/60 text-blue-300",
  "Anthropic":   "bg-orange-900/60 text-orange-300",
  "Meta AI":     "bg-indigo-900/60 text-indigo-300",
  "Image AI":    "bg-pink-900/60 text-pink-300",
  "Hardware":    "bg-cyan-900/60 text-cyan-300",
  "Open Source": "bg-purple-900/60 text-purple-300",
  "Policy":      "bg-amber-900/60 text-amber-300",
  "General AI":  "bg-slate-700/60 text-slate-300",
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

// ── NeuralPulse Banner ─────────────────────────────────────────────────────
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

  const categories = ["All", ...Array.from(new Set(news.map((n) => n.category)))];
  const filtered = filter === "All" ? news : news.filter((n) => n.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-10 rounded-2xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-900/30"
      style={{ background: "linear-gradient(135deg, #0d0d24 0%, #0f0720 50%, #0d0d24 100%)" }}
    >
      {/* Banner header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-white/[0.07]"
        style={{ background: "linear-gradient(90deg, rgba(109,40,217,0.25) 0%, rgba(16,6,40,0.5) 50%, rgba(6,82,109,0.2) 100%)" }}>
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">NeuralPulse</h2>
            <p className="text-[9px] text-slate-400 font-medium tracking-widest uppercase">AI News Feed</p>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-slate-400">Live · Updated {lastUpdated || "loading..."}</span>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 px-1">
          {categories.slice(0, 7).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                filter === cat
                  ? "bg-violet-500 text-white shadow-md shadow-violet-500/30"
                  : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={() => fetchNews(true)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0 ${refreshing ? "animate-spin" : ""}`}
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* News grid — 3 columns × 2 rows */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse px-5 py-4 border-b border-r border-white/[0.05]">
              <div className="h-2 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-full mb-1.5" />
              <div className="h-3 bg-white/10 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-x divide-y divide-white/[0.05]">
          {filtered.slice(0, 6).map((item, idx) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.06 }}
              className="group px-5 py-4 hover:bg-white/[0.04] transition-colors flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["General AI"]}`}>
                  {item.category}
                </span>
                <span className="text-[9px] text-slate-600 shrink-0">{item.time}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-200 leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-3 text-[9px] text-slate-500 mt-auto">
                <span className="flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{item.points}</span>
                <span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" />{item.source}</span>
                <ExternalLink className="w-2.5 h-2.5 ml-auto text-slate-700 group-hover:text-violet-400 transition-colors" />
              </div>
            </motion.a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2 border-t border-white/[0.05]" style={{ background: "rgba(0,0,0,0.2)" }}>
        <p className="text-[9px] text-slate-600 text-center">
          RSS + Supabase · refresh runs daily at 8pm CST/CDT
        </p>
      </div>
    </motion.div>
  );
}

// ── Hub data ───────────────────────────────────────────────────────────────
const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    label: "Marketplace",
    tagline: "The Hub",
    description:
      "Buy and sell AI prompts, agents, fine-tuned models, GPU compute, and hardware — all in one place.",
    bannerFrom: "#7c3aed",
    bannerTo: "#a78bfa",
    bannerEmojis: ["🤖", "💡", "✨", "🧠", "⚡", "💎", "🛒", "🔮"],
    iconBg: "bg-violet-600 text-white",
    border: "border-violet-500/40 hover:border-violet-400",
    glow: "hover:shadow-[0_0_30px_rgba(124,58,237,0.25)]",
    pill: "bg-violet-900/60 text-violet-300",
    cta: "Enter Marketplace",
    ctaStyle: "bg-violet-600 hover:bg-violet-500 text-white",
    tags: ["Digital Assets", "Compute Hub", "Hardware Corner"],
    stats: [{ val: "15K+", label: "listings" }, { val: "4.8★", label: "avg rating" }, { val: "99%", label: "satisfaction" }],
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    icon: Brain,
    label: "Know Your AI",
    tagline: "Discover & Compare",
    description:
      "Explore, benchmark, and compare AI models across categories. Find the perfect model for your use case.",
    bannerFrom: "#0369a1",
    bannerTo: "#22d3ee",
    bannerEmojis: ["🔬", "📊", "🧪", "💡", "🎯", "🔮", "📈", "🏆"],
    iconBg: "bg-cyan-600 text-white",
    border: "border-cyan-500/40 hover:border-cyan-400",
    glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
    pill: "bg-cyan-900/60 text-cyan-300",
    cta: "Explore AI",
    ctaStyle: "bg-cyan-600 hover:bg-cyan-500 text-white",
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
    bannerFrom: "#047857",
    bannerTo: "#34d399",
    bannerEmojis: ["🎓", "📚", "🚀", "💻", "🏆", "🌟", "🎯", "📝"],
    iconBg: "bg-emerald-600 text-white",
    border: "border-emerald-500/40 hover:border-emerald-400",
    glow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.2)]",
    pill: "bg-emerald-900/60 text-emerald-300",
    cta: "Start Learning",
    ctaStyle: "bg-emerald-600 hover:bg-emerald-500 text-white",
    tags: ["Prompt Engineering", "AI Courses", "Labs"],
    stats: [{ val: "50+", label: "courses" }, { val: "Hands-on", label: "labs" }, { val: "Free", label: "to start" }],
  },
  {
    id: "ai-task-board",
    href: "/ai-task-board",
    icon: Briefcase,
    label: "AI Task Board",
    tagline: "Get It Built",
    description:
      "Post any AI task — custom LLMs, fine-tuned models, AI agents, chatbots — and get it done by vetted AI developers. Pay only on delivery.",
    bannerFrom: "#b45309",
    bannerTo: "#fbbf24",
    bannerEmojis: ["🛠️", "🤝", "💼", "🔧", "⚙️", "🎯", "💰", "🚀"],
    iconBg: "bg-amber-500 text-white",
    border: "border-amber-500/40 hover:border-amber-400",
    glow: "hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]",
    pill: "bg-amber-900/60 text-amber-300",
    cta: "Post a Task",
    ctaStyle: "bg-amber-500 hover:bg-amber-400 text-white",
    tags: ["AI Development", "Bounties", "Freelancers"],
    stats: [{ val: "500+", label: "AI devs" }, { val: "48hr", label: "avg delivery" }, { val: "Escrow", label: "protected" }],
  },
];

// ── Hub Page ───────────────────────────────────────────────────────────────
export default function HubPage() {
  return (
    <div className="min-h-screen" style={{ background: "#07070f" }}>
      {/* Navbar wrapper — dark */}
      <div className="sticky top-0 z-40 border-b border-white/[0.08]" style={{ background: "#07070f" }}>
        <Navbar />
      </div>

      {/* Subtle grid/dot background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Ambient glow orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none opacity-15"
        style={{ background: "radial-gradient(circle, #0891b2, transparent)" }} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-14">

        {/* ── NeuralPulse Banner ─────────────────────────────── */}
        <NeuralPulseBanner />

        {/* ── Header ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-900/30 text-violet-300 text-sm font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Welcome to WhichAi.cloud
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-white">
            Where do you want to go?
          </h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Your AI journey starts here. Pick a destination below.
          </p>
        </motion.div>

        {/* ── 4 Hub Cards — single horizontal row, 20% smaller ─ */}
        <div className="grid grid-cols-4 gap-3">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <Link href={hub.href} className="block h-full group">
                  <div
                    className={`relative h-full flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer shadow-lg ${hub.border} ${hub.glow}`}
                    style={{ background: "#0f0f24" }}
                  >
                    {/* Colorful banner */}
                    <div
                      className="relative h-[72px] flex items-center justify-center overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${hub.bannerFrom}, ${hub.bannerTo})` }}
                    >
                      {/* Floating emoji decoration */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-2 opacity-20 rotate-[-8deg] scale-125">
                          {hub.bannerEmojis.map((emoji, ei) => (
                            <span key={ei} className="text-xl select-none">{emoji}</span>
                          ))}
                        </div>
                      </div>
                      {/* Icon circle */}
                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${hub.iconBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
                          {hub.tagline}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-3">
                      <h2 className="text-sm font-black text-white mb-1">
                        {hub.label}
                      </h2>
                      <p className="text-slate-400 text-[11px] leading-relaxed flex-1 mb-3">
                        {hub.description}
                      </p>

                      {/* Stats row */}
                      <div className="flex gap-2 mb-2.5">
                        {hub.stats.map((stat) => (
                          <div key={stat.label} className="flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-100">{stat.val}</span>
                            <span className="text-[10px] text-slate-500">{stat.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {hub.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${hub.pill}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div
                        className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${hub.ctaStyle}`}
                      >
                        {hub.cta}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
          transition={{ delay: 0.6 }}
          className="text-center text-slate-600 text-xs mt-8"
        >
          You can always switch between sections from the navbar.
        </motion.p>
      </main>
    </div>
  );
}
