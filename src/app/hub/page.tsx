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
function UniversalSearchBar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full max-w-[600px] mx-auto z-50">
      <div className={`relative flex items-center rounded-2xl border transition-all duration-500 backdrop-blur-xl ${
        focused 
          ? "bg-white/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]" 
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}>
        <Search className={`absolute left-5 w-5 h-5 transition-colors duration-500 ${focused ? "text-purple-400" : "text-white/40"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search the nexus..."
          className="w-full pl-14 pr-6 py-4 bg-transparent text-base text-white placeholder:text-white/30 outline-none rounded-2xl"
        />
      </div>
    </div>
  );
}

// ── Accordion Data ────────────────────────────────────────────────
const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    label: "Marketplace",
    icon: ShoppingBag,
    tagline: "Commerce",
    description: "The primary hub for AI commerce. Buy and sell agents, models, and premium prompt packages.",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
    color: "purple",
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    label: "Know Your AI",
    icon: Brain,
    tagline: "Intelligence",
    description: "Real-time benchmarking and model comparison engine for the latest LLMs.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    color: "cyan",
  },
  {
    id: "learning-hub",
    href: "/learning-hub",
    label: "Learning Hub",
    icon: BookOpen,
    tagline: "Evolution",
    description: "Master the machine with curated paths, hands-on labs, and certificates.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
    color: "emerald",
  },
  {
    id: "ai-forge",
    href: "/ai-task-board",
    label: "AI Forge",
    icon: Briefcase,
    tagline: "Creation",
    description: "Post bounties and find tasks for the elite global AI developer network.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    color: "amber",
  },
  {
    id: "prompt-hub",
    href: "/prompt-hub",
    label: "Prompt Hub",
    icon: MessageSquare,
    tagline: "Linguistics",
    description: "High-precision LLM prompt engineering packages for every major model.",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=600&q=80",
    color: "pink",
  },
  {
    id: "community",
    href: "/community",
    label: "Community",
    icon: Users,
    tagline: "Signal",
    description: "Collaborative building, gossip, and reputation-backed networking.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    color: "indigo",
  },
  {
    id: "compute-exchange",
    href: "/gpurentals",
    label: "Compute Exchange",
    icon: Cpu,
    tagline: "Infrastructure",
    description: "Rent H100 clusters or monetize your own hardware nodes via decentralized P2P orchestration.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    color: "blue",
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

  return (
    <div className="h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden flex flex-col">
      <div className="shrink-0 relative z-50">
        <Navbar />
      </div>

      {/* ── 1. Futuristic Nebula Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
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
            className="text-3xl md:text-5xl font-black tracking-tightest mb-4"
          >
            Access the <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Nexus</span>
          </motion.h1>
          <UniversalSearchBar query={searchQuery} setQuery={setSearchQuery} />
        </div>

        {/* ── 2. Expanding Horizontal Accordion ── */}
        <div className="flex flex-row w-full h-[55vh] md:h-[500px] gap-2 md:gap-4 overflow-hidden items-stretch">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            const isHovered = hoveredId === hub.id;
            
            return (
              <motion.div
                key={hub.id}
                onMouseEnter={() => setHoveredId(hub.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`relative flex-1 hover:flex-[4] transition-all duration-500 ease-out group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl ${colorGlows[hub.color]}`}
              >
                <Link href={hub.href} className="absolute inset-0 z-10" />
                
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={hub.image}
                    alt={hub.label}
                    className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? "opacity-40 scale-110" : "opacity-10 grayscale group-hover:opacity-20"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative h-full z-20 flex flex-col p-6 overflow-hidden">
                  
                  {/* Compressed State: Icon & Vertical Text */}
                  <div className={`absolute inset-0 flex flex-col items-center pt-10 transition-opacity duration-300 ${isHovered ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <Icon className={`w-8 h-8 mb-8 transition-transform duration-500 group-hover:scale-110 ${iconColors[hub.color]}`} />
                    <span className="text-white/30 font-black text-sm uppercase tracking-[0.3em] vertical-text">
                      {hub.label}
                    </span>
                  </div>

                  {/* Expanded State Content */}
                  <div className={`h-full flex flex-col justify-between transition-all duration-500 delay-100 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${iconColors[hub.color]}`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            {hub.tagline}
                          </span>
                          <h2 className="text-2xl md:text-3xl font-black text-white">
                            {hub.label}
                          </h2>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-md">
                        {hub.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${hub.id === 'compute-exchange' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                          Live Hub
                        </div>
                        <span>Protocol v4.2</span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all hover:bg-white hover:text-black">
                        <ArrowRight size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center shrink-0">
          <Link href="/" className="inline-flex items-center gap-2 text-white/20 hover:text-white/50 transition-colors text-xs font-bold tracking-widest uppercase">
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
      `}</style>
    </div>
  );
}
