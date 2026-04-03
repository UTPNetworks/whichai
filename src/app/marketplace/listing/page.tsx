'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Share2, Flag, MessageCircle, ShoppingCart, Zap, Star, Check,
  MapPin, Shield, Clock, Tag, ChevronLeft, ChevronRight, Package, Eye, Users,
  ExternalLink, Copy, Bookmark, Send, X, BadgeCheck, Truck, CreditCard,
  Globe, Award, TrendingUp, ThumbsUp,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { allListingsV3, MarketListingV3 } from '@/lib/data';

// Convert Supabase row to MarketListingV3 (same as marketplace page)
function supabaseRowToListing(row: any, sellerName: string): MarketListingV3 {
  const catStr = (row.category || '').toLowerCase();
  let bigCategory: 'digital-assets' | 'compute-hub' | 'hardware-corner' = 'digital-assets';
  if (catStr.includes('compute')) bigCategory = 'compute-hub';
  else if (catStr.includes('hardware')) bigCategory = 'hardware-corner';
  return {
    id: `user-${row.id}`,
    name: row.title || 'Untitled Listing',
    description: row.description || '',
    bigCategory,
    subcategory: row.subcategory || catStr.split('>').pop()?.trim() || '',
    price: row.price || 0,
    unit: row.pricing_type === 'free' ? 'free' : row.pricing_type || 'one-time',
    seller: { name: sellerName, rating: 5.0, reviews: 0, verified: true, badge: 'new' as const },
    badge: row.is_boosted ? 'Boosted' : undefined,
    featured: row.is_boosted || false,
    tags: Array.isArray(row.tags) ? row.tags : [],
    emoji: bigCategory === 'compute-hub' ? '⚡' : bigCategory === 'hardware-corner' ? '🖥️' : '🤖',
    images: Array.isArray(row.photo_urls) ? row.photo_urls : [],
    trendingScore: row.views || 0,
  };
}

