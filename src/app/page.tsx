"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, Newspaper, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getAllProducts, getAllNews, type AIProduct, type AINewsArticle } from "@/lib/data";
import NewsCard from "@/components/NewsCard";

// ============================================================
// Visitor Counter
// ============================================================
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
        if (!error && data) {
          setCount(data as number);
        }
      }
    }
    trackVisit();
  }, []);

  if (count === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-gray-200 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{count.toLocaleString()}</span>{" "}
          Total Visitors
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================
// Search bar with autocomplete
// ============================================================
function SmartSearch({ products }: { products: AIProduct[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.provider.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, products]);

  function navigate(slug: string) {
    setQuery("");
    setFocused(false);
    router.push(`/product/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && query.trim()) {
      if (suggestions.length > 0) {
        navigate(suggestions[0].slug);
      } else {
        router.push(`/compare`);
      }
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder="Search AI models... (e.g. ChatGPT, Gemini, Claude)"
        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-gray-200 text-slate-900 placeholder-slate-400 text-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
      />

      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
          >
            <div className="p-2">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Live Suggestions
              </p>
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  onMouseDown={() => navigate(p.slug)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                    {p.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400">{p.provider} · {p.category}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function Home() {
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [news, setNews] = useState<AINewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [prods, articles] = await Promise.all([getAllProducts(), getAllNews()]);
      setProducts(prods);
      setNews(articles);
      setLoading(false);
    }
    load();
  }, []);

  const sortedNews = useMemo(
    () => [...news].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()),
    [news]
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Subtle background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-0 -left-40 w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-7 h-7 text-purple-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            whichai
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center gap-1"
        >
          {[
            { href: "/compare", label: "Compare" },
            { href: "/dashboard", label: "Dashboard" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/auth/signup"
            className="relative group px-6 py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-300 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]"
          >
            Join whichai.cloud
          </Link>
        </motion.div>
      </nav>

      {/* Fixed left sidebar — news corner */}
      <aside className="hidden lg:flex fixed left-0 top-[73px] w-[270px] h-[calc(100vh-73px)] z-10 flex-col bg-white/80 backdrop-blur-sm border-r border-gray-100">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col h-full p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-purple-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              AI News Corner
            </h2>
          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              </div>
            ) : (
              <>
                {sortedNews.map((article, i) => (
                  <NewsCard key={article.id} article={article} index={i} />
                ))}
                {sortedNews.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">No news yet</p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </aside>

      {/* Center content — full viewport width, centered */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center w-full max-w-2xl"
        >
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-2">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
                Compare. Connect. Conquer.
              </span>
            </h1>
            <p className="text-base md:text-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold bg-gradient-animate">
              The World&apos;s AI at Your Fingertips.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-5"
          >
            <SmartSearch products={products} />
          </motion.div>

          {/* Marketplace CTA — directly below search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
              Join Whichai for the best AI Marketplace in the world
            </p>
            <p className="text-sm md:text-base bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold bg-gradient-animate">
              AI Marketplace: From Prompt to Power, All in One Place.
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Mobile news feed — shown below center content on small screens */}
      <section className="lg:hidden px-4 pb-12">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-purple-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            AI News Corner
          </h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {sortedNews.map((article, i) => (
            <NewsCard key={article.id} article={article} index={i} />
          ))}
          {sortedNews.length === 0 && (
            <p className="text-xs text-slate-400 py-4 text-center">No news yet</p>
          )}
        </div>
      </section>

      <VisitorCounter />
    </div>
  );
}
