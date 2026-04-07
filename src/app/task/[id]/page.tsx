"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Clock, DollarSign, Users, Star, 
  ShieldCheck, Briefcase, Tag, CheckCircle2, 
  ChevronRight, Send, User, MessageCircle
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// Mock Data (Shared with AI Task Board)
const TASKS = [
  {
    id: "task-1",
    title: "Build a Custom Customer Support Chatbot",
    description: "We need a multi-language chatbot integrated with Zendesk & Shopify. Should handle FAQs, order tracking, and escalation to human agents. RAG over our product knowledge base.",
    fullDescription: "Looking for an expert AI developer to build a production-ready customer support chatbot. The system must leverage RAG (Retrieval-Augmented Generation) using our existing product documentation. Key requirements include support for 5+ languages, seamless integration with Shopify for order lookups, and a robust hand-off mechanism to human agents in Zendesk. The bot should be capable of handling 80% of routine inquiries autonomously.",
    budget: 2500,
    budgetType: "fixed",
    deadline: "7 days",
    category: "Chatbot",
    tags: ["LangChain", "RAG", "Zendesk", "GPT-4o"],
    poster: { name: "ShopTech_Ventures", rating: 4.9, tasks: 12, verified: true },
    bids: 8,
    postedAgo: "2h ago",
    deliverables: [
      "Custom RAG Pipeline using Pinecone/LangChain",
      "Shopify & Zendesk API Integrations",
      "Multilingual support (En, Es, Fr, De, Zh)",
      "Human-in-the-loop escalation logic"
    ],
    techStack: ["Python", "OpenAI GPT-4o", "LangChain", "Pinecone", "Shopify API"]
  }
];

export default function TaskDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const task = TASKS.find(t => t.id === id) || TASKS[0]; // Fallback to first mock

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Link 
          href="/ai-task-board" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Task Board
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN: Job Details */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-black uppercase tracking-wider">
                  {task.category}
                </span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <Clock size={14} /> Posted {task.postedAgo}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                {task.title}
              </h1>

              <div className="space-y-10">
                <section>
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-slate-400" /> Job Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg font-medium">
                    {task.fullDescription || task.description}
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-slate-400" /> Required Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.techStack?.map(tech => (
                      <span key={tech} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-purple-600" /> Deliverables
                  </h3>
                  <div className="space-y-3">
                    {task.deliverables?.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 group hover:border-purple-200 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 size={16} />
                        </div>
                        <span className="font-bold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-32 space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600" />
                
                <div className="mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Project Budget</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-slate-900">${task.budget.toLocaleString()}</span>
                    <span className="text-slate-400 font-bold text-sm uppercase">{task.budgetType}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400">Proposals</span>
                    <span className="text-slate-900">{task.bids}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400">Deadline</span>
                    <span className="text-slate-900">{task.deadline}</span>
                  </div>
                </div>

                <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  Submit Proposal <Send size={18} />
                </button>
              </div>

              {/* Client Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">About Client</h4>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xl border border-slate-200">
                    {task.poster.name[0]}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 flex items-center gap-1.5">
                      {task.poster.name}
                      {task.poster.verified && <ShieldCheck size={16} className="text-cyan-500 fill-cyan-50" />}
                    </h5>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-0.5">
                      <Star size={12} className="fill-current" /> {task.poster.rating} Rating
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <CheckCircle2 size={14} className="text-emerald-500" /> {task.poster.tasks} Jobs Posted
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Users size={14} className="text-purple-500" /> Escrow Verified
                  </div>
                </div>

                <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                  Contact Client <MessageCircle size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
