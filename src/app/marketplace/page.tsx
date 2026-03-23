'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Upload, Code2, Eye, Mic, Image, Globe, Zap, BadgeCheck, ChevronRight,
  Brain, Monitor, X, Sparkles, Loader2, Tag, ShoppingBag, Search as SearchIcon,
  Key, MessageSquare, Cpu,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CategorySidebar from '@/components/marketplace/CategorySidebar';
import HeroSearchBar from '@/components/marketplace/HeroSearchBar';
import PowerFilterPanel, { FilterState } from '@/components/marketplace/PowerFilterPanel';
import LocationSearch from '@/components/marketplace/LocationSearch';
import MapView from '@/components/marketplace/MapView';
import ListingCardV3 from '@/components/marketplace/ListingCardV3';
import ComputeHeatmap from '@/components/marketplace/ComputeHeatmap';
import CompatibilityChecker from '@/components/marketplace/CompatibilityChecker';
import {
  getAllProducts, marketplaceDeals, marketplaceCategories, getDiscountPct,
  allListingsV3, getListingsByCategory, type AIProduct, type MarketplaceCategory,
  type MarketListingV3, calculateDistance,
} from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';

type BigTab = 'all' | 'digital-assets' | 'compute-hub' | 'hardware-corner';

const DealCard = ({ deal, index }: { deal: typeof marketplaceDeals[0]; index: number }) => {
  const discountPct = getDiscountPct(deal.original_price, deal.discounted_price);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-5 rounded-xl bg-white border border-gray-200 hover:border-purple-300 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{deal.provider}</span>
        {deal.badge && (<span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r text-white ${{ 'Hot Deal': 'from-red-500 to-orange-500', 'Popular': 'from-purple-500 to-pink-500', 'New': 'from-cyan-500 to-blue-500', 'Student Special': 'from-violet-500 to-purple-500', 'Best Value': 'from-emerald-500 to-green-500', 'Team Deal': 'from-blue-500 to-indigo-500', 'Limited': 'from-amber-500 to-yellow-500', 'Budget Pick': 'from-teal-500 to-cyan-500' }[deal.badge] || ''}`}>{deal.badge}</span>)}
      </div>
      <h3 className="font-bold text-slate-900 mb-1 text-sm line-clamp-1">{deal.name}</h3>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{deal.description}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-lg font-bold text-slate-900">${deal.discounted_price.toFixed(2)}</span>
        <span className="text-xs text-slate-400 line-through">${deal.original_price.toFixed(2)}</span>
        <span className="text-xs font-semibold text-green-600 ml-auto">Save {discountPct}%</span>
      </div>
      <p className="text-xs text-slate-400 mb-3">{deal.unit}</p>
      <button className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all">Claim Deal</button>
    </motion.div>
  );
};

const ToolCard = ({ product, index }: { product: AIProduct; index: number }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-5 rounded-xl bg-white border border-gray-200 hover:border-purple-300 transition-all group">
      <div className="flex items-start gap-3 mb-3">
        {product.logo_url ? (<img src={product.logo_url} alt={product.name} className="w-10 h-10 rounded" />) : (<div className="w-10 h-10 rounded bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">{product.name.charAt(0)}</div>)}
        <div><h3 className="font-bold text-slate-900 text-sm">{product.name}</h3><p className="text-xs text-slate-500">{product.provider}</p></div>
      </div>
      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{product.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {product.features.vision && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Vision</span>}
        {product.features.voice && <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">Voice</span>}
        {product.features.image_gen && <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">Image</span>}
      </div>
      <Link href={`/product/${product.slug}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 text-xs font-semibold hover:bg-slate-200 transition-all">View <ChevronRight size={14} /></Link>
    </motion.div>
  );
};

const SellModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">List Your Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={24} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Item name" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none" />
          <textarea placeholder="Description" rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none" />
          <input type="number" placeholder="Price" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none" />
          <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all">Submit Listing</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function MarketplacePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [showSellModal, setShowSellModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bigTab, setBigTab] = useState<BigTab>('all');
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | null>(null);
  const [toolFilter, setToolFilter] = useState('all');
  const [activeCategory2, setActiveCategory2] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(500);
  const [filters, setFilters] = useState<FilterState>({ sortBy: 'trending', priceRange: [0, 10000], minRating: 0, vramMin: 0, frameworks: [], subcategories: [], maxDistance: 500 });

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingTools(true);
      const data = await getAllProducts();
      setProducts(data);
      setLoadingTools(false);
    };
    loadProducts();
  }, []);

  const getFilteredListings = () => {
    let filtered = allListingsV3.filter((listing) => {
      if (searchQuery) { const q = searchQuery.toLowerCase(); return listing.name.toLowerCase().includes(q) || listing.description.toLowerCase().includes(q) || listing.tags.some((t) => t.toLowerCase().includes(q)); }
      return true;
    });
    if (activeCategory2) { filtered = filtered.filter((l) => l.bigCategory === activeCategory2); } else if (bigTab !== 'all') { filtered = filtered.filter((l) => l.bigCategory === bigTab); }
    if (userLocation) { filtered = filtered.filter((listing) => { if (!listing.location) return true; const dist = calculateDistance(userLocation.lat, userLocation.lng, listing.location.lat, listing.location.lng); return dist <= searchRadius; }); }
    filtered = filtered.filter((l) => l.price >= filters.priceRange[0] && l.price <= filters.priceRange[1]);
    if (filters.vramMin > 0) { filtered = filtered.filter((l) => { if (!l.techSpecs?.vram) return false; return l.techSpecs.vram >= filters.vramMin; }); }
    if (filters.frameworks.length > 0) { filtered = filtered.filter((l) => { if (!l.techSpecs?.framework) return false; return filters.frameworks.some((fw) => l.techSpecs?.framework?.includes(fw)); }); }
    filtered = filtered.filter((l) => l.seller.rating >= filters.minRating);
    const sorted = [...filtered].sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.seller.rating - a.seller.rating;
      if (filters.sortBy === 'trending') { const scoreA = (a.trendingScore || 0) + (a.featured ? 100 : 0); const scoreB = (b.trendingScore || 0) + (b.featured ? 100 : 0); return scoreB - scoreA; }
      if (filters.sortBy === 'distance' && userLocation && a.location && b.location) { const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng); const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng); return distA - distB; }
      return 0;
    });
    return sorted;
  };

  const filteredListings = getFilteredListings();
  const filteredDeals = activeCategory ? marketplaceDeals.filter((d) => d.category === activeCategory) : marketplaceDeals;
  const sortedDeals = [...filteredDeals].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const filteredTools = toolFilter === 'all' ? products : products.filter((p) => { if (toolFilter === 'voice') return p.features.voice === true; if (toolFilter === 'vision') return p.features.vision === true; return p.category === toolFilter; });
  const handleCompare = (id: string) => { setCompareIds((prev) => { if (prev.includes(id)) { return prev.filter((cid) => cid !== id); } return prev.length < 3 ? [...prev, id] : prev; }); };

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="relative z-10 bg-[#f4f0eb]/80 backdrop-blur-sm border-b border-gray-200"><Navbar /></div>
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-white to-cyan-50 border border-purple-100">
          <div className="rounded-2xl px-6 md:px-8 py-10 md:py-14">
            <div className="absolute inset-0 rounded-2xl opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-600 text-xs font-medium mb-4">
                  <Store className="w-3.5 h-3.5" /> World&apos;s First AI Marketplace
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">The AI{' '}<span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Marketplace</span></h1>
                <p className="text-slate-500 text-sm max-w-lg">Buy prompts, rent GPUs, sell agents, and discover hardware â all in one place.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => setShowSellModal(true)} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 animate-pulse-slow">
                  <Upload className="w-4 h-4" /> List Your Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex gap-6">
        <CategorySidebar activeCategory={activeCategory2} onCategoryChange={setActiveCategory2} activeSub={activeSub} onSubChange={setActiveSub} />
        <main className="flex-1 min-w-0">
          <HeroSearchBar value={searchQuery} onChange={setSearchQuery} onFilterToggle={() => {}} filterCount={filters.frameworks.length + (filters.maxDistance < 500 ? 1 : 0)} />
          <PowerFilterPanel filters={filters} onFiltersChange={setFilters} listingCount={filteredListings.length} />
          <LocationSearch onLocationChange={(coords) => { if (coords) { setUserLocation({ lat: coords.lat, lng: coords.lng }); } else { setUserLocation(null); } }} onRadiusChange={setSearchRadius} radius={searchRadius} />
          <div className="mb-6 flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowMap(!showMap)} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${ showMap ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`}>
              ð {showMap ? 'Hide' : 'Show'} Map
            </motion.button>
          </div>
          {showMap && userLocation && (<MapView listings={filteredListings} userLocation={userLocation} radiusMiles={searchRadius} />)}
          <ComputeHeatmap />
          {filteredListings.filter((l) => l.techSpecs?.gpuType).length > 0 && (<CompatibilityChecker listing={filteredListings.find((l) => l.techSpecs?.gpuType)!} />)}
          <motion.section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Sparkles size={24} className="text-purple-500" /> Marketplace Listings</h2>
            <AnimatePresence mode="wait">
              <motion.div key={bigTab + searchQuery + JSON.stringify(filters)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredListings.map((listing, idx) => (<ListingCardV3 key={listing.id} listing={listing} index={idx} onCompare={handleCompare} />))}
              </motion.div>
            </AnimatePresence>
            {filteredListings.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-slate-700 font-medium">No listings found.</p>
                <p className="text-slate-500 text-sm mt-1">Try a different search or category.</p>
              </div>
            )}
          </motion.section>
          {(bigTab === 'all' || bigTab === 'digital-assets') && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
              <div className="flex items-center gap-2 mb-5"><Sparkles className="w-5 h-5 text-purple-500" /><h2 className="text-2xl font-bold text-slate-900">AI Tools Directory</h2></div>
              <div className="flex flex-wrap gap-2 mb-6">
                {[{value:'all',label:'â¨ All Tools'},{value:'code',label:'ð» Code'},{value:'vision',label:'ðï¸ Vision'},{value:'voice',label:'ð¤ Voice'},{value:'image',label:'ð¼ï¸ Image Gen'},{value:'chatbot',label:'ð¬ Chat'},{value:'multimodal',label:'â¡ Multimodal'}].map(({ value, label }) => (
                  <motion.button key={value} onClick={() => setToolFilter(value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${ toolFilter === value ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`} whileHover={{ scale: 1.05 }}>{label}</motion.button>
                ))}
              </div>
              {loadingTools ? (<div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-purple-500" /></div>) : (
                <AnimatePresence mode="wait"><motion.div key={toolFilter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filteredTools.map((product, i) => (<ToolCard key={product.id} product={product} index={i} />))}</motion.div></AnimatePresence>
              )}
            </motion.section>
          )}
          {(bigTab === 'all' || bigTab === 'compute-hub') && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-12">
              <div className="flex items-center gap-2 mb-4"><Tag className="w-5 h-5 text-cyan-500" /><h2 className="text-2xl font-bold text-slate-900">Exclusive Deals</h2></div>
              <p className="text-slate-500 text-sm mb-5">Discounted API tokens, subscriptions, and GPU rentals â curated for developers, researchers, and teams.</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <motion.button onClick={() => setActiveCategory(null)} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${ activeCategory === null ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`} whileHover={{ scale: 1.05 }}>All Deals</motion.button>
                {marketplaceCategories.map((cat) => (<motion.button key={cat.value} onClick={() => setActiveCategory(cat.value)} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${ activeCategory === cat.value ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`} whileHover={{ scale: 1.05 }}>{cat.label}</motion.button>))}
              </div>
              <AnimatePresence mode="wait"><motion.div key={activeCategory || 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{sortedDeals.map((deal, i) => (<DealCard key={deal.id} deal={deal} index={i} />))}</motion.div></AnimatePresence>
            </motion.section>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-12 mb-12 text-center">
            <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
              <div className="bg-white rounded-2xl px-8 py-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Have something to sell?</h3>
                <p className="text-sm text-slate-500 mb-4">Join 6,400+ sellers on the world&apos;s first AI marketplace. Free to list, 0% fee on your first 3 sales.</p>
                <motion.button onClick={() => setShowSellModal(true)} whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"><Upload className="w-4 h-4" /> List Your Item Free</motion.button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      {compareIds.length > 0 && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-200 backdrop-blur-sm p-4 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div><p className="text-slate-900 font-semibold">{compareIds.length} item{compareIds.length !== 1 ? 's' : ''} selected for comparison</p><p className="text-slate-500 text-sm">{compareIds.map((id) => allListingsV3.find((l) => l.id === id)?.name).join(', ')}</p></div>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-lg bg-purple-100 border border-purple-300 text-purple-700 font-semibold text-sm">Compare Now</motion.button>
              <motion.button onClick={() => setCompareIds([])} whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm">Clear</motion.button>
            </div>
          </div>
        </motion.div>
      )}
      <AnimatePresence>{showSellModal && <SellModal onClose={() => setShowSellModal(false)} />}</AnimatePresence>
    </div>
  );
}
