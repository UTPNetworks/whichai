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

// ── Accordion Data ────────────────────────────────────────────────
const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    label: "Marketplace",
    subtitle: "Buy • Sell • Bid",
    icon: ShoppingBag,
    tagline: "Commerce",
    description: "The primary hub for AI commerce. Buy and sell agents, models, and premium prompt packages.",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
    color: "purple",
    keywords: ["buy", "sell", "agent", "model", "prompt", "escrow", "commerce", "shop"],
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    label: "Know Your AI",
    subtitle: "Compare • Source APIs • Claim Perks",
    icon: Brain,
    tagline: "Intelligence",
    description: "Real-time benchmarking and model comparison engine for the latest LLMs.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    color: "cyan",
    keywords: ["compare", "benchmark", "score", "llm", "claude", "gpt", "gemini", "research"],
  },
  {
    id: "learning-hub",
    href: "/learning-hub",
    label: "Learning Hub",
    subtitle: "Learn • Teach • Build AI",
    icon: BookOpen,
    tagline: "Evolution",
    description: "Master the machine with curated paths, hands-on labs, and certificates.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
    color: "emerald",
    keywords: ["course", "learn", "lab", "certificate", "guide", "tutorial", "masterclass"],
  },
  {
    id: "ai-forge",
    href: "/ai-task-board",
    label: "AI Forge",
    subtitle: "Post Bounties • Hunt Tasks",
    icon: Briefcase,
    tagline: "Creation",
    description: "Post bounties and find tasks for the elite global AI developer network.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    color: "amber",
    keywords: ["task", "bounty", "build", "developer", "hire", "work", "forge"],
  },
  {
    id: "prompt-hub",
    href: "/prompt-hub",
    label: "Prompt Hub",
    subtitle: "Discover • Draft • Engineer",
    icon: MessageSquare,
    tagline: "Linguistics",
    description: "High-precision LLM prompt engineering packages for every major model.",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=600&q=80",
    color: "pink",
    keywords: ["prompt", "package", "template", "engineering", "chatgpt", "midjourney"],
  },
  {
    id: "community",
    href: "/community",
    label: "Community",
    subtitle: "Build • Connect • Debate",
    icon: Users,
    tagline: "Signal",
    description: "Collaborative building, gossip, and reputation-backed networking.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    color: "indigo",
    keywords: ["chat", "forum", "discuss", "network", "builder", "signal", "reputation"],
  },
  {
    id: "compute-exchange",
    href: "/gpurentals",
    label: "GPU Rentals",
    subtitle: "Rent Compute • Host Nodes",
    icon: Cpu,
    tagline: "Infrastructure",
    description: "Rent H100 clusters or monetize your own hardware nodes via decentralized P2P orchestration.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    color: "blue",
    keywords: ["gpu", "rent", "h100", "a100", "4090", "node", "compute", "mining", "hardware", "nvidia"],
  },
];

const colorGlows: Record<string, string> = {
  purple: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  cyan: "group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  emerald: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  amber: "group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  pink: "group-hover:border-pink-500/50 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]",
  indigo: "group-hover:border-indigo-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]",
  blue: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
};

const iconColors: Record<string, string> = {
  purple: "text-purple-400",
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  pink: "text-pink-400",
  indigo: "text-indigo-400",
  blue: "text-blue-400",
};