// Photo Gallery Component (eBay style)
function PhotoGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const next = () => setActiveIdx((i) => (i + 1) % Math.max(images.length, 1));
  const prev = () => setActiveIdx((i) => (i - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));

  return (
    <>
      <div className="relative group">
        {/* Main Image */}
        <div
          className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden cursor-zoom-in"
          onClick={() => images.length > 0 && setFullscreen(true)}
        >
          {images.length > 0 ? (
            <motion.img
              key={activeIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[activeIdx]}
              alt={name}
              className="w-full h-full object-contain bg-white"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <Package className="w-16 h-16 mb-3" />
              <p className="text-sm font-medium">No photos available</p>
            </div>
          )}
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </>
        )}

        {/* Photo counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
            {activeIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                i === activeIdx ? 'border-purple-500 shadow-md ring-2 ring-purple-200' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img src={url} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setFullscreen(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            <img src={images[activeIdx]} alt={name} className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }} className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeIdx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Seller Card Component
function SellerCard({ seller }: { seller: MarketListingV3['seller'] }) {
  const initial = seller.name.charAt(0).toUpperCase();
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Seller Information</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white text-lg font-bold shadow-md">
          {initial}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-slate-900">{seller.name}</p>
            {seller.verified && (
              <BadgeCheck className="w-4 h-4 text-cyan-500" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-slate-700">{seller.rating}</span>
            </div>
            <span className="text-xs text-slate-400">({seller.reviews} reviews)</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {seller.badge && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="capitalize">{seller.badge.replace(/-/g, ' ')}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Verified seller</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>Usually responds within 1 hour</span>
        </div>
      </div>
      <Link href="/marketplace/store?id=neuralforge" className="w-full mt-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
        <Eye className="w-4 h-4" />Visit Store
      </Link>
    </div>
  );
}

function ListingDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const listingId = searchParams.get('id') || '';

  const [listing, setListing] = useState<MarketListingV3 | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('Hi, is this still available?');
  const [messageSent, setMessageSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extra Supabase data for user listings
  const [supabaseData, setSupabaseData] = useState<any>(null);

  const fetchListing = useCallback(async () => {
    setLoading(true);

    // Check if it's a user listing (id starts with "user-")
    if (listingId.startsWith('user-')) {
      const dbId = listingId.replace('user-', '');
      try {
        // Use timeout to prevent infinite hang
        const fetchPromise = supabase.from('user_listings').select('*').eq('id', dbId).single();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timed out')), 10000));
        const { data: row, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (!error && row) {
          setSupabaseData(row);
          // Fetch seller profile (with timeout)
          const profilePromise = supabase.from('profiles').select('id, first_name, last_name, email').eq('id', row.user_id).single();
          const { data: profile } = await Promise.race([profilePromise, new Promise((resolve) => setTimeout(() => resolve({ data: null }), 5000))]) as any;

          const sellerName = profile
            ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email?.split('@')[0] || 'WhichAI Seller'
            : 'WhichAI Seller';

          setListing(supabaseRowToListing(row, sellerName));

          // Increment views (fire and forget, don't block)
          supabase.from('user_listings').update({ views: (row.views || 0) + 1 }).eq('id', dbId).then(() => {});
        }
      } catch (err) {
        console.error('Failed to fetch listing:', err);
      }
    } else {
      // Static demo listing
      const found = allListingsV3.find((l) => l.id === listingId);
      if (found) setListing(found);
    }

    setLoading(false);
  }, [listingId]);

  useEffect(() => { fetchListing(); }, [fetchListing]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSendMessage = () => {
    setMessageSent(true);
    setTimeout(() => { setShowMessageModal(false); setMessageSent(false); setMessage('Hi, is this still available?'); }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f0eb]">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#f4f0eb]">
        <Navbar />
        <div className="max-w-md mx-auto mt-32 text-center px-4">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Listing not found</h2>
          <p className="text-sm text-slate-500 mb-6">This listing may have been removed or the link is incorrect.</p>
          <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all">
            <ArrowLeft className="w-4 h-4" />Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    'digital-assets': 'Digital Assets',
    'compute-hub': 'Compute Hub',
    'hardware-corner': 'Hardware Corner',
  };

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
          <Link href="/marketplace" className="flex items-center gap-1 hover:text-purple-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-600">{categoryLabels[listing.bigCategory] || listing.bigCategory}</span>
          {listing.subcategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-600 capitalize">{listing.subcategory.replace(/-/g, ' ')}</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Photos (3 cols) */}
          <div className="lg:col-span-3">
            <PhotoGallery images={listing.images || []} name={listing.name} />
          </div>

          {/* Right: Details (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main info card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700">
                  {categoryLabels[listing.bigCategory]}
                </span>
                {listing.badge && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {listing.badge}
                  </span>
                )}
                {listing.featured && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-50 text-cyan-700">
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-slate-900 mb-2">{listing.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-slate-900">
                  {listing.unit === 'free' ? 'Free' : `$${listing.price.toFixed(2)}`}
                </span>
                {listing.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">${listing.originalPrice.toFixed(2)}</span>
                )}
                {listing.originalPrice && (
                  <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                    {Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-4 capitalize">{listing.unit === 'free' ? 'Free' : listing.unit}</p>

              {/* Action Buttons */}
              <div className="space-y-2.5 mb-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-purple-200/50 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {listing.unit === 'free' ? 'Get it Free' : 'Buy Now'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-sm font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />Make an Offer
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMessageModal(true)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />Message Seller
                </motion.button>
              </div>

              {/* Quick actions row */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    saved ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-gray-50 text-slate-600 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-pink-500' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </button>
                <button onClick={handleShare} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-50 text-slate-600 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-all">
                  <Share2 className="w-3.5 h-3.5" />Share
                </button>
                <button className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-50 text-slate-600 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-all">
                  <Flag className="w-3.5 h-3.5" />Report
                </button>
              </div>
            </div>

            {/* Delivery & Protection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><Truck className="w-4 h-4 text-emerald-600" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {supabaseData?.delivery_method === 'physical' ? 'Physical Shipping' :
                       supabaseData?.delivery_method === 'api' ? 'API Access' :
                       supabaseData?.delivery_method === 'license' ? 'License Key' :
                       'Instant Digital Delivery'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {supabaseData?.delivery_method === 'physical' ? 'Ships within 3-5 business days' : 'Access immediately after purchase'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Shield className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Buyer Protection</p>
                    <p className="text-xs text-slate-400">30-day money-back guarantee</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center"><Globe className="w-4 h-4 text-purple-600" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Secure Transaction</p>
                    <p className="text-xs text-slate-400">Encrypted payment processing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <SellerCard seller={listing.seller} />
          </div>
        </div>

        {/* Description + Details section (below photos) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-slate-900 mb-3">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
              </p>
            </div>

            {/* Tags */}
            {listing.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500" />Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag, i) => (
                    <Link
                      key={i}
                      href={`/marketplace?search=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors border border-purple-100"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Specs (if available) */}
            {listing.techSpecs && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="text-base font-bold text-slate-900 mb-3">Technical Specifications</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.techSpecs.vram && (
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">VRAM</p>
                      <p className="text-sm font-bold text-slate-900">{listing.techSpecs.vram} GB</p>
                    </div>
                  )}
                  {listing.techSpecs.framework && (
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Framework</p>
                      <p className="text-sm font-bold text-slate-900">{listing.techSpecs.framework.join(', ')}</p>
                    </div>
                  )}
                  {listing.techSpecs.gpuType && (
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">GPU Type</p>
                      <p className="text-sm font-bold text-slate-900">{listing.techSpecs.gpuType}</p>
                    </div>
                  )}
                  {listing.techSpecs.tokenCount && (
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Token Count</p>
                      <p className="text-sm font-bold text-slate-900">{listing.techSpecs.tokenCount.toLocaleString()}</p>
                    </div>
                  )}
                  {listing.techSpecs.condition && (
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Condition</p>
                      <p className="text-sm font-bold text-slate-900">{listing.techSpecs.condition}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Item Details for Supabase listings */}
            {supabaseData && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="text-base font-bold text-slate-900 mb-3">Item Details</h2>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  {supabaseData.condition && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Condition</p>
                      <p className="text-sm text-slate-800 capitalize">{supabaseData.condition}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Category</p>
                    <p className="text-sm text-slate-800">{supabaseData.category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Delivery</p>
                    <p className="text-sm text-slate-800 capitalize">{supabaseData.delivery_method || 'Digital'}</p>
                  </div>
                  {supabaseData.location && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Location</p>
                      <p className="text-sm text-slate-800 flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500" />{supabaseData.location}</p>
                    </div>
                  )}
                  {supabaseData.license && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">License</p>
                      <p className="text-sm text-slate-800">{supabaseData.license}</p>
                    </div>
                  )}
                  {supabaseData.frameworks && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Frameworks</p>
                      <p className="text-sm text-slate-800">{supabaseData.frameworks}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{supabaseData.views || 0} views</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{supabaseData.saves || 0} saves</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Listed {new Date(supabaseData.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Q&A Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Q&A (12 questions)</h2>
              </div>
              <div className="space-y-3 mb-4">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-semibold text-slate-800 mb-1.5">Q: Does this come with documentation or setup instructions?</p>
                  <p className="text-xs text-slate-500">A: Yes, full documentation included with setup guide, API reference, and example code. — <span className="text-purple-600 font-semibold">{listing.seller.name}</span></p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-semibold text-slate-800 mb-1.5">Q: Is there a warranty or money-back guarantee?</p>
                  <p className="text-xs text-slate-500">A: All purchases are covered by WhichAI&apos;s 30-day buyer protection. If it doesn&apos;t work as described, full refund. — <span className="text-purple-600 font-semibold">{listing.seller.name}</span></p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-semibold text-slate-800 mb-1.5">Q: Can this be used commercially?</p>
                  <p className="text-xs text-slate-500">A: Please check the license details above. Commercial use terms vary by listing. — <span className="text-purple-600 font-semibold">{listing.seller.name}</span></p>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors">
                Ask a Question
              </button>
            </div>
          </div>

          {/* Right: Related/Similar (placeholder) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />You might also like
              </h3>
              <div className="space-y-3">
                {allListingsV3
                  .filter((l) => l.bigCategory === listing.bigCategory && l.id !== listing.id)
                  .slice(0, 4)
                  .map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/marketplace/listing?id=${rel.id}`}
                      className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {rel.images && rel.images.length > 0 ? (
                          <img src={rel.images[0]} alt={rel.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{rel.emoji}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-purple-600 transition-colors">{rel.name}</p>
                        <p className="text-xs text-slate-400 truncate">{rel.description.slice(0, 50)}...</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">${rel.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
              </div>
              <Link href="/marketplace" className="block text-center mt-3 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                Browse all listings →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Message Seller Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMessageModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Message Seller</h2>
                  <p className="text-xs text-slate-400">{listing.seller.name}</p>
                </div>
                <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-6">
                {/* Listing preview */}
                <div className="flex gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{listing.emoji}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{listing.name}</p>
                    <p className="text-sm font-bold text-slate-900">{listing.unit === 'free' ? 'Free' : `$${listing.price.toFixed(2)}`}</p>
                  </div>
                </div>

                {messageSent ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-6">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <Check className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="font-bold text-slate-900">Message Sent!</p>
                    <p className="text-xs text-slate-400 mt-1">The seller will be notified</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Quick replies */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['Hi, is this still available?', 'What\'s the lowest price?', 'Can you ship this?', 'Is this negotiable?'].map((q) => (
                        <button key={q} onClick={() => setMessage(q)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${message === q ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-slate-600 hover:bg-gray-200 border border-transparent'}`}>
                          {q}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm text-slate-800 resize-none"
                      placeholder="Type your message..."
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />Send Message
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f0eb]">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <ListingDetailContent />
    </Suspense>
  );
}
