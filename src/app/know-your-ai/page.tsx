"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    ArrowLeft,
    Zap,
    Search,
    BarChart3,
    Layers,
    ExternalLink,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { searchProducts, AIProduct } from "@/lib/data";

/* ------------------------------------------------------------------ */
/* Feature cards – each has a href so they navigate to a sub-page      */
/* ------------------------------------------------------------------ */
const features = [
  {
        icon: Search,
        title: "Model Explorer",
        desc: "Search and browse hundreds of AI models by category, capability, and price.",
        color: "bg-cyan-100 text-cyan-600",
        href: "/know-your-ai/model-explorer",
  },
  {
        icon: BarChart3,
        title: "Benchmarks",
        desc: "Real performance data across coding, reasoning, creativity, and more.",
        color: "bg-blue-100 text-blue-600",
        href: "/know-your-ai/benchmarks",
  },
  {
        icon: Layers,
        title: "Side-by-Side Compare",
        desc: "Compare any two models head-to-head on the metrics that matter to you.",
        color: "bg-indigo-100 text-indigo-600",
        href: "/know-your-ai/compare",
  },
  {
        icon: Zap,
        title: "Use-Case Matcher",
        desc: "Tell us what you need to do – we'll recommend the best AI for the job.",
        color: "bg-violet-100 text-violet-600",
        href: "/know-your-ai/use-case-matcher",
  },
  ];

