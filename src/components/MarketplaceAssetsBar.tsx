'use client';

import { useState } from 'react';

const ASSETS = [
  { label: 'GPU Rentals',       emoji: '🖥️', count: '1,240+', desc: 'listings available',  color: '#6366f1' },
  { label: 'API Credits',       emoji: '🔑', count: '890+',   desc: 'credit bundles',       color: '#8b5cf6' },
  { label: 'Used GPUs',         emoji: '⚡', count: '340+',   desc: 'verified units',        color: '#ec4899' },
  { label: 'AI Kits',           emoji: '🤖', count: '215+',   desc: 'edge AI kits',          color: '#06b6d4' },
  { label: 'Prompts',           emoji: '✍️', count: '4,800+', desc: 'prompt bundles',        color: '#10b981' },
  { label: 'Fine-tuned Models', emoji: '🧠', count: '620+',   desc: 'custom models',         color: '#f59e0b' },
  { label: 'AI Agents',         emoji: '🤝', count: '480+',   desc: 'ready-to-deploy',       color: '#ef4444' },
  { label: 'Subscriptions',     emoji: '📦', count: '310+',   desc: 'group buy deals',       color: '#3b82f6' },
  { label: 'Cloud Compute',     emoji: '☁️', count: '760+',   desc: 'cloud slots',           color: '#14b8a6' },
  { label: 'AI Laptops',        emoji: '💻', count: '125+',   desc: 'pre-configured',        color: '#a855f7' },
  { label: 'Servers',           emoji: '🗄️', count: '98+',    desc: 'AI-ready servers',      color: '#f97316' },
  { label: 'LoRAs',             emoji: '🎨', count: '1,100+', desc: 'style adapters',        color: '#84cc16' },
];

// Duplicate the array so the marquee loops seamlessly
const MARQUEE_ITEMS = [...ASSETS, ...ASSETS];

function AssetCard({ asset, index, hovered, setHovered }: {
  asset: typeof ASSETS[0];
  index: number;
  hovered: number | null;
  setHovered: (i: number | null) => void;
}) {
  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
        height: 90,
        borderRadius: 14,
        padding: '10px 16px',
        cursor: 'pointer',
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative',
        background:
          hovered === index
            ? 'rgba(255,255,255,0.18)'
            : 'rgba(255,255,255,0.08)',
        border: `1px solid ${
          hovered === index
            ? 'rgba(255,255,255,0.4)'
            : 'rgba(255,255,255,0.15)'
        }`,
        transform:
          hovered === index ? 'translateY(-4px) scale(1.05)' : 'none',
        boxShadow:
          hovered === index ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ fontSize: 22, marginBottom: 4, lineHeight: 1 }}>
        {asset.emoji}
      </span>
      <span
        style={{
          color: '#fff',
          fontSize: 11.5,
          fontWeight: 600,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {asset.label}
      </span>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          marginTop: 5,
          background: asset.color,
          display: 'block',
        }}
      />
      {/* Popup */}
      {hovered === index && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e1b4b',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            minWidth: 160,
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            {asset.count}
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.6)',
              display: 'block',
              marginTop: 2,
            }}
          >
            {asset.desc}
          </span>
          <span
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 10,
              padding: '3px 10px',
              borderRadius: 20,
              background: asset.color + '33',
              color: asset.color,
              border: `1px solid ${asset.color}55`,
            }}
          >
            ● On Marketplace
          </span>
        </div>
      )}
    </div>
  );
}

export default function MarketplaceAssetsBar() {
  const [hovered, setHovered] = useState<number | null>(null);
  const isPaused = hovered !== null;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        height: '150px',
      }}
    >
      {/* CSS keyframes for the marquee */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <span
        style={{
          position: 'absolute',
          top: 10,
          right: 20,
          fontSize: 10,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        Marketplace Assets
      </span>

      {/* Fade edges */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 60, zIndex: 5,
        background: 'linear-gradient(to right, #0f0c29, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 60, zIndex: 5,
        background: 'linear-gradient(to left, #24243e, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Scrolling track */}
      <div
        className="flex items-center gap-4 h-full px-4"
        style={{
          width: 'max-content',
          animation: 'marquee-scroll 40s linear infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {MARQUEE_ITEMS.map((asset, i) => (
          <AssetCard
            key={`${asset.label}-${i}`}
            asset={asset}
            index={i}
            hovered={hovered}
            setHovered={setHovered}
          />
        ))}
      </div>
    </div>
  );
}
