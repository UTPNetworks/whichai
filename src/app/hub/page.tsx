"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Brain, BookOpen, Briefcase, ArrowRight, Sparkles,
  Zap, TrendingUp, Globe, ExternalLink, RefreshCw, Home, Search,
  ChevronRight, Loader2, MessageSquare, Users, Check, Clock, Shield,
  BarChart3, Monitor, Star, DollarSign, Tag, Cpu,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";

// ── Universal Search Bar (Futuristic) ──────────────────────────
const SEARCH_CATEGORIES = [
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, href: "/marketplace", color: "from-violet-500 to-purple-600" },
  { id: "know-your-ai", label: "Know Your AI", icon: Brain, href: "/know-your-ai", color: "from-cyan-500 to-blue-600" },
  { id: "learning-hub", label: "Learning Hub", icon: BookOpen, href: "/learning-hub", color: "from-emerald-500 to-green-600" },
  { id: "ai-forge", label: "AI Forge", icon: Briefcase, href: "/ai-task-board", color: "from-amber-500 to-orange-600" },
  { id: "prompt-hub", label: "Prompt Hub", icon: MessageSquare, href: "/prompt-hub", color: "from-pink-500 to-rose-600" },
  { id: "community", label: "Community", icon: Users, href: "/community", color: "from-indigo-500 to-violet-600" },
  { id: "compute-exchange", label: "Compute Exchange", icon: Cpu, href: "/gpurentals", color: "from-slate-800 to-slate-950" },
];

function UniversalSearchBar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full max-w-[725px] mx-auto z-50">
      <div className={`relative flex items-center rounded-3xl border transition-all duration-500 backdrop-blur-xl ${
        focused 
          ? "bg-white/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-[1.02]" 
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}>
        <Search className={`absolute left-6 w-6 h-6 transition-colors duration-500 ${focused ? "text-purple-400" : "text-white/40"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search the nexus of AI..."
          className="w-full pl-16 pr-6 py-6 bg-transparent text-lg text-white placeholder:text-white/30 outline-none rounded-3xl"
        />
      </div>
    </div>
  );
}

// ── Bento Grid Data ────────────────────────────────────────────────
const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    label: "Marketplace",
    tagline: "The Nexus",
    description: "The primary hub for AI commerce. Buy and sell production-ready agents, fine-tuned models, and premium prompt engineering packages.",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
    color: "purple",
    gridClass: "md:col-span-2 md:row-span-2",
    tags: ["Digital Assets", "High Liquidity"],
    stats: "15K+ Active",
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    label: "Know Your AI",
    tagline: "Intelligence",
    description: "Real-time benchmarking and model comparison engine.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    color: "cyan",
    gridClass: "md:col-span-1 md:row-span-1",
    tags: ["Benchmarks"],
    stats: "200+ Models",
  },
  {
    id: "learning-hub",
    href: "/learning-hub",
    label: "Learning Hub",
    tagline: "Evolution",
    description: "Master the machine with curated paths and labs.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
    color: "emerald",
    gridClass: "md:col-span-1 md:row-span-1",
    tags: ["Labs"],
    stats: "50+ Courses",
  },
  {
    id: "ai-forge",
    href: "/ai-task-board",
    label: "AI Forge",
    tagline: "Creation",
    description: "Bounties and tasks for the elite AI developer network.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    color: "amber",
    gridClass: "md:col-span-1 md:row-span-1",
    tags: ["Tasks"],
    stats: "500+ Devs",
  },
  {
    id: "prompt-hub",
    href: "/prompt-hub",
    label: "Prompt Hub",
    tagline: "Linguistics",
    description: "High-precision LLM prompt engineering packages.",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=600&q=80",
    color: "pink",
    gridClass: "md:col-span-1 md:row-span-1",
    tags: ["Library"],
    stats: "4.8K Prompts",
  },
  {
    id: "community",
    href: "/community",
    label: "Community",
    tagline: "The Signal",
    description: "Collaborative building and reputation-backed networking.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    color: "indigo",
    gridClass: "md:col-span-1 md:row-span-1",
    tags: ["Social"],
    stats: "52K Members",
  },
  {
    id: "compute-exchange",
    href: "/gpurentals",
    label: "Compute & GPU Exchange",
    tagline: "Infrastructure",
    description: "The foundational layer of WhichAI. Rent massive H100 clusters or monetize your own hardware nodes through our decentralized P2P orchestration network.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    color: "cyan-bright",
    gridClass: "md:col-span-3 md:row-span-1",
    tags: ["Infrastructure", "P2P nodes"],
    stats: "1.2k Nodes",
  },
];

