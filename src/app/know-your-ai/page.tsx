"use client";

import { motion } from "framer-motion";
import { Brain, ArrowLeft, Zap, Search, BarChart3, Layers } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: Search,
    title: "Model Explorer",
    desc: "Search and browse hundreds of AI models by category, capability, and price.",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Benchmarks",
    desc: "Real performance data across coding, reasoning, creativity, and more.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Layers,
    title: "Side-by-Side Compare",
    desc: "Compare any two models head-to-head on the metrics that matter to you.",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Zap,
    title: "Use-Case Matcher",
    desc: "Tell us what you need to do — we'll recommend the best AI for the job.",
    color: "bg-violet-100 text-violet-600",
  },
];

export default function KnowYourAIPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <Navbar />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center">
              <Brain className="w-7 h-7 text-cyan-600" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 bg-cyan-100 px-3 py-1 rounded-full">
                Discover & Compare
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Know Your AI
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            Explore, benchmark, and compare AI models so you always pick the right tool for
            the job. No more guessing — make data-driven decisions.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex gap-4 p-6 rounded-2xl border border-gray-200 bg-white hover:border-cyan-300 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Coming soon banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border-2 border-dashed border-cyan-200 bg-cyan-50 p-10 text-center"
        >
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Coming Soon</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            The full AI explorer and comparison engine is in development. Check back soon!
          </p>
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
