"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Clock, Users, Star, 
  CheckCircle2, FileText, Globe, GraduationCap, ChevronRight 
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
      "Introduction to LLM Architectures",
      "Zero-shot vs. Few-shot Prompting",
      "Chain-of-Thought Heuristics",
      "Prompt Versioning & Testing",
      "Adversarial Robustness in Prompts"
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
      "GPU Architecture Fundamentals",
      "Kubernetes for AI Workloads",
      "Distributed Training Strategies",
      "Monitoring & VRAM Optimization",
      "P2P Node Orchestration"
    ]
  }
];

export default function CoursePage() {
  const { id } = useParams();
  const course = coursesData.find(c => c.id === id) || coursesData[0]; // Fallback to first if not found

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Navbar />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link 
          href="/learning-hub" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Hub
        </Link>

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

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                {course.title}
              </h1>

              <div className="flex flex-wrap gap-6 mb-8 text-sm font-bold text-slate-500">
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
                <h3 className="text-xl font-bold mb-4">About this Course</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {course.description} This comprehensive curriculum is designed to take you from foundational concepts 
                  to industry-expert implementation. You will gain hands-on experience with the same tools used 
                  by top AI researchers at {course.source}.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-600" /> Course Syllabus
                </h3>
                <div className="space-y-4">
                  {(course as any).syllabus?.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-purple-200 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-purple-600 group-hover:border-purple-200">
                        {i + 1}
                      </div>
                      <span className="font-bold text-slate-700">{item}</span>
                      <ChevronRight size={16} className="ml-auto text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-32 space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />
                <img 
                  src={course.thumbnail} 
                  alt="Course Preview" 
                  className="w-full aspect-video object-cover rounded-2xl mb-6 shadow-sm"
                />
                
                <div className="space-y-4">
                  <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2">
                    Access External Course <Globe size={18} />
                  </button>
                  <button className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    Download Syllabus PDF <FileText size={18} />
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Verified Curriculum
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <GraduationCap size={14} className="text-purple-500" /> Certificate Included
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Award size={14} className="text-amber-500" /> Industry Recognized
                  </div>
                </div>
              </div>

              <div className="bg-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-purple-200">
                <h4 className="font-black mb-2 flex items-center gap-2">
                  <Sparkles size={18} /> Pro Membership
                </h4>
                <p className="text-sm text-purple-100 mb-4 font-medium">
                  Get unlimited access to all 50+ masterclasses and hands-on labs for one low monthly rate.
                </p>
                <button className="w-full py-3 rounded-xl bg-white text-purple-600 font-bold text-xs hover:bg-purple-50 transition-all">
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
