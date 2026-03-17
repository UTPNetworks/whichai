"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Star, BadgeCheck, ChevronRight,
  Brain, Cpu, Monitor, Sparkles, Flame, Tag, X, Plus,
  ArrowUpDown, Grid3X3, List, Heart, Share2, Eye,
  TrendingUp, Clock, ShieldCheck, Zap, Package,
  MessageCircle, BookOpen, GraduationCap, Filter,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";

// ── Types ─────────────────────────────────────────────────────
type BigCategory = "all" | "digital-assets" | "compute-hub" | "hardware-corner";
type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest" | "discount";
type ViewMode = "grid" | "list";

interface Listing {
  id: string;
  name: string;
  description: string;
  bigCategory: BigCategory;
  subCategory: string;
  badge?: string;
  tags: string[];
  price: number;
  originalPrice?: number;
  unit: string;
  seller: { name: string; verified: boolean; rating: number; reviews: number; avatar: string };
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  views: number;
  saves: number;
  postedAt: string;
  color: string; // gradient for avatar
}

// ── Rich Mock Data ─────────────────────────────────────────────
const LISTINGS: Listing[] = [
  // Digital Assets
  { id: "1", name: "Ultimate ChatGPT Prompt Bundle", description: "500+ battle-tested system prompts for marketing, coding, legal, and creative tasks. Organized by use case with usage examples and chaining guides.", bigCategory: "digital-assets", subCategory: "Prompts", badge: "Bestseller", tags: ["GPT-4", "prompts", "productivity", "marketing"], price: 29, originalPrice: 49, unit: "one-time", seller: { name: "PromptMaster_Jay", verified: true, rating: 4.9, reviews: 312, avatar: "PM" }, featured: true, trending: true, views: 8420, saves: 934, postedAt: "2 days ago", color: "from-violet-500 to-purple-600" },
  { id: "2", name: "Legal Assistant GPT Agent", description: "Specialized AI agent trained on US contract law. Drafts NDAs, reviews clauses, explains legal jargon in plain English.", bigCategory: "digital-assets", subCategory: "Agents", badge: "Verified", tags: ["legal", "agent", "GPT-4", "contracts"], price: 49, unit: "/mo", seller: { name: "LexTech_AI", verified: true, rating: 4.7, reviews: 88, avatar: "LT" }, views: 3210, saves: 421, postedAt: "5 days ago", color: "from-blue-500 to-indigo-600" },
  { id: "3", name: "NRI Tax Bot — Indian Expats (US)", description: "AI assistant specialized in DTAA, FEMA compliance, and NRI investment rules. Answers tax questions for Indians in the US.", bigCategory: "digital-assets", subCategory: "Agents", badge: "Popular", tags: ["tax", "NRI", "India", "finance"], price: 39, unit: "/mo", seller: { name: "NRIFinance_Pro", verified: true, rating: 4.9, reviews: 156, avatar: "NF" }, trending: true, views: 5670, saves: 712, postedAt: "1 week ago", color: "from-orange-500 to-amber-600" },
  { id: "4", name: "Stable Diffusion XL LoRA — Anime Style", description: "High-quality LoRA fine-tune for SDXL producing consistent anime-style characters. Includes 12 trigger words and usage guide.", bigCategory: "digital-assets", subCategory: "LoRAs", badge: "Hot", tags: ["SDXL", "LoRA", "anime", "image-gen"], price: 19, originalPrice: 35, unit: "one-time", seller: { name: "ArtForge_AI", verified: false, rating: 4.6, reviews: 203, avatar: "AF" }, views: 9100, saves: 1203, postedAt: "3 days ago", color: "from-pink-500 to-rose-600" },
  { id: "5", name: "Code Review Agent — Python & JS", description: "Autonomous agent that reviews PRs, suggests refactors, catches security issues, and writes test cases. Integrates with GitHub.", bigCategory: "digital-assets", subCategory: "Agents", badge: "New", tags: ["code", "Python", "JavaScript", "DevOps"], price: 59, unit: "/mo", seller: { name: "DevBot_Labs", verified: true, rating: 4.8, reviews: 74, avatar: "DB" }, isNew: true, views: 2340, saves: 387, postedAt: "1 day ago", color: "from-cyan-500 to-blue-600" },
  { id: "6", name: "E-Commerce Product Description Writer", description: "Fine-tuned model that generates SEO-optimized product descriptions in 12 languages. Shopify & WooCommerce ready.", bigCategory: "digital-assets", subCategory: "Fine-tuned Models", tags: ["e-commerce", "SEO", "copywriting", "multilingual"], price: 79, unit: "/mo", seller: { name: "CopyAI_Pro", verified: true, rating: 4.5, reviews: 129, avatar: "CA" }, views: 4120, saves: 534, postedAt: "2 weeks ago", color: "from-emerald-500 to-teal-600" },
  { id: "7", name: "Medical Triage Prompt System", description: "HIPAA-aware prompt system for healthcare intake. Triages symptoms, flags urgency, and generates structured clinical notes.", bigCategory: "digital-assets", subCategory: "Prompts", badge: "Verified", tags: ["healthcare", "medical", "HIPAA", "clinical"], price: 149, unit: "one-time", seller: { name: "MedPrompt_MD", verified: true, rating: 5.0, reviews: 41, avatar: "MP" }, views: 1890, saves: 298, postedAt: "3 weeks ago", color: "from-red-500 to-rose-600" },
  { id: "8", name: "Midjourney Prompt Masterclass Pack", description: "2,000+ curated Midjourney v6 prompts across 40 styles. Includes architecture, fashion, product photography, and abstract art.", bigCategory: "digital-assets", subCategory: "Prompts", tags: ["Midjourney", "image-gen", "art", "design"], price: 24, originalPrice: 40, unit: "one-time", seller: { name: "VisualAI_Studio", verified: false, rating: 4.4, reviews: 445, avatar: "VS" }, views: 12300, saves: 1876, postedAt: "1 month ago", color: "from-fuchsia-500 to-purple-600" },

  // Compute Hub
  { id: "9", name: "RTX 4090 — On-Demand Rental", description: "Idle RTX 4090 24GB VRAM for rent. ~180 TFLOPS FP16. Great for inference, image gen, and LoRA training. Available 9am–9pm PST.", bigCategory: "compute-hub", subCategory: "GPU Rentals", badge: "Hot", tags: ["RTX 4090", "GPU", "rental", "inference"], price: 4.20, originalPrice: 5.50, unit: "/hr", seller: { name: "TechFarm_TX", verified: true, rating: 4.9, reviews: 428, avatar: "TF" }, featured: true, trending: true, views: 15600, saves: 2341, postedAt: "Ongoing", color: "from-green-500 to-emerald-600" },
  { id: "10", name: "OpenAI API Credits — $100 Bundle", description: "Excess OpenAI API credits from a startup plan. Valid for GPT-4o, o3, DALL-E 3, and Whisper. Transfer via org invite.", bigCategory: "compute-hub", subCategory: "API Credits", tags: ["OpenAI", "credits", "API", "GPT-4o"], price: 88, originalPrice: 100, unit: "bundle", seller: { name: "StartupTokens", verified: true, rating: 4.8, reviews: 93, avatar: "ST" }, views: 7820, saves: 1102, postedAt: "4 days ago", color: "from-slate-600 to-slate-700" },
  { id: "11", name: "Gemini Advanced — Group Buy", description: "Shared-seat access to Gemini 2.5 Ultra. 2M context window, Google ecosystem, Gems feature. Pay monthly, cancel anytime.", bigCategory: "compute-hub", subCategory: "Subscriptions", badge: "Best Value", tags: ["Gemini", "Google", "subscription", "2M context"], price: 12.50, originalPrice: 20, unit: "/mo", seller: { name: "AIDeals_Pro", verified: true, rating: 4.7, reviews: 178, avatar: "AD" }, views: 9450, saves: 1567, postedAt: "2 weeks ago", color: "from-blue-500 to-cyan-600" },
  { id: "12", name: "H100 80GB — Batch Training Slots", description: "NVIDIA H100 SXM5 80GB available for batch training jobs. 3.35 TFLOPS FP8. Ideal for fine-tuning LLaMA, Mistral, or custom models.", bigCategory: "compute-hub", subCategory: "GPU Rentals", badge: "Professional", tags: ["H100", "training", "fine-tuning", "enterprise"], price: 2.89, unit: "/hr", seller: { name: "CloudGPU_Elite", verified: true, rating: 4.6, reviews: 67, avatar: "CG" }, views: 4230, saves: 678, postedAt: "1 week ago", color: "from-indigo-500 to-violet-600" },
  { id: "13", name: "Anthropic Claude Pro — Student Seat", description: "Verified student seat on Claude Pro plan. 5× usage, Projects, extended context. Requires .edu email verification.", bigCategory: "compute-hub", subCategory: "Subscriptions", badge: "Student", tags: ["Claude", "Anthropic", "student", "Pro"], price: 9, originalPrice: 20, unit: "/mo", seller: { name: "EduAI_Hub", verified: true, rating: 4.9, reviews: 312, avatar: "EA" }, views: 18900, saves: 3421, postedAt: "Ongoing", color: "from-orange-500 to-red-600" },
  { id: "14", name: "Perplexity Pro Group — 4 Seats", description: "Split a Perplexity Pro team plan across 4 users. Unlimited searches, GPT-4o & Claude access, file uploads.", bigCategory: "compute-hub", subCategory: "Subscriptions", tags: ["Perplexity", "search", "group-buy", "Pro"], price: 5, originalPrice: 20, unit: "/mo", seller: { name: "SharedAI_Plans", verified: false, rating: 4.3, reviews: 89, avatar: "SA" }, views: 6780, saves: 923, postedAt: "3 days ago", color: "from-teal-500 to-cyan-600" },

  // Hardware Corner
  { id: "15", name: "NVIDIA RTX 3090 Ti — Used, Excellent", description: "Lightly used RTX 3090 Ti 24GB. 2,000 hours runtime. Tested at 98% performance. Includes original box and warranty transfer.", bigCategory: "hardware-corner", subCategory: "Used GPUs", badge: "Verified HW", tags: ["RTX 3090 Ti", "GPU", "used", "24GB"], price: 750, originalPrice: 1200, unit: "one-time", seller: { name: "HardwarePro_SJ", verified: true, rating: 4.8, reviews: 156, avatar: "HP" }, featured: true, views: 11200, saves: 1893, postedAt: "1 week ago", color: "from-green-600 to-emerald-700" },
  { id: "16", name: "Jetson Orin NX — AI Edge Kit", description: "NVIDIA Jetson Orin NX 16GB. 100 TOPS AI performance. Pre-flashed with JetPack 6. Perfect for robotics and edge inference.", bigCategory: "hardware-corner", subCategory: "AI Kits", badge: "New", tags: ["Jetson", "edge AI", "robotics", "NVIDIA"], price: 499, unit: "one-time", seller: { name: "EdgeAI_Store", verified: true, rating: 4.7, reviews: 43, avatar: "ES" }, isNew: true, views: 3450, saves: 567, postedAt: "5 days ago", color: "from-blue-600 to-indigo-700" },
  { id: "17", name: "AI Workstation — RTX 4080 + i9-14900K", description: "Pre-built AI workstation. RTX 4080 16GB, Intel i9-14900K, 64GB DDR5, 4TB NVMe. Pre-installed with CUDA, PyTorch, and Ollama.", bigCategory: "hardware-corner", subCategory: "Laptops & Servers", badge: "Certified Refurb", tags: ["workstation", "RTX 4080", "i9", "PyTorch"], price: 2800, originalPrice: 3800, unit: "one-time", seller: { name: "AIBuilds_Pro", verified: true, rating: 4.9, reviews: 28, avatar: "AB" }, views: 7890, saves: 1234, postedAt: "2 weeks ago", color: "from-slate-600 to-gray-700" },
  { id: "18", name: "AMD RX 7900 XTX — ROCm Ready", description: "AMD RX 7900 XTX 24GB. Tested with ROCm 6.0, PyTorch, and Stable Diffusion. Great Linux-compatible alternative to NVIDIA.", bigCategory: "hardware-corner", subCategory: "Used GPUs", tags: ["AMD", "ROCm", "7900 XTX", "Linux"], price: 680, originalPrice: 950, unit: "one-time", seller: { name: "OpenSource_HW", verified: false, rating: 4.5, reviews: 72, avatar: "OS" }, views: 5670, saves: 834, postedAt: "3 days ago", color: "from-red-600 to-orange-700" },
];

