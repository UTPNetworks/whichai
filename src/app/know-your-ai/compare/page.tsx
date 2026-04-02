"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Layers, ChevronDown, Star, Zap, DollarSign, Brain,
  Code, Eye, MessageSquare, X, Plus, GitCompare, Check, Tag,
  Users, Building2, Image,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

// ── Model Database ────────────────────────────────────────────────────
const ALL_MODELS = [
  {
    id: "gpt-4o", name: "GPT-4o", provider: "OpenAI",
    scores: { coding: 91, reasoning: 88, creative: 85, speed: 82, vision: 90, value: 70 },
    pricing: "$$", rating: 4.8, contextWindow: "128K",
    imageGen: false,
    bestFor: ["Complex reasoning", "Code generation", "Vision tasks"],
    individualPlan: { name: "ChatGPT Plus", price: "$20/mo" },
    businessPlan: { name: "Team", price: "$25/user/mo" },
    apiPricing: "$2.50 / $10.00 per 1M tokens",
    discount: "20% off annual billing",
    badge: "Popular",
  },
  {
    id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI",
    scores: { coding: 78, reasoning: 74, creative: 72, speed: 95, vision: 72, value: 95 },
    pricing: "$", rating: 4.5, contextWindow: "128K",
    imageGen: false,
    bestFor: ["High-volume tasks", "Cost-sensitive apps"],
    individualPlan: { name: "Free", price: "$0/mo" },
    businessPlan: { name: "API only", price: "Pay-per-use" },
    apiPricing: "$0.15 / $0.60 per 1M tokens",
    discount: null,
    badge: null,
  },
  {
    id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic",
    scores: { coding: 94, reasoning: 92, creative: 90, speed: 72, vision: 88, value: 55 },
    pricing: "$$$", rating: 4.9, contextWindow: "200K",
    imageGen: false,
    bestFor: ["Complex research", "Long documents", "Advanced coding"],
    individualPlan: { name: "Claude Pro", price: "$20/mo" },
    businessPlan: { name: "Team", price: "$25/user/mo" },
    apiPricing: "$15.00 / $75.00 per 1M tokens",
    discount: "20% off annual billing",
    badge: "Top Rated",
  },
  {
    id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic",
    scores: { coding: 88, reasoning: 85, creative: 86, speed: 90, vision: 85, value: 78 },
    pricing: "$$", rating: 4.7, contextWindow: "200K",
    imageGen: false,
    bestFor: ["Everyday tasks", "Coding", "Content creation"],
    individualPlan: { name: "Claude Pro", price: "$20/mo" },
    businessPlan: { name: "Team", price: "$25/user/mo" },
    apiPricing: "$3.00 / $15.00 per 1M tokens",
    discount: "20% off annual billing",
    badge: "Popular",
  },
  {
    id: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google",
    scores: { coding: 89, reasoning: 87, creative: 82, speed: 85, vision: 92, value: 72 },
    pricing: "$$", rating: 4.7, contextWindow: "1M",
    imageGen: false,
    bestFor: ["Massive documents", "Video understanding", "Google Workspace"],
    individualPlan: { name: "Gemini Advanced", price: "$19.99/mo" },
    businessPlan: { name: "Workspace Business", price: "Custom" },
    apiPricing: "$1.25 / $5.00 per 1M tokens",
    discount: "Google One bundling available",
    badge: "New",
  },
  {
    id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek",
    scores: { coding: 88, reasoning: 90, creative: 72, speed: 76, vision: 55, value: 93 },
    pricing: "$", rating: 4.6, contextWindow: "128K",
    imageGen: false,
    bestFor: ["Complex math", "Scientific reasoning", "Chain-of-thought"],
    individualPlan: { name: "Free", price: "$0/mo" },
    businessPlan: { name: "API only", price: "Pay-per-use" },
    apiPricing: "$0.55 / $2.19 per 1M tokens",
    discount: "50% off during off-peak hours",
    badge: "New",
  },
  {
    id: "llama-3-1-405b", name: "Llama 3.1 405B", provider: "Meta",
    scores: { coding: 80, reasoning: 78, creative: 75, speed: 65, vision: 52, value: 98 },
    pricing: "Free", rating: 4.6, contextWindow: "128K",
    imageGen: false,
    bestFor: ["Self-hosting", "Fine-tuning", "Privacy-first"],
    individualPlan: { name: "Self-hosted", price: "Free" },
    businessPlan: { name: "Self-hosted", price: "Free" },
    apiPricing: "Free (self-hosted) / ~$0.50/1M (cloud)",
    discount: "100% free open source",
    badge: "Open Source",
  },
  {
    id: "grok-3", name: "Grok 3", provider: "xAI",
    scores: { coding: 82, reasoning: 80, creative: 78, speed: 85, vision: 70, value: 65 },
    pricing: "$$", rating: 4.4, contextWindow: "128K",
    imageGen: true,
    bestFor: ["Real-time news", "Social media analysis", "X integration"],
    individualPlan: { name: "X Premium+", price: "$16/mo" },
    businessPlan: { name: "Enterprise", price: "Custom" },
    apiPricing: "$3.00 / $15.00 per 1M tokens",
    discount: "Annual X Premium saves ~15%",
    badge: "New",
  },
  {
    id: "dall-e-3", name: "DALL-E 3", provider: "OpenAI",
    scores: { coding: 0, reasoning: 55, creative: 92, speed: 65, vision: 85, value: 65 },
    pricing: "$$", rating: 4.6, contextWindow: "N/A",
    imageGen: true,
    bestFor: ["Marketing visuals", "Concept art", "Illustrations"],
    individualPlan: { name: "ChatGPT Plus", price: "$20/mo" },
    businessPlan: { name: "ChatGPT Team", price: "$25/user/mo" },
    apiPricing: "$0.040/image (standard) · $0.080/image (HD)",
    discount: null,
    badge: "Popular",
  },
  {
    id: "midjourney-v6", name: "Midjourney v6", provider: "Midjourney",
    scores: { coding: 0, reasoning: 50, creative: 97, speed: 60, vision: 90, value: 70 },
    pricing: "$$", rating: 4.8, contextWindow: "N/A",
    imageGen: true,
    bestFor: ["Artistic imagery", "Concept art", "Fashion", "Architecture"],
    individualPlan: { name: "Standard", price: "$30/mo" },
    businessPlan: { name: "Enterprise", price: "$120+/user/yr" },
    apiPricing: "No public API — subscription only",
    discount: "Annual billing: 20% discount",
    badge: "Top Rated",
  },
  {
    id: "mistral-large", name: "Mistral Large", provider: "Mistral",
    scores: { coding: 83, reasoning: 81, creative: 76, speed: 88, vision: 60, value: 78 },
    pricing: "$$", rating: 4.5, contextWindow: "128K",
    imageGen: false,
    bestFor: ["EU data compliance", "Multilingual", "Coding"],
    individualPlan: { name: "Le Chat Pro", price: "$14.99/mo" },
    businessPlan: { name: "Enterprise", price: "Custom" },
    apiPricing: "$2.00 / $6.00 per 1M tokens",
    discount: null,
    badge: null,
  },
  {
    id: "perplexity", name: "Perplexity", provider: "Perplexity AI",
    scores: { coding: 65, reasoning: 80, creative: 70, speed: 90, vision: 72, value: 88 },
    pricing: "$", rating: 4.5, contextWindow: "128K",
    imageGen: false,
    bestFor: ["Research with citations", "Current events", "Fact-checking"],
    individualPlan: { name: "Pro", price: "$20/mo" },
    businessPlan: { name: "Enterprise Pro", price: "$40/user/mo" },
    apiPricing: "$1.00 / $1.00 per 1M tokens (Sonar)",
    discount: "Annual Pro saves ~17%",
    badge: "Popular",
  },
];

