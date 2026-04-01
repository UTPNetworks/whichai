"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, Zap, Search, BarChart3, Layers, ExternalLink, Star, DollarSign, Cpu, MessageSquare, Image, Code, Music, Video, Sparkles } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── AI Model Database ────────────────────────────────────────────────────
const AI_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.8, description: "OpenAI's flagship multimodal model with text, vision, and audio capabilities.", badge: "Popular" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code"], pricing: "$", rating: 4.5, description: "Affordable, fast version of GPT-4o for everyday tasks.", badge: null },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$$", rating: 4.7, description: "High-performance model with 128K context window.", badge: null },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code"], pricing: "$", rating: 4.0, description: "Fast and cost-effective for simple tasks.", badge: null },
  { id: "chatgpt", name: "ChatGPT", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.8, description: "Consumer-facing conversational AI powered by GPT-4o.", badge: "Popular" },
  { id: "chatgpt-plus", name: "ChatGPT Plus", provider: "OpenAI", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning", "Image Gen"], pricing: "$$", rating: 4.9, description: "Premium ChatGPT with GPT-4o, DALL-E, browsing, and plugins.", badge: "Top Rated" },
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", category: "LLM", capability: ["Chat", "Code", "Reasoning", "Vision"], pricing: "$$$", rating: 4.9, description: "Anthropic's most powerful model for complex analysis and coding.", badge: "Top Rated" },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", category: "LLM", capability: ["Chat", "Code", "Reasoning", "Vision"], pricing: "$$", rating: 4.7, description: "Balanced performance and speed for most tasks.", badge: "Popular" },
  { id: "claude-haiku-3.5", name: "Claude Haiku 3.5", provider: "Anthropic", category: "LLM", capability: ["Chat", "Code"], pricing: "$", rating: 4.3, description: "Lightning-fast responses at the lowest cost.", badge: null },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.7, description: "Google's most capable model with 1M token context.", badge: "New" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", category: "LLM", capability: ["Chat", "Code", "Vision"], pricing: "$", rating: 4.4, description: "Fast, efficient model for high-volume tasks.", badge: null },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", category: "LLM", capability: ["Chat", "Code", "Vision", "Reasoning"], pricing: "$$", rating: 4.5, description: "Strong all-rounder with multimodal capabilities.", badge: null },
  { id: "llama-3.1-405b", name: "Llama 3.1 405B", provider: "Meta", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "Free", rating: 4.6, description: "Meta's largest open-source model, rivaling proprietary models.", badge: "Open Source" },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta", category: "LLM", capability: ["Chat", "Code"], pricing: "Free", rating: 4.4, description: "Strong open-source model, great for self-hosting.", badge: "Open Source" },
  { id: "llama-3.1-8b", name: "Llama 3.1 8B", provider: "Meta", category: "LLM", capability: ["Chat", "Code"], pricing: "Free", rating: 4.0, description: "Lightweight model that runs on consumer hardware.", badge: "Open Source" },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "$$", rating: 4.5, description: "Mistral's flagship model for complex tasks.", badge: null },
  { id: "mixtral-8x22b", name: "Mixtral 8x22B", provider: "Mistral", category: "LLM", capability: ["Chat", "Code"], pricing: "$", rating: 4.3, description: "Mixture-of-experts architecture for efficient inference.", badge: "Open Source" },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "$", rating: 4.5, description: "High-performance model with strong coding abilities.", badge: "New" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", category: "LLM", capability: ["Reasoning", "Code", "Chat"], pricing: "$", rating: 4.6, description: "Reasoning-focused model competitive with o1.", badge: "New" },
  { id: "grok-3", name: "Grok 3", provider: "xAI", category: "LLM", capability: ["Chat", "Code", "Reasoning"], pricing: "$$", rating: 4.4, description: "xAI's conversational model with real-time knowledge.", badge: "New" },
  { id: "dall-e-3", name: "DALL-E 3", provider: "OpenAI", category: "Image", capability: ["Image Gen"], pricing: "$$", rating: 4.6, description: "Advanced text-to-image generation with high fidelity.", badge: "Popular" },
  { id: "midjourney-v6", name: "Midjourney v6", provider: "Midjourney", category: "Image", capability: ["Image Gen"], pricing: "$$", rating: 4.8, description: "Industry-leading aesthetic quality for image generation.", badge: "Top Rated" },
  { id: "stable-diffusion-3", name: "Stable Diffusion 3", provider: "Stability AI", category: "Image", capability: ["Image Gen"], pricing: "Free", rating: 4.4, description: "Open-source image generation with fine-tuning support.", badge: "Open Source" },
  { id: "flux-1.1-pro", name: "Flux 1.1 Pro", provider: "Black Forest Labs", category: "Image", capability: ["Image Gen"], pricing: "$", rating: 4.5, description: "Fast, high-quality image generation model.", badge: "New" },
  { id: "sora", name: "Sora", provider: "OpenAI", category: "Video", capability: ["Video Gen"], pricing: "$$$", rating: 4.5, description: "Text-to-video generation with cinematic quality.", badge: "New" },
  { id: "runway-gen3", name: "Runway Gen-3", provider: "Runway", category: "Video", capability: ["Video Gen"], pricing: "$$", rating: 4.4, description: "Professional video generation and editing AI.", badge: null },
  { id: "whisper-v3", name: "Whisper v3", provider: "OpenAI", category: "Audio", capability: ["Speech-to-Text"], pricing: "$", rating: 4.7, description: "State-of-the-art speech recognition in 99 languages.", badge: "Popular" },
  { id: "eleven-labs-v2", name: "ElevenLabs v2", provider: "ElevenLabs", category: "Audio", capability: ["Text-to-Speech"], pricing: "$$", rating: 4.6, description: "Ultra-realistic AI voice synthesis and cloning.", badge: null },
  { id: "copilot", name: "GitHub Copilot", provider: "GitHub / OpenAI", category: "Code", capability: ["Code", "Chat"], pricing: "$$", rating: 4.7, description: "AI pair programmer integrated into your IDE.", badge: "Popular" },
  { id: "cursor", name: "Cursor", provider: "Cursor", category: "Code", capability: ["Code", "Chat"], pricing: "$$", rating: 4.6, description: "AI-first code editor with deep codebase understanding.", badge: "New" },
  { id: "claude-code", name: "Claude Code", provider: "Anthropic", category: "Code", capability: ["Code", "Chat", "Reasoning"], pricing: "$$", rating: 4.8, description: "Agentic coding tool that works directly in your terminal.", badge: "New" },
  { id: "perplexity", name: "Perplexity", provider: "Perplexity AI", category: "LLM", capability: ["Chat", "Search", "Reasoning"], pricing: "$", rating: 4.5, description: "AI-powered search engine with cited, real-time answers.", badge: "Popular" },
];

