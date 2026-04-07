"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Zap, Shield, HardDrive, Wallet, ArrowUpRight, TrendingUp,
  Server, Monitor, Clock, Check, Plus, ShoppingCart, Globe, RefreshCcw,
  BadgeCheck, ExternalLink, ArrowRight, Activity, Database,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── 1. Live Compute Pricing Ticker ──────────────────────────────────
const TICKER_DATA = [
  { model: "NVIDIA H100 80GB", price: "$2.49/hr", trend: "down" },
  { model: "NVIDIA A100 80GB", price: "$1.89/hr", trend: "stable" },
  { model: "NVIDIA A100 40GB", price: "$1.29/hr", trend: "up" },
  { model: "RTX 4090 24GB", price: "$0.45/hr", trend: "down" },
  { model: "RTX 3090 24GB", price: "$0.32/hr", trend: "stable" },
  { model: "L40S 48GB", price: "$1.15/hr", trend: "down" },
];

function PricingTicker() {
  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 py-2.5 overflow-hidden whitespace-nowrap relative z-50">
      <div className="flex animate-marquee gap-12 items-center">
        {[...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
              {item.model}
            </span>
            <span className="text-sm font-bold text-cyan-600 font-mono">
              {item.price}
            </span>
            <span className={`text-[10px] font-bold ${
              item.trend === "up" ? "text-emerald-600" : item.trend === "down" ? "text-rose-600" : "text-slate-400"
            }`}>
              {item.trend === "up" ? "▲" : item.trend === "down" ? "▼" : "–"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. Available Instances Data Grid ───────────────────────────────
const INSTANCES = [
  { id: 1, type: "8x H100 SXM5", provider: "Lambda Cloud", vram: "640GB", ram: "2TB", location: "US-East", price: 19.92, status: "available" },
  { id: 2, type: "1x A100 80GB", provider: "CoreWeave", vram: "80GB", ram: "128GB", location: "EU-West", price: 1.89, status: "available" },
  { id: 3, type: "4x RTX 4090", provider: "P2P Host #821", vram: "96GB", ram: "256GB", location: "CA-Central", price: 1.80, status: "available" },
  { id: 4, type: "1x L40S 48GB", provider: "RunPod", vram: "48GB", ram: "64GB", location: "US-West", price: 1.15, status: "available" },
  { id: 5, type: "1x RTX 3090", provider: "Homelab #042", vram: "24GB", ram: "64GB", location: "US-East", price: 0.35, status: "available" },
];

export default function GPURentalsPage() {
  const [balance, setBalance] = useState(1240.50);

  return (
    <div className="min-h-screen bg-transparent selection:bg-purple-100 dark:selection:bg-purple-900/30">
      <div className="sticky top-0 z-50 backdrop-blur-md">
        <Navbar />
        <PricingTicker />
      </div>

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ── 2. Dual-Path Hero Section (Left Path) ── */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
            
            {/* Rent Path */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 flex flex-col justify-between min-h-[360px] shadow-sm hover:shadow-md transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/[0.03] dark:from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center mb-6">
                  <Cpu className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Scale Your AI</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Rent high-performance compute on-demand. Access H100 clusters, dedicated bare metal, or spot instances for fine-tuning and inference.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['Jupyter Ready', 'Root Access', 'Instant SSH'].map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">{t}</span>
                  ))}
                </div>
              </div>
              <button className="relative z-10 w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm hover:bg-black dark:hover:bg-slate-100 hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                Deploy Instance <ArrowRight size={18} />
              </button>
            </motion.div>

            {/* Host Path */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 flex flex-col justify-between min-h-[360px] shadow-sm hover:shadow-md transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/[0.03] dark:from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center mb-6">
                  <Database className="text-cyan-600 dark:text-cyan-400 w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Monetize Hardware</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Turn your idle GPUs into revenue. From datacenter racks to single-server homelabs, WhichAI provides the orchestration layer for global rentals.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['Zero Commission', 'Daily Payouts', 'P2P Orchestration'].map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-[10px] font-bold text-cyan-600 dark:text-cyan-300 uppercase tracking-wider">{t}</span>
                  ))}
                </div>
              </div>
              <button className="relative z-10 w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm hover:bg-white dark:hover:bg-white/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                Host Your Rig <Plus size={18} />
              </button>
            </motion.div>
          </div>

          {/* ── 4. Compute Credits Wallet Widget ── */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-purple-600">
                <Wallet size={80} className="rotate-12" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">WhichAI Credits</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white font-mono">${balance.toLocaleString()}</h3>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><TrendingUp size={12} /> +12%</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Nodes Active</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">3</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Earned (24h)</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+$12.42</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full py-3 rounded-xl bg-purple-600 text-white text-xs font-black hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Credits
                  </button>
                  <button className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-slate-200 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    <RefreshCcw size={14} /> Auto-Reload Off
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Quick Status */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity size={14} className="text-cyan-600 dark:text-cyan-400" /> Network Status
              </h4>
              <div className="space-y-4">
                {[
                  { l: "Global Capacity", v: "14.2 PFLOPS", c: "text-slate-900 dark:text-white" },
                  { l: "Active Nodes", v: "1,242", c: "text-slate-900 dark:text-white" },
                  { l: "Avg H100 Price", v: "$2.38", c: "text-cyan-600 dark:text-cyan-400" },
                ].map(s => (
                  <div key={s.l} className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">{s.l}</span>
                    <span className={`text-[11px] font-black font-mono ${s.c}`}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 3. Available Instances Data Grid (Full Width below) ── */}
          <div className="lg:col-span-12">
            <div className="rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden shadow-md">
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Server size={20} className="text-purple-600 dark:text-purple-400" /> Available Instances
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Real-time availability across WhichAI Cloud & P2P Network</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Globe size={14} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-purple-500 appearance-none">
                      <option>All Regions</option>
                      <option>US-East</option>
                      <option>EU-West</option>
                      <option>Asia-South</option>
                    </select>
                  </div>
                  <button className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/20">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">GPU Configuration</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">VRAM / RAM</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Region</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Price / HR</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {INSTANCES.map((inst) => (
                      <tr key={inst.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                              <Cpu size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{inst.type}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">{inst.provider}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">{inst.vram} VRAM</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-400">{inst.ram} RAM</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5"><Globe size={14} className="text-slate-300 dark:text-slate-600" /> {inst.location}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-lg font-black text-slate-900 dark:text-white font-mono">${inst.price.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-black hover:bg-purple-700 transition-all shadow-sm">
                            Deploy Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
