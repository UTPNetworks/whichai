"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Clock, Users, Star, 
  CheckCircle2, FileText, Globe, GraduationCap, ChevronRight,
  Award, Sparkles, Download, ExternalLink
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// Mock data shared with Learning Hub
const coursesData = [
  {
    id: "prompt-engineering-101",
    title: "Advanced Prompt Engineering for LLMs",
    category: "Prompt Engineering",
    source: "WhichAI Academy",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    description: "Master the art of communicating with large language models through structured frameworks and advanced heuristics.",
    stats: { students: "12.4k", rating: "4.9", duration: "6h" },
    syllabus: [
      { title: "Introduction to LLM Architectures", duration: "45m" },
      { title: "Zero-shot vs. Few-shot Prompting", duration: "1h 15m" },
      { title: "Chain-of-Thought Heuristics", duration: "1h" },
      { title: "Prompt Versioning & Testing", duration: "50m" },
      { title: "Adversarial Robustness in Prompts", duration: "1h 10m" }
    ]
  },
  {
    id: "gpu-infrastructure-masterclass",
    title: "GPU Infrastructure & Deployment",
    category: "Infrastructure",
    source: "NVIDIA Partner",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    description: "Deep dive into A100/H100 orchestration, CUDA kernels, and scaling distributed training clusters.",
    stats: { students: "8.2k", rating: "4.8", duration: "12h" },
    syllabus: [
      { title: "GPU Architecture Fundamentals", duration: "2h" },
      { title: "Kubernetes for AI Workloads", duration: "3h" },
      { title: "Distributed Training Strategies", duration: "2h 30m" },
      { title: "Monitoring & VRAM Optimization", duration: "2h" },
      { title: "P2P Node Orchestration", duration: "2h 30m" }
    ]
  }
];

export default function CoursePage() {
  const params = useParams();
  const id = params?.id as string;
  const course = coursesData.find(c => c.id === id) || coursesData[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100 pb-24 lg:pb-0">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/learning-hub" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Hub
          </Link>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 text-[11px] font-black uppercase tracking-wider shadow-lg shadow-amber-200/50 cursor-pointer hover:scale-105 transition-all"
          >
            <Sparkles size={14} className="fill-current" /> Unlock Pro Membership
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  {course.source}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                {course.title}
              </h1>

              <div className="flex flex-wrap gap-6 mb-10 text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-slate-300" /> {course.stats.students} Students
                </div>
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-current" /> {course.stats.rating} Rating
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-slate-300" /> {course.stats.duration} Total
                </div>
              </div>

              <div className="prose prose-slate max-w-none mb-12">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-slate-400" /> Course Overview
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  {course.description} This elite curriculum provides deep technical insights and hands-on laboratory work.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <BookOpen size={20} className="text-purple-600" /> Detailed Syllabus
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {course.syllabus.length} Modules
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {course.syllabus.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-6 hover:bg-slate-50 transition-colors group cursor-default">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-purple-600 group-hover:border-purple-200 transition-all">
                        {(i + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 text-sm md:text-base">{item.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {item.duration}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Desktop Sidebar */}
          <div className="lg:col-span-4 hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-32 space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600" />
                <img 
                  src={course.thumbnail} 
                  alt="Course Preview" 
                  className="w-full aspect-video object-cover rounded-2xl mb-6 shadow-sm ring-1 ring-slate-100"
                />
                
                <div className="space-y-3">
                  <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 group">
                    Access External Course <ExternalLink size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                  <button className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    Download Syllabus PDF <Download size={18} />
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Verified Curriculum
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <GraduationCap size={14} className="text-purple-500" /> Certificate Included
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <Award size={14} className="text-amber-500" /> Industry Recognized
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl">
                <h4 className="font-black mb-2 flex items-center gap-2 text-lg">
                  <Sparkles size={20} className="text-amber-400" /> Pro Membership
                </h4>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Join 50,000+ engineers. Get unlimited access to all masterclasses, private labs, and 1-on-1 mentorship.
                </p>
                <button className="w-full py-3 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-all active:scale-95">
                  Upgrade Now — $29/mo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex gap-3 lg:hidden z-50">
        <button className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-black transition-all flex items-center justify-center gap-2">
          Access Course <ExternalLink size={16} />
        </button>
        <button className="px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-xs hover:bg-slate-50 transition-all flex items-center justify-center">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
}