const CATEGORY_ICONS: Record<string, typeof Brain> = {
  LLM: MessageSquare,
  Image: Image,
  Video: Video,
  Audio: Music,
  Code: Code,
};

const PROVIDER_COLORS: Record<string, string> = {
  "OpenAI": "bg-emerald-100 text-emerald-700",
  "Anthropic": "bg-orange-100 text-orange-700",
  "Google": "bg-blue-100 text-blue-700",
  "Meta": "bg-indigo-100 text-indigo-700",
  "Mistral": "bg-amber-100 text-amber-700",
  "DeepSeek": "bg-cyan-100 text-cyan-700",
  "xAI": "bg-slate-100 text-slate-700",
  "Midjourney": "bg-purple-100 text-purple-700",
  "Stability AI": "bg-violet-100 text-violet-700",
  "Black Forest Labs": "bg-rose-100 text-rose-700",
  "Runway": "bg-pink-100 text-pink-700",
  "ElevenLabs": "bg-teal-100 text-teal-700",
  "GitHub / OpenAI": "bg-gray-100 text-gray-700",
  "Cursor": "bg-sky-100 text-sky-700",
  "Perplexity AI": "bg-blue-100 text-blue-700",
};

const BADGE_COLORS: Record<string, string> = {
  "Popular": "bg-violet-100 text-violet-700",
  "Top Rated": "bg-amber-100 text-amber-700",
  "New": "bg-cyan-100 text-cyan-700",
  "Open Source": "bg-emerald-100 text-emerald-700",
};

