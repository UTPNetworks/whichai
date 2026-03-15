"use client";

import { motion } from "framer-motion";
import { ExternalLink, Newspaper } from "lucide-react";
import type { AINewsArticle } from "@/lib/data";
import { timeAgo } from "@/lib/data";

export default function NewsCard({
  article,
  index = 0,
}: {
  article: AINewsArticle;
  index?: number;
}) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group block bg-white rounded-xl p-4 border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all duration-300"
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <Newspaper className="w-4 h-4 text-purple-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
            <span className="font-medium text-slate-500">{article.source}</span>
            <span>•</span>
            <span>{timeAgo(article.published_at)}</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
