"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Code2, PenTool, FlaskConical, GraduationCap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const tracks = [
  {
    icon: PenTool,
    title: "Prompt Engineering",
    desc: "Learn to write prompts that consistently get the results you want from any AI model.",
    level: "Beginner",
    lessons: 12,
    color: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Code2,
    title: "AI Development",
    desc: "Build AI-powered apps, integrate APIs, and deploy models into real products.",
    level: "Intermediate",
    lessons: 18,
    color: "bg-teal-100 text-teal-600",
    badge: "bg-teal-100 text-teal-700",
  },
  {
    icon: FlaskConical,
    title: "ML Fundamentals",
    desc: "Understand the core machine learning concepts behind modern AI systems.",
    level: "Intermediate",
    lessons: 15,
    color: "bg-green-100 text-green-600",
    badge: "bg-green-100 text-green-700",
  },
  {
    icon: GraduationCap,
    title: "AI for Students",
    desc: "Use AI tools to supercharge your studies, projects, and research papers.",
    level: "Beginner",
    lessons: 8,
    color: "bg-lime-100 text-lime-600",
    badge: "bg-lime-100 text-lime-700",
  },
];

export default function LearningHubPage() {
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
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                Grow Your Skills
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Learning Hub
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            Structured courses, practical labs, and hands-on guides to help you master AI â
            whether you&apos;re a complete beginner or an experienced developer.
          </p>
        </motion.div>

        {/* Track cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {tracks.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${t.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${t.badge}`}>
                    {t.level}
                  </span>
                  <span className="text-xs text-slate-400">{t.lessons} lessons</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">{t.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Coming soon banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-10 text-center"
        >
          <div className="text-4xl mb-4">ð</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Courses Coming Soon</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            We&apos;re building the full course library. Join the waitlist to get early access!
          </p>
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
