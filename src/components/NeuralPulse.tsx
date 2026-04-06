"use client";

import React, { useEffect, useState } from "react";
import { Zap, TrendingUp, Loader2 } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "LLMs":        "text-purple-500",
  "Startups":    "text-emerald-500",
  "Products":    "text-blue-500",
  "Research":    "text-amber-500",
  "General AI":  "text-slate-500",
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

  async function fetchNews() {
    try {
      const res = await fetch("/api/ai-news", { cache: "no-store" });
      const data = await res.json();
      const articles = Array.isArray(data) ? data : (data.articles || []);
      setNews(articles);
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

  // Triple the items to ensure seamless loop
  const tickerItems = news.length > 0 ? [...news, ...news, ...news] : [];

  return (
    <div
      className="w-[90%] mx-auto relative flex items-center overflow-hidden whitespace-nowrap bg-[#f8f9fc] border border-black/[0.04] rounded-full px-5 py-1.5 flex-[1_1_auto] h-[44px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Title / Fixed Section */}
      <div className="flex items-center gap-2 mr-6 shrink-0 z-20 bg-[#f8f9fc] pr-4 border-r border-slate-200">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-300/40">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[11px] font-black text-slate-800 tracking-tight uppercase whitespace-nowrap">Global Ai Pulse</span>
        <div className="flex items-center gap-1.5 ml-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
        </div>
      </div>

      {/* Marquee Track */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        {loading ? (
          <div className="flex items-center gap-2 pl-4">
            <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
            <span className="text-[11px] text-slate-400 font-medium tracking-tight">Syncing stream...</span>
          </div>
        ) : tickerItems.length === 0 ? (
          <div className="text-[11px] text-slate-400 font-medium pl-4 tracking-tight">Waiting for next transmission...</div>
        ) : (
          <div
            className="flex items-center gap-[50px] transition-transform"
            style={{
              display: 'inline-flex',
              animation: `marquee ${Math.max(news.length * 8, 60)}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {tickerItems.map((item, idx) => (
              <a 
                key={`${item.id}-${idx}`} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2.5 shrink-0 group hover:cursor-pointer"
              >
                <span className={`text-[11px] font-bold tracking-[0.5px] uppercase ${CATEGORY_COLORS[item.category] || 'text-purple-500'}`}>
                  [{item.category}]
                </span>
                <span className="text-[14px] font-medium text-slate-600 group-hover:text-purple-600 transition-colors duration-200">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {item.points}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Fade Gradients */}
      <div className="absolute left-[180px] top-0 bottom-0 w-12 bg-gradient-to-r from-[#f8f9fc] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#f8f9fc] to-transparent z-10 pointer-events-none" />

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
