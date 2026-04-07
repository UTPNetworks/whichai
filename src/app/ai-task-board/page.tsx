"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Plus, Clock, DollarSign, Star, ChevronRight,
  Zap, Shield, CheckCircle, Users, Filter, Search, X, Tag
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useState } from "react";

// ── Mock Task Data ────────────────────────────────────────────
const TASKS = [
  {
    id: "task-1",
    title: "Build a Custom Customer Support Chatbot",
    description:
      "We need a multi-language chatbot integrated with Zendesk & Shopify. Should handle FAQs, order tracking, and escalation to human agents. RAG over our product knowledge base.",
    budget: 2500,
    budgetType: "fixed",
    deadline: "7 days",
    category: "Chatbot",
    tags: ["LangChain", "RAG", "Zendesk", "GPT-4o"],
    poster: { name: "ShopTech_Ventures", rating: 4.9, tasks: 12, verified: true },
    bids: 8,
    urgency: "high",
    postedAgo: "2h ago",
    status: "open",
    skills: ["Python", "LangChain", "Shopify API"],
  },
  {
    id: "task-2",
    title: "Fine-tune LLaMA 3.1 70B on Legal Documents",
    description:
      "Need a domain expert to fine-tune LLaMA 3.1 70B on a dataset of 50K US court documents. LoRA preferred. Must achieve <10% perplexity drop vs base model on our eval set.",
    budget: 4800,
    budgetType: "fixed",
    deadline: "14 days",
    category: "Fine-tuning",
    tags: ["LLaMA", "LoRA", "PyTorch", "Legal NLP"],
    poster: { name: "LexAI_Corp", rating: 5.0, tasks: 3, verified: true },
    bids: 5,
    urgency: "medium",
    postedAgo: "5h ago",
    status: "open",
    skills: ["PyTorch", "Transformers", "LoRA"],
  },
  {
    id: "task-3",
    title: "AI Voice Assistant for Healthcare Scheduling",
    description:
      "Build a voice-first AI assistant that can book, cancel and reschedule medical appointments via phone. EHR integration (Epic). HIPAA compliance required.",
    budget: 180,
    budgetType: "hourly",
    deadline: "21 days",
    category: "Voice AI",
    tags: ["Twilio", "Whisper", "TTS", "HIPAA", "Epic EHR"],
    poster: { name: "MedFlow_Health", rating: 4.7, tasks: 7, verified: true },
    bids: 3,
    urgency: "medium",
    postedAgo: "1d ago",
    status: "open",
    skills: ["Twilio", "OpenAI API", "Python"],
  },
  {
    id: "task-4",
    title: "Real-time AI Fraud Detection Pipeline",
    description:
      "Design and deploy a real-time ML pipeline for payment fraud detection. Target: <50ms inference, >97% accuracy on our test set. Kafka + Flink preferred. Model explainability needed.",
    budget: 6500,
    budgetType: "fixed",
    deadline: "30 days",
    category: "ML Engineering",
    tags: ["Kafka", "XGBoost", "MLflow", "Real-time ML"],
    poster: { name: "FinGuard_AI", rating: 4.8, tasks: 5, verified: true },
    bids: 11,
    urgency: "high",
    postedAgo: "3h ago",
    status: "open",
    skills: ["Python", "Kafka", "Spark", "XGBoost"],
  },
  {
    id: "task-5",
    title: "Multimodal AI Content Moderator",
    description:
      "Build a content moderation API that screens images, video thumbnails, and text simultaneously. Must run on-premise (no external API calls). Target: 200ms/request on 4x A100.",
    budget: 3200,
    budgetType: "fixed",
    deadline: "10 days",
    category: "Computer Vision",
    tags: ["CLIP", "BLIP-2", "FastAPI", "On-premise"],
    poster: { name: "SafeContent_Pro", rating: 4.6, tasks: 2, verified: false },
    bids: 6,
    urgency: "high",
    postedAgo: "6h ago",
    status: "open",
    skills: ["PyTorch", "FastAPI", "Docker", "CUDA"],
  },
  {
    id: "task-6",
    title: "AI-powered Resume Parser & Ranker",
    description:
      "Extract structured data from CVs (any format: PDF, DOCX, images). Rank candidates against job descriptions using semantic similarity. Output via REST API with ATS webhook.",
    budget: 1200,
    budgetType: "fixed",
    deadline: "5 days",
    category: "NLP",
    tags: ["NLP", "Sentence-BERT", "FastAPI", "Recruitement"],
    poster: { name: "TalentOS_AI", rating: 4.9, tasks: 18, verified: true },
    bids: 14,
    urgency: "low",
    postedAgo: "2d ago",
    status: "open",
    skills: ["SpaCy", "Sentence-BERT", "FastAPI"],
  },
  {
    id: "task-7",
    title: "Custom Code Review AI Agent",
    description:
      "Build an autonomous code review agent that analyses PRs on GitHub, suggests improvements, catches security issues, and posts structured comments. Integrate with GitHub Actions CI.",
    budget: 2100,
    budgetType: "fixed",
    deadline: "12 days",
    category: "AI Agent",
    tags: ["LangGraph", "GitHub API", "Code Analysis", "Security"],
    poster: { name: "DevBoost_Tech", rating: 4.7, tasks: 9, verified: true },
    bids: 7,
    urgency: "medium",
    postedAgo: "4h ago",
    status: "open",
    skills: ["LangChain", "GitHub API", "Python", "AST"],
  },
  {
    id: "task-8",
    title: "Generative AI Product Image Creator",
    description:
      "Build a pipeline that takes product SKU data (name, color, dimensions) and auto-generates professional product photos on white background using ComfyUI or Flux. Shopify upload integration.",
    budget: 90,
    budgetType: "hourly",
    deadline: "8 days",
    category: "Image Generation",
    tags: ["ComfyUI", "Flux", "SDXL", "Shopify"],
    poster: { name: "BrandMagic_Ecom", rating: 4.4, tasks: 4, verified: false },
    bids: 9,
    urgency: "medium",
    postedAgo: "1d ago",
    status: "open",
    skills: ["ComfyUI", "Python", "Shopify API"],
  },
];

