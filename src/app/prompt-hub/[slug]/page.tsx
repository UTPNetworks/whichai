'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, X, ChevronRight, Copy, Check, ArrowLeft, Tag, BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  getCollectionBySlug,
  CATEGORY_GROUPS,
  type Prompt,
} from '@/lib/prompt-data';

// ── Prompt Card (copyable) ───────────────────────────────────────
function PromptCard({ prompt, index }: { prompt: Prompt; index: number }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show first 200 chars when collapsed
  const isLong = prompt.prompt.length > 200;
  const displayText = expanded || !isLong ? prompt.prompt : prompt.prompt.slice(0, 200) + '…';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="bg-white rounded-2xl border border-gray-200 hover:border-violet-200 transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                #{index + 1}
              </span>
              <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                {prompt.title}
              </h3>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-sm hover:shadow-md'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        {/* Prompt text */}
        <div className="relative">
          <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 rounded-xl p-4 border border-slate-100">
            {displayText}
          </pre>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
            >
              {expanded ? 'Show less' : 'Show full prompt'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const collection = getCollectionBySlug(slug);
  const [searchQuery, setSearchQuery] = useState('');

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="sticky top-0 z-40">
          <Navbar />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Collection not found
          </h1>
          <p className="text-slate-500 mb-6">
            The prompt collection you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/prompt-hub"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Prompt Hub
          </Link>
        </div>
      </div>
    );
  }

  const group = CATEGORY_GROUPS.find((g) => g.id === collection.category);

  // Filter prompts by search
  const filteredPrompts = searchQuery.trim()
    ? collection.prompts.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    : collection.prompts;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-violet-50 border-b border-gray-200/60">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/30 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/25 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-10">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <Link
              href="/hub"
              className="text-xs text-slate-400 hover:text-violet-600 transition-colors"
            >
              Hub
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <Link
              href="/prompt-hub"
              className="text-xs text-slate-400 hover:text-violet-600 transition-colors"
            >
              Prompt Hub
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-xs text-violet-600 font-semibold">
              {collection.title}
            </span>
          </motion.div>

          {/* Title area */}
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: (group?.color || '#6366f1') + '15' }}
            >
              {collection.emoji}
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2"
              >
                {collection.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 text-sm leading-relaxed max-w-xl mb-3"
              >
                {collection.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-3"
              >
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: (group?.color || '#6366f1') + '18',
                    color: group?.color || '#6366f1',
                  }}
                >
                  {group?.label}
                </span>
                <span className="text-xs text-slate-400">
                  {collection.prompts.length} prompts
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search + Back */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
          <Link
            href="/prompt-hub"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Collections
          </Link>

          <div className="relative flex-1 w-full sm:max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts in this collection..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="text-xs text-slate-500 mb-4">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {filteredPrompts.length}
            </span>{' '}
            of {collection.prompts.length} prompts
          </p>
        )}

        {/* Prompt list */}
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 mb-1">
              No prompts match your search
            </h3>
            <p className="text-sm text-slate-400">Try a different keyword.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrompts.map((prompt, i) => (
              <PromptCard key={prompt.id} prompt={prompt} index={i} />
            ))}
          </div>
        )}

        {/* Bottom nav */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link
            href="/prompt-hub"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all collections
          </Link>
          <span className="text-xs text-slate-400">
            {collection.prompts.length} prompts in this collection
          </span>
        </div>
      </main>
    </div>
  );
}
