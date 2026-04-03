'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Shield, Clock, Package, BadgeCheck, MessageCircle,
  MapPin, TrendingUp, Users, ShoppingBag, ChevronRight, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ListingCardV3 from '@/components/marketplace/ListingCardV3';
import { allListingsV3, MarketListingV3 } from '@/lib/data';

// Demo seller store data
const DEMO_STORES: Record<string, {
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  banner: string;
  verified: boolean;
  memberSince: string;
  location: string;
  rating: number;
  reviews: number;
  itemsSold: number;
  positiveRate: number;
  responseTime: string;
  badges: string[];
}> = {
  'neuralforge': {
    name: 'NeuralForge Labs',
    handle: '/store/neuralforge',
    bio: 'Building the future of AI automation. We sell production-ready agents, fine-tuned models, and enterprise prompt packs. All products include lifetime updates and dedicated support.',
    avatar: 'N',
    banner: 'from-purple-600 via-violet-500 to-cyan-500',
    verified: true,
    memberSince: 'Jan 2024',
    location: 'San Francisco, CA',
    rating: 4.9,
    reviews: 342,
    itemsSold: 1247,
    positiveRate: 98,
    responseTime: '< 1 hour',
    badges: ['Top Seller', 'Fast Shipper', 'Verified Business'],
  },
  'gputrader': {
    name: 'GPUTrader_Pro',
    handle: '/store/gputrader',
    bio: 'Professional GPU reseller specializing in enterprise and consumer NVIDIA cards. All items tested and guaranteed. Bulk discounts available for 5+ units.',
    avatar: 'G',
    banner: 'from-emerald-600 via-teal-500 to-cyan-500',
    verified: true,
    memberSince: 'Mar 2024',
    location: 'Austin, TX',
    rating: 4.8,
    reviews: 189,
    itemsSold: 523,
    positiveRate: 97,
    responseTime: '< 2 hours',
    badges: ['Hardware Expert', 'Verified Business'],
  },
  'promptcraft': {
    name: 'PromptCraft Studio',
    handle: '/store/promptcraft',
    bio: 'Crafting premium prompt packs for marketing, coding, and creative professionals. Our prompts are battle-tested across GPT-4, Claude, and Gemini.',
    avatar: 'P',
    banner: 'from-pink-600 via-rose-500 to-orange-500',
    verified: true,
    memberSince: 'Jun 2024',
    location: 'New York, NY',
    rating: 4.7,
    reviews: 256,
    itemsSold: 892,
    positiveRate: 96,
    responseTime: '< 30 min',
    badges: ['Top Seller', 'Digital Expert'],
  },
};

function StoreContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('id') || 'neuralforge';
  const store = DEMO_STORES[storeId] || DEMO_STORES['neuralforge'];
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'about'>('listings');

  // Get demo listings for this store
  const storeListings = allListingsV3.slice(0, 8);

  const tabs = [
    { key: 'listings' as const, label: `Listings (${storeListings.length})` },
    { key: 'reviews' as const, label: `Reviews (${store.reviews})` },
    { key: 'about' as const, label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <Navbar />

      {/* Store Banner */}
      <div className={`h-48 bg-gradient-to-r ${store.banner} relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Store Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl">
            {store.avatar}
          </div>
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
              {store.verified && <BadgeCheck className="w-6 h-6 text-cyan-500" />}
            </div>
            <p className="text-sm text-slate-500 mb-2">{store.handle}</p>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{store.bio}</p>
          </div>
          <div className="flex gap-2 sm:mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />Contact Seller
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Follow
            </motion.button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { value: store.itemsSold.toLocaleString(), label: 'Items Sold', icon: ShoppingBag, color: 'text-purple-600' },
            { value: `${store.rating}`, label: 'Rating', icon: Star, color: 'text-amber-500' },
            { value: `${store.positiveRate}%`, label: 'Positive', icon: TrendingUp, color: 'text-emerald-600' },
            { value: storeListings.length.toString(), label: 'Active Listings', icon: Package, color: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {store.badges.map((badge) => (
            <span key={badge} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              {badge}
            </span>
          ))}
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />Responds {store.responseTime}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <MapPin className="w-3 h-3" />{store.location}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'listings' && (
            <motion.div
              key="listings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-16"
            >
              {storeListings.map((listing, idx) => (
                <ListingCardV3 key={listing.id} listing={listing} index={idx} />
              ))}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pb-16"
            >
              {[
                { user: 'Alex K.', rating: 5, date: '2 days ago', text: 'Excellent quality prompt pack. Saved me hours of work on my marketing campaigns. Seller was very responsive to questions.' },
                { user: 'Maria S.', rating: 5, date: '1 week ago', text: 'The fine-tuned model works exactly as described. Great documentation included. Would buy again.' },
                { user: 'James L.', rating: 4, date: '2 weeks ago', text: 'Good product overall. Took a bit to set up but seller helped me through it via chat. Solid support.' },
                { user: 'Priya D.', rating: 5, date: '3 weeks ago', text: 'Fast delivery, works perfectly. This seller consistently delivers high quality AI products.' },
              ].map((review, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                        {review.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{review.user}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pb-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Seller Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{store.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Member since {store.memberSince}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Identity verified by WhichAI</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{store.itemsSold} successful transactions</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Policies</h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-800">Returns:</span> 30-day money-back guarantee on all digital products</p>
                    <p><span className="font-semibold text-slate-800">Shipping:</span> Free shipping on orders over $500. Standard 3-5 business days.</p>
                    <p><span className="font-semibold text-slate-800">Support:</span> Responds to messages within {store.responseTime}. Available Mon-Fri 9AM-6PM PT.</p>
                    <p><span className="font-semibold text-slate-800">Warranty:</span> All hardware items include manufacturer warranty transfer.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SellerStorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f0eb]">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <StoreContent />
    </Suspense>
  );
}
