"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Search,
  Check,
  Minus,
  Zap,
  Brain,
  PenTool,
  Eye,
  DollarSign,
  Code,
  Trophy,
  Loader2,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  getAllProducts,
  formatPrice,
  formatContextWindow,
  type AIProduct,
} from "@/lib/data";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const MAX_COMPARE = 4;

// Distinct theme colors for each slot
const SLOT_THEMES = [
  {
    id: 0,
    name: "Electric Cyan",
    color: "#06b6d4",
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    shadow: "0 0 15px #06b6d4",
  },
  {
    id: 1,
    name: "Neon Purple",
    color: "#a855f7",
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    shadow: "0 0 15px #a855f7",
  },
  {
    id: 2,
    name: "Matrix Green",
    color: "#22c55e",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    shadow: "0 0 15px #22c55e",
  },
  {
    id: 3,
    name: "Warning Amber",
    color: "#f59e0b",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    shadow: "0 0 15px #f59e0b",
  },
];

// Mock metrics for demo (since DB might not have them yet)
const MOCK_SCORES: Record<string, any> = {
  coding: 85,
  reasoning: 90,
  writing: 80,
  speed: 75,
  vision: 88,
  value: 70,
};

function getProductScore(p: AIProduct, key: string) {
  // Real apps would get this from DB. We'll use deterministic random for demo.
  const hash = p.name.length + key.length;
  return 60 + (hash % 35); // Returns 60-95
}