const features = [
  {
    icon: Search,
    title: "Model Explorer",
    desc: "Search and browse hundreds of AI models by category, capability, and price.",
    color: "bg-cyan-100 text-cyan-600",
    href: "/know-your-ai/models",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: BarChart3,
    title: "Benchmarks",
    desc: "Real performance data across coding, reasoning, creativity, and more.",
    color: "bg-blue-100 text-blue-600",
    href: "/know-your-ai/benchmarks",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Layers,
    title: "Side-by-Side Compare",
    desc: "Compare any two models head-to-head on the metrics that matter to you.",
    color: "bg-indigo-100 text-indigo-600",
    href: "/know-your-ai/compare",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: Zap,
    title: "Use-Case Matcher",
    desc: "Tell us what you need to do — we'll recommend the best AI for the job.",
    color: "bg-violet-100 text-violet-600",
    href: "/know-your-ai/matcher",
    gradient: "from-violet-500 to-purple-600",
  },
];

function PricingBadge({ pricing }: { pricing: string }) {
  const color = pricing === "Free" ? "text-emerald-600" : pricing === "$" ? "text-slate-500" : pricing === "$$" ? "text-amber-600" : "text-rose-600";
  return <span className={`text-xs font-bold ${color}`}>{pricing === "Free" ? "Free" : pricing}</span>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-xs text-amber-500">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

export default function KnowYourAIPage() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return AI_MODELS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.capability.some((c) => c.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40">
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
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center">
              <Brain className="w-7 h-7 text-cyan-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Know Your AI
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Explore, benchmark, and compare AI models so you always pick the right tool for
            the job.
          </p>
        </motion.div>

        {/* ── Big Search Bar ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-16 relative"
          ref={containerRef}
        >
          <div
            className={`relative rounded-2xl border-2 transition-all duration-300 bg-white shadow-lg ${
              focused
                ? "border-cyan-400 shadow-cyan-200/50 shadow-xl"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${focused ? "text-cyan-500" : "text-slate-400"}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search AI models... try &quot;ChatGPT&quot;, &quot;image generation&quot;, &quot;open source&quot;..."
              className="w-full pl-14 pr-6 py-5 text-lg bg-transparent outline-none text-slate-900 placeholder:text-slate-400 rounded-2xl"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick tags */}
          {!showDropdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 mt-4 justify-center"
            >
              {["ChatGPT", "Claude", "Gemini", "Image Gen", "Open Source", "Code"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); setFocused(true); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-full hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50 transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-slate-200/50 overflow-hidden"
              >
                {results.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No models found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {results.length} model{results.length !== 1 ? "s" : ""} found
                      </span>
                      <span className="text-xs text-slate-300">Press Enter to explore all</span>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                      {results.map((model, i) => {
                        const CatIcon = CATEGORY_ICONS[model.category] || Sparkles;
                        return (
                          <motion.div
                            key={model.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-cyan-50/50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 group"
                            onClick={() => { setFocused(false); }}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${PROVIDER_COLORS[model.provider] || "bg-slate-100 text-slate-600"}`}>
                              <CatIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-slate-900 text-sm">{model.name}</span>
                                {model.badge && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[model.badge] || "bg-slate-100 text-slate-600"}`}>
                                    {model.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{model.provider}</span>
                                <span>·</span>
                                <span>{model.category}</span>
                                <span>·</span>
                                <span>{model.capability.slice(0, 3).join(", ")}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <StarRating rating={model.rating} />
                              <PricingBadge pricing={model.pricing} />
                              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feature cards — now clickable links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Link href={f.href} className="block group">
                  <div className="flex gap-4 p-6 rounded-2xl border border-gray-200 bg-white hover:border-cyan-300 hover:shadow-lg transition-all duration-300 h-full">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-cyan-700 transition-colors">{f.title}</h3>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-8 mb-16 text-center"
        >
          {[
            { label: "AI Models", value: `${AI_MODELS.length}+` },
            { label: "Providers", value: `${new Set(AI_MODELS.map(m => m.provider)).size}+` },
            { label: "Categories", value: `${new Set(AI_MODELS.map(m => m.category)).size}` },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-black text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-400 font-medium">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
