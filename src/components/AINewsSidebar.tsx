'use client';

import { useState, useEffect, useCallback } from 'react';

interface NewsItem {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  created_at: string;
  author: string;
  num_comments: number;
  _tags: string[];
}

interface NewsResponse {
  articles: NewsItem[];
  cached: boolean;
  lastFetched: string;
}

const CATEGORIES = ['All', 'LLMs', 'Research', 'Products', 'Safety', 'Startups'];

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function filterByCategory(articles: NewsItem[], category: string): NewsItem[] {
  if (category === 'All') return articles;
  const keywordMap: Record<string, string[]> = {
    'LLMs': ['gpt', 'llm', 'language model', 'claude', 'gemini', 'mistral', 'llama', 'chatgpt', 'openai'],
    'Research': ['research', 'paper', 'arxiv', 'study', 'dataset', 'benchmark', 'training'],
    'Products': ['launch', 'release', 'product', 'app', 'api', 'tool', 'platform', 'service'],
    'Safety': ['safety', 'alignment', 'risk', 'regulation', 'ethics', 'bias', 'harm', 'policy'],
    'Startups': ['startup', 'funding', 'raise', 'series', 'venture', 'acquired', 'million', 'billion'],
  };
  const keywords = keywordMap[category] || [];
  return articles.filter(article => {
    const text = article.title.toLowerCase();
    return keywords.some(kw => text.includes(kw));
  });
}

export default function AINewsSidebar() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <h2 className="font-semibold text-gray-900 text-sm">NeuralPulse</h2>
            <span className="text-xs text-gray-400">AI News</span>
          </div>
          <button
            onClick={fetchNews}
            className="text-xs text-violet-500 hover:text-violet-700 transition-colors"
            title="Refresh"
          >
            &#8635;
          </button>
        </div>
        {lastRefresh && (
          <p className="text-xs text-gray-400 mt-1">
            Updated {timeAgo(lastRefresh.toISOString())}
          </p>
        )}
      </div>

      {/* Category Pills */}
      <div className="px-3 py-2 border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {CATEGORIES.map(cat => (
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
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
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
            <button
              onClick={fetchNews}
              className="mt-2 text-xs text-violet-500 underline"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-gray-400">No articles in this category</p>
          </div>
        )}
        {!loading && filteredArticles.map((article, idx) => (
          <a
            key={article.objectID}
            href={article.url || `https://news.ycombinator.com/item?id=${article.objectID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 hover:bg-violet-50 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-300 font-mono mt-0.5 w-4 shrink-0">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 group-hover:text-violet-700 transition-colors leading-snug line-clamp-2">
                  {article.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">&#9650; {article.points}</span>
                  <span className="text-xs text-gray-300">&#183;</span>
                  <span className="text-xs text-gray-400">{timeAgo(article.created_at)}</span>
                  <span className="text-xs text-gray-300">&#183;</span>
                  <span className="text-xs text-gray-400">{article.num_comments} comments</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">
          Powered by HackerNews &#183; Auto-refreshes every 30min
        </p>
      </div>
    </div>
  );
}
