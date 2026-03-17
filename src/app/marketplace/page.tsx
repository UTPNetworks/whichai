"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Store, Tag, ArrowRight, Cpu, Key, MessageSquare, Flame,
  GraduationCap, Star, Clock, ExternalLink, Sparkles, Loader2,
  Code2, Eye, Mic, Image, Globe, Zap, BadgeCheck, ChevronRight,
  Brain, Monitor, X, Upload, DollarSign, FileText, CheckCircle2,
  Filter, Search, ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import {
  marketplaceDeals, marketplaceCategories, getDiscountPct,
  getAllProducts, formatPrice, allListings, getListingsByCategory,
  type MarketplaceCategory, type MarketplaceDeal, type AIProduct,
  type MarketplaceListing, type BigCategory,
} from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";

// ── Types ─────────────────────────────────────────────────────
type BigTab = "all" | BigCategory;

// ── Constants ─────────────────────────────────────────────────
const BIG_TABS = [
  { value: "all" as BigTab, label: "All Listings", icon: Sparkles },
  { value: "digital-assets" as BigTab, label: "Digital Assets", icon: Brain },
  { value: "compute-hub" as BigTab, label: "Compute Hub", icon: Cpu },
  { value: "hardware-corner" as BigTab, label: "Hardware Corner", icon: Monitor },
];

const catBadgeStyle: Record<string, string> = {
  "digital-assets": "bg-purple-100 text-purple-700",
  "compute-hub": "bg-cyan-100 text-cyan-700",
  "hardware-corner": "bg-emerald-100 text-emerald-700",
};
const catBadgeLabel: Record<string, string> = {
  "digital-assets": "Digital Asset",
  "compute-hub": "Compute Hub",
  "hardware-corner": "Hardware",
};
const listingBadgeGradients: Record<string, string> = {
  Bestseller: "from-amber-400 to-orange-500",
  Verified: "from-emerald-400 to-teal-500",
  Hot: "from-red-400 to-orange-500",
  Student: "from-violet-400 to-purple-500",
  "Best Value": "from-emerald-400 to-green-500",
  "Verified HW": "from-blue-400 to-indigo-500",
  "Certified Refurb": "from-blue-400 to-cyan-500",
  Professional: "from-slate-500 to-slate-600",
  Popular: "from-pink-400 to-rose-500",
  New: "from-cyan-400 to-blue-500",
};
const categoryIcons: Record<MarketplaceCategory, typeof Key> = {
  "api-tokens": Key,
  "llm-subscriptions": MessageSquare,
  "gpu-deals": Cpu,
};
const badgeStyles: Record<string, string> = {
  "Hot Deal": "from-red-500 to-orange-500",
  Popular: "from-purple-500 to-pink-500",
  New: "from-cyan-500 to-blue-500",
  "Student Special": "from-violet-500 to-purple-500",
  "Best Value": "from-emerald-500 to-green-500",
  "Team Deal": "from-blue-500 to-indigo-500",
  Limited: "from-amber-500 to-yellow-500",
  "Budget Pick": "from-teal-500 to-cyan-500",
};
const providerInitials: Record<string, { letter: string; bg: string }> = {
  OpenAI: { letter: "O", bg: "from-green-400 to-emerald-500" },
  Anthropic: { letter: "A", bg: "from-orange-400 to-amber-500" },
  Google: { letter: "G", bg: "from-blue-400 to-indigo-500" },
  "Google Cloud": { letter: "G", bg: "from-blue-400 to-cyan-500" },
  Mistral: { letter: "M", bg: "from-purple-400 to-violet-500" },
  "Lambda Cloud": { letter: "λ", bg: "from-pink-400 to-rose-500" },
  CoreWeave: { letter: "C", bg: "from-cyan-400 to-teal-500" },
  RunPod: { letter: "R", bg: "from-indigo-400 to-blue-500" },
};
const TOOL_CATEGORIES = [
  { value: "all", label: "All Tools", Icon: Sparkles },
  { value: "code", label: "Code", Icon: Code2 },
  { value: "vision", label: "Vision", Icon: Eye },
  { value: "voice", label: "Voice", Icon: Mic },
  { value: "image", label: "Image Gen", Icon: Image },
  { value: "chatbot", label: "Chat", Icon: Globe },
  { value: "multimodal", label: "Multimodal", Icon: Zap },
];

