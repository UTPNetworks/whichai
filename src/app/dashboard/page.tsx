"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  TrendingDown,
  Crown,
  LogOut,
  Copy,
  Check,
  ArrowRight,
  PiggyBank,
  Bookmark,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

const models = [
  {
    name: "Claude 4.6 Opus",
    provider: "Anthropic",
    retail: "$45.00",
    member: "$28.50",
    discount: "37%",
    speed: "42 tok/s",
    context: "1M tokens",
    badge: "Most Capable",
    color: "from-orange-400 to-amber-500",
  },
  {
    name: "GPT-5",
    provider: "OpenAI",
    retail: "$60.00",
    member: "$38.00",
    discount: "37%",
    speed: "55 tok/s",
    context: "512K tokens",
    badge: "Fastest",
    color: "from-emerald-400 to-green-500",
  },
  {
    name: "Gemini 2.5 Ultra",
    provider: "Google",
    retail: "$35.00",
    member: "$21.00",
    discount: "40%",
    speed: "68 tok/s",
    context: "2M tokens",
    badge: "Best Value",
    color: "from-blue-400 to-indigo-500",
  },
  {
    name: "Llama 4 Maverick",
    provider: "Meta",
    retail: "$12.00",
    member: "$6.00",
    discount: "50%",
    speed: "120 tok/s",
    context: "256K tokens",
    badge: "Open Source",
    color: "from-purple-400 to-violet-500",
  },
  {
    name: "Mistral Large 3",
    provider: "Mistral AI",
    retail: "$18.00",
    member: "$10.80",
    discount: "40%",
    speed: "85 tok/s",
    context: "128K tokens",
    badge: "EU Hosted",
    color: "from-cyan-400 to-teal-500",
  },
  {
    name: "Grok 3",
    provider: "xAI",
    retail: "$40.00",
    member: "$26.00",
    discount: "35%",
    speed: "50 tok/s",
    context: "256K tokens",
    badge: "Real-Time Data",
    color: "from-pink-400 to-rose-500",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function APIBrokerButton() {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="relative group p-[2px] rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate animate-glow hover:shadow-[0_0_35px_rgba(192,38,211,0.6)] transition-all duration-300"
    >
      <div className="bg-white rounded-full px-8 py-4 flex items-center gap-3 group-hover:bg-gray-50 transition-all">
        <Zap className="w-5 h-5 text-yellow-500" />
        <span className="text-slate-900 font-bold text-lg tracking-wide">
          GET DISCOUNTED API TOKENS
        </span>
        <span className="text-2xl animate-bounce">⚡</span>
      </div>
    </motion.button>
  );
}

function TokenDisplay() {
  const [copied, setCopied] = useState(false);
  const token = "whai_sk_live_a8f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5";

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-white rounded-2xl p-6 mt-6 border border-gray-200 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-semibold text-yellow-600">
          Your API Key
        </span>
      </div>
      <div className="flex items-center gap-3">
        <code className="flex-1 text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-2.5 font-mono truncate border border-gray-100">
          {token}
        </code>
        <button
          onClick={copyToken}
          className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-gray-100 transition-all"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Rate limit: 10,000 req/min • Includes member discount on all models
      </p>
    </motion.div>
  );
}

const tierColors: Record<string, string> = {
  Free: "text-slate-600 bg-slate-100",
  Student: "text-purple-600 bg-purple-100",
  Pro: "text-yellow-600 bg-yellow-100",
};

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();

  const firstName = profile?.first_name || user?.email?.split("@")[0] || "there";
  const tier = profile?.tier || "Free";
  const savings = profile?.savings_total ?? 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Subtle background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 bg-cyan-100/40 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12 py-8 max-w-7xl mx-auto">
        {/* Personalized Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-2"
          >
            Welcome back, {firstName}! 👋
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <p className="text-slate-500">You are currently a</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${tierColors[tier]}`}
            >
              {tier} Member
            </span>
          </motion.div>

          <APIBrokerButton />
          <TokenDisplay />
        </div>

        {/* Personalized Cards Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {/* Savings Tracker */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <PiggyBank className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900">Savings Tracker</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              ${savings.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total saved with whichai member pricing</p>
          </div>

          {/* Watchlist */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900">Saved Models</h3>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Track your favorite AI models and get notified of price drops.
            </p>
            <Link
              href="/compare"
              className="text-sm text-purple-500 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
            >
              Browse models <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Marketplace Quick Link */}
          <div className="bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900">Marketplace</h3>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Exclusive deals on API tokens, subscriptions, and GPU rentals.
            </p>
            <Link
              href="/marketplace"
              className="text-sm text-purple-500 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
            >
              View deals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Exclusive Member Rates */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-emerald-500" />
                Exclusive Member Rates
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Save up to 50% compared to retail pricing • Per 1M tokens
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model, i) => (
              <motion.div
                key={model.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-xs text-slate-400">{model.provider}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${model.color} text-white`}
                  >
                    {model.badge}
                  </span>
                </div>

                <div className="flex items-end gap-3 mb-3">
                  <span className="text-2xl font-bold text-slate-900">
                    {model.member}
                  </span>
                  <span className="text-sm text-slate-400 line-through mb-0.5">
                    {model.retail}
                  </span>
                  <span className="text-sm font-semibold text-emerald-500 mb-0.5">
                    -{model.discount}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    {model.speed}
                  </span>
                  <span>{model.context}</span>
                </div>

                <button className="mt-4 w-full py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-gray-200 hover:border-purple-300 transition-all flex items-center justify-center gap-2 group/btn">
                  Use Model
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
        >
          {[
            { label: "API Calls Today", value: "12,847", change: "+23%" },
            { label: "Tokens Used", value: "4.2M", change: "+12%" },
            { label: "Money Saved", value: "$1,284", change: "This month" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 text-center border border-gray-200 shadow-sm"
            >
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-emerald-500 mt-1">{stat.change}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
