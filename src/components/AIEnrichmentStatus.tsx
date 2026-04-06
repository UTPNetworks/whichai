'use client';

/**
 * AIEnrichmentStatus
 * ------------------
 * Displays an animated, step-by-step "AI is enriching your listing" status panel.
 *
 * Usage:
 *   <AIEnrichmentStatus listingId={id} onComplete={(enriched) => setListing(enriched)} />
 *
 * The component polls the `user_listings` row every 3 s until the
 * `enrichment_status` column flips to "complete" (or "failed").
 * Each intermediate step is surfaced via the `enrichment_step` column
 * written by the Supabase Edge Function.
 *
 * Expected `user_listings` columns (added via migration):
 *   enrichment_status  TEXT  -- "pending" | "processing" | "complete" | "failed"
 *   enrichment_step    TEXT  -- "analyzing_image" | "generating_specs" | "writing_description" | "tagging"
 *   ai_generated       BOOLEAN
 *   refined_title      TEXT
 *   refined_description TEXT
 *   technical_specs    JSONB
 *   ai_compatibility   JSONB  (TEXT[])
 *   suggested_hashtags JSONB  (TEXT[])
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ImageIcon, Cpu, FileText, Tag, CheckCircle2,
  AlertTriangle, Loader2, BadgeCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EnrichmentStatus = 'pending' | 'processing' | 'complete' | 'failed';
export type EnrichmentStep =
  | 'analyzing_image'
  | 'generating_specs'
  | 'writing_description'
  | 'tagging'
  | null;

export interface EnrichedListing {
  id: string;
  refined_title?: string;
  refined_description?: string;
  technical_specs?: Record<string, string>;
  ai_compatibility?: string[];
  suggested_hashtags?: string[];
  enrichment_status: EnrichmentStatus;
  enrichment_step: EnrichmentStep;
  ai_generated?: boolean;
}

interface Props {
  listingId: string;
  /** Called once enrichment reaches "complete" or "failed" */
  onComplete?: (listing: EnrichedListing) => void;
  /** Override polling interval (ms). Default: 3000 */
  pollIntervalMs?: number;
}

// ── Step definitions ──────────────────────────────────────────────────────────

interface StepDef {
  key: EnrichmentStep;
  label: string;
  sublabel: string;
  Icon: React.ElementType;
}

const STEPS: StepDef[] = [
  {
    key: 'analyzing_image',
    label: 'Analysing image',
    sublabel: 'Identifying brand, model & condition via vision AI',
    Icon: ImageIcon,
  },
  {
    key: 'generating_specs',
    label: 'Extracting technical specs',
    sublabel: 'Pulling VRAM, architecture, interface & performance data',
    Icon: Cpu,
  },
  {
    key: 'writing_description',
    label: 'Writing listing copy',
    sublabel: 'Crafting title, description & AI compatibility notes',
    Icon: FileText,
  },
  {
    key: 'tagging',
    label: 'Generating tags',
    sublabel: 'Building SEO-optimised hashtag array',
    Icon: Tag,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function stepIndex(step: EnrichmentStep): number {
  if (!step) return -1;
  return STEPS.findIndex((s) => s.key === step);
}

// ── Sub-components ────────────────────────────────────────────────────────────

const PulsingDot = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500" />
  </span>
);

interface StepRowProps {
  step: StepDef;
  status: 'waiting' | 'active' | 'done';
  index: number;
}

const StepRow = ({ step, status, index }: StepRowProps) => {
  const { Icon } = step;

  const iconBg =
    status === 'done'
      ? 'bg-green-100 text-green-600'
      : status === 'active'
      ? 'bg-purple-100 text-purple-600'
      : 'bg-gray-100 text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-start gap-3"
    >
      {/* Icon bubble */}
      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${iconBg}`}>
        {status === 'active' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === 'done' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium leading-tight transition-colors duration-300 ${
              status === 'done'
                ? 'text-green-700 line-through decoration-green-400'
                : status === 'active'
                ? 'text-purple-700'
                : 'text-gray-400'
            }`}
          >
            {step.label}
          </span>
          {status === 'active' && <PulsingDot />}
        </div>
        <p
          className={`text-xs mt-0.5 leading-snug transition-colors duration-300 ${
            status === 'active' ? 'text-purple-500' : 'text-gray-400'
          }`}
        >
          {step.sublabel}
        </p>
      </div>
    </motion.div>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────────

const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
      initial={{ width: '4%' }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIEnrichmentStatus({
  listingId,
  onComplete,
  pollIntervalMs = 3000,
}: Props) {
  const [enrichmentStatus, setEnrichmentStatus] = useState<EnrichmentStatus>('pending');
  const [currentStep, setCurrentStep] = useState<EnrichmentStep>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    const { data, error } = await supabase
      .from('user_listings')
      .select(
        'id, enrichment_status, enrichment_step, refined_title, refined_description, technical_specs, ai_compatibility, suggested_hashtags, ai_generated'
      )
      .eq('id', listingId)
      .single();

    if (error || !data) return;

    const status: EnrichmentStatus = data.enrichment_status ?? 'pending';
    const step: EnrichmentStep = data.enrichment_step ?? null;

    setEnrichmentStatus(status);
    setCurrentStep(step);

    if (status === 'complete' || status === 'failed') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onComplete?.(data as EnrichedListing);
    }
  }, [listingId, onComplete]);

  useEffect(() => {
    poll(); // immediate first check
    intervalRef.current = setInterval(poll, pollIntervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll, pollIntervalMs]);

  // ── Derived state ──
  const activeIdx = stepIndex(currentStep);

  // Progress: pending=4%, each step adds 24%, complete=100%
  const progressPct =
    enrichmentStatus === 'complete'
      ? 100
      : enrichmentStatus === 'failed'
      ? 100
      : activeIdx === -1
      ? 4
      : 4 + (activeIdx + 1) * (96 / STEPS.length);

  const isFailed = enrichmentStatus === 'failed';
  const isDone = enrichmentStatus === 'complete';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence mode="wait">
      {!isDone && (
        <motion.div
          key="enrichment-panel"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-5 space-y-4 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-800 leading-tight">
                {isFailed ? 'AI enrichment failed' : 'AI enrichment in progress'}
              </p>
              <p className="text-xs text-purple-500 mt-0.5">
                {isFailed
                  ? 'Your listing was saved. You can edit it manually.'
                  : 'Claude is analysing your listing — this takes ~15 seconds'}
              </p>
            </div>
            {isFailed && <AlertTriangle className="w-5 h-5 text-amber-500 ml-auto flex-shrink-0" />}
          </div>

          {/* Progress bar */}
          <ProgressBar pct={isFailed ? 100 : progressPct} />

          {/* Steps */}
          {!isFailed && (
            <div className="space-y-3 pt-1">
              {STEPS.map((step, idx) => {
                const status =
                  idx < activeIdx
                    ? 'done'
                    : idx === activeIdx
                    ? 'active'
                    : 'waiting';
                return <StepRow key={step.key} step={step} status={status} index={idx} />;
              })}
            </div>
          )}

          {/* AI badge note */}
          {!isFailed && (
            <p className="text-[11px] text-purple-400 flex items-center gap-1.5 pt-1 border-t border-purple-100">
              <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" />
              Result will carry an <strong className="font-semibold">AI-Generated</strong> badge until you review &amp; approve
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
