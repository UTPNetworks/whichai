'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { MarketListingV3 } from '@/lib/data';

interface AuctionCardProps {
  listing: MarketListingV3;
  index: number;
}

function useCountdown(endTime: string) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, ended: false });

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, ended: true });
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        ended: false,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg w-12 h-12 flex items-center justify-center tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-amber-600 font-semibold mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function AuctionCard({ listing, index }: AuctionCardProps) {
  const time = useCountdown(listing.auctionEnd || new Date().toISOString());
  const image = listing.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link href={`/marketplace/listing?id=${listing.id}`} className="block">
        <div className="bg-white border border-gray-200 hover:border-amber-400 rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-lg group">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={listing.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                {listing.emoji || '⚡'}
              </div>
            )}
            {/* LIVE badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
            {/* Auction badge */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold">
              Auction
            </div>
          </div>

          {/* Bid Info */}
          <div className="p-5">
            {/* Current Bid + Bids row */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">Current Bid</p>
                <p className="text-2xl font-bold text-amber-700">${(listing.currentBid || listing.price).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  {listing.reservePrice ? 'Reserve' : 'Bids'}
                </p>
                <p className="text-sm font-bold text-slate-600">
                  {listing.reservePrice
                    ? `$${listing.reservePrice.toLocaleString()}`
                    : `${listing.bidCount || 0} bids`}
                </p>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 text-sm mb-4 line-clamp-1">
              {listing.name}
            </h3>

            {/* Countdown Timer */}
            {time.ended ? (
              <div className="text-center py-3 rounded-lg bg-gray-100 text-sm font-semibold text-slate-500">
                Auction Ended
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-4">
                <TimerUnit value={time.d} label="Days" />
                <span className="text-amber-400 font-bold text-lg mt-[-16px]">:</span>
                <TimerUnit value={time.h} label="Hrs" />
                <span className="text-amber-400 font-bold text-lg mt-[-16px]">:</span>
                <TimerUnit value={time.m} label="Min" />
                <span className="text-amber-400 font-bold text-lg mt-[-16px]">:</span>
                <TimerUnit value={time.s} label="Sec" />
              </div>
            )}

            {/* Place Bid Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => e.preventDefault()}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Zap size={16} />
              Place Bid
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