const METRICS = [
  { key: "coding" as const, label: "Coding", icon: Code },
  { key: "reasoning" as const, label: "Reasoning", icon: Brain },
  { key: "creative" as const, label: "Creative Writing", icon: MessageSquare },
  { key: "speed" as const, label: "Speed", icon: Zap },
  { key: "vision" as const, label: "Vision", icon: Eye },
  { key: "value" as const, label: "Value for Money", icon: DollarSign },
];

const COLORS = [
  { bar: "from-cyan-400 to-cyan-500", text: "text-cyan-600", border: "border-cyan-200", bg: "bg-cyan-50", label: "Model A" },
  { bar: "from-violet-400 to-violet-500", text: "text-violet-600", border: "border-violet-200", bg: "bg-violet-50", label: "Model B" },
  { bar: "from-amber-400 to-amber-500", text: "text-amber-600", border: "border-amber-200", bg: "bg-amber-50", label: "Model C" },
  { bar: "from-rose-400 to-rose-500", text: "text-rose-600", border: "border-rose-200", bg: "bg-rose-50", label: "Model D" },
];

const BADGE_COLORS: Record<string, string> = {
  "Popular": "bg-violet-100 text-violet-700",
  "Top Rated": "bg-amber-100 text-amber-700",
  "New": "bg-cyan-100 text-cyan-700",
  "Open Source": "bg-emerald-100 text-emerald-700",
};

type ModelData = typeof ALL_MODELS[0];

