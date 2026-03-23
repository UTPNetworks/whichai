"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Brain, BookOpen, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const hubs = [
  {
    id: "marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    label: "Marketplace",
    tagline: "The Hub",
    description:
      "Buy and sell AI prompts, agents, fine-tuned models, GPU compute, and hardware â all in one place.",
    bannerFrom: "#7c3aed",
    bannerTo: "#a78bfa",
    bannerEmojis: ["ð¤", "ð¡", "â¨", "ð§ ", "â¡", "ð", "ð", "ð®"],
    iconBg: "bg-violet-600 text-white",
    border: "border-violet-200 hover:border-violet-400",
    pill: "bg-violet-100 text-violet-700",
    cta: "Enter Marketplace",
    ctaStyle: "bg-violet-600 hover:bg-violet-700 text-white",
    tags: ["Digital Assets", "Compute Hub", "Hardware Corner"],
    stats: [{ val: "15K+", label: "listings" }, { val: "4.8â", label: "avg rating" }, { val: "99%", label: "satisfaction" }],
  },
  {
    id: "know-your-ai",
    href: "/know-your-ai",
    icon: Brain,
    label: "Know Your AI",
    tagline: "Discover & Compare",
    description:
      "Explore, benchmark, and compare AI models across categories. Find the perfect model for your use case.",
    bannerFrom: "#0369a1",
    bannerTo: "#22d3ee",
    bannerEmojis: ["ð¬", "ð", "ð§ª", "ð¡", "ð¯", "ð®", "ð", "ð"],
    iconBg: "bg-cyan-600 text-white",
    border: "border-cyan-200 hover:border-cyan-400",
    pill: "bg-cyan-100 text-cyan-700",
    cta: "Explore AI",
    ctaStyle: "bg-cyan-600 hover:bg-cyan-700 text-white",
    tags: ["Model Explorer", "Benchmarks", "Side-by-Side"],
    stats: [{ val: "200+", label: "models" }, { val: "Live", label: "benchmarks" }, { val: "Daily", label: "updates" }],
  },
  {
    id: "learning-hub",
    href: "/learning-hub",
    icon: BookOpen,
    label: "Learning Hub",
    tagline: "Grow Your Skills",
    description:
      "Courses, guides, and hands-on labs to master prompt engineering, AI development, and ML fundamentals.",
    bannerFrom: "#047857",
    bannerTo: "#34d399",
    bannerEmojis: ["ð", "ð", "ð", "ð»", "ð", "ð", "ð¯", "ð"],
    iconBg: "bg-emerald-600 text-white",
    border: "border-emerald-200 hover:border-emerald-400",
    pill: "bg-emerald-100 text-emerald-700",
    cta: "Start Learning",
    ctaStyle: "bg-emerald-600 hover:bg-emerald-700 text-white",
    tags: ["Prompt Engineering", "AI Courses", "Labs"],
    stats: [{ val: "50+", label: "courses" }, { val: "Hands-on", label: "labs" }, { val: "Free", label: "to start" }],
  },
  {
    id: "ai-task-board",
    href: "/ai-task-board",
    icon: Briefcase,
    label: "AI Task Board",
    tagline: "Get It Built",
    description:
      "Post any AI task â custom LLMs, fine-tuned models, AI agents, chatbots â and get it done by vetted AI developers. Pay only on delivery.",
    bannerFrom: "#b45309",
    bannerTo: "#fbbf24",
    bannerEmojis: ["ð ï¸", "ð¤", "ð¼", "ð§", "âï¸", "ð¯", "ð°", "ð"],
    iconBg: "bg-amber-500 text-white",
    border: "border-amber-200 hover:border-amber-400",
    pill: "bg-amber-100 text-amber-700",
    cta: "Post a Task",
    ctaStyle: "bg-amber-500 hover:bg-amber-600 text-white",
    tags: ["AI Development", "Bounties", "Freelancers"],
    stats: [{ val: "500+", label: "AI devs" }, { val: "48hr", label: "avg delivery" }, { val: "Escrow", label: "protected" }],
  },
];

export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40">
        <Navbar />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-18">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            Welcome to WhichAi.cloud
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Where do you want to go?
          </h1>
          <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
            Your AI journey starts here. Pick a destination below.
          </p>
        </motion.div>

        {/* 4 Hub Cards â 2Ã2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <Link href={hub.href} className="block h-full group">
                  <div
                    className={`relative h-full flex flex-col rounded-2xl border-2 overflow-hidden bg-white transition-all duration-300 cursor-pointer shadow-sm group-hover:shadow-xl ${hub.border}`}
                  >
                    {/* Colorful banner image area */}
                    <div
                      className="relative h-28 flex items-center justify-center overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${hub.bannerFrom}, ${hub.bannerTo})`,
                      }}
                    >
                      {/* Floating emoji decoration */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-3 opacity-20 rotate-[-8deg] scale-125">
                          {hub.bannerEmojis.map((emoji, ei) => (
                            <span key={ei} className="text-3xl select-none">{emoji}</span>
                          ))}
                        </div>
                      </div>
                      {/* Icon circle */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${hub.iconBg}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm`}>
                          {hub.tagline}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5">
                      <h2 className="text-lg font-black text-slate-900 mb-1.5">
                        {hub.label}
                      </h2>
                      <p className="text-slate-500 text-xs leading-relaxed flex-1 mb-4">
                        {hub.description}
                      </p>

                      {/* Stats row */}
                      <div className="flex gap-3 mb-4">
                        {hub.stats.map((stat) => (
                          <div key={stat.label} className="flex flex-col items-center">
                           <span className="text-xs font-bold text-slate-800">{stat.val}</span>
                            <span className="text-[10px] text-slate-400">{stat.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {hub.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${hub.pill}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${hub.ctaStyle}`}
                      >
                        {hub.cta}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-slate-400 text-xs mt-10"
        >
          You can always switch between sections from the navbar.
        </motion.p>
      </main>
    </div>
  );
}
