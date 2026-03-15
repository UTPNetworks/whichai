"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Search,
  Check,
  Minus,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  getAllProducts,
  getProductTiers,
  formatPrice,
  formatContextWindow,
  type AIProduct,
} from "@/lib/data";

const MAX_COMPARE = 4;

function FeatureCell({ value }: { value: boolean | undefined }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-slate-300 mx-auto" />;
  return <span className="text-slate-300 text-xs">—</span>;
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
      <div className="bg-white rounded-xl p-4 text-center relative group border border-gray-200 shadow-sm">
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center mx-auto mb-2">
          <span className="text-lg font-bold text-slate-800">
            {selected.name[0]}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{selected.name}</h3>
        <p className="text-xs text-slate-400">{selected.provider}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => setOpen(!open)}
        className="w-full bg-white rounded-xl p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all flex flex-col items-center justify-center min-h-[100px] text-slate-400 hover:text-slate-700"
      >
        <Plus className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Add AI Tool</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl p-3 z-50 max-h-60 overflow-y-auto border border-gray-200 shadow-lg"
          >
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-gray-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400"
              />
            </div>
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                  {p.name[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.provider}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-3">
                No tools found
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
      // Default: pre-select first two
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

  const comparisonRows = [
    {
      label: "Price (Monthly)",
      getValue: (p: AIProduct) => formatPrice(p.base_price_monthly),
    },
    {
      label: "Price (Annual)",
      getValue: (p: AIProduct) =>
        p.base_price_annual === null
          ? "Contact Sales"
          : p.base_price_annual === 0
          ? "Free"
          : `$${p.base_price_annual.toFixed(2)}/yr`,
    },
    {
      label: "Student Discount",
      getValue: (p: AIProduct) =>
        p.student_discount_pct > 0 ? `${p.student_discount_pct}%` : "None",
    },
    {
      label: "Context Window",
      getValue: (p: AIProduct) => formatContextWindow(p.context_window),
    },
    {
      label: "Free Tier",
      getValue: (p: AIProduct) => (p.free_tier ? "Yes" : "No"),
    },
  ];

  const featureRows = [
    { label: "Image Generation", key: "image_gen" },
    { label: "Voice", key: "voice" },
    { label: "Vision", key: "vision" },
    { label: "Code Interpreter", key: "code_interpreter" },
    { label: "Web Browsing", key: "web_browsing" },
    { label: "API Available", key: "api_available" },
    { label: "File Upload", key: "file_upload" },
    { label: "Plugins", key: "plugins" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-100/40 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10 px-6 md:px-12 pb-20 max-w-[1200px] mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Compare AI Tools
          </h1>
          <p className="text-slate-500">
            Select up to {MAX_COMPARE} tools to compare side-by-side
          </p>
        </motion.div>

        {/* Selectors */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

        {activeProducts.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Comparison table */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-5 py-4 text-sm font-semibold text-slate-500 w-48">
                        Feature
                      </th>
                      {activeProducts.map((p) => (
                        <th
                          key={p.id}
                          className="text-center px-4 py-4 text-sm font-semibold text-slate-900"
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Pricing rows */}
                    {comparisonRows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3 text-sm text-slate-500">
                          {row.label}
                        </td>
                        {activeProducts.map((p) => (
                          <td
                            key={p.id}
                            className="text-center px-4 py-3 text-sm text-slate-900"
                          >
                            {row.getValue(p)}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Spacer */}
                    <tr>
                      <td
                        colSpan={activeProducts.length + 1}
                        className="px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50"
                      >
                        Capabilities
                      </td>
                    </tr>

                    {/* Feature rows */}
                    {featureRows.map((row) => (
                      <tr
                        key={row.key}
                        className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3 text-sm text-slate-500">
                          {row.label}
                        </td>
                        {activeProducts.map((p) => (
                          <td key={p.id} className="text-center px-4 py-3">
                            <FeatureCell
                              value={p.features[row.key] as boolean | undefined}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Hidden caps */}
                    <tr>
                      <td
                        colSpan={activeProducts.length + 1}
                        className="px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50"
                      >
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Hidden Caps & Gotchas
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-5 py-3 text-sm text-slate-500">
                        Gotchas
                      </td>
                      {activeProducts.map((p) => (
                        <td
                          key={p.id}
                          className="px-4 py-3 text-xs text-slate-500 leading-relaxed"
                        >
                          {p.hidden_caps || "None noted"}
                        </td>
                      ))}
                    </tr>

                    {/* View details links */}
                    <tr>
                      <td className="px-5 py-4" />
                      {activeProducts.map((p) => (
                        <td key={p.id} className="px-4 py-4 text-center">
                          <Link
                            href={`/product/${p.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-purple-500 hover:text-purple-700 transition-colors"
                          >
                            Full details
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeProducts.length < 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-slate-400"
          >
            <p className="text-lg">Select at least 2 AI tools to start comparing</p>
            <p className="text-sm mt-1">
              Click the &quot;+&quot; buttons above to add tools
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
