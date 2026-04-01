"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Star, Check, ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const QUESTIONS = [
  {
    id: "task",
    question: "What do you primarily need AI for?",
    options: [
      { value: "chat", label: "General Chat & Q&A", emoji: "💬" },
      { value: "code", label: "Writing & Reviewing Code", emoji: "💻" },
      { value: "writing", label: "Creative Writing & Content", emoji: "✍️" },
      { value: "image", label: "Image Generation", emoji: "🎨" },
      { value: "research", label: "Research & Analysis", emoji: "🔬" },
      { value: "video", label: "Video Creation", emoji: "🎬" },
    ],
  },
  {
    id: "budget",
    question: "What's your budget?",
    options: [
      { value: "free", label: "Free / Open Source", emoji: "🆓" },
      { value: "low", label: "Under $20/month", emoji: "💵" },
      { value: "medium", label: "$20-100/month", emoji: "💰" },
      { value: "high", label: "Enterprise / Unlimited", emoji: "🏢" },
    ],
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: [
      { value: "quality", label: "Best Quality Output", emoji: "🏆" },
      { value: "speed", label: "Fastest Responses", emoji: "⚡" },
      { value: "privacy", label: "Privacy & Data Control", emoji: "🔒" },
      { value: "integration", label: "Easy Integration / API", emoji: "🔌" },
    ],
  },
];

type Answers = Record<string, string>;

interface Recommendation {
  name: string;
  provider: string;
  reason: string;
  match: number;
  badge: string;
}

function getRecommendations(answers: Answers): Recommendation[] {
  const { task, budget, priority } = answers;
  const recs: Recommendation[] = [];

  if (task === "code") {
    recs.push({ name: "Claude Opus 4", provider: "Anthropic", reason: "Top-rated for code generation, refactoring, and debugging.", match: 97, badge: "Best for Code" });
    recs.push({ name: "GitHub Copilot", provider: "GitHub / OpenAI", reason: "Seamless IDE integration for real-time code suggestions.", match: 92, badge: "Best IDE Tool" });
    recs.push({ name: "Claude Code", provider: "Anthropic", reason: "Agentic coding directly in your terminal.", match: 90, badge: "Best CLI Tool" });
    if (budget === "free") recs.push({ name: "DeepSeek V3", provider: "DeepSeek", reason: "Excellent coding ability at very low cost.", match: 88, badge: "Best Value" });
  } else if (task === "image") {
    recs.push({ name: "Midjourney v6", provider: "Midjourney", reason: "Industry-leading aesthetic quality and style control.", match: 96, badge: "Best Quality" });
    recs.push({ name: "DALL-E 3", provider: "OpenAI", reason: "Excellent prompt following and text rendering.", match: 91, badge: "Most Versatile" });
    if (budget === "free") recs.push({ name: "Stable Diffusion 3", provider: "Stability AI", reason: "Free, open-source, and fully customizable.", match: 89, badge: "Best Free" });
  } else if (task === "video") {
    recs.push({ name: "Sora", provider: "OpenAI", reason: "Cinematic quality text-to-video generation.", match: 93, badge: "Best Quality" });
    recs.push({ name: "Runway Gen-3", provider: "Runway", reason: "Professional video editing and generation tools.", match: 90, badge: "Best Editor" });
  } else if (task === "writing") {
    recs.push({ name: "Claude Opus 4", provider: "Anthropic", reason: "Nuanced, creative writing with excellent long-form quality.", match: 96, badge: "Best Writer" });
    recs.push({ name: "GPT-4o", provider: "OpenAI", reason: "Versatile and great at following style instructions.", match: 91, badge: "Most Versatile" });
    recs.push({ name: "Gemini 2.5 Pro", provider: "Google", reason: "1M context window — great for long documents.", match: 87, badge: "Best for Long Docs" });
  } else if (task === "research") {
    recs.push({ name: "Perplexity", provider: "Perplexity AI", reason: "Real-time search with cited sources — built for research.", match: 95, badge: "Best for Search" });
    recs.push({ name: "DeepSeek R1", provider: "DeepSeek", reason: "Exceptional reasoning for complex analysis.", match: 92, badge: "Best Reasoning" });
    recs.push({ name: "Claude Opus 4", provider: "Anthropic", reason: "Deep analysis with nuanced understanding.", match: 90, badge: "Best Analysis" });
  } else {
    recs.push({ name: "ChatGPT Plus", provider: "OpenAI", reason: "All-in-one with browsing, DALL-E, and plugins.", match: 94, badge: "Best All-Rounder" });
    recs.push({ name: "Claude Sonnet 4", provider: "Anthropic", reason: "Fast, capable, and great at conversation.", match: 92, badge: "Best Balance" });
    recs.push({ name: "Gemini 2.5 Pro", provider: "Google", reason: "Multimodal with massive context window.", match: 88, badge: "Best Context" });
  }

  if (priority === "speed") {
    recs.push({ name: "Claude Haiku 3.5", provider: "Anthropic", reason: "Lightning fast at the lowest cost.", match: 88, badge: "Fastest" });
    recs.push({ name: "Gemini 2.0 Flash", provider: "Google", reason: "Optimized for speed and throughput.", match: 86, badge: "Fast & Cheap" });
  }
  if (priority === "privacy") {
    recs.push({ name: "Llama 3.1 405B", provider: "Meta", reason: "Run locally — your data never leaves your machine.", match: 90, badge: "Best Privacy" });
  }
  if (budget === "free") {
    recs.push({ name: "Llama 3.1 70B", provider: "Meta", reason: "Powerful open-source model, completely free.", match: 85, badge: "Free" });
  }

  // Deduplicate and sort
  const seen = new Set<string>();
  return recs.filter(r => { if (seen.has(r.name)) return false; seen.add(r.name); return true; }).sort((a, b) => b.match - a.match).slice(0, 4);
}

export default function MatcherPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  function handleSelect(value: string) {
    const newAnswers = { ...answers, [QUESTIONS[step].id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setDone(false);
  }

  const results = done ? getRecommendations(answers) : [];

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40"><Navbar /></div>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/know-your-ai" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Know Your AI
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center"><Zap className="w-6 h-6 text-violet-600" /></div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Use-Case Matcher</h1>
          </div>
          <p className="text-slate-500 mb-10">Answer 3 quick questions and we&apos;ll recommend the best AI for you.</p>
        </motion.div>

        {/* Progress bar */}
        {!done && (
          <div className="flex gap-2 mb-10">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-violet-500" : "bg-slate-200"}`} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <h2 className="text-xl font-black text-slate-900 mb-6">{QUESTIONS[step].question}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-violet-400 hover:shadow-lg transition-all text-left group cursor-pointer"
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-bold text-slate-900 text-sm group-hover:text-violet-700 transition-colors">{opt.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 ml-auto transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Your Top Recommendations</h2>
                <button onClick={reset} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-violet-600 transition-colors cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" /> Start Over
                </button>
              </div>
              <div className="space-y-4">
                {results.map((rec, i) => (
                  <motion.div key={rec.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-violet-300 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {i === 0 && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                          <span className="font-black text-slate-900">{rec.name}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{rec.badge}</span>
                        </div>
                        <span className="text-xs text-slate-400">{rec.provider}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-violet-600">{rec.match}%</div>
                        <div className="text-[10px] text-slate-400">match</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{rec.reason}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
