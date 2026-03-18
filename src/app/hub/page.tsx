"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Brain, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    label: "Marketplace",
    tagline: "The Hub",
    description:
      "Buy and sell AI prompts, agents, fine-tuned models, GPU compute, and hardware — all in one place.",
    accent: "#8b5cf6",
    accentLight: "#f5f3ff",
    accentMid: "#ede9fe",
    iconBg: "bg-violet-100 text-violet-600",
    border: "border-violet-200 hover:border-violet-400",
    pill: "bg-violet-100 text-violet-600",
    cta: "Enter Marketplace",
    ctaStyle: "bg-violet-600 hover:bg-violet-700 text-white",
    tags: ["Digital Assets", "Compute Hub", "Hardware Corner"],
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    icon: Brain,
    label: "Know Your AI",
    tagline: "Discover & Compare",
    description:
      "Explore, benchmark, and compare AI models across categories. Find the perfect model for your use case.",
    accent: "#06b6d4",
    accentLight: "#ecfeff",
    accentMid: "#cffafe",
    iconBg: "bg-cyan-100 text-cyan-600",
    border: "border-cyan-200 hover:border-cyan-400",
    pill: "bg-cyan-100 text-cyan-600",
    cta: "Explore AI",
    ctaStyle: "bg-cyan-600 hover:bg-cyan-700 text-white",
    tags: ["Model Explorer", "Benchmarks", "Side-by-Side"],
  },
  {
    id: "learning-hub",
    href: "/learning-hub",
    icon: BookOpen,
    label: "Learning Hub",
    tagline: "Grow Your Skills",
    description:
      "Courses, guides, and hands-on labs to master prompt engineering, AI development, and ML fundamentals.",
    accent: "#10b981",
    accentLight: "#ecfdf5",
    accentMid: "#d1fae5",
    iconBg: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-200 hover:border-emerald-400",
    pill: "bg-emerald-100 text-emerald-600",
    cta: "Start Learning",
    ctaStyle: "bg-emerald-600 hover:bg-emerald-700 text-white",
    tags: ["Prompt Engineering", "AI Courses", "Labs"],
  },
];

export default function HubPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <Navbar />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Welcome to WhichAi.cloud
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Where do you want to go?
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Your AI journey starts here. Pick a destination below.
          </p>
        </motion.div>

        {/* 3 Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
              >
                <Link href={hub.href} className="block h-full group">
                  <div
                    className={`
                      relative h-full flex flex-col rounded-3xl border-2 p-8
                      bg-white transition-all duration-300 cursor-pointer
                      shadow-sm group-hover:shadow-xl
                      ${hub.border}
                    `}
                    style={{
                      background: `linear-gradient(145deg, white 60%, ${hub.accentLight})`,
                    }}
                  >
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${hub.iconBg}`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Title */}
                    <div className="mb-1">
                      <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${hub.pill}`}>
                        {hub.tagline}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mt-3 mb-3">
                      {hub.label}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-6">
                      {hub.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {hub.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-slate-500 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div
                      className={`
                        flex items-center justify-center gap-2 w-full
                        py-3.5 rounded-2xl text-sm font-bold
                        transition-all duration-200
                        ${hub.ctaStyle}
                      `}
                    >
                      {hub.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-slate-400 text-sm mt-12"
        >
          You can always switch between sections from the navbar.
        </motion.p>
      </main>
    </div>
  );
}
