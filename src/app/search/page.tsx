"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, MapPin, Filter, ChevronRight, Package, Star, BadgeCheck, Brain, Cpu, Monitor, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import Navbar from "@/components/Navbar";
import { allListingsV3, type MarketListingV3 } from "@/lib/data";

// ââ Region classification âââââââââââââââââââââââââââââââââââ
const CITY_REGION: Record<string, string> = {
  "San Francisco": "North America",
  "New York": "North America",
  "Boston": "North America",
  "Seattle": "North America",
  "Austin": "North America",
  "Denver": "North America",
  "Chicago": "North America",
  "Los Angeles": "North America",
  "Toronto": "North America",
  "Vancouver": "North America",
  "London": "Europe",
  "Berlin": "Europe",
  "Paris": "Europe",
  "Amsterdam": "Europe",
  "Stockholm": "Europe",
  "Zurich": "Europe",
  "Madrid": "Europe",
  "Milan": "Europe",
  "Tokyo": "Asia Pacific",
  "Singapore": "Asia Pacific",
  "Seoul": "Asia Pacific",
  "Mumbai": "Asia Pacific",
  "Sydney": "Asia Pacific",
  "Bangalore": "Asia Pacific",
  "Shanghai": "Asia Pacific",
  "Beijing": "Asia Pacific",
  "Dubai": "Middle East & Africa",
  "Tel Aviv": "Middle East & Africa",
};

const REGION_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "North America": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  "Europe":        { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  "Asia Pacific":  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "Middle East & Africa": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  "Global":        { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", dot: "bg-slate-400" },
};

const CAT_ICON: Record<string, React.ElementType> = {
  "digital-assets": Brain,
  "compute-hub": Cpu,
  "hardware-corner": Monitor,
};

const CAT_BADGE: Record<string, string> = {
  "digital-assets": "bg-purple-100 text-purple-700",
  "compute-hub": "bg-cyan-100 text-cyan-700",
  "hardware-corner": "bg-emerald-100 text-emerald-700",
};

function getRegion(listing: MarketListingV3): string {
  if (listing.location?.city) {
    return CITY_REGION[listing.location.city] || "Global";
  }
  return "Global";
}

function matchesQuery(listing: MarketListingV3, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    listing.name.toLowerCase().includes(lower) ||
    listing.description.toLowerCase().includes(lower) ||
    listing.tags.some((t) => t.toLowerCase().includes(lower)) ||
    listing.bigCategory.toLowerCase().includes(lower) ||
    (listing.seller?.name || "").toLowerCase().includes(lower) ||
    (listing.location?.city || "").toLowerCase().includes(lower)
  );
}