function ScoreBar({ score, color, delay, winner }: { score: number; color: string; delay: number; winner: boolean }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${winner ? color : "from-slate-200 to-slate-300"}`}
        />
      </div>
      <span className={`text-xs font-bold w-7 ${winner ? "text-slate-800" : "text-slate-400"}`}>{score}</span>
    </div>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const preSelected = searchParams.get("models")?.split(",").filter(Boolean) || [];

  const defaultModels = preSelected.length >= 2
    ? preSelected.slice(0, 4).map(id => ALL_MODELS.find(m => m.id === id)).filter(Boolean) as ModelData[]
    : [ALL_MODELS[0], ALL_MODELS[2]];

  const [selectedModels, setSelectedModels] = useState<ModelData[]>(defaultModels);

  const addModel = (id: string) => {
    if (selectedModels.length >= 4) return;
    const m = ALL_MODELS.find(m => m.id === id);
    if (m && !selectedModels.find(s => s.id === id)) {
      setSelectedModels(prev => [...prev, m]);
    }
  };

  const removeModel = (id: string) => {
    if (selectedModels.length <= 2) return;
    setSelectedModels(prev => prev.filter(m => m.id !== id));
  };

  const replaceModel = (index: number, id: string) => {
    const m = ALL_MODELS.find(m => m.id === id);
    if (!m) return;
    setSelectedModels(prev => prev.map((sm, i) => i === index ? m : sm));
  };

  const totalScores = selectedModels.map(m => Object.values(m.scores).reduce((a, b) => a + b, 0));
  const winner = totalScores.indexOf(Math.max(...totalScores));

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40"><Navbar /></div>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/know-your-ai/models" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Model Explorer
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <GitCompare className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">Model Comparison</h1>
              <p className="text-slate-500 text-sm">Compare up to 4 models side-by-side across key metrics</p>
            </div>
          </div>
        </motion.div>

        {/* Model Selectors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {selectedModels.map((model, idx) => {
            const color = COLORS[idx];
            return (
              <div key={idx} className={`bg-white rounded-2xl border-2 p-4 ${color.border}`}>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${color.text}`}>
                  {color.label}
                  {idx === winner && <span className="ml-1">👑</span>}
                </label>
                <div className="relative">
                  <select
                    value={model.id}
                    onChange={e => replaceModel(idx, e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {ALL_MODELS.map(m => (
                      <option key={m.id} value={m.id} disabled={selectedModels.some(s => s.id === m.id && s.id !== model.id)}>
                        {m.name} — {m.provider}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
                {selectedModels.length > 2 && (
                  <button
                    onClick={() => removeModel(model.id)}
                    className="mt-2 text-xs text-slate-300 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
            );
          })}

          {/* Add model slot */}
          {selectedModels.length < 4 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center gap-2 min-h-[100px]">
              <select
                onChange={e => { if (e.target.value) addModel(e.target.value); e.target.value = ""; }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 outline-none focus:border-cyan-400 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>+ Add model</option>
                {ALL_MODELS.filter(m => !selectedModels.find(s => s.id === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.provider}</option>
                ))}
              </select>
              <div className="flex items-center gap-1 text-xs text-slate-300">
                <Plus className="w-3 h-3" /> Up to 4 models
              </div>
            </div>
          )}
        </div>

        {/* Scores Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6"
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-700">Performance Scores</span>
          </div>

          {METRICS.map((metric, i) => {
            const scores = selectedModels.map(m => m.scores[metric.key]);
            const maxScore = Math.max(...scores);
            const Icon = metric.icon;
            return (
              <div key={metric.key} className="px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.label}</span>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, 1fr)` }}>
                  {selectedModels.map((model, idx) => {
                    const score = model.scores[metric.key];
                    const isWinner = score === maxScore && score > 0;
                    return (
                      <div key={model.id} className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold ${COLORS[idx].text}`}>{model.name}</span>
                        <ScoreBar
                          score={score}
                          color={COLORS[idx].bar}
                          delay={0.1 + i * 0.04}
                          winner={isWinner}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Total scores */}
          <div className="px-6 py-5 bg-slate-50 border-t border-gray-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Total Score</div>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedModels.length}, 1fr)` }}>
              {selectedModels.map((model, idx) => (
                <div key={model.id} className={`text-center p-3 rounded-xl ${idx === winner ? `${COLORS[idx].bg} border ${COLORS[idx].border}` : "bg-white border border-gray-100"}`}>
                  {idx === winner && <div className="text-xs font-bold text-slate-500 mb-1">🏆 Winner</div>}
                  <div className={`text-2xl font-black ${COLORS[idx].text}`}>{totalScores[idx]}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{model.name}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Detailed Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6"
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-700">Feature & Pricing Breakdown</span>
          </div>

          {/* Header row */}
          <div className="px-6 py-3 border-b border-gray-100 grid gap-4 bg-slate-50/50" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feature</div>
            {selectedModels.map((m, idx) => (
              <div key={m.id} className={`text-xs font-bold ${COLORS[idx].text}`}>{m.name}</div>
            ))}
          </div>

          {/* Rating row */}
          <div className="px-6 py-4 border-b border-gray-50 grid gap-4 items-center hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Star className="w-3.5 h-3.5 text-amber-400" /> Rating</div>
            {selectedModels.map(m => (
              <div key={m.id} className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {m.rating}
              </div>
            ))}
          </div>

          {/* Context window */}
          <div className="px-6 py-4 border-b border-gray-50 grid gap-4 items-center hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="text-xs text-slate-500 font-medium">Context Window</div>
            {selectedModels.map(m => (
              <div key={m.id} className="text-sm font-bold text-slate-700">{m.contextWindow} tokens</div>
            ))}
          </div>

          {/* Image generation */}
          <div className="px-6 py-4 border-b border-gray-50 grid gap-4 items-center hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Image className="w-3.5 h-3.5 text-pink-400" /> Image Gen</div>
            {selectedModels.map(m => (
              <div key={m.id}>
                {m.imageGen
                  ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><Check className="w-3.5 h-3.5" /> Yes</span>
                  : <span className="text-xs text-slate-300 font-medium">—</span>
                }
              </div>
            ))}
          </div>

          {/* Individual plan */}
          <div className="px-6 py-4 border-b border-gray-50 grid gap-4 items-start hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5"><Users className="w-3.5 h-3.5 text-blue-400" /> Individual Plan</div>
            {selectedModels.map(m => (
              <div key={m.id}>
                <div className="text-xs font-bold text-slate-700">{m.individualPlan.name}</div>
                <div className="text-xs text-slate-400">{m.individualPlan.price}</div>
              </div>
            ))}
          </div>

          {/* Business plan */}
          <div className="px-6 py-4 border-b border-gray-50 grid gap-4 items-start hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5"><Building2 className="w-3.5 h-3.5 text-violet-400" /> Business Plan</div>
            {selectedModels.map(m => (
              <div key={m.id}>
                <div className="text-xs font-bold text-slate-700">{m.businessPlan.name}</div>
                <div className="text-xs text-slate-400">{m.businessPlan.price}</div>
              </div>
            ))}
          </div>

          {/* API Pricing */}
          <div className="px-6 py-4 border-b border-gray-50 grid gap-4 items-start hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5"><Code className="w-3.5 h-3.5 text-slate-400" /> API Pricing</div>
            {selectedModels.map(m => (
              <div key={m.id} className="text-xs text-slate-600 leading-relaxed">{m.apiPricing}</div>
            ))}
          </div>

          {/* Discount */}
          <div className="px-6 py-4 border-b border-gray-50 grid gap-4 items-start hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5"><Tag className="w-3.5 h-3.5 text-emerald-400" /> Discounts</div>
            {selectedModels.map(m => (
              <div key={m.id}>
                {m.discount
                  ? <span className="text-xs text-emerald-600 font-medium">{m.discount}</span>
                  : <span className="text-xs text-slate-300">None listed</span>
                }
              </div>
            ))}
          </div>

          {/* Best for */}
          <div className="px-6 py-4 grid gap-4 items-start hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `140px repeat(${selectedModels.length}, 1fr)` }}>
            <div className="text-xs text-slate-500 font-medium pt-0.5">Best For</div>
            {selectedModels.map(m => (
              <div key={m.id} className="flex flex-col gap-1">
                {m.bestFor.map(use => (
                  <span key={use} className="text-xs text-slate-600 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" /> {use}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick verdict */}
        <AnimatePresence>
          <motion.div
            key={selectedModels.map(m => m.id).join("-")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              <h3 className="font-bold text-slate-800">Quick Verdict</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedModels.map((model, idx) => {
                const isWinner = idx === winner;
                const color = COLORS[idx];
                return (
                  <div key={model.id} className={`p-4 rounded-xl border ${isWinner ? `${color.bg} ${color.border}` : "bg-slate-50 border-slate-100"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {isWinner && <span className="text-sm">🏆</span>}
                      {model.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[model.badge] || ""}`}>{model.badge}</span>}
                      <span className={`text-sm font-black ${color.text}`}>{model.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isWinner ? "Best overall score. " : ""}
                      Best for: {model.bestFor.slice(0, 2).join(" and ")}.
                      {model.discount ? ` 💡 ${model.discount}.` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f0eb] flex items-center justify-center text-slate-400">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
