"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ArrowLeft, Star, Users, Clock, Award, Search,
  Filter, ChevronRight, Play, Sparkles, GraduationCap, Shield,
  Cpu, Brain, Eye, Terminal, Bot, Database, Palette, Lock,
  BarChart3, Loader2, X,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

// ── Types ──────────────────────────────────────────────────
interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar_url: string;
  rating: number;
  total_students: number;
  total_courses: number;
  verified: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  image_url: string;
  instructor_id: string;
  category: string;
  level: string;
  price: number;
  original_price: number | null;
  is_free: boolean;
  has_certificate: boolean;
  badge: string | null;
  rating: number;
  review_count: number;
  student_count: number;
  lesson_count: number;
  duration_hours: number;
  tags: string[];
  instructor?: Instructor;
}

interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  gradient: string;
  course_count: number;
  total_hours: number;
  level: string;
}

// ── Constants ──────────────────────────────────────────────
const CATEGORIES = [
  { id: "All", icon: Sparkles, color: "bg-purple-100 text-purple-600" },
  { id: "LLMs", icon: Brain, color: "bg-blue-100 text-blue-600" },
  { id: "Computer Vision", icon: Eye, color: "bg-pink-100 text-pink-600" },
  { id: "NLP", icon: Terminal, color: "bg-teal-100 text-teal-600" },
  { id: "MLOps", icon: Database, color: "bg-orange-100 text-orange-600" },
  { id: "AI Agents", icon: Bot, color: "bg-violet-100 text-violet-600" },
  { id: "Data Science", icon: BarChart3, color: "bg-cyan-100 text-cyan-600" },
  { id: "Prompt Engineering", icon: Palette, color: "bg-amber-100 text-amber-600" },
  { id: "AI Safety", icon: Shield, color: "bg-emerald-100 text-emerald-600" },
  { id: "Generative AI", icon: Sparkles, color: "bg-rose-100 text-rose-600" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "certificate", label: "With Certificate" },
];