function MetricBar({ 
  label, 
  value, 
  theme, 
  icon: Icon 
}: { 
  label: string; 
  value: number; 
  theme: typeof SLOT_THEMES[0];
  icon: any;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${theme.text}`} />
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
            {label}
          </span>
        </div>
        <span className={`text-xs font-mono font-bold ${theme.text}`}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ backgroundColor: theme.color }}
          className={`h-full rounded-full ${theme.glow}`}
        />
      </div>
    </div>
  );
}

function ProductSelector({
  selected,
  onSelect,
  onRemove,
  index,
  allProducts,
}: {
  selected: AIProduct | null;
  onSelect: (p: AIProduct) => void;
  onRemove: () => void;
  index: number;
  allProducts: AIProduct[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const theme = SLOT_THEMES[index];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.provider.toLowerCase().includes(q)
    );
  }, [query, allProducts]);

  if (selected) {
    return (
      <div className={`relative group p-4 rounded-2xl border ${theme.border} ${theme.bg} backdrop-blur-md transition-all duration-300`}>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/10"
          style={{ backgroundColor: theme.color + "20", color: theme.color }}
        >
          <span className="text-xl font-bold font-mono">
            {selected.name[0]}
          </span>
        </div>
        <h3 className="text-sm font-bold text-white mb-0.5 truncate">{selected.name}</h3>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
          {selected.provider}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => setOpen(!open)}
        className="w-full h-full min-h-[110px] rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-600 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center text-slate-500 group"
      >
        <Plus className="w-6 h-6 mb-2 group-hover:text-slate-300 transition-colors" />
        <span className="text-[10px] uppercase tracking-widest font-bold">Add Model</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-3 bg-[#161B22] border border-slate-800 rounded-xl p-3 z-50 max-h-72 overflow-y-auto shadow-2xl"
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models..."
                autoFocus
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-white transition-colors font-mono">
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate group-hover:text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{p.provider}</p>
                  </div>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">
                Zero matches found.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ComparePage() {
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [selected, setSelected] = useState<(AIProduct | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const prods = await getAllProducts();
      setProducts(prods);
      // Pre-select first two
      setSelected([prods[0] || null, prods[1] || null, null, null]);
      setLoading(false);
    }
    loadData();
  }, []);

  const activeProducts = selected.filter(Boolean) as AIProduct[];

  function setSlot(index: number, product: AIProduct | null) {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = product;
      return next;
    });
  }

  // Prepare radar data
  const radarData = useMemo(() => {
    const metrics = [
      { key: 'coding', label: 'Coding' },
      { key: 'reasoning', label: 'Reasoning' },
      { key: 'writing', label: 'Creative' },
      { key: 'speed', label: 'Speed' },
      { key: 'vision', label: 'Vision' },
      { key: 'value', label: 'Value' },
    ];

    return metrics.map(m => {
      const entry: any = { subject: m.label };
      activeProducts.forEach((p, idx) => {
        entry[`p${idx}`] = getProductScore(p, m.key);
      });
      return entry;
    });
  }, [activeProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
            <p className="text-slate-500 font-mono animate-pulse">INITIALIZING CORE ENGINE...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-200 selection:bg-cyan-500/30">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-4"
          >
            <Zap className="w-3 h-3" />
            V2.0 Side-by-Side Analysis
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            COMPARE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400">INTELLIGENCE</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-mono text-sm">
            Cross-reference benchmarks, pricing, and capabilities across up to {MAX_COMPARE} neural models in real-time.
          </p>
        </header>

        {/* Model Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {selected.map((product, i) => (
            <ProductSelector
              key={i}
              index={i}
              selected={product}
              onSelect={(p) => setSlot(i, p)}
              onRemove={() => setSlot(i, null)}
              allProducts={products}
            />
          ))}
        </div>

        {activeProducts.length > 0 ? (
          <div className="space-y-12">
            {/* Visual Overview Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Radar Chart (Left 2/3 on Desktop) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2 bg-[#161B22] rounded-3xl p-8 border border-slate-800 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Brain className="w-32 h-32 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-cyan-400" />
                  Comparative Strengths
                </h2>
                
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#30363d" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#8b949e', fontSize: 12, fontWeight: 600 }}
                      />
                      {activeProducts.map((p, i) => (
                        <Radar
                          key={p.id}
                          name={p.name}
                          dataKey={`p${i}`}
                          stroke={SLOT_THEMES[i].color}
                          fill={SLOT_THEMES[i].color}
                          fillOpacity={0.2}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Summary Score Cards (Right 1/3) */}
              <div className="space-y-4">
                {activeProducts.map((p, i) => {
                  const theme = SLOT_THEMES[i];
                  const totalScore = Math.round(
                    (getProductScore(p, 'coding') + getProductScore(p, 'reasoning') + getProductScore(p, 'writing')) / 3
                  );
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-[#161B22] rounded-2xl p-6 border ${theme.border} relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono mb-1">Total IQ Score</p>
                          <h3 className="text-xl font-bold text-white truncate">{p.name}</h3>
                        </div>
                        <div className="text-center">
                          <span 
                            className="text-4xl font-black font-mono"
                            style={{ color: theme.color, textShadow: theme.shadow }}
                          >
                            {totalScore}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {activeProducts.length < 2 && (
                  <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-2xl">
                    <p className="text-slate-600 text-center font-mono text-xs uppercase tracking-widest">
                      Select more models to unlock deep metrics
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Detailed Benchmark Bars */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#161B22] rounded-3xl p-6 border border-slate-800"
                >
                  <h3 className={`text-sm font-bold mb-6 font-mono ${SLOT_THEMES[i].text}`}>
                    // {p.name.toUpperCase()}
                  </h3>
                  
                  <MetricBar label="Coding" icon={Code} value={getProductScore(p, 'coding')} theme={SLOT_THEMES[i]} />
                  <MetricBar label="Reasoning" icon={Brain} value={getProductScore(p, 'reasoning')} theme={SLOT_THEMES[i]} />
                  <MetricBar label="Writing" icon={PenTool} value={getProductScore(p, 'writing')} theme={SLOT_THEMES[i]} />
                  <MetricBar label="Vision" icon={Eye} value={getProductScore(p, 'vision')} theme={SLOT_THEMES[i]} />
                  <MetricBar label="Speed" icon={Zap} value={getProductScore(p, 'speed')} theme={SLOT_THEMES[i]} />
                  <MetricBar label="Value" icon={DollarSign} value={getProductScore(p, 'value')} theme={SLOT_THEMES[i]} />
                </motion.div>
              ))}
            </section>

            {/* Specifications Table */}
            <section className="bg-[#161B22] rounded-3xl border border-slate-800 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Full Specifications</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                      <th className="px-8 py-4 font-bold">Attribute</th>
                      {activeProducts.map((p, i) => (
                        <th key={p.id} className={`px-8 py-4 font-bold ${SLOT_THEMES[i].text}`}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 text-slate-400">Provider</td>
                      {activeProducts.map(p => (
                        <td key={p.id} className="px-8 py-4 text-white font-semibold">{p.provider}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 text-slate-400">Monthly Price</td>
                      {activeProducts.map(p => (
                        <td key={p.id} className="px-8 py-4 text-white">{formatPrice(p.base_price_monthly)}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 text-slate-400">Context Window</td>
                      {activeProducts.map(p => (
                        <td key={p.id} className="px-8 py-4 text-white">{formatContextWindow(p.context_window)}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 text-slate-400">Free Tier</td>
                      {activeProducts.map(p => (
                        <td key={p.id} className="px-8 py-4 text-white">{p.free_tier ? 'AVAILABLE' : 'NONE'}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 text-slate-400">Image Gen</td>
                      {activeProducts.map(p => (
                        <td key={p.id} className="px-8 py-4">
                          {p.features.image_gen ? <Check className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-700" />}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 text-slate-400">Voice Mode</td>
                      {activeProducts.map(p => (
                        <td key={p.id} className="px-8 py-4">
                          {p.features.voice ? <Check className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-700" />}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4 text-slate-400">API Access</td>
                      {activeProducts.map(p => (
                        <td key={p.id} className="px-8 py-4">
                          {p.features.api_available ? <Check className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-700" />}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 border-2 border-dashed border-slate-800 rounded-[40px] bg-white/[0.02]"
          >
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Ready for Comparison</h3>
            <p className="text-slate-500 font-mono text-sm mb-8">SELECT AT LEAST ONE MODEL TO INITIALIZE DATA STREAM.</p>
            <div className="flex justify-center gap-4">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
      </main>

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