// ââ Listing card for search results ââââââââââââââââââââââââââââ
function SearchResultCard({ listing, index }: { listing: MarketListingV3; index: number }) {
  const Icon = CAT_ICON[listing.bigCategory] || Package;
  const discountPct = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;
  const region = getRegion(listing);
  const regionStyle = REGION_COLORS[region] || REGION_COLORS["Global"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="relative bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 flex gap-4"
    >
      {discountPct && (
        <div className="absolute -top-2 -right-2 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          -{discountPct}%
        </div>
      )}

      {/* Icon */}
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${CAT_BADGE[listing.bigCategory]}`}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{listing.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${CAT_BADGE[listing.bigCategory]}`}>
              {listing.bigCategory.replace("-", " ")}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{listing.description}</p>

        <div className="flex flex-wrap gap-1 mb-2">
          {listing.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-slate-700">{listing.seller?.name}</span>
              {listing.seller?.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
            </div>
            {listing.location?.city && (
              <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${regionStyle.bg} ${regionStyle.text} ${regionStyle.border}`}>
                <MapPin className="w-2.5 h-2.5" />
                {listing.location.city}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-base font-black text-slate-900">${listing.price.toFixed(2)}</span>
              <span className="text-xs text-slate-400 ml-1">{listing.unit}</span>
            </div>
            <Link
              href={`/marketplace`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-md transition-all"
            >
              View <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ââ Region group header âââââââââââââââââââââââââââââââââââââââ
function RegionGroup({ region, listings, defaultOpen = true }: { region: string; listings: MarketListingV3[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const style = REGION_COLORS[region] || REGION_COLORS["Global"];

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 ${style.border} ${style.bg} mb-4 hover:opacity-90 transition-all`}
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <Globe className={`w-4 h-4 ${style.text}`} />
          <span className={`font-bold text-sm ${style.text}`}>{region}</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${style.bg} ${style.text} border ${style.border}`}>
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ChevronRight className={`w-4 h-4 ${style.text} transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3">
              {listings.map((listing, i) => (
                <SearchResultCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ââ Search inner component (uses useSearchParams) âââââââââââââ
function SearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const allListings = allListingsV3;

  const results = useCallback((): MarketListingV3[] => {
    if (!query.trim()) return allListings;
    return allListings.filter((l) => matchesQuery(l, query));
  }, [query, allListings]);

  const filtered = results();

  // Group by region
  const byRegion = filtered.reduce<Record<string, MarketListingV3[]>>((acc, listing) => {
    const region = getRegion(listing);
    if (!acc[region]) acc[region] = [];
    acc[region].push(listing);
    return acc;
  }, {});

  // Sort regions by count (most listings first), but put "North America" first
  const REGION_ORDER = ["North America", "Europe", "Asia Pacific", "Middle East & Africa", "Global"];
  const sortedRegions = Object.keys(byRegion).sort((a, b) => {
    const ai = REGION_ORDER.indexOf(a);
    const bi = REGION_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return byRegion[b].length - byRegion[a].length;
  });

  // Category filter
  const categories = ["All", "Digital Assets", "Compute Hub", "Hardware Corner"];
  const catMap: Record<string, string> = {
    "Digital Assets": "digital-assets",
    "Compute Hub": "compute-hub",
    "Hardware Corner": "hardware-corner",
  };

  const displayByRegion = sortedRegions.reduce<Record<string, MarketListingV3[]>>((acc, region) => {
    let listings = byRegion[region];
    if (activeFilter !== "All") {
      listings = listings.filter((l) => l.bigCategory === catMap[activeFilter]);
    }
    if (listings.length > 0) acc[region] = listings;
    return acc;
  }, {});

  const totalFiltered = Object.values(displayByRegion).reduce((s, arr) => s + arr.length, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
  };

  const POPULAR = ["ChatGPT API", "GPU Rentals", "Stable Diffusion", "Claude Credits", "H100", "Fine-tuned Models"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Search header */}
      <div className="bg-[#f4f0eb] border-b border-gray-100 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search ChatGPT API, GPU rentals, AI prompts..."
              className="w-full pl-12 pr-32 py-4 text-base text-slate-900 bg-white rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none shadow-sm transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-lg transition-all"
            >
              Search
            </button>
          </form>

          {/* Popular searches */}
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setInputValue(p);
                  setQuery(p);
                  router.push(`/search?q=${encodeURIComponent(p)}`, { scroll: false });
                }}
                className="px-3 py-1 rounded-full text-xs bg-gray-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 border border-transparent hover:border-purple-200 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {query ? (
                <>
                  <span className="text-purple-600">{totalFiltered.toLocaleString()}</span>{" "}
                  {totalFiltered === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
                </>
              ) : (
                <>
                  <span className="text-purple-600">{totalFiltered.toLocaleString()}</span> listings available
                </>
              )}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Sorted by region Â· {Object.keys(displayByRegion).length} region{Object.keys(displayByRegion).length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === cat
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-500 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Region summary pills */}
        {totalFiltered > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {sortedRegions
              .filter((r) => displayByRegion[r])
              .map((region) => {
                const style = REGION_COLORS[region] || REGION_COLORS["Global"];
                return (
                  <div key={region} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {region}: {displayByRegion[region].length}
                  </div>
                );
              })}
          </div>
        )}

        {/* Results grouped by region */}
        {totalFiltered === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No results found</h2>
            <p className="text-slate-500 mb-6">
              No listings matched &ldquo;{query}&rdquo;. Try a different term or browse our marketplace.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-lg transition-all"
            >
              Browse Marketplace <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          sortedRegions
            .filter((r) => displayByRegion[r])
            .map((region, idx) => (
              <RegionGroup
                key={region}
                region={region}
                listings={displayByRegion[region]}
                defaultOpen={idx < 2}
              />
            ))
        )}
      </div>
    </div>
  );
}

// ââ Page wrapper with Suspense (required for useSearchParams) â
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SearchInner />
    </Suspense>
  );
}