const CATEGORIES = ["All", "Chatbot", "Fine-tuning", "Voice AI", "ML Engineering", "Computer Vision", "NLP", "AI Agent", "Image Generation"];

const urgencyColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const categoryColors: Record<string, string> = {
  "Chatbot": "bg-purple-100 text-purple-700",
  "Fine-tuning": "bg-blue-100 text-blue-700",
  "Voice AI": "bg-cyan-100 text-cyan-700",
  "ML Engineering": "bg-indigo-100 text-indigo-700",
  "Computer Vision": "bg-pink-100 text-pink-700",
  "NLP": "bg-teal-100 text-teal-700",
  "AI Agent": "bg-violet-100 text-violet-700",
  "Image Generation": "bg-rose-100 text-rose-700",
};

export default function AITaskBoardPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);

  const filtered = TASKS.filter((t) => {
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #b45309 0%, #d97706 50%, #fbbf24 100%)" }}
      >
        {/* Decorative floating emojis */}
        <div className="absolute inset-0 opacity-10 select-none pointer-events-none">
          {["🛠️", "🤝", "💼", "🔧", "⚙️", "🎯", "💰", "🚀", "🤖", "🧠", "💡", "📊"].map((e, i) => (
            <span
              key={i}
              className="absolute text-4xl"
              style={{ left: `${(i * 9.1) % 95}%`, top: `${(i * 17) % 80}%` }}
            >
              {e}
            </span>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 backdrop-blur-sm">
                <Briefcase className="w-3.5 h-3.5" />
                AI Task Board — Get It Built
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
                Post Any AI Task. Get It Done.
              </h1>
              <p className="text-amber-100 text-sm max-w-md leading-relaxed">
                Hire vetted AI developers for custom LLMs, fine-tuning, agents, chatbots, and more. Escrow-protected. Pay only on delivery.
              </p>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { icon: Shield, label: "Escrow Protected" },
                  { icon: CheckCircle, label: "Vetted Devs" },
                  { icon: Zap, label: "Avg 48hr Delivery" },
                  { icon: Users, label: "500+ AI Experts" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium">
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-amber-700 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Post a Task
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, skills, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="font-medium">{filtered.length} tasks</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-7">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-slate-600 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Task Cards Grid - HIGH DENSITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((task, i) => (
            <Link key={task.id} href={`/task/${task.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="bg-white h-full rounded-xl border border-gray-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-500/30 flex flex-col overflow-hidden group"
              >
                {/* Card Header - COMPACT */}
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[task.category] || "bg-gray-100 text-gray-600"}`}>
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${urgencyColors[task.urgency]}`}>
                      {task.urgency === "high" ? "🔴 Urgent" : task.urgency === "medium" ? "🟡 Active" : "🟢 Relaxed"}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1.5 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {task.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
                    {task.description}
                  </p>

                  {/* Tech Tags - SCALED DOWN */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-md font-bold uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Poster info - COMPACT */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[9px] font-black shrink-0 border border-slate-200">
                      {task.poster.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-700 truncate">
                        {task.poster.name}
                      </p>
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 shrink-0">
                      {task.postedAgo}
                    </div>
                  </div>
                </div>

                {/* Card Footer - PINNED BOTTOM */}
                <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    <span className="text-[13px] font-black text-slate-900">
                      {task.budgetType === "fixed"
                        ? `$${task.budget.toLocaleString()}`
                        : `$${task.budget}/hr`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Users size={10} />
                      {task.bids}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-500 text-sm">No tasks match your search.</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="mt-3 text-xs text-amber-600 hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 rounded-2xl p-7 text-center"
          style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}
        >
          <h2 className="text-lg font-black text-slate-900 mb-1.5">Have an AI task to outsource?</h2>
          <p className="text-slate-500 text-sm mb-5">
            Post your task for free. Get bids from expert AI developers within hours.
            Escrow-protected payment. Pay only when you&apos;re satisfied.
          </p>
          <button
            onClick={() => setShowPostModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Post Your Task — It&apos;s Free
          </button>
        </motion.div>
      </main>

      {/* Post Task Modal (simplified) */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPostModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-slate-900">Post a Task</h2>
                <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Task Title</label>
                  <input type="text" placeholder="e.g. Build a customer support chatbot with RAG" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:border-amber-400 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
                  <textarea placeholder="Describe what you need, tech stack preferences, deliverables..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:border-amber-400 transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Budget ($)</label>
                    <input type="number" placeholder="1000" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:border-amber-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Deadline</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:border-amber-400 transition-all">
                      <option>3 days</option>
                      <option>7 days</option>
                      <option>14 days</option>
                      <option>30 days</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-all duration-200">
                  🚀 Post Task (Coming Soon)
                </button>
                <p className="text-xs text-slate-400 text-center">
                  Full launch coming soon — join the waitlist above!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