/* ------------------------------------------------------------------ */
/* Main Page                                                            */
/* ------------------------------------------------------------------ */
export default function KnowYourAIPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<AIProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
        function handleClick(e: MouseEvent) {
                if (
                          containerRef.current &&
                          !containerRef.current.contains(e.target as Node)
                        ) {
                          setOpen(false);
                }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Debounced search */
  const handleChange = useCallback((val: string) => {
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!val.trim()) {
                setResults([]);
                setOpen(false);
                return;
        }
        setLoading(true);
        setOpen(true);
        debounceRef.current = setTimeout(async () => {
                try {
                          const data = await searchProducts(val.trim());
                          setResults(data.slice(0, 10));
                } catch {
                          setResults([]);
                } finally {
                          setLoading(false);
                }
        }, 300);
  }, []);

  const clearSearch = () => {
        setQuery("");
        setResults([]);
        setOpen(false);
        inputRef.current?.focus();
  };

  return (
        <div className="min-h-screen bg-[#f4f0eb]">
          {/* Sticky Navbar */}
              <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40">
                      <Navbar />
              </div>div>
        
              <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
                {/* Back link */}
                      <motion.div
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="mb-10"
                                >
                                <Link
                                              href="/hub"
                                              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors"
                                            >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Hub
                                </Link>Link>
                      </motion.div>motion.div>
              
                {/* Header */}
                      <motion.div
                                  initial={{ opacity: 0, y: 24 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5 }}
                                  className="mb-10"
                                >
                                <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center">
                                                          <Brain className="w-7 h-7 text-cyan-600" />
                                            </div>div>
                                            <div>
                                                          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 bg-cyan-100 px-3 py-1 rounded-full">
                                                                          Discover &amp; Compare
                                                          </span>span>
                                            </div>div>
                                </div>div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                                            Know Your AI
                                </h1>h1>
                                <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                                            Explore, benchmark, and compare AI models so you always pick the
                                            right tool for the job. No more guessing — make data-driven
                                            decisions.
                                </p>p>
                      </motion.div>motion.div>
              
                {/* ── BIG SEARCH BAR ─────────────────────────────────────────── */}
                      <motion.div
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.15, duration: 0.45 }}
                                  className="mb-14"
                                  ref={containerRef}
                                >
                        {/* Input wrapper */}
                                <div className="relative">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none" />
                                            <input
                                                            ref={inputRef}
                                                            type="text"
                                                            value={query}
                                                            onChange={(e) => handleChange(e.target.value)}
                                                            onFocus={() => {
                                                                              if (query.trim() && results.length > 0) setOpen(true);
                                                            }}
                                                            placeholder="Search AI models… e.g. ChatGPT, Claude, Gemini"
                                                            className="w-full pl-14 pr-14 py-5 text-lg rounded-2xl border-2 border-gray-200 bg-white shadow-sm focus:outline-none focus:border-cyan-400 focus:shadow-md transition-all placeholder:text-slate-400 text-slate-900"
                                                          />
                                  {query && (
                                                <button
                                                                  onClick={clearSearch}
                                                                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                                                >
                                                                <X className="w-5 h-5" />
                                                </button>button>
                                            )}
                                </div>div>
                      
                        {/* Dropdown results */}
                                <AnimatePresence>
                                  {open && (
                                                <motion.div
                                                                  initial={{ opacity: 0, y: -8 }}
                                                                  animate={{ opacity: 1, y: 0 }}
                                                                  exit={{ opacity: 0, y: -8 }}
                                                                  transition={{ duration: 0.18 }}
                                                                  className="absolute z-50 mt-2 w-full max-w-5xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
                                                                >
                                                  {loading ? (
                                                                                    <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
                                                                                                        <svg
                                                                                                                                className="animate-spin w-5 h-5"
                                                                                                                                viewBox="0 0 24 24"
                                                                                                                                fill="none"
                                                                                                                              >
                                                                                                                              <circle
                                                                                                                                                        className="opacity-25"
                                                                                                                                                        cx="12"
                                                                                                                                                        cy="12"
                                                                                                                                                        r="10"
                                                                                                                                                        stroke="currentColor"
                                                                                                                                                        strokeWidth="4"
                                                                                                                                                      />
                                                                                                                              <path
                                                                                                                                                        className="opacity-75"
                                                                                                                                                        fill="currentColor"
                                                                                                                                                        d="M4 12a8 8 0 018-8v8H4z"
                                                                                                                                                      />
                                                                                                          </svg>svg>
                                                                                                        Searching…
                                                                                      </div>div>
                                                                                  ) : results.length === 0 ? (
                                                                                    <div className="py-10 text-center text-slate-400 text-sm">
                                                                                                        No AI models found for &ldquo;{query}&rdquo;
                                                                                      </div>div>
                                                                                  ) : (
                                                                                    <ul>
                                                                                      {results.map((item, idx) => (
                                                                                                            <motion.li
                                                                                                                                      key={item.id}
                                                                                                                                      initial={{ opacity: 0, x: -8 }}
                                                                                                                                      animate={{ opacity: 1, x: 0 }}
                                                                                                                                      transition={{ delay: idx * 0.04 }}
                                                                                                                                    >
                                                                                                                                    <Link
                                                                                                                                                                href={`/know-your-ai/model-explorer/${item.slug}`}
                                                                                                                                                                onClick={() => setOpen(false)}
                                                                                                                                                                className="flex items-center gap-4 px-5 py-4 hover:bg-cyan-50 transition-colors border-b border-gray-100 last:border-0 group"
                                                                                                                                                              >
                                                                                                                                      {/* Logo / Fallback */}
                                                                                                                                                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                                                                                                                                {item.logo_url ? (
                                                                                                                                                                                              // eslint-disable-next-line @next/next/no-img-element
                                                                                                                                                                                              <img
                                                                                                                                                                                                                                src={item.logo_url}
                                                                                                                                                                                                                                alt={item.name}
                                                                                                                                                                                                                                className="w-8 h-8 object-contain"
                                                                                                                                                                                                                              />
                                                                                                                                                                                            ) : (
                                                                                                                                                                                              <Brain className="w-5 h-5 text-slate-400" />
                                                                                                                                                                                            )}
                                                                                                                                                                </div>div>
                                                                                                                                      {/* Info */}
                                                                                                                                                              <div className="flex-1 min-w-0">
                                                                                                                                                                                          <p className="font-bold text-slate-900 truncate">
                                                                                                                                                                                                                        {item.name}
                                                                                                                                                                                                                      </p>p>
                                                                                                                                                                                          <p className="text-xs text-slate-400 truncate">
                                                                                                                                                                                                                        {item.provider} ·{" "}
                                                                                                                                                                                                                        <span className="capitalize">{item.category}</span>span>
                                                                                                                                                                                                                        {item.free_tier && (
                                                                                                                                                                                                <span className="ml-2 px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold text-[10px]">
                                                                                                                                                                                                                                  Free tier
                                                                                                                                                                                                                                </span>span>
                                                                                                                                                                                                                        )}
                                                                                                                                                                                                                      </p>p>
                                                                                                                                                                </div>div>
                                                                                                                                      {/* Arrow */}
                                                                                                                                                              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 transition-colors shrink-0" />
                                                                                                                                      </Link>Link>
                                                                                                              </motion.li>motion.li>
                                                                                                          ))}
                                                                                      </ul>ul>
                                                                )}
                                                </motion.div>motion.div>
                                              )}
                                </AnimatePresence>AnimatePresence>
                      </motion.div>motion.div>
                {/* ── END SEARCH BAR ─────────────────────────────────────────── */}
              
                {/* Feature cards – ALL clickable */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                        {features.map((f, i) => {
                      const Icon = f.icon;
                      return (
                                      <motion.div
                                                        key={f.title}
                                                        initial={{ opacity: 0, y: 24 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 + i * 0.08 }}
                                                      >
                                                      <Link
                                                                          href={f.href}
                                                                          className="flex gap-4 p-6 rounded-2xl border border-gray-200 bg-white hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer group block"
                                                                        >
                                                                        <div
                                                                                              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}
                                                                                            >
                                                                                            <Icon className="w-6 h-6" />
                                                                        </div>div>
                                                                        <div className="flex-1">
                                                                                            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-cyan-700 transition-colors">
                                                                                              {f.title}
                                                                                              </h3>h3>
                                                                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                                                              {f.desc}
                                                                                              </p>p>
                                                                        </div>div>
                                                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 transition-colors shrink-0 self-center" />
                                                      </Link>Link>
                                      </motion.div>motion.div>
                                    );
        })}
                      </div>div>
              
                {/* Coming soon banner */}
                      <motion.div
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.6 }}
                                  className="rounded-3xl border-2 border-dashed border-cyan-200 bg-cyan-50 p-10 text-center"
                                >
                                <div className="text-4xl mb-4">🔭</div>div>
                                <h2 className="text-xl font-black text-slate-900 mb-2">
                                            Coming Soon
                                </h2>h2>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                                            The full AI explorer and comparison engine is in development. Check
                                            back soon!
                                </p>p>
                                <Link
                                              href="/hub"
                                              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors"
                                            >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Hub
                                </Link>Link>
                      </motion.div>motion.div>
              </main>main>
        </div>div>
      );
}</div>
