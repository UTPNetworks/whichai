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
        <div className="p-4 flex flex-col h-full">
          {/* Badges row */}
          <div className="flex gap-2 mb-2">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${catBadge.bg} ${catBadge.text}`}
            >
              {listing.subcategory}
            </span>
            {listing.badge && (
              <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-50 border border-amber-200 text-amber-700">
                {listing.badge}
              </span>
            )}
            {listing.pricingType === 'auction' && (
              <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-50 border border-amber-200 text-amber-700">⚡ Auction</span>
            )}
            {listing.pricingType === 'negotiable' && (
              <span className="px-2 py-1 text-xs font-semibold rounded bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700">💬 Make Offer</span>
            )}
            {listing.pricingType === 'free' && (
              <span className="px-2 py-1 text-xs font-semibold rounded bg-green-50 border border-green-200 text-green-700">🆓 Free</span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">
            {listing.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {listing.description}
          </p>

          {/* Tags */}
          <div className="flex gap-1 flex-wrap mb-3">
            {listing.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-slate-600 border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Seller row */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-br ${
                listing.seller.name.includes('OpenAI')
                  ? 'from-green-400 to-emerald-500'
                  : listing.seller.name.includes('Claude')
                  ? 'from-orange-400 to-amber-500'
                  : 'from-blue-400 to-purple-500'
              } flex items-center justify-center font-bold text-white`}
            >
              {listing.seller.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 truncate font-medium">
                {listing.seller.name}
              </p>
              {listing.seller.verified && (
                <div className="flex items-center gap-1 text-cyan-600">
                  <Check size={12} />
                  <span>Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Distance badge if available */}
          {listing.distance && (
            <div className="flex items-center gap-1 text-xs text-blue-600 mb-3">
              <MapPin size={14} />
              <span>{listing.distance.toFixed(1)} mi away</span>
            </div>
          )}

          {/* Hover reveal section */}
          {isHovering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 mb-3 border-t border-gray-200 pt-3"
            >
              {/* Compare checkbox */}
              {onCompare && (
                <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.preventDefault()}>
                  <input
                    type="checkbox"
                    checked={isComparing}
                    onChange={(e) => {
                      e.stopPropagation();
                      setIsComparing(e.target.checked);
                      onCompare(listing.id);
                    }}
                    className="w-4 h-4 rounded bg-purple-500/30 border border-purple-500/50 cursor-pointer accent-cyan-400"
                  />
                  <span className="text-xs text-slate-600">Quick Compare</span>
                </label>
              )}

              {/* Tech specs */}
              <MetadataBadges
                techSpecs={listing.techSpecs}
                category={listing.bigCategory}
              />

              {/* Code snippet preview */}
              {listing.codeSnippet && (
                <CodePreview code={listing.codeSnippet} />
              )}
            </motion.div>
          )}

          <div className="mt-auto pt-3 border-t border-gray-200">
            {/* Auction timer */}
            {listing.pricingType === 'auction' && listing.auctionEnd && (
              <AuctionTimer endTime={listing.auctionEnd} bidCount={listing.bidCount} />
            )}
            <div className="flex items-center justify-between mt-2">
              <div>
                {listing.pricingType === 'auction' ? (
                  <>
                    <p className="text-[10px] text-amber-600 font-semibold uppercase">Current Bid</p>
                    <span className="text-lg font-bold text-amber-700">${(listing.currentBid || listing.price).toLocaleString()}</span>
                  </>
                ) : listing.pricingType === 'free' ? (
                  <span className="text-lg font-bold text-green-600">Free</span>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900">${listing.price.toLocaleString()}</span>
                      {listing.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">${listing.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{listing.unit}</p>
                    {discountPct && <p className="text-xs text-green-600 font-semibold">Save {discountPct}%</p>}
                  </>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.preventDefault()}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  listing.pricingType === 'auction'
                    ? 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
                    : listing.pricingType === 'negotiable'
                    ? 'bg-fuchsia-50 border border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-100'
                    : listing.pricingType === 'free'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600'
                }`}
              >
                {listing.pricingType === 'auction' ? (
                  <><Clock size={14} className="inline mr-1" />Bid</>
                ) : listing.pricingType === 'negotiable' ? (
                  '💬 Offer'
                ) : listing.pricingType === 'free' ? (
                  '⬇ Get'
                ) : (
                  <><Zap size={14} className="inline mr-1" />Buy</>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      </Link>
    </motion.div>
  );
}
