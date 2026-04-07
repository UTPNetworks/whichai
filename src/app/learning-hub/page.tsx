"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, GraduationCap, ArrowRight, Sparkles, 
  BookOpen, Clock, Users, Star, Award
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── 2. Data-Driven Architecture ──────────────────────────────
const coursesData = [
  {
    id: "prompt-engineering-101",
    title: "Advanced Prompt Engineering for LLMs",
    category: "Prompt Engineering",
    source: "WhichAI Academy",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    description: "Master the art of communicating with large language models through structured frameworks and advanced heuristics.",
    stats: { students: "12.4k", rating: "4.9", duration: "6h" }
  },
  {
    id: "gpu-infrastructure-masterclass",
    title: "GPU Infrastructure & Deployment",
    category: "Infrastructure",
    source: "NVIDIA Partner",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    description: "Deep dive into A100/H100 orchestration, CUDA kernels, and scaling distributed training clusters.",
    stats: { students: "8.2k", rating: "4.8", duration: "12h" }
  },
  {
    id: "ai-agents-autonomy",
    title: "Building Autonomous AI Agents",
    category: "AI Agents",
    source: "Stanford Research",
    thumbnail: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
    description: "Learn to build goal-oriented agents that can reason, plan, and execute complex workflows across external tools.",
    stats: { students: "15.1k", rating: "4.9", duration: "8h" }
  },
  {
    id: "generative-art-stable-diffusion",
    title: "Mastering Generative Art with SDXL",
    category: "Generative Art",
    source: "Stability AI",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    description: "Understand the latent space, LoRA training, and ControlNet for high-fidelity image generation.",
    stats: { students: "22.8k", rating: "4.7", duration: "10h" }
  },
  {
    id: "nlp-transformers-deep-dive",
    title: "NLP & Transformers: From Scratch",
    category: "Machine Learning",
    source: "Google DeepMind",
    thumbnail: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    description: "A mathematical and practical guide to understanding the Transformer architecture that powers modern AI.",
    stats: { students: "10.5k", rating: "4.9", duration: "15h" }
  },
  {
    id: "ai-ethics-safety",
    title: "AI Ethics & Alignment Safety",
    category: "AI Safety",
    source: "Harvard University",
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    description: "Explore the critical challenges of aligning superintelligent systems with human values and safety protocols.",
    stats: { students: "5.6k", rating: "4.8", duration: "4h" }
  }
];

// ── 3. The Tile Design (Creative Direction) ───────────────────
function CourseTile({ course }: { course: typeof coursesData[0] }) {
  return (
    <Link href={`/course/${course.id}`} className="block h-full">
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 12px 20px -5px rgb(0 0 0 / 0.1)" }}
        className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all flex flex-col h-full cursor-pointer hover:border-purple-300"
      >
        {/* Top Half: 16:9 Thumbnail with Hover Zoom - REDUCED HEIGHT */}
        <div className="relative aspect-video h-28 md:h-32 overflow-hidden">
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
        </div>

        {/* Bottom Half: Content - TIGHTER PADDING */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[9px] font-bold uppercase tracking-wider">
              {course.category}
            </span>
            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest truncate">
              {course.source}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1.5 group-hover:text-purple-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-snug">
            {course.description}
          </p>

          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
                <Users size={10} /> {course.stats.students}
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                <Star size={10} className="fill-current" /> {course.stats.rating}
              </div>
            </div>
            
            <div className="inline-flex items-center gap-1 text-purple-600 text-[10px] font-black group-hover:gap-1.5 transition-all">
              Start <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ── 1. White Theme Conversion ─────────────────────────────────
export default function LearningHubPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = coursesData.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Navbar />
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4"
            >
              <GraduationCap size={14} /> WhichAI Academy
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tight mb-4"
            >
              The Global <span className="text-purple-600">Learning Hub</span> for AI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 leading-relaxed"
            >
              Structured syllabuses from the world&apos;s leading institutions. 
              Master everything from basic prompting to GPU orchestration.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative w-full md:w-80"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search curriculum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm font-medium"
            />
          </motion.div>
        </div>

        {/* Course Grid - DENSE LAYOUT */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {filteredCourses.map((course, i) => (
            <CourseTile key={course.id} course={course} />
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No matching courses found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or explore all categories.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 rounded-[2.5rem] bg-slate-900 p-8 md:p-16 text-center overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              Ready to Share Your Expertise?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Join the ranks of elite AI researchers and instructors. Build your curriculum, 
              reach thousands of students, and earn revenue through our marketplace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
                Apply to Teach <Award size={18} />
              </button>
              <button className="px-8 py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                Curriculum Labs <Clock size={18} />
              </button>
            </div>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