// ── Listing Card (new v2) ──────────────────────────────────────
function ListingCard({ listing, index }: { listing: MarketplaceListing; index: number }) {
  const discountPct = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="relative bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300 flex flex-col group"
    >
      {discountPct && (
        <div className="absolute -top-2.5 -right-2.5 z-10 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
          -{discountPct}%
        </div>
      )}

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${catBadgeStyle[listing.bigCategory]}`}>
          {catBadgeLabel[listing.bigCategory]}
        </span>
        {listing.badge && (
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold text-white bg-gradient-to-r ${listingBadgeGradients[listing.badge] ?? "from-slate-400 to-slate-500"}`}>
            {listing.badge}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 mb-2">
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${catBadgeStyle[listing.bigCategory]}`}>
          {listing.bigCategory === "digital-assets" && <Brain className="w-5 h-5" />}
          {listing.bigCategory === "compute-hub" && <Cpu className="w-5 h-5" />}
          {listing.bigCategory === "hardware-corner" && <Monitor className="w-5 h-5" />}
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
          {listing.name}
        </h3>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">{listing.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {listing.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between py-2.5 border-t border-b border-gray-100 mb-3">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-slate-700">{listing.seller.name}</span>
            {listing.seller.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={`w-3 h-3 ${n <= Math.floor(listing.seller.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
            ))}
            <span className="text-[10px] text-slate-400 ml-1">{listing.seller.rating.toFixed(1)}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400">{listing.seller.reviews} reviews</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl font-black text-slate-900">${listing.price.toFixed(2)}</span>
          <span className="text-xs text-slate-400 ml-1">{listing.unit}</span>
          {listing.originalPrice && (
            <div className="text-[11px] text-slate-400 line-through">${listing.originalPrice.toFixed(2)}</div>
          )}
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all">
          {listing.bigCategory === "hardware-corner" ? "Buy Now" : listing.bigCategory === "compute-hub" ? "Rent / Buy" : "Get It"}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Deal Card (existing) ──────────────────────────────────────
