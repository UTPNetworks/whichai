"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, Newspaper, Loader2, ShoppingBag, TrendingUp, Tag, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getAllProducts, getAllNews, marketplaceDeals, getDiscountPct, type AIProduct, type AINewsArticle, type MarketplaceDeal } from "@/lib/data";
import NewsCard from "@/components/NewsCard";
import { useAuth } from "@/components/AuthProvider";

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
// Latest Listings Strip
// ============================================================
function LatestListings({ deals }: { deals: MarketplaceDeal[] }) {
  const latest = deals.slice(0, 6);
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="relative z-10 px-4 md:px-12 pb-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-slate-900">Latest Listings</h2>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-1 text-sm font-medium text-purple-500 hover:text-purple-700 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latest.map((deal, i) => {
            const discount = getDiscountPct(deal.original_price, deal.discounted_price);
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-slate-800 font-bold text-lg shrink-0">
                  {deal.provider[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{deal.name}</p>
                  <p className="text-xs text-slate-400">{deal.provider}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-slate-900">${deal.discounted_price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 line-through">${deal.original_price.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">-{discount}%</span>
                  </div>
                </div>
                <a
                  href={deal.claim_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function Home() {
  const { user } = useAuth();
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

      {/* Main layout: 35% news sidebar + 65% hero content */}
      <div className="relative z-10 flex h-[calc(100vh-73px)]">

        {/* Left sidebar — news corner (35% of page width) */}
        <aside className="hidden lg:flex flex-col w-[23%] h-full bg-white/80 backdrop-blur-sm border-r border-gray-100 shrink-0">
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

        {/* Right content — hero (65% of page width) */}
        <main className="flex-1 flex items-center justify-center px-4">
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

          {/* CTA — changes based on auth state */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {user ? (
              /* Logged-in: Buy/Sell action buttons */
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] transition-all duration-300"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Buy
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-[0_0_30px_rgba(236,72,153,0.45)] transition-all duration-300"
                  >
                    <Tag className="w-4 h-4" />
                    Sell
                  </Link>
                </div>
                <p className="text-sm text-slate-500">
                  Welcome back! Explore the AI marketplace below ↓
                </p>
              </div>
            ) : (
              /* Logged-out: Join CTA */
              <>
                <div className="mb-4">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate hover:shadow-[0_0_30px_rgba(168,85,247,0.45)] transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    Join Marketplace
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                  Join Whichai for the best AI Marketplace in the world
                </p>
                <p className="text-sm md:text-base bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold bg-gradient-animate">
                  AI Marketplace: From Prompt to Power, All in One Place.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
        </main>
      </div>{/* end flex layout */}

      {/* Mobile news feed — shown below center content on small screens */}
      <section className="lg:hidden px-4 pb-6">
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

      {/* Latest Listings — shown to logged-in users */}
      {user && <LatestListings deals={marketplaceDeals} />}

      <VisitorCounter />
    </div>
  );
}
