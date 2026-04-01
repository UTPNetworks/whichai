"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Star, MessageSquare, Image, Video, Music, Code, Sparkles, Filter } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const AI_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.8, description: "OpenAI's flagship multimodal model.", badge: "Popular" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code"], pricing: "$", rating: 4.5, description: "Affordable, fast version of GPT-4o.", badge: null },
  { id: "chatgpt", name: "ChatGPT", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.8, description: "Consumer-facing conversational AI powered by GPT-4o.", badge: "Popular" },
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", category: "LLM", capability: ["Chat", "Code", "Reasoning", "Vision"], pricing: "$$$", rating: 4.9, description: "Anthropic's most powerful model.", badge: "Top Rated" },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", category: "LLM", capability: ["Chat", "Code", "Reasoning", "Vision"], pricing: "$$", rating: 4.7, description: "Balanced performance and speed.", badge: "Popular" },
  { id: "claude-haiku-3.5", name: "Claude Haiku 3.5", provider: "Anthropic", category: "LLM", capability: ["Chat", "Code"], pricing: "$", rating: 4.3, description: "Lightning-fast at lowest cost.", badge: null },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.7, description: "Google's most capable model with 1M context.", badge: "New" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", category: "LLM", capability: ["Chat", "Code", "Vision"], pricing: "$", rating: 4.4, description: "Fast, efficient model.", badge: null },
  { id: "llama-3.1-405b", name: "Llama 3.1 405B", provider: "Meta", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "Free", rating: 4.6, description: "Meta's largest open-source model.", badge: "Open Source" },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta", category: "LLM", capability: ["Chat", "Code"], pricing: "Free", rating: 4.4, description: "Strong open-source model.", badge: "Open Source" },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "$$", rating: 4.5, description: "Mistral's flagship model.", badge: null },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "$", rating: 4.5, description: "Strong coding abilities.", badge: "New" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", category: "LLM", capability: ["Reasoning", "Code", "Chat"], pricing: "$", rating: 4.6, description: "Reasoning-focused model.", badge: "New" },
  { id: "grok-3", name: "Grok 3", provider: "xAI", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "$$", rating: 4.4, description: "Real-time knowledge model.", badge: "New" },
  { id: "dall-e-3", name: "DALL-E 3", provider: "OpenAI", category: "Image", capability: ["Image Gen"], pricing: "$$", rating: 4.6, description: "Text-to-image with high fidelity.", badge: "Popular" },
  { id: "midjourney-v6", name: "Midjourney v6", provider: "Midjourney", category: "Image", capability: ["Image Gen"], pricing: "$$", rating: 4.8, description: "Best aesthetic quality.", badge: "Top Rated" },
  { id: "stable-diffusion-3", name: "Stable Diffusion 3", provider: "Stability AI", category: "Image", capability: ["Image Gen"], pricing: "Free", rating: 4.4, description: "Open-source image generation.", badge: "Open Source" },
  { id: "sora", name: "Sora", provider: "OpenAI", category: "Video", capability: ["Video Gen"], pricing: "$$$", rating: 4.5, description: "Text-to-video generation.", badge: "New" },
  { id: "whisper-v3", name: "Whisper v3", provider: "OpenAI", category: "Audio", capability: ["Speech-to-Text"], pricing: "$", rating: 4.7, description: "Speech recognition in 99 languages.", badge: "Popular" },
  { id: "copilot", name: "GitHub Copilot", provider: "GitHub / OpenAI", category: "Code", capability: ["Code", "Chat"], pricing: "$$", rating: 4.7, description: "AI pair programmer.", badge: "Popular" },
  { id: "claude-code", name: "Claude Code", provider: "Anthropic", category: "Code", capability: ["Code", "Chat", "Reasoning"], pricing: "$$", rating: 4.8, description: "Agentic terminal coding tool.", badge: "New" },
  { id: "perplexity", name: "Perplexity", provider: "Perplexity AI", category: "LLM", capability: ["Chat", "Search", "Reasoning"], pricing: "$", rating: 4.5, description: "AI search engine with citations.", badge: "Popular" },
];

const CATEGORIES = ["All", "LLM", "Image", "Video", "Audio", "Code"];
const CAT_ICONS: Record<string, typeof MessageSquare> = { LLM: MessageSquare, Image: Image, Video: Video, Audio: Music, Code: Code };
const PROVIDER_COLORS: Record<string, string> = {
  "OpenAI": "bg-emerald-100 text-emerald-700", "Anthropic": "bg-orange-100 text-orange-700", "Google": "bg-blue-100 text-blue-700",
  "Meta": "bg-indigo-100 text-indigo-700", "Mistral": "bg-amber-100 text-amber-700", "DeepSeek": "bg-cyan-100 text-cyan-700",
  "xAI": "bg-slate-100 text-slate-700", "Midjourney": "bg-purple-100 text-purple-700", "Stability AI": "bg-violet-100 text-violet-700",
  "Runway": "bg-pink-100 text-pink-700", "ElevenLabs": "bg-teal-100 text-teal-700", "GitHub / OpenAI": "bg-gray-100 text-gray-700",
  "Cursor": "bg-sky-100 text-sky-700", "Perplexity AI": "bg-blue-100 text-blue-700",
};
const BADGE_COLORS: Record<string, string> = { "Popular": "bg-violet-100 text-violet-700", "Top Rated": "bg-amber-100 text-amber-700", "New": "bg-cyan-100 text-cyan-700", "Open Source": "bg-emerald-100 text-emerald-700" };

export default function ModelsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return AI_MODELS.filter((m) => {
      const matchesCat = category === "All" || m.category === category;
      if (!query.trim()) return matchesCat;
      const q = query.toLowerCase();
      return matchesCat && (m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.capability.some(c => c.toLowerCase().includes(q)));
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40"><Navbar /></div>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/know-your-ai" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Know Your AI
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Model Explorer</h1>
          <p className="text-slate-500 mb-8">Browse and discover AI models across every category.</p>
        </motion.div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search models..." className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-cyan-400 focus:shadow-lg transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${category === c ? "bg-cyan-600 text-white border-cyan-600 shadow-md" : "bg-white text-slate-500 border-gray-200 hover:border-cyan-300"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="text-xs text-slate-400 mb-4 font-semibold">{filtered.length} models</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const CatIcon = CAT_ICONS[m.category] || Sparkles;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-cyan-300 hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${PROVIDER_COLORS[m.provider] || "bg-slate-100 text-slate-600"}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                      {m.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[m.badge]}`}>{m.badge}</span>}
                    </div>
                    <span className="text-xs text-slate-400">{m.provider}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{m.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {m.capability.slice(0, 3).map(c => <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{c}</span>)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-xs text-amber-500"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{m.rating}</span>
                    <span className={`text-xs font-bold ${m.pricing === "Free" ? "text-emerald-600" : m.pricing === "$" ? "text-slate-500" : m.pricing === "$$" ? "text-amber-600" : "text-rose-600"}`}>{m.pricing === "Free" ? "Free" : m.pricing}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {filtered.length === 0 && <div className="text-center py-16 text-slate-400">No models match your search.</div>}
      </main>
    </div>
  );
}