function DealCard({ deal, index }: { deal: MarketplaceDeal; index: number }) {
  const discountPct = getDiscountPct(deal.original_price, deal.discounted_price);
  const provider = providerInitials[deal.provider] || { letter: deal.provider[0], bg: "from-slate-400 to-slate-500" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`relative bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col ${deal.featured ? "border-purple-200" : "border-gray-200 hover:border-purple-200"}`}
    >
      <div className="absolute -top-2.5 -right-2.5 z-10">
        <div className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">-{discountPct}%</div>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${provider.bg} flex items-center justify-center text-white font-bold text-lg shrink-0 group-hover:scale-110 transition-transform`}>
          {provider.letter}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-purple-600 transition-colors">{deal.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{deal.provider}</p>
        </div>
      </div>

      {deal.badge && (
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${badgeStyles[deal.badge] || "from-slate-400 to-slate-500"}`}>
            {deal.badge === "Hot Deal" && <Flame className="w-3 h-3" />}
            {deal.badge === "Student Special" && <GraduationCap className="w-3 h-3" />}
            {deal.badge === "Best Value" && <Star className="w-3 h-3" />}
            {deal.badge === "Limited" && <Clock className="w-3 h-3" />}
            {deal.badge}
          </span>
        </div>
      )}

      <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">{deal.description}</p>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-2xl font-bold text-slate-900">${deal.discounted_price.toFixed(2)}</span>
        <span className="text-sm text-slate-400 line-through mb-0.5">${deal.original_price.toFixed(2)}</span>
        <span className="text-xs text-slate-400 mb-0.5">{deal.unit}</span>
      </div>

      <a href={deal.claim_url} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all group/btn">
        {deal.category === "gpu-deals" ? "Rent Now" : "Claim Discount"}
        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </a>
    </motion.div>
  );
}

// ── Tool Card ─────────────────────────────────────────────────
function ToolCard({ product, index }: { product: AIProduct; index: number }) {
  const featureKeys = ["vision", "voice", "image_gen", "code_interpreter", "web_browsing", "api_available"];
  const activeFeatures = featureKeys.filter((k) => product.features[k] === true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all duration-300 group flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-slate-800 font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
          {product.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-purple-600 transition-colors">{product.name}</h3>
          <p className="text-[11px] text-slate-400">{product.provider}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize shrink-0">{product.category}</span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">{product.description}</p>

      {activeFeatures.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {activeFeatures.slice(0, 4).map((f) => (
            <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
              {f.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm font-bold text-slate-900">{formatPrice(product.base_price_monthly)}</span>
        <Link href={`/product/${product.slug}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all">
          View Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Sell Modal ────────────────────────────────────────────────
const SELL_CATEGORIES = [
  { value: "digital-assets", label: "Digital Assets", icon: Brain, desc: "Prompts, agents, fine-tuned models, LoRAs" },
  { value: "compute-hub", label: "Compute Hub", icon: Cpu, desc: "GPU rentals, API credits, subscriptions" },
  { value: "hardware-corner", label: "Hardware Corner", icon: Monitor, desc: "Used GPUs, AI kits, laptops" },
];

function SellModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState("");
  const [formData, setFormData] = useState({ name: "", description: "", price: "", unit: "one-time" });
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full relative text-center shadow-2xl">
          <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to sell</h2>
          <p className="text-slate-500 text-sm mb-6">You need an account to list items on whichai.</p>
          <Link href="/auth/signup" onClick={onClose}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full relative shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <motion.div className="h-1 bg-gradient-to-r from-purple-500 to-cyan-500" animate={{ width: submitted ? "100%" : `${(step / 3) * 100}%` }} />
        </div>

        <div className="p-7">
          <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {submitted ? (
            <div className="text-center py-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Listing Submitted!</h2>
              <p className="text-slate-500 text-sm mb-2">Our team will review <strong>{formData.name}</strong> within 24 hours.</p>
              <p className="text-xs text-slate-400 mb-6">You&apos;ll receive an email at <span className="font-medium text-slate-600">{user.email}</span> once it&apos;s live.</p>
              <button onClick={onClose}
                className="px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all">
                Done
              </button>
            </div>
          ) : step === 1 ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Upload className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-bold text-slate-900">List Your Item</h2>
              </div>
              <p className="text-slate-400 text-sm mb-6">Step 1 of 3 — Choose a category</p>
              <div className="space-y-3">
                {SELL_CATEGORIES.map((cat) => (
                  <button key={cat.value} onClick={() => setSelectedCat(cat.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedCat === cat.value ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-200"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catBadgeStyle[cat.value] || "bg-slate-100 text-slate-600"}`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{cat.label}</div>
                      <div className="text-xs text-slate-400">{cat.desc}</div>
                    </div>
                    {selectedCat === cat.value && <CheckCircle2 className="w-5 h-5 text-purple-500 ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
              <button disabled={!selectedCat} onClick={() => setStep(2)}
                className="mt-6 w-full py-3 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : step === 2 ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-bold text-slate-900">Item Details</h2>
              </div>
              <p className="text-slate-400 text-sm mb-6">Step 2 of 3 — Describe what you&apos;re selling</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ultimate Marketing Prompt Bundle" maxLength={80}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what buyers get, how it works, and why it's valuable..." rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="29.00" type="number" min="0"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit</label>
                    <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm bg-white transition-all">
                      <option value="one-time">One-time</option>
                      <option value="/mo">Per month</option>
                      <option value="/hr">Per hour</option>
                      <option value="/yr">Per year</option>
                      <option value="each">Each</option>
                      <option value="bundle">Bundle</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-full font-semibold text-slate-600 border-2 border-gray-200 hover:border-purple-200 transition-all">
                  Back
                </button>
                <button disabled={!formData.name || !formData.description || !formData.price}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-bold text-slate-900">Review & Submit</h2>
              </div>
              <p className="text-slate-400 text-sm mb-6">Step 3 of 3 — Confirm your listing</p>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Category</span>
                  <span className="font-semibold text-slate-900 capitalize">{selectedCat.replace(/-/g, " ")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{formData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Price</span>
                  <span className="font-semibold text-emerald-600">${formData.price} {formData.unit}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Description</span>
                  <p className="text-slate-700 mt-1 text-xs line-clamp-3">{formData.description}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-5 text-center">
                By submitting, you agree to our{" "}
                <span className="text-purple-500 cursor-pointer">Seller Terms</span>. Listings go live after a 24-hour review.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-full font-semibold text-slate-600 border-2 border-gray-200 hover:border-purple-200 transition-all">
                  Back
                </button>
                <button onClick={() => setSubmitted(true)}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  Submit Listing
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MarketplacePage() {
  const { user } = useAuth();
  const [bigTab, setBigTab] = useState<BigTab>("all");
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | null>(null);
  const [toolFilter, setToolFilter] = useState("all");
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [showSellModal, setShowSellModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getAllProducts().then((prods) => { setProducts(prods); setLoadingTools(false); });
  }, []);

  // Filter v2 listings
  const displayedListings = (() => {
    let list = bigTab === "all" ? allListings : getListingsByCategory(bigTab as BigCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  })();

  // Existing deals filter
  const filteredDeals = activeCategory ? marketplaceDeals.filter((d) => d.category === activeCategory) : marketplaceDeals;
  const sortedDeals = [...filteredDeals].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  // Existing tools filter
  const filteredTools = toolFilter === "all"
    ? products
    : products.filter((p) => {
        if (toolFilter === "voice") return p.features.voice === true;
        if (toolFilter === "vision") return p.features.vision === true;
        return p.category === toolFilter;
      });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-sm">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-0">

        {/* ── Hero header ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl mt-6 mb-8 bg-gradient-to-br from-[#05050f] via-[#0d0520] to-[#050515] p-px">
          <div className="rounded-2xl px-8 py-10 md:py-14">
            {/* Dot grid overlay */}
            <div className="absolute inset-0 rounded-2xl opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
                  <Store className="w-3.5 h-3.5" /> World&apos;s First AI Marketplace
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                  The AI{" "}
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Marketplace
                  </span>
                </h1>
                <p className="text-slate-400 text-sm max-w-lg">
                  Buy prompts, rent GPUs, sell agents, and discover hardware — all in one place.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowSellModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 animate-pulse-slow"
                >
                  <Upload className="w-4 h-4" /> List Your Item
                </button>
                <Link href="/" className="hidden md:flex items-center gap-1 px-5 py-3 rounded-full font-semibold text-slate-300 border border-white/10 hover:border-white/30 transition-all text-sm">
                  <ShoppingBag className="w-4 h-4" /> Buy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search bar ──────────────────────────────────────── */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings — prompts, GPUs, agents, hardware..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm shadow-sm transition-all"
          />
        </div>

        {/* ── Big category tabs ────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {BIG_TABS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setBigTab(value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${bigTab === value ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-gray-200 hover:border-purple-200 hover:text-slate-900"}`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            {displayedListings.length} listing{displayedListings.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* ── v2 Listings Grid ────────────────────────────────── */}
        <motion.section className="mb-14">
          <AnimatePresence mode="wait">
            <motion.div key={bigTab + searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedListings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {displayedListings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No listings found.</p>
              <p className="text-slate-400 text-sm mt-1">Try a different search or category.</p>
            </div>
          )}
        </motion.section>

        {/* ── AI Tools Section ────────────────────────────────── */}
        {(bigTab === "all" || bigTab === "digital-assets") && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold text-slate-900">AI Tools Directory</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {TOOL_CATEGORIES.map(({ value, label, Icon }) => (
                <button key={value} onClick={() => setToolFilter(value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${toolFilter === value ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-gray-200 hover:border-purple-200 hover:text-slate-900"}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
            {loadingTools ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={toolFilter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTools.map((product, i) => (
                    <ToolCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.section>
        )}

        {/* ── Exclusive Deals Section ──────────────────────────── */}
        {(bigTab === "all" || bigTab === "compute-hub") && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900">Exclusive Deals</h2>
            </div>
            <p className="text-slate-500 text-sm mb-5">Discounted API tokens, subscriptions, and GPU rentals — curated for developers, researchers, and teams.</p>

            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setActiveCategory(null)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === null ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-gray-200 hover:border-purple-200"}`}>
                All Deals
              </button>
              {marketplaceCategories.map((cat) => {
                const Icon = categoryIcons[cat.value];
                return (
                  <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.value ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-gray-200 hover:border-purple-200"}`}>
                    <Icon className="w-4 h-4" /> {cat.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeCategory || "all"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {sortedDeals.map((deal, i) => (
                  <DealCard key={deal.id} deal={deal} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.section>
        )}

        {/* ── Bottom CTA ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.2 }} className="mt-8 mb-12 text-center">
          <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
            <div className="bg-white rounded-2xl px-8 py-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Have something to sell?</h3>
              <p className="text-sm text-slate-500 mb-4">
                Join 6,400+ sellers on the world&apos;s first AI marketplace. Free to list, 0% fee on your first 3 sales.
              </p>
              <button onClick={() => setShowSellModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
                <Upload className="w-4 h-4" /> List Your Item Free
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Sell Modal */}
      <AnimatePresence>
        {showSellModal && <SellModal onClose={() => setShowSellModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
