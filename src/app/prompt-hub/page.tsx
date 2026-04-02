'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, X, ChevronRight, ArrowRight, Sparkles, Gift,
  MessageSquare, Tag, Crown, Download, BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CATEGORY_GROUPS, PROMPT_COLLECTIONS, getCollectionsByCategory } from '@/lib/prompt-data';

// ── Stats ────────────────────────────────────────────────────────
const HERO_STATS = [
  { val: '4,800+', label: 'Prompts', icon: MessageSquare },
  { val: '16', label: 'Collections', icon: BookOpen },
  { val: '8', label: 'Categories', icon: Tag },
  { val: '50K+', label: 'Downloads', icon: Download },
];

// ── Collection Card ──────────────────────────────────────────────
function CollectionCard({
  collection,
  index,
}: {
  collection: typeof PROMPT_COLLECTIONS[0];
  index: number;
}) {
  const group = CATEGORY_GROUPS.find((g) => g.id === collection.category);

  return (
    <Link href={`/prompt-hub/${collection.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className="group relative bg-white rounded-2xl border border-gray-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/40 transition-all duration-300 p-5 flex items-start gap-4 cursor-pointer"
      >
        {/* Emoji icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: (group?.color || '#6366f1') + '15' }}
        >
          {collection.emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 group-hover:text-violet-700 transition-colors">
            {collection.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">
            {collection.description}
          </p>
          <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
            {collection.prompts.length} ready-to-use prompts
          </span>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      </motion.div>
    </Link>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function PromptHubPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter collections by search
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return CATEGORY_GROUPS.map((group) => {
      const collections = getCollectionsByCategory(group.id);

      if (!q) return { group, collections };

      const filtered = collections.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.prompts.some(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.tags.some((t) => t.toLowerCase().includes(q))
          )
      );
      return { group, collections: filtered };
    }).filter((entry) => entry.collections.length > 0);
  }, [searchQuery]);

  const totalCollections = filteredGroups.reduce(
    (sum, entry) => sum + entry.collections.length,
    0
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-violet-50 border-b border-gray-200/60">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/30 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/25 rounded-full blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(148,163,184,0.3) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-12 text-center">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            <Link
              href="/hub"
              className="text-xs text-slate-400 hover:text-violet-600 transition-colors"
            >
              Hub
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-xs text-violet-600 font-semibold">
              Prompt Hub
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3"
          >
            Prompt{' '}
            <span className="bg-gradient-to-r from-rose-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Hub
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-base max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Browse curated prompt collections across 8 categories. Copy, learn,
            and level up your AI game.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative max-w-2xl mx-auto mb-6"
          >
            <div className="relative flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections, prompts, tags..."
                className="flex-1 pl-12 pr-4 py-4 text-sm text-slate-900 bg-transparent rounded-2xl focus:outline-none placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {HERO_STATS.map(({ val, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-slate-900 mb-0.5">
                  {val}
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <Icon className="w-3 h-3" /> {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Main Content: Category sections ────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Results count */}
        {searchQuery && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-bold text-slate-800">
                {totalCollections}
              </span>{' '}
              collections
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear search
            </button>
          </div>
        )}

        {filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              No collections found
            </h3>
            <p className="text-sm text-slate-400">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredGroups.map(({ group, collections }) => (
              <section key={group.id}>
                {/* Category heading */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-1.5 h-7 rounded-full"
                    style={{ background: group.color }}
                  />
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {group.label}
                  </h2>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    {collections.length}{' '}
                    {collections.length === 1 ? 'collection' : 'collections'}
                  </span>
                </div>

                {/* Collection cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collections.map((collection, i) => (
                    <CollectionCard
                      key={collection.slug}
                      collection={collection}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ── Contribute CTA ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Share Your Best Prompts
            </h2>
            <p className="text-violet-200 text-base mb-7 max-w-lg mx-auto leading-relaxed">
              Got a prompt that works like magic? Sell it, share it for free, or
              donate it to the community. Join 2,100+ creators on the Prompt Hub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-violet-700 bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Sell a Prompt
              </Link>
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all">
                <Gift className="w-4 h-4" />
                Donate for Free
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