const AI_MODELS = [
  { name: "GPT-4o", provider: "OpenAI", color: "bg-green-100 text-green-700 border-green-200" },
  { name: "Claude Opus 4", provider: "Anthropic", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "Gemini 2.5", provider: "Google", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "LLaMA 4", provider: "Meta", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { name: "Mistral Large", provider: "Mistral", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Grok-3", provider: "xAI", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { name: "Command R+", provider: "Cohere", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { name: "SDXL Turbo", provider: "Stability", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { name: "Whisper v3", provider: "OpenAI", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { name: "DALL-E 3", provider: "OpenAI", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

// ── Course Card Component ──────────────────────────────────
function CourseCard({ course, index }: { course: Course; index: number }) {
  const discountPct = course.original_price
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group"
    >
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all h-full flex flex-col">
        {/* Image */}
        <div className="relative h-[160px] overflow-hidden">
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {course.badge && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
              course.badge === "Bestseller" ? "bg-amber-400 text-amber-900"
              : course.badge === "Hot" ? "bg-red-500 text-white"
              : course.badge === "New" ? "bg-cyan-500 text-white"
              : course.badge === "Free" ? "bg-green-500 text-white"
              : "bg-purple-500 text-white"
            }`}>{course.badge}</span>
          )}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm ${
              course.level === "Beginner" ? "bg-green-500/90 text-white"
              : course.level === "Intermediate" ? "bg-blue-500/90 text-white"
              : "bg-red-500/90 text-white"
            }`}>{course.level}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">{course.category}</span>
          <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-2 leading-snug">{course.title}</h3>

          {/* Instructor */}
          {course.instructor && (
            <div className="flex items-center gap-2 mb-2">
              <img src={course.instructor.avatar_url} alt={course.instructor.name} className="w-5 h-5 rounded-full object-cover" />
              <span className="text-xs text-slate-500">{course.instructor.name}</span>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-bold text-amber-600">{course.rating}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < Math.round(course.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
              ))}
            </div>
            <span className="text-xs text-slate-400">({course.review_count.toLocaleString()})</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1"><Users size={12} />{course.student_count.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Play size={12} />{course.lesson_count} lessons</span>
            <span className="flex items-center gap-1"><Clock size={12} />{course.duration_hours}h</span>
          </div>

          {/* Price */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {course.is_free ? (
                <span className="text-lg font-bold text-green-600">Free</span>
              ) : (
                <>
                  <span className="text-lg font-bold text-slate-900">${course.price}</span>
                  {course.original_price && (
                    <span className="text-xs text-slate-400 line-through">${course.original_price}</span>
                  )}
                  {discountPct && (
                    <span className="text-[10px] font-bold text-green-600">{discountPct}% off</span>
                  )}
                </>
              )}
            </div>
            {course.has_certificate && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-600"><Award size={12} />Certificate</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function LearningHubPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch data from Supabase
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [coursesRes, instructorsRes, pathsRes] = await Promise.all([
        supabase.from("courses").select("*").eq("published", true).order("student_count", { ascending: false }),
        supabase.from("instructors").select("*").order("total_students", { ascending: false }),
        supabase.from("learning_paths").select("*"),
      ]);
      const instructorMap = new Map<string, Instructor>();
      (instructorsRes.data || []).forEach((i: Instructor) => instructorMap.set(i.id, i));
      const coursesWithInstructors = (coursesRes.data || []).map((c: Course) => ({
        ...c,
        instructor: instructorMap.get(c.instructor_id),
      }));
      setCourses(coursesWithInstructors);
      setInstructors(instructorsRes.data || []);
      setPaths(pathsRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    let result = courses;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q) ||
        (c.instructor?.name || "").toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "All") {
      result = result.filter((c) => c.category === activeCategory);
    }
    if (activeFilter === "free") result = result.filter((c) => c.is_free);
    if (activeFilter === "paid") result = result.filter((c) => !c.is_free);
    if (activeFilter === "beginner") result = result.filter((c) => c.level === "Beginner");
    if (activeFilter === "intermediate") result = result.filter((c) => c.level === "Intermediate");
    if (activeFilter === "advanced") result = result.filter((c) => c.level === "Advanced");
    if (activeFilter === "certificate") result = result.filter((c) => c.has_certificate);
    return result;
  }, [courses, searchQuery, activeCategory, activeFilter]);

  const totalStudents = courses.reduce((sum, c) => sum + c.student_count, 0);

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb]/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <Navbar />
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 py-14 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12)_0%,transparent_50%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold mb-4">
              <GraduationCap className="w-3.5 h-3.5" /> AI Learning Academy
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
              Learn AI from the <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">Best in the World</span>
            </h1>
            <p className="text-white/70 text-sm max-w-lg leading-relaxed mb-6">
              Structured courses, hands-on labs, and real-world projects. From prompt engineering to deploying production ML systems.
            </p>
            <div className="flex gap-8">
              {[
                { n: `${courses.length}+`, l: "Courses" },
                { n: `${(totalStudents / 1000).toFixed(0)}K+`, l: "Students" },
                { n: `${instructors.length}+`, l: "Instructors" },
                { n: "4.8★", l: "Avg Rating" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black text-white">{s.n}</div>
                  <div className="text-[10px] text-white/50 font-medium uppercase tracking-wide">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ═══ CATEGORY BAR ═══ */}
        <section className="py-6 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-50 text-slate-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={14} />
                    {cat.id}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ SEARCH & FILTERS ═══ */}
        <section className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, instructors, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none text-sm transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === f.id
                    ? "bg-purple-100 border border-purple-300 text-purple-700"
                    : "bg-white border border-gray-200 text-slate-500 hover:border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* ═══ COURSE GRID ═══ */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={20} className="text-purple-500" />
              {activeCategory === "All" ? "Trending Courses" : activeCategory}
              <span className="text-sm font-normal text-slate-400">({filteredCourses.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + activeFilter + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredCourses.map((course, idx) => (
                  <CourseCard key={course.id} course={course} index={idx} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && filteredCourses.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-slate-700 font-semibold">No courses found</p>
              <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
            </div>
          )}
        </section>

        {/* ═══ LEARNING PATHS ═══ */}
        {paths.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <BookOpen size={20} className="text-indigo-500" /> Learning Paths
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paths.map((path, idx) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative rounded-2xl bg-gradient-to-br ${path.gradient} p-6 text-white overflow-hidden group cursor-pointer hover:shadow-xl transition-all`}
                >
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2">{path.title}</h3>
                    <p className="text-white/75 text-xs leading-relaxed mb-4">{path.description}</p>
                    <div className="flex gap-4 text-xs text-white/65">
                      <span>{path.course_count} courses</span>
                      <span>{path.total_hours}h total</span>
                      <span>{path.level}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-white group-hover:gap-3 transition-all">
                      Start Path <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ AI MODEL COMPARISON HUB ═══ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Cpu size={20} className="text-cyan-500" /> AI Model Comparison Hub
          </h2>
          <p className="text-sm text-slate-500 mb-5">Compare the latest AI models side-by-side. Understand capabilities, pricing, and use cases.</p>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap gap-2.5">
              {AI_MODELS.map((model) => (
                <motion.button
                  key={model.name}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:shadow-md ${model.color}`}
                >
                  <span className="font-bold">{model.name}</span>
                  <span className="text-[10px] ml-1.5 opacity-60">{model.provider}</span>
                </motion.button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/know-your-ai/compare" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700">
                Compare Models Side-by-Side <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ INSTRUCTOR CTA ═══ */}
        <section className="mb-16">
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-8 md:p-10 overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                  Teach what you know.<br />
                  <span className="bg-gradient-to-r from-amber-300 to-pink-400 bg-clip-text text-transparent">Earn while you sleep.</span>
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-md">
                  Share your AI expertise with {(totalStudents / 1000).toFixed(0)}K+ students. Set your own prices, keep 85% revenue, and get featured on the homepage.
                </p>
                <div className="flex gap-6 mb-6 text-xs text-white/50">
                  <div><span className="text-lg font-bold text-white block">85%</span>Revenue Share</div>
                  <div><span className="text-lg font-bold text-white block">0</span>Upfront Cost</div>
                  <div><span className="text-lg font-bold text-white block">24hr</span>Approval Time</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-amber-300 to-pink-400 hover:shadow-lg transition-all text-sm"
                >
                  <GraduationCap size={16} /> Apply to Teach
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-3 max-w-xs">
                {instructors.slice(0, 6).map((inst) => (
                  <div key={inst.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <img src={inst.avatar_url} alt={inst.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-semibold text-white">{inst.name}</div>
                      <div className="text-[10px] text-white/50">{inst.total_students.toLocaleString()} students</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