const colorVariants: Record<string, string> = {
  purple: "group-hover:border-purple-500/50 group-hover:shadow-purple-500/20 text-purple-400",
  cyan: "group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20 text-cyan-400",
  emerald: "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20 text-emerald-400",
  amber: "group-hover:border-amber-500/50 group-hover:shadow-amber-500/20 text-amber-400",
  pink: "group-hover:border-pink-500/50 group-hover:shadow-pink-500/20 text-pink-400",
  indigo: "group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/20 text-indigo-400",
  "cyan-bright": "group-hover:border-cyan-400/60 group-hover:shadow-cyan-400/20 text-cyan-300",
};

export default function HubPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* ── 1. Futuristic Nebula Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#020205]" />
        <div className="absolute inset-0 animate-nebula opacity-40 mix-blend-screen overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/30 rounded-full blur-[120px] animate-nebula-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[100px] animate-nebula-blob animation-delay-2000" />
          <div className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[110px] animate-nebula-blob animation-delay-4000" />
        </div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
      </div>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold tracking-[0.2em] uppercase mb-6"
          >
            <Sparkles size={14} /> Nexus Terminal
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tightest mb-6"
          >
            Access the <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Nexus</span>
          </motion.h1>
          
          <UniversalSearchBar query={searchQuery} setQuery={setSearchQuery} />
        </div>

        {/* ── 2. Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-min">
          {hubs.map((hub, i) => (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.6 }}
              className={`${hub.gridClass} group`}
            >
              <Link href={hub.href} className="block h-full">
                <div className={`relative h-full rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.08] ${colorVariants[hub.color]}`}>
                  
                  {/* Glowing hover border */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-[-1px] border border-inherit rounded-[2rem] blur-sm shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />
                  </div>

                  <div className="relative h-full flex flex-col">
                    {/* Image Area */}
                    <div className={`relative w-full overflow-hidden ${hub.id === 'marketplace' ? 'h-48' : hub.id === 'compute-exchange' ? 'h-32 md:h-40' : 'h-32'}`}>
                      <img
                        src={hub.image}
                        alt={hub.label}
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/40 to-transparent" />
                      
                      {/* Category Badge */}
                      <span className="absolute top-4 left-6 z-10 text-[9px] font-black uppercase tracking-[0.2em] text-white/50 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        {hub.tagline}
                      </span>

                      {/* Top Right Stat */}
                      <div className="absolute top-4 right-6 z-10 font-mono text-[10px] font-bold text-white/40">
                        {hub.stats}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 pt-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl font-black mb-3 group-hover:translate-x-1 transition-transform duration-500">
                          {hub.label}
                        </h2>
                        <p className={`text-sm text-white/50 leading-relaxed mb-6 group-hover:text-white/70 transition-colors duration-500 ${hub.id === 'compute-exchange' || hub.id === 'marketplace' ? 'max-w-2xl' : ''}`}>
                          {hub.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                          {hub.tags.map(t => (
                            <span key={t} className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-white/40 group-hover:text-white/60 transition-colors">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 group-hover:rotate-[-45deg]">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 flex flex-col items-center gap-6"
        >
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <Link href="/" className="text-white/30 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
            <Home size={16} /> Return to Nexus Root
          </Link>
        </motion.div>
      </main>

      <style jsx global>{`
        @keyframes nebula {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes nebula-blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-nebula-blob {
          animation: nebula-blob 7s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .tracking-tightest {
          letter-spacing: -0.05em;
        }
      `}</style>
    </div>
  );
}
