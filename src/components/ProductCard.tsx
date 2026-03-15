"use client";

import { motion } from "framer-motion";
import { Bot, Image, Code, Layers, Check, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AIProduct } from "@/lib/data";
import { formatPrice, formatContextWindow } from "@/lib/data";

const categoryIcons: Record<string, typeof Bot> = {
  chatbot: Bot,
  image: Image,
  code: Code,
  multimodal: Layers,
};

const categoryColors: Record<string, string> = {
  chatbot: "from-cyan-500/20 to-blue-500/20",
  image: "from-pink-500/20 to-rose-500/20",
  code: "from-green-500/20 to-emerald-500/20",
  multimodal: "from-purple-500/20 to-violet-500/20",
};

export default function ProductCard({
  product,
  index = 0,
}: {
  product: AIProduct;
  index?: number;
}) {
  const Icon = categoryIcons[product.category] || Bot;
  const colorClass = categoryColors[product.category] || "from-cyan-500/20 to-blue-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 group flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}
          >
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-slate-400">{product.provider}</p>
          </div>
        </div>
        {product.free_tier && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            Free tier
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2 flex-1">
        {product.description}
      </p>

      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
        <span className="font-medium text-slate-900">
          {formatPrice(product.base_price_monthly)}
        </span>
        {product.context_window && (
          <>
            <span>•</span>
            <span>{formatContextWindow(product.context_window)}</span>
          </>
        )}
        {product.student_discount_pct > 0 && (
          <>
            <span>•</span>
            <span className="text-purple-500">
              {product.student_discount_pct}% student discount
            </span>
          </>
        )}
      </div>

      {/* Quick feature badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { key: "vision", label: "Vision" },
          { key: "image_gen", label: "Image Gen" },
          { key: "voice", label: "Voice" },
          { key: "code_interpreter", label: "Code" },
          { key: "web_browsing", label: "Web" },
          { key: "api_available", label: "API" },
        ].map(({ key, label }) => {
          const val = product.features[key];
          if (val === undefined) return null;
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md ${
                val
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              {val ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
              {label}
            </span>
          );
        })}
      </div>

      <Link
        href={`/product/${product.slug}`}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-purple-300 transition-all group/btn"
      >
        View Details
        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}
