"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Layers, ChevronDown, Star, Zap, DollarSign, Brain, Code, Eye, MessageSquare } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", scores: { coding: 91, reasoning: 88, creative: 85, speed: 82, vision: 90, price: 70 } },
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", scores: { coding: 94, reasoning: 92, creative: 90, speed: 75, vision: 88, price: 55 } },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", scores: { coding: 88, reasoning: 85, creative: 86, speed: 90, vision: 85, price: 75 } },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", scores: { coding: 89, reasoning: 87, creative: 82, speed: 85, vision: 92, price: 72 } },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", scores: { coding: 88, reasoning: 90, creative: 72, speed: 78, vision: 60, price: 92 } },
  { id: "llama-3.1-405b", name: "Llama 3.1 405B", provider: "Meta", scores: { coding: 80, reasoning: 78, creative: 75, speed: 68, vision: 55, price: 95 } },
  { id: "grok-3", name: "Grok 3", provider: "xAI", scores: { coding: 82, reasoning: 80, creative: 78, speed: 85, vision: 70, price: 68 } },
  { id: "mistral-large", name: "Mistral", scores: { coding: 83, reasoning: 81, creative: 76, speed: 88, vision: 65, price: 78 }, provider: "Mistral" },
];

const METRICS = [
  { key: "coding", label: "Coding", icon: Code },
  { key: "reasoning", label: "Reasoning", icon: Brain },
  { key: "creative", label: "Creative Writing", icon: MessageSquare },
  { key: "speed", label: "Speed", icon: Zap },
  { key: "vision", label: "Vision", icon: Eye },
  { key: "price", label: "Value for Money", icon: DollarSign },
] as const;

function ScoreBar({ score, color, delay }: { score: number; color: string; delay: number }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ delay, duration: 0.6 }} className={`h-full rounded-full ${color}`} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-8">{score}</span>
    </div>
  );
}

export default function ComparePage() {
  const [modelA, setModelA] = useState(MODELS[0]);
  const [modelB, setModelB] = useState(MODELS[1]);

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40"><Navbar /></div>
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/know-your-ai" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Know Your AI
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center"><Layers className="w-6 h-6 text-indigo-600" /></div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Side-by-Side Compare</h1>
          </div>
          <p className="text-slate-500 mb-10">Pick any two models and compare them head-to-head.</p>
        </motion.div>

        {/* Model selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[{ selected: modelA, setter: setModelA, color: "cyan" }, { selected: modelB, setter: setModelB, color: "violet" }].map(({ selected, setter, color }, idx) => (
            <div key={idx} className={`bg-white rounded-2xl border-2 p-6 ${color === "cyan" ? "border-cyan-200" : "border-violet-200"}`}>
              <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${color === "cyan" ? "text-cyan-600" : "text-violet-600"}`}>
                Model {idx === 0 ? "A" : "B"}
              </label>
              <div className="relative">
                <select
                  value={selected.id}
                  onChange={e => setter(MODELS.find(m => m.id === e.target.value) || MODELS[0])}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.provider}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_auto_1fr] gap-0 items-center px-6 py-4 border-b border-gray-100 bg-slate-50">
            <span className="text-sm font-bold text-cyan-600">{modelA.name}</span>
            <span />
            <span className="text-xs font-bold text-slate-400 px-3">METRIC</span>
            <span className="text-sm font-bold text-violet-600 text-right">{modelB.name}</span>
          </div>
          {METRICS.map((metric, i) => {
            const scoreA = modelA.scores[metric.key];
            const scoreB = modelB.scores[metric.key];
            const Icon = metric.icon;
            const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "tie";
            return (
              <div key={metric.key} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center px-6 py-5 border-b border-gray-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                <ScoreBar score={scoreA} color={winner === "A" ? "bg-gradient-to-r from-cyan-400 to-cyan-500" : "bg-slate-300"} delay={0.1 + i * 0.05} />
                <div className="flex flex-col items-center gap-1 w-28">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">{metric.label}</span>
                </div>
                <ScoreBar score={scoreB} color={winner === "B" ? "bg-gradient-to-r from-violet-400 to-violet-500" : "bg-slate-300"} delay={0.1 + i * 0.05} />
              </div>
            );
          })}

          {/* Summary */}
          <div className="px-6 py-5 bg-slate-50 border-t border-gray-100">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="text-center">
                <div className="text-2xl font-black text-cyan-600">{Object.values(modelA.scores).reduce((a, b) => a + b, 0)}</div>
                <div className="text-xs text-slate-400">Total Score</div>
              </div>
              <div className="text-xs font-bold text-slate-400">VS</div>
              <div className="text-center">
                <div className="text-2xl font-black text-violet-600">{Object.values(modelB.scores).reduce((a, b) => a + b, 0)}</div>
                <div className="text-xs text-slate-400">Total Score</div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
