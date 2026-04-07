'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star } from 'lucide-react';

export interface FilterState {
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'trending' | 'distance';
  priceRange: [number, number];
  minRating: number;
  vramMin: number;
  frameworks: string[];
  subcategories: string[];
  maxDistance: number;
  zipCode?: string;
}

interface PowerFilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  listingCount: number;
}

const sortOptions = [
  { value: 'trending' as const, label: '🔥 Trending' },
  { value: 'price-asc' as const, label: '💰 Price (Low to High)' },
  { value: 'price-desc' as const, label: '💸 Price (High to Low)' },
  { value: 'rating' as const, label: '⭐ Top Rated' },
  { value: 'distance' as const, label: '📍 Nearest' },
];

const frameworks = ['PyTorch', 'TensorFlow', 'JAX', 'ONNX'];

export default function PowerFilterPanel({
  filters,
  onFiltersChange,
  listingCount,
}: PowerFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleFramework = (fw: string) => {
    const updated = filters.frameworks.includes(fw)
      ? filters.frameworks.filter((f) => f !== fw)
      : [...filters.frameworks, fw];
    updateFilter('frameworks', updated);
  };

  return (
    <div className="w-full mb-6">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white border border-gray-200 text-slate-900 font-semibold transition-all shadow-sm hover:border-purple-300"
        whileHover={{ scale: 1.01 }}
      >
        <span className="flex items-center gap-2">
          🎛️ Filters & Sort
          {(filters.frameworks.length > 0 || filters.maxDistance < 500) && (
            <span className="ml-2 px-2 py-1 bg-cyan-50 border border-cyan-300 text-cyan-700 text-xs rounded-full">
              {filters.frameworks.length + (filters.maxDistance < 500 ? 1 : 0)} active
            </span>
          )}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={20} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Sort By</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {sortOptions.map((opt) => (
                    <motion.button
                      key={opt.value}
                      onClick={() => updateFilter('sortBy', opt.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        filters.sortBy === opt.value
                          ? 'bg-purple-100 border border-purple-300 text-purple-700'
                          : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Price Range</h4>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">Min</label>
                    <input type="number" value={filters.priceRange[0]} onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])} className="w-full px-2 py-1 rounded bg-gray-50 border border-gray-200 text-slate-900 text-sm focus:outline-none focus:border-purple-400 mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">Max</label>
                    <input type="number" value={filters.priceRange[1]} onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])} className="w-full px-2 py-1 rounded bg-gray-50 border border-gray-200 text-slate-900 text-sm focus:outline-none focus:border-purple-400 mt-1" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Min Rating</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <motion.button key={stars} onClick={() => updateFilter('minRating', stars)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${ filters.minRating === stars ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`} whileHover={{ scale: 1.05 }}>
                      {stars}<Star size={14} className="inline ml-1" fill="currentColor" />
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Min VRAM: {filters.vramMin}GB</h4>
                <input type="range" min="0" max="80" value={filters.vramMin} onChange={(e) => updateFilter('vramMin', Number(e.target.value))} className="w-full cursor-pointer accent-cyan-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Frameworks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {frameworks.map((fw) => (
                    <motion.button key={fw} onClick={() => toggleFramework(fw)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${ filters.frameworks.includes(fw) ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`} whileHover={{ scale: 1.05 }}>{fw}</motion.button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Max Distance: {filters.maxDistance} mi</h4>
                <input type="range" min="0" max="500" value={filters.maxDistance} onChange={(e) => updateFilter('maxDistance', Number(e.target.value))} className="w-full cursor-pointer accent-cyan-500" />
              </div>
              <div className="pt-4 border-t border-gray-200 text-sm text-slate-600">Showing {listingCount} listings</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
