"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const BENCHMARKS = [
  { category: "Coding", tests: [
    { name: "HumanEval", models: [{ model: "Claude Opus 4", score: 94.2 }, { model: "GPT-4o", score: 91.0 }, { model: "Gemini 2.5 Pro", score: 89.5 }, { model: "DeepSeek V3", score: 88.1 }, { model: "Llama 3.1 405B", score: 80.3 }] },
    { name: "SWE-bench", models: [{ model: "Claude Opus 4", score: 72.5 }, { model: "GPT-4o", score: 69.1 }, { model: "DeepSeek R1", score: 65.3 }, { model: "Gemini 2.5 Pro", score: 63.8 }, { model: "Grok 3", score: 55.2 }] },
  ]},
  { category: "Reasoning", tests: [
    { name: "GPQA Diamond", models: [{ model: "Claude Opus 4", score: 74.9 }, { model: "GPT-4o", score: 72.1 }, { model: "DeepSeek R1", score: 71.5 }, { model: "Gemini 2.5 Pro", score: 70.2 }, { model: "Grok 3", score: 65.8 }] },
    { name: "MATH (Lvl 5)", models: [{ model: "DeepSeek R1", score: 96.3 }, { model: "Claude Opus 4", score: 93.8 }, { model: "Gemini 2.5 Pro", score: 91.2 }, { model: "GPT-4o", score: 88.7 }, { model: "Llama 3.1 405B", score: 73.5 }] },
  ]},
  { category: "General Knowledge", tests: [
    { name: "MMLU", models: [{ model: "GPT-4o", score: 88.7 }, { model: "Claude Opus 4", score: 88.3 }, { model: "Gemini 2.5 Pro", score: 87.9 }, { model: "Llama 3.1 405B", score: 85.2 }, { model: "Mistral Large", score: 81.4 }] },
    { name: "MMLU-Pro", models: [{ model: "Claude Opus 4", score: 78.4 }, { model: "GPT-4o", score: 76.2 }, { model: "Gemini 2.5 Pro", score: 75.8 }, { model: "DeepSeek V3", score: 71.3 }, { model: "Grok 3", score: 68.9 }] },
  ]},
  { category: "Creative Writing", tests: [
    { name: "EQ-Bench", models: [{ model: "Claude Opus 4", score: 87.1 }, { model: "GPT-4o", score: 84.5 }, { model: "Gemini 2.5 Pro", score: 82.3 }, { model: "Llama 3.1 405B", score: 78.9 }, { model: "Mistral Large", score: 76.2 }] },
  ]},
];

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];

export default function BenchmarksPage() {
  const [selectedCat, setSelectedCat] = useState("All");
  const categories = ["All", ...BENCHMARKS.map(b => b.category)];
  const visible = selectedCat === "All" ? BENCHMARKS : BENCHMARKS.filter(b => b.category === selectedCat);

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40"><Navbar /></div>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/know-your-ai" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Know Your AI
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><BarChart3 className="w-6 h-6 text-blue-600" /></div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Benchmarks</h1>
          </div>
          <p className="text-slate-500 mb-8">Real performance data across coding, reasoning, creativity, and more.</p>
        </motion.div>

        <div className="flex gap-2 flex-wrap mb-10">
          {categories.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)} className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${selectedCat === c ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-gray-200 hover:border-blue-300"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-10">
          {visible.map((bench, bi) => (
            <motion.div key={bench.category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: bi * 0.1 }}>
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> {bench.category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {bench.tests.map((test) => (
                  <div key={test.name} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm">{test.name}</h3>
                    <div className="space-y-3">
                      {test.models.map((m, mi) => {
                        const maxScore = test.models[0].score;
                        const pct = (m.score / maxScore) * 100;
                        return (
                          <div key={m.model} className="flex items-center gap-3">
                            <div className="w-5 text-center">
                              {mi < 3 ? <Trophy className={`w-4 h-4 ${MEDAL_COLORS[mi]}`} /> : <span className="text-xs text-slate-300">{mi + 1}</span>}
                            </div>
                            <span className="text-xs font-semibold text-slate-700 w-32 shrink-0 truncate">{m.model}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.3 + mi * 0.08, duration: 0.6 }}
                                className={`h-full rounded-full ${mi === 0 ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-slate-300"}`}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600 w-12 text-right">{m.score}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