export default function HubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [categoryMatches, setCategoryMatches] = useState<Record<string, number>>({});

  // Mock Telemetry Logic: Simulates real-time search indexing across categories
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const mockResults: Record<string, number> = {};
      hubs.forEach(hub => {
        const count = Math.floor(Math.random() * 45) + 1;
        mockResults[hub.label] = count;
      });
      setCategoryMatches(mockResults);
    } else {
      setCategoryMatches({});
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 selection:bg-purple-500/30 overflow-hidden flex flex-col">
      <div className="shrink-0 relative z-50">
        <Navbar />
      </div>

      {/* ── 1. Futuristic Nebula Background (Only in Dark Mode) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 dark:opacity-100 opacity-0 transition-opacity duration-1000">
        <div className="absolute inset-0 bg-[#020205]" />
        <div className="absolute inset-0 animate-nebula opacity-30 mix-blend-screen overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-nebula-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/15 rounded-full blur-[100px] animate-nebula-blob animation-delay-2000" />
        </div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 contrast-150" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-6 py-4 md:py-8 justify-center">
        
        {/* Header - Compact for no-scroll */}
        <div className="text-center mb-8 shrink-0">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black tracking-tightest mb-6 dark:text-white text-slate-900"
          >
            Access the <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Nexus</span>
          </motion.h1>
          
          {/* ── 2. Omni-Search Bar (Flexbox Pill Rewrite) ── */}
          <div className="flex items-center w-full max-w-md mx-auto my-8 bg-gray-50/50 dark:bg-white/5 backdrop-blur-md border-2 border-gray-200/50 dark:border-white/10 rounded-full px-6 py-3 shadow-md focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Search size={24} strokeWidth={2.5} className="text-blue-500 mr-4 shrink-0" />
            <input
              type="text"
              placeholder="Search the Nexus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* ── 2. Expanding Horizontal Accordion ── */}
        <div className="flex flex-row w-full h-[55vh] md:h-[500px] gap-2 md:gap-4 overflow-hidden items-stretch">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            const isHovered = hoveredId === hub.id;
            const matchCount = categoryMatches[hub.label] || 0;
            
            return (
              <Link 
                key={hub.id} 
                href={hub.href}
                className={`relative flex-1 hover:flex-[4] transition-all duration-500 ease-out group cursor-pointer overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-2xl shadow-sm dark:shadow-none pointer-events-auto z-20 ${colorGlows[hub.color]}`}
                onMouseEnter={() => setHoveredId(hub.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* ── 3. Telemetry Badge ── */}
                <AnimatePresence>
                  {matchCount > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full border border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse-slow"
                    >
                      {matchCount}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className="h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={hub.image}
                      alt={hub.label}
                      className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? "opacity-40 scale-110" : "opacity-5 dark:opacity-10 grayscale group-hover:opacity-20"}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-black via-transparent to-transparent" />
                  </div>

                  <div className="relative h-full z-20 flex flex-col p-6 overflow-hidden pointer-events-none">
                    
                    {/* Compressed State: Icon & Vertical Text */}
                    <div className={`absolute inset-0 flex flex-col items-center pt-10 transition-opacity duration-300 ${isHovered ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                      <Icon className={`w-8 h-8 mb-8 transition-transform duration-500 group-hover:scale-110 ${iconColors[hub.color]}`} />
                      <div className="flex flex-col items-center gap-1">
                        <span className="dark:text-white/30 text-slate-400 font-black text-sm uppercase tracking-[0.3em] vertical-text">
                          {hub.label}
                        </span>
                      </div>
                    </div>

                    {/* Expanded State Content */}
                    <div className={`h-full flex flex-col justify-between transition-all duration-500 delay-100 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 ${iconColors[hub.color]}`}>
                            <Icon size={24} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white/40 text-slate-500">
                              {hub.tagline}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black dark:text-white text-slate-900 leading-none">
                              {hub.label}
                            </h2>
                            {/* PRESERVED SUBTITLE */}
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase mt-3 transition-all duration-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                              {(hub as any).subtitle}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm md:text-base dark:text-white/60 text-slate-600 leading-relaxed max-w-md">
                          {hub.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs font-bold dark:text-white/40 text-slate-400 uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${hub.id === 'compute-exchange' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                            Live Hub
                          </div>
                          <span>Protocol v4.2</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white/10 border border-slate-800 dark:border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 pointer-events-auto">
                          <ArrowRight size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center shrink-0">
          <Link href="/" className="inline-flex items-center gap-2 dark:text-white/20 text-slate-400 hover:dark:text-white/50 hover:text-slate-600 transition-colors text-xs font-bold tracking-widest uppercase">
            <Home size={14} /> Nexus Root
          </Link>
        </div>
      </main>

      <style jsx global>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
        @keyframes nebula {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes nebula-blob {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, -20px) scale(1.1); }
        }
        .animate-nebula-blob {
          animation: nebula-blob 10s infinite alternate ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .tracking-tightest {
          letter-spacing: -0.05em;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
