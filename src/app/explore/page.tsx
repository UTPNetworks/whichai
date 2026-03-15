"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import NewsCard from "@/components/NewsCard";
import {
  getAllProducts,
  getAllNews,
  categories,
  type AIProduct,
  type AINewsArticle,
} from "@/lib/data";
import { supabase } from "@/lib/supabase";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [newsArticles, setNewsArticles] = useState<AINewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [prods, news] = await Promise.all([getAllProducts(), getAllNews()]);
      setProducts(prods);
      setNewsArticles(news);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (query) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.provider.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    return result;
  }, [query, activeCategory, products]);

  const sortedNews = useMemo(
    () =>
      [...newsArticles].sort(
        (a, b) =>
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      ),
    [newsArticles]
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Subtle background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-100/40 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10 px-6 md:px-12 pb-20 max-w-[1400px] mx-auto pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left — 75% */}
            <div className="flex-1 lg:w-3/4">
              {/* Search bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search AI tools... (e.g. ChatGPT, Gemini, Claude)"
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-gray-200 text-slate-900 placeholder-slate-400 text-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
                  />
                </div>
              </motion.div>

              {/* Category filters */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeCategory === cat.value
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "text-slate-500 bg-white border border-gray-200 hover:text-slate-700 hover:border-gray-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </motion.div>

              {/* Section header */}
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  {query
                    ? `${filteredProducts.length} result${filteredProducts.length !== 1 ? "s" : ""}`
                    : "Featured AI Tools"}
                </h2>
              </div>

              {/* Products grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <p className="text-lg">No AI tools found matching &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Right — 25% News sidebar */}
            <aside className="lg:w-1/4 lg:min-w-[280px]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    AI News Corner
                  </h2>
                </div>

                <div className="flex flex-col gap-3 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-1">
                  {sortedNews.map((article, i) => (
                    <NewsCard key={article.id} article={article} index={i} />
                  ))}
                </div>
              </motion.div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