// ── Category Config ────────────────────────────────────────────
const CATEGORIES = [
  { value: "all" as BigCategory, label: "All Listings", icon: Sparkles, color: "from-violet-500 to-purple-600", count: LISTINGS.length },
  { value: "digital-assets" as BigCategory, label: "Digital Assets", icon: Brain, color: "from-purple-500 to-fuchsia-600", count: LISTINGS.filter(l => l.bigCategory === "digital-assets").length },
  { value: "compute-hub" as BigCategory, label: "Compute Hub", icon: Cpu, color: "from-cyan-500 to-blue-600", count: LISTINGS.filter(l => l.bigCategory === "compute-hub").length },
  { value: "hardware-corner" as BigCategory, label: "Hardware Corner", icon: Monitor, color: "from-emerald-500 to-teal-600", count: LISTINGS.filter(l => l.bigCategory === "hardware-corner").length },
];

const SUB_CATEGORIES: Record<BigCategory, string[]> = {
  "all": [],
  "digital-assets": ["Prompts", "Agents", "Fine-tuned Models", "LoRAs"],
  "compute-hub": ["GPU Rentals", "API Credits", "Subscriptions"],
  "hardware-corner": ["Used GPUs", "AI Kits", "Laptops & Servers"],
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "discount", label: "Biggest Discount" },
];

