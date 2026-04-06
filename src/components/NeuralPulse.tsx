"use client";

import React, { useEffect, useState } from "react";
import { Zap, TrendingUp, Loader2 } from "lucide-react";

const FIXED_TABS = ["All", "LLMs", "Startups", "Products", "Research"];

const CATEGORY_COLORS: Record<string, string> = {
  "LLMs":        "bg-violet-100 text-violet-700",
  "Startups":    "bg-emerald-100 text-emerald-700",
  "Products":    "bg-blue-100 text-blue-700",
  "Research":    "bg-amber-100 text-amber-700",
  "General AI":  "bg-slate-100 text-slate-500",
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

export default function NeuralPulse() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  async function fetchNews() {
    try {
      const res = await fetch("/api/ai-news", { cache: "no-store" });
      const data = await res.json();
      setNews(Array.isArray(data) ? data : (data.articles || []));
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("News fetch failed", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), 1800000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = activeTab === "All" ? news : news.filter((item) => item.category === activeTab);
  const tickerItems = filteredNews.length > 0 ? [...filteredNews, ...filteredNews, ...filteredNews] : [];

  return (
    <div
      className="flex-1 max-w-xl mx-4 relative border border-indigo-200/60 rounded-xl bg-gradient-to-r from-indigo-50 via-white to-violet-50 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-indigo-100/50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Zap className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[10px] font-black text-slate-800 tracking-tight">NeuralPulse</span>
          <div className="flex items-center gap-1 ml-1">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500" />
            </span>
            <span className="text-[8px] text-slate-400 hidden lg:inline">Live · {lastUpdated || "..."}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {FIXED_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? "text-violet-700 bg-violet-100 border-violet-300 shadow-sm"
                  : "text-slate-400 border-slate-200 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-7 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-indigo-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-violet-50 to-transparent z-10 pointer-events-none" />
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-3 h-3 text-violet-500 animate-spin" />
          </div>
        ) : tickerItems.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[9px] text-slate-400">No stories</div>
        ) : (
          <div
            className="flex items-center h-full gap-6 whitespace-nowrap"
            style={{
              animation: `marquee ${Math.max(filteredNews.length * 5, 30)}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {tickerItems.map((item, idx) => (
              <a key={`${item.id}-${idx}`} href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 shrink-0 group">
                <span className={`text-[7px] font-bold px-1 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["General AI"]}`}>{item.category}</span>
                <span className="text-[10px] font-semibold text-slate-700 group-hover:text-violet-600 transition-colors max-w-[200px] truncate">{item.title}</span>
                <span className="text-[8px] text-slate-400 flex items-center gap-0.5"><TrendingUp className="w-2 h-2" />{item.points}</span>
                <span className="text-slate-200">│</span>
              </a>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
