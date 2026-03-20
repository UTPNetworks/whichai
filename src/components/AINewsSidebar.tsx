'use client';

import { useState, useEffect, useCallback } from 'react';

type Category = 'All' | 'LLMs' | 'Research' | 'Products' | 'Safety' | 'Startups';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  image_url: string | null;
  published_at: string | null;
  category: Category;
}

interface NewsResponse {
  articles: NewsItem[];
  cached: boolean;
  lastFetched: string;
}

const CATEGORIES: Category[] = ['All', 'LLMs', 'Research', 'Products', 'Safety', 'Startups'];
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return '';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function filterByCategory(articles: NewsItem[], category: Category): NewsItem[] {
  if (category === 'All') return articles;
  return articles.filter((article) => article.category === category);
}

export default function AINewsSidebar() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai-news');
      if (!response.ok) throw new Error('Failed to fetch news');
      const data: NewsResponse = await response.json();

      setArticles(data.articles);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load news. Retrying...');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filteredArticles = filterByCategory(articles, activeCategory);

  return (
    <div
      className={`fixed left-4 bottom-4 z-50 max-w-sm shadow-2xl rounded-xl border border-gray-200 bg-white transition-all ${
        expanded ? 'w-80 sm:w-96' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 text-sm truncate">NeuralPulse</h2>
                {expanded && <span className="text-xs text-gray-400 whitespace-nowrap">AI News</span>}
              </div>
              {expanded && lastRefresh && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">Updated {timeAgo(lastRefresh.toISOString())}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-xs text-violet-500 hover:bg-violet-100 transition"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '⤢' : '⤡'}
            </button>
            {expanded && (
              <button
                onClick={fetchNews}
                className="w-7 h-7 flex items-center justify-center rounded-full text-xs text-violet-500 hover:bg-violet-100 transition"
                title="Refresh"
              >
                ⟳
              </button>
            )}
          </div>
        </div>
      </div>

      {!expanded ? (
        <div className="p-3 text-center">
          <p className="text-[10px] text-gray-400 leading-tight">Tap to expand</p>
        </div>
      ) : (
        <>
          {/* Category Pills */}
          <div className="px-3 py-2 border-b border-gray-100 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-50">
            {loading && (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-full mb-1.5" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/3 mt-1" />
                  </div>
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="p-4 text-center">
                <p className="text-xs text-red-500">{error}</p>
                <button onClick={fetchNews} className="mt-2 text-xs text-violet-500 underline">
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && filteredArticles.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400">No articles in this category</p>
              </div>
            )}

            {!loading &&
              filteredArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 hover:bg-violet-50 transition-colors group"
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {article.image_url ? (
                        <img src={article.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-xs text-gray-400">{article.source.slice(0, 3)}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 group-hover:text-violet-700 transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] text-gray-500">{article.source}</span>
                        <span className="text-[11px] text-gray-300">·</span>
                        <span className="text-[11px] text-gray-500">{timeAgo(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[11px] text-gray-400 text-center leading-tight">
              RSS + Supabase · refresh runs daily at 8pm CST/CDT
            </p>
          </div>
        </>
      )}
    </div>
  );
}