const catBadgeStyle: Record<string, string> = {
  "digital-assets": "bg-purple-100 text-purple-700 border border-purple-200",
  "compute-hub": "bg-cyan-100 text-cyan-700 border border-cyan-200",
  "hardware-corner": "bg-emerald-100 text-emerald-700 border border-emerald-200",
};
const catLabel: Record<string, string> = {
  "digital-assets": "Digital Asset",
  "compute-hub": "Compute Hub",
  "hardware-corner": "Hardware",
};
const badgeGradients: Record<string, string> = {
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

// ── Listing Card ───────────────────────────────────────────────
function ListingCard({ listing, index, viewMode }: { listing: Listing; index: number; viewMode: ViewMode }) {
  const [saved, setSaved] = useState(false);
  const discountPct = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.35 }}
        className="group bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 flex gap-4 p-4 items-center"
      >
        {/* Avatar */}
        <div className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${listing.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
          {listing.seller.avatar}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${catBadgeStyle[listing.bigCategory]}`}>{catLabel[listing.bigCategory]}</span>
            {listing.badge && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white bg-gradient-to-r ${badgeGradients[listing.badge] ?? "from-slate-400 to-slate-500"}`}>{listing.badge}</span>}
            <span className="text-[10px] text-slate-400">{listing.subCategory}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors truncate">{listing.name}</h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{listing.description}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= Math.floor(listing.seller.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
              <span className="text-[10px] text-slate-400 ml-0.5">{listing.seller.rating} ({listing.seller.reviews})</span>
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views.toLocaleString()}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="shrink-0 text-right flex flex-col items-end gap-2">
          <div>
            <div className="text-xl font-black text-slate-900">${listing.price.toFixed(2)}<span className="text-xs font-normal text-slate-400 ml-1">{listing.unit}</span></div>
            {listing.originalPrice && <div className="text-xs text-slate-400 line-through">${listing.originalPrice.toFixed(2)}</div>}
          </div>
          <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center gap-1">
            View Deal <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Top colour band */}
      <div className={`h-2 w-full bg-gradient-to-r ${listing.color}`} />

      {/* Discount badge */}
      {discountPct && (
        <div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg">
          -{discountPct}%
        </div>
      )}

      {/* Save button */}
      <button
        onClick={() => setSaved(s => !s)}
        className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
      >
        <Heart className={`w-4 h-4 transition-colors ${saved ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
      </button>

      <div className="p-5 flex flex-col flex-1">
        {/* Category + badge */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${catBadgeStyle[listing.bigCategory]}`}>{catLabel[listing.bigCategory]}</span>
          {listing.badge && <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold text-white bg-gradient-to-r ${badgeGradients[listing.badge] ?? "from-slate-400 to-slate-500"}`}>{listing.badge}</span>}
          {listing.trending && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-semibold flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />Trending</span>}
          {listing.isNew && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-600 font-semibold">New</span>}
        </div>

        {/* Avatar + title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${listing.color} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform duration-300`}>
            {listing.seller.avatar}
          </div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">{listing.name}</h3>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">{listing.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {listing.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 hover:bg-purple-100 hover:text-purple-600 transition-colors cursor-pointer">{tag}</span>
          ))}
        </div>

        {/* Seller row */}
        <div className="flex items-center justify-between py-2.5 border-t border-b border-gray-100 mb-3">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-700">{listing.seller.name}</span>
              {listing.seller.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
            </div>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= Math.floor(listing.seller.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
              <span className="text-[10px] text-slate-400 ml-1">{listing.seller.rating}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 justify-end"><Eye className="w-3 h-3" />{listing.views.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 justify-end mt-0.5"><Heart className="w-3 h-3" />{listing.saves.toLocaleString()}</div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">${listing.price.toFixed(2)}</span>
              <span className="text-xs text-slate-400">{listing.unit}</span>
            </div>
            {listing.originalPrice && <div className="text-[11px] text-slate-400 line-through">${listing.originalPrice.toFixed(2)}</div>}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:scale-105 transition-all duration-200">
            View Deal <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<BigCategory>("all");
  const [activeSubCat, setActiveSubCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleSave = useCallback((id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let list = [...LISTINGS];

    if (activeCategory !== "all") list = list.filter(l => l.bigCategory === activeCategory);
    if (activeSubCat !== "all") list = list.filter(l => l.subCategory === activeSubCat);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.tags.some(t => t.toLowerCase().includes(q)));
    }
    list = list.filter(l => l.price <= maxPrice);
    list = list.filter(l => l.seller.rating >= minRating);
    if (verifiedOnly) list = list.filter(l => l.seller.verified);

    switch (sortBy) {
      case "price-asc": return list.sort((a, b) => a.price - b.price);
      case "price-desc": return list.sort((a, b) => b.price - a.price);
      case "rating": return list.sort((a, b) => b.seller.rating - a.seller.rating);
      case "discount": return list.sort((a, b) => {
        const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return db - da;
      });
      case "newest": return list.sort((a, b) => (a.isNew ? -1 : 1));
      default: return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [activeCategory, activeSubCat, searchQuery, sortBy, maxPrice, minRating, verifiedOnly]);

  const featured = LISTINGS.filter(l => l.featured);
  const subCats = activeCategory === "all" ? [] : SUB_CATEGORIES[activeCategory];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero Search Bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search prompts, agents, GPUs, credits..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border border-transparent focus:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm text-slate-800 placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${showFilters ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-700 border-gray-200 hover:border-purple-300"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-slate-700 focus:outline-none focus:border-purple-300 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* View mode */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow text-purple-600" : "text-slate-400 hover:text-slate-600"}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow text-purple-600" : "text-slate-400 hover:text-slate-600"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable filter bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-600">Max Price: <span className="text-purple-600">${maxPrice.toLocaleString()}</span></label>
                  <input type="range" min={0} max={3000} step={10} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
                    className="w-32 accent-purple-500" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-600">Min Rating: <span className="text-purple-600">{minRating}★</span></label>
                  <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={e => setMinRating(+e.target.value)}
                    className="w-28 accent-purple-500" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full transition-colors ${verifiedOnly ? "bg-purple-500" : "bg-gray-300"} relative`} onClick={() => setVerifiedOnly(s => !s)}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${verifiedOnly ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Verified Sellers Only</span>
                </label>
                <button onClick={() => { setMaxPrice(3000); setMinRating(0); setVerifiedOnly(false); }} className="text-xs text-purple-500 hover:text-purple-700 font-medium">Reset Filters</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Left Sidebar ── */}
        <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setActiveCategory(cat.value); setActiveSubCat("all"); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.value ? "bg-gradient-to-r " + cat.color + " text-white shadow-md" : "text-slate-600 hover:bg-gray-100"}`}
                >
                  <div className="flex items-center gap-2">
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeCategory === cat.value ? "bg-white/20 text-white" : "bg-gray-100 text-slate-500"}`}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-categories */}
          {subCats.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sub-Category</h3>
              <div className="space-y-1">
                {["all", ...subCats].map(sc => (
                  <button key={sc} onClick={() => setActiveSubCat(sc)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${activeSubCat === sc ? "bg-purple-100 text-purple-700 font-semibold" : "text-slate-600 hover:bg-gray-100"}`}>
                    {sc === "all" ? "All" : sc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl border border-purple-100 p-4">
            <h3 className="text-xs font-bold text-slate-600 mb-3">Why Whichai?</h3>
            <div className="space-y-2.5">
              {[
                { icon: ShieldCheck, label: "Escrow Protection", color: "text-emerald-500" },
                { icon: BadgeCheck, label: "Verified Sellers", color: "text-blue-500" },
                { icon: Zap, label: "Instant Delivery", color: "text-amber-500" },
                { icon: MessageCircle, label: "24/7 Dispute Support", color: "text-purple-500" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-slate-600 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sell CTA */}
          <div className="bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl p-4 text-white">
            <Package className="w-6 h-6 mb-2 opacity-80" />
            <h3 className="font-bold text-sm mb-1">Sell on Whichai</h3>
            <p className="text-xs opacity-75 mb-3">0% fee on your first 3 sales. List in under 5 minutes.</p>
            <button className="w-full py-2 rounded-xl bg-white text-purple-700 text-xs font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> List an Item
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">

          {/* Featured Banner (only on "all" with no search) */}
          {activeCategory === "all" && !searchQuery && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Featured Listings</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {featured.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative rounded-2xl p-5 bg-gradient-to-br ${listing.color} text-white overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-lg`}
                  >
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
                    <div className="relative z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">{catLabel[listing.bigCategory]}</span>
                      <h3 className="font-bold text-sm mt-2 mb-1 line-clamp-2">{listing.name}</h3>
                      <p className="text-xs opacity-75 line-clamp-2 mb-3">{listing.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black">${listing.price.toFixed(2)}<span className="text-xs font-normal opacity-75 ml-1">{listing.unit}</span></span>
                        <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1">
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Category pills (mobile) */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 lg:hidden scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => { setActiveCategory(cat.value); setActiveSubCat("all"); }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeCategory === cat.value ? "bg-gradient-to-r " + cat.color + " text-white shadow" : "bg-white text-slate-600 border border-gray-200"}`}>
                <cat.icon className="w-3.5 h-3.5" />{cat.label}
              </button>
            ))}
          </div>

          {/* Sub-cat pills */}
          {subCats.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {["all", ...subCats].map(sc => (
                <button key={sc} onClick={() => setActiveSubCat(sc)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeSubCat === sc ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-white text-slate-600 border border-gray-200 hover:border-purple-200"}`}>
                  {sc === "all" ? "All" : sc}
                </button>
              ))}
            </div>
          )}

          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-bold text-slate-800">{filtered.length} listings</span>
              {searchQuery && <span className="text-sm text-slate-500 ml-2">for &ldquo;{searchQuery}&rdquo;</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Updated live
            </div>
          </div>

          {/* Grid / List */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No listings found</h3>
              <p className="text-slate-400 text-sm">Try adjusting your filters or search query.</p>
              <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); setMaxPrice(3000); setMinRating(0); setVerifiedOnly(false); }}
                className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
              {filtered.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Student CTA banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">The Student Swap</h3>
                <p className="text-sm opacity-80">50% off Claude Pro · GPU credits for finals · Free agent templates</p>
              </div>
            </div>
            <button className="shrink-0 px-6 py-3 rounded-xl bg-white text-purple-700 font-bold text-sm hover:bg-purple-50 transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Join with .edu Email
            </button>
          </motion.div>
        </main>
      </div>

      {/* ── Floating Sell Button (mobile) ── */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm shadow-2xl shadow-purple-500/40"
        >
          <Plus className="w-5 h-5" /> List an Item
        </motion.button>
      </div>
    </div>
  );
}
