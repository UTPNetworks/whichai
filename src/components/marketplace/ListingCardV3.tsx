'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, MapPin, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { MarketListingV3 } from '@/lib/data';
import MicroGallery from './MicroGallery';
import MetadataBadges from './MetadataBadges';
import CodePreview from './CodePreview';

interface ListingCardV3Props {
  listing: MarketListingV3;
  index: number;
  onCompare?: (id: string) => void;
}

const categoryEmojis: Record<string, string> = {
  'digital-assets': '🤖',
  'compute-hub': '⚩',
  'hardware-corner': '🖥️',
};

const categoryBadges: Record<string, { bg: string; text: string }> = {
  'digital-assets': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'compute-hub': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  'hardware-corner': { bg: 'bg-green-50', text: 'text-green-700' },
};

function AuctionTimer({ endTime, bidCount }: { endTime: string; bidCount?: number }) {
  const [timeLeft, setTimeLeft] = React.useState('');
  React.useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-amber-600 font-semibold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        {timeLeft}
      </span>
      {bidCount && <span className="text-slate-400">{bidCount} bids</span>}
    </div>
  );
}

export default function ListingCardV3({
  listing,
  index,
  onCompare,
}: ListingCardV3Props) {
  const [isHovering, setIsHovering] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const discountPct = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  const catBadge = categoryBadges[listing.bigCategory];
  const emoji = categoryEmojis[listing.bigCategory];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="h-full"
    >
      <Link href={`/marketplace/listing?id=${listing.id}`} className="block h-full">
      <motion.div
        animate={{ scale: isHovering ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
        className="h-full bg-white border border-gray-200 hover:border-purple-400 rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md cursor-pointer"
      >
        {/* Image Section */}
        <MicroGallery
          images={listing.images || []}
          alt={listing.name}
          categoryEmoji={emoji}
        />

        {/* Content Section */}
        <div className="p-3 flex flex-col h-full">
          {/* Badges row */}
          <div className="flex gap-1.5 mb-1.5">
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${catBadge.bg} ${catBadge.text}`}
            >
              {listing.subcategory}
            </span>
            {listing.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 border border-amber-200 text-amber-700">
                {listing.badge}
              </span>
            )}
            {listing.pricingType === 'auction' && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 border border-amber-200 text-amber-700">⚡ Auction</span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="font-bold text-slate-900 text-[13px] mb-0.5 line-clamp-1">
            {listing.name}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
            {listing.description}
          </p>

          {/* Seller row - more compact */}
          <div className="flex items-center gap-1.5 mb-2 text-[10px]">
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-br ${
                listing.seller.name.includes('OpenAI')
                  ? 'from-green-400 to-emerald-500'
                  : listing.seller.name.includes('Claude')
                  ? 'from-orange-400 to-amber-500'
                  : 'from-blue-400 to-purple-500'
              } flex items-center justify-center font-bold text-white text-[9px]`}
            >
              {listing.seller.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-1">
              <p className="text-slate-700 truncate font-semibold">
                {listing.seller.name}
              </p>
              {listing.seller.verified && (
                <Check size={10} className="text-cyan-600 flex-shrink-0" />
              )}
            </div>
          </div>

          <div className="mt-auto pt-2 border-t border-gray-100">
            {/* Auction timer */}
            {listing.pricingType === 'auction' && listing.auctionEnd && (
              <div className="mb-1.5">
                <AuctionTimer endTime={listing.auctionEnd} bidCount={listing.bidCount} />
              </div>
            )}
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                {listing.pricingType === 'auction' ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-amber-700">${(listing.currentBid || listing.price).toLocaleString()}</span>
                  </div>
                ) : listing.pricingType === 'free' ? (
                  <span className="text-xs font-bold text-green-600">Free</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900">${listing.price.toLocaleString()}</span>
                    {listing.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through">${listing.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tight">{listing.unit}</span>
                  {discountPct && <span className="text-[9px] text-green-600 font-bold">-{discountPct}%</span>}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.preventDefault()}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center justify-center min-w-[60px] ${
                  listing.pricingType === 'auction'
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : listing.pricingType === 'negotiable'
                    ? 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200'
                    : listing.pricingType === 'free'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                {listing.pricingType === 'auction' ? 'Bid' : listing.pricingType === 'negotiable' ? 'Offer' : listing.pricingType === 'free' ? 'Get' : 'Buy'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      </Link>
    </motion.div>
  );
}
