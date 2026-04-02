import { useState } from "react";

// ─── DESIGN CONCEPT: "The Signal" ────────────────────────────────
// WhichAi Community is called "The Signal" — because in the noise of
// AI hype, this is where you find the signal. Real conversations,
// real builders, real insights.
//
// ARCHITECTURE:
// 1. SPACES (like subreddits meets Discord channels)
// 2. THREADS (rich post types: Discussion, Question, Showcase, Poll, AMA)
// 3. REPUTATION (XP system tied to marketplace trust)
// 4. REAL-TIME (live presence, typing indicators, instant updates)

const SPACES = [
  { id: "model-arena", name: "Model Arena", emoji: "⚔️", color: "#8b5cf6", members: "12.4K", desc: "Debate, compare & roast AI models. GPT vs Claude vs Gemini — no holds barred.", category: "Discussion", hot: true, threads: 847, online: 234 },
  { id: "build-in-public", name: "Build in Public", emoji: "🔨", color: "#f59e0b", members: "8.2K", desc: "Share your AI project journey. Wins, fails, lessons — all welcome.", category: "Builders", hot: true, threads: 623, online: 189 },
  { id: "prompt-lab", name: "Prompt Lab", emoji: "🧪", color: "#ec4899", members: "15.1K", desc: "Experiment, share & refine prompts together. The community test kitchen.", category: "Learning", threads: 1240, online: 412 },
  { id: "gpu-garage", name: "GPU Garage", emoji: "🏎️", color: "#06b6d4", members: "5.7K", desc: "Hardware talk — GPUs, servers, rigs, benchmarks, deals & setups.", category: "Hardware", threads: 389, online: 87 },
  { id: "help-desk", name: "Help Desk", emoji: "🆘", color: "#10b981", members: "9.3K", desc: "Stuck? Ask anything AI. No question is too basic here.", category: "Q&A", threads: 2100, online: 156 },
  { id: "showcase", name: "Showcase", emoji: "🏆", color: "#f97316", members: "6.8K", desc: "Ship something cool? Show it off. Get feedback, users, and clout.", category: "Builders", threads: 445, online: 98 },
  { id: "ai-news", name: "AI News & Takes", emoji: "📡", color: "#6366f1", members: "18.9K", desc: "Breaking AI news, hot takes, and 'did you see this?' moments.", category: "Discussion", hot: true, threads: 1890, online: 567 },
  { id: "career-corner", name: "Career Corner", emoji: "💼", color: "#0ea5e9", members: "4.1K", desc: "AI job hunting, salary threads, interview prep, and career pivots.", category: "Career", threads: 312, online: 65 },
  { id: "watercooler", name: "Water Cooler", emoji: "🍻", color: "#a855f7", members: "7.5K", desc: "Off-topic banter. Memes, hot takes on tech Twitter, and vibes.", category: "Chill", threads: 980, online: 201 },
  { id: "research-papers", name: "Paper Club", emoji: "📄", color: "#14b8a6", members: "3.2K", desc: "Weekly paper discussions. Break down the latest arXiv drops together.", category: "Learning", threads: 156, online: 42 },
];

const CATEGORIES = ["All", "Discussion", "Builders", "Learning", "Hardware", "Q&A", "Career", "Chill"];

const TRENDING_THREADS = [
  { id: 1, space: "Model Arena", spaceEmoji: "⚔️", spaceColor: "#8b5cf6", title: "Claude Opus 4 just dropped and it's INSANE — here's my benchmark results", author: "neural_ninja", authorBadge: "Top Contributor", avatar: "🧠", type: "discussion", upvotes: 847, replies: 234, time: "2h ago", hot: true, pinned: false },
  { id: 2, space: "Build in Public", spaceEmoji: "🔨", spaceColor: "#f59e0b", title: "Day 47: My AI agent now handles 90% of my customer support. Here's the full stack breakdown.", author: "ship_it_sarah", authorBadge: "Builder", avatar: "🚀", type: "showcase", upvotes: 623, replies: 89, time: "4h ago", hot: true, pinned: false },
  { id: 3, space: "Prompt Lab", spaceEmoji: "🧪", spaceColor: "#ec4899", title: "[FREE] I tested 200 system prompts for coding — these 5 patterns consistently outperform", author: "prompt_wizard", authorBadge: "Verified Seller", avatar: "✨", type: "discussion", upvotes: 1203, replies: 312, time: "6h ago", hot: true, pinned: false },
  { id: 4, space: "Help Desk", spaceEmoji: "🆘", spaceColor: "#10b981", title: "How do I fine-tune LLaMA 3 on my own data? Complete noob, have RTX 4090", author: "ai_curious_dev", authorBadge: null, avatar: "🌱", type: "question", upvotes: 89, replies: 45, time: "1h ago", hot: false, answered: true, pinned: false },
  { id: 5, space: "AI News & Takes", spaceEmoji: "📡", spaceColor: "#6366f1", title: "OpenAI just acquired a robotics company. Here's why this changes everything.", author: "tech_pulse", authorBadge: "News Scout", avatar: "📡", type: "discussion", upvotes: 567, replies: 178, time: "30m ago", hot: true, pinned: false },
  { id: 6, space: "GPU Garage", spaceEmoji: "🏎️", spaceColor: "#06b6d4", title: "POLL: What's your daily driver GPU for inference? Results will surprise you.", author: "silicon_sam", authorBadge: "Hardware Expert", avatar: "⚡", type: "poll", upvotes: 234, replies: 156, time: "8h ago", hot: false, pinned: false },
  { id: 7, space: "Showcase", spaceEmoji: "🏆", spaceColor: "#f97316", title: "I built an AI that generates Figma designs from wireframe sketches — try it free", author: "design_ai_dan", authorBadge: "Builder", avatar: "🎨", type: "showcase", upvotes: 445, replies: 67, time: "12h ago", hot: false, pinned: false },
  { id: 8, space: "Water Cooler", spaceEmoji: "🍻", spaceColor: "#a855f7", title: "Unpopular opinion: AI will NOT replace developers. Here's my actual hot take.", author: "contrarian_carl", authorBadge: null, avatar: "🔥", type: "discussion", upvotes: 1567, replies: 489, time: "5h ago", hot: true, pinned: false },
];

const LEADERBOARD = [
  { rank: 1, name: "prompt_wizard", xp: 24500, badge: "Legend", avatar: "✨", streak: 45 },
  { rank: 2, name: "neural_ninja", xp: 21200, badge: "Legend", avatar: "🧠", streak: 38 },
  { rank: 3, name: "ship_it_sarah", xp: 18900, badge: "Expert", avatar: "🚀", streak: 32 },
  { rank: 4, name: "tech_pulse", xp: 15600, badge: "Expert", avatar: "📡", streak: 28 },
  { rank: 5, name: "silicon_sam", xp: 12300, badge: "Pro", avatar: "⚡", streak: 21 },
];

const BADGE_COLORS = {
  "Top Contributor": { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
  "Builder": { bg: "#fdf2f8", text: "#9d174d", border: "#f472b6" },
  "Verified Seller": { bg: "#ecfdf5", text: "#065f46", border: "#34d399" },
  "News Scout": { bg: "#eff6ff", text: "#1e40af", border: "#60a5fa" },
  "Hardware Expert": { bg: "#ecfeff", text: "#155e75", border: "#22d3ee" },
  "Legend": { bg: "#fefce8", text: "#854d0e", border: "#facc15" },
  "Expert": { bg: "#f5f3ff", text: "#5b21b6", border: "#a78bfa" },
  "Pro": { bg: "#ecfeff", text: "#0e7490", border: "#06b6d4" },
};

const TYPE_ICONS = {
  discussion: "💬",
  question: "❓",
  showcase: "🏆",
  poll: "📊",
  ama: "🎙️",
};

const SORT_OPTIONS = ["Hot", "New", "Top", "Unanswered"];

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function CommunityPreview() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("Hot");
  const [activeTab, setActiveTab] = useState("feed");
  const [hoveredSpace, setHoveredSpace] = useState(null);
  const [expandedThread, setExpandedThread] = useState(null);

  const filteredSpaces = activeCategory === "All"
    ? SPACES
    : SPACES.filter(s => s.category === activeCategory);

  const totalOnline = SPACES.reduce((sum, s) => sum + s.online, 0);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fafafa", minHeight: "100vh" }}>

      {/* ═══ NAVBAR MOCK ═══ */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg, #06b6d4, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>W</span>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>WhichAi</span>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span style={{ fontWeight: 700, color: "#7c3aed", fontSize: 15 }}>Community</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", padding: "4px 12px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }}></span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>{totalOnline.toLocaleString()} online</span>
          </div>
          <button style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ New Thread</button>
        </div>
      </div>

      {/* ═══ HERO BANNER ═══ */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #581c87 100%)", padding: "40px 24px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(139,92,246,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(236,72,153,0.4) 0%, transparent 50%)" }}></div>
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: 20, padding: "6px 16px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ fontSize: 14 }}>📡</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>The Signal — Find clarity in the noise</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "white", marginBottom: 8, letterSpacing: "-0.02em" }}>
            WhichAi <span style={{ background: "linear-gradient(135deg, #c084fc, #f472b6, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Community</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, maxWidth: 500, margin: "0 auto 20px" }}>
            Ask. Learn. Build. Gossip. The only AI community where your reputation follows you to the marketplace.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 500, margin: "0 auto 20px", position: "relative" }}>
            <input
              placeholder="Search threads, spaces, people..."
              style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: 13, outline: "none", backdropFilter: "blur(10px)" }}
            />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.5 }}>🔍</span>
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
            {[
              { val: "52K+", label: "Members" },
              { val: "10", label: "Spaces" },
              { val: "8.4K", label: "Threads" },
              { val: totalOnline.toLocaleString(), label: "Online Now" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { id: "feed", label: "🔥 Feed", desc: "Trending threads" },
            { id: "spaces", label: "🏘️ Spaces", desc: "Browse all spaces" },
            { id: "leaderboard", label: "🏆 Leaderboard", desc: "Top contributors" },
            { id: "my-stuff", label: "👤 My Stuff", desc: "Your threads & saved" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 20px",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "#7c3aed" : "#64748b",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #7c3aed" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>

        {/* ── LEFT: Main Feed / Spaces ── */}
        <div>
          {activeTab === "feed" && (
            <>
              {/* Sort bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {SORT_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSort(s)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: activeSort === s ? "#0f172a" : "white",
                        color: activeSort === s ? "white" : "#64748b",
                        border: activeSort === s ? "none" : "1px solid #e5e7eb",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      {s === "Hot" ? "🔥 " : s === "New" ? "🆕 " : s === "Top" ? "⬆️ " : "❓ "}{s}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Showing all spaces</span>
              </div>

              {/* Thread list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TRENDING_THREADS.map((thread, i) => (
                  <div
                    key={thread.id}
                    onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}
                    style={{
                      background: "white",
                      borderRadius: 14,
                      border: expandedThread === thread.id ? "1px solid #c4b5fd" : "1px solid #e5e7eb",
                      padding: 16,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: expandedThread === thread.id ? "0 4px 20px rgba(124,58,237,0.08)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      {/* Upvote column */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 44 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>▲</button>
                        <span style={{ fontSize: 13, fontWeight: 700, color: thread.upvotes > 500 ? "#7c3aed" : "#334155" }}>{thread.upvotes > 999 ? (thread.upvotes / 1000).toFixed(1) + "K" : thread.upvotes}</span>
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, opacity: 0.3 }}>▼</button>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Space + meta */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: thread.spaceColor, background: thread.spaceColor + "12", padding: "2px 8px", borderRadius: 6 }}>
                            {thread.spaceEmoji} {thread.space}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                            {TYPE_ICONS[thread.type]} {thread.type}
                          </span>
                          {thread.hot && <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 6px", borderRadius: 4 }}>🔥 HOT</span>}
                          {thread.answered && <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "2px 6px", borderRadius: 4 }}>✅ Answered</span>}
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8, lineHeight: 1.4 }}>{thread.title}</h3>

                        {/* Author + time */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span style={{ fontSize: 16 }}>{thread.avatar}</span>
                          <span style={{ fontWeight: 600, color: "#334155" }}>{thread.author}</span>
                          {thread.authorBadge && BADGE_COLORS[thread.authorBadge] && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                              background: BADGE_COLORS[thread.authorBadge].bg,
                              color: BADGE_COLORS[thread.authorBadge].text,
                              border: `1px solid ${BADGE_COLORS[thread.authorBadge].border}`,
                            }}>
                              {thread.authorBadge}
                            </span>
                          )}
                          <span style={{ color: "#94a3b8" }}>·</span>
                          <span style={{ color: "#94a3b8" }}>{thread.time}</span>
                          <span style={{ color: "#94a3b8" }}>·</span>
                          <span style={{ color: "#64748b" }}>💬 {thread.replies} replies</span>
                        </div>

                        {/* Expanded preview */}
                        {expandedThread === thread.id && (
                          <div style={{ marginTop: 12, padding: 12, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                            <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                              Click would open the full thread with nested replies, reactions (🔥 💡 👏 🤔 ❤️), quote-replies, and embedded media. Threads support Markdown, code blocks, image uploads, and @mentions.
                            </p>
                            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                              <button style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "#7c3aed", color: "white", border: "none", cursor: "pointer" }}>Reply</button>
                              <button style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "white", color: "#64748b", border: "1px solid #e5e7eb", cursor: "pointer" }}>🔖 Save</button>
                              <button style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "white", color: "#64748b", border: "1px solid #e5e7eb", cursor: "pointer" }}>📤 Share</button>
                              <button style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "white", color: "#64748b", border: "1px solid #e5e7eb", cursor: "pointer" }}>🚩 Report</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "spaces" && (
            <>
              {/* Category filter */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: activeCategory === cat ? "#0f172a" : "white",
                      color: activeCategory === cat ? "white" : "#64748b",
                      border: activeCategory === cat ? "none" : "1px solid #e5e7eb",
                      cursor: "pointer",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Space cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {filteredSpaces.map(space => (
                  <div
                    key={space.id}
                    onMouseEnter={() => setHoveredSpace(space.id)}
                    onMouseLeave={() => setHoveredSpace(null)}
                    style={{
                      background: "white",
                      borderRadius: 16,
                      border: hoveredSpace === space.id ? `1px solid ${space.color}40` : "1px solid #e5e7eb",
                      padding: 20,
                      cursor: "pointer",
                      transition: "all 0.25s",
                      boxShadow: hoveredSpace === space.id ? `0 8px 30px ${space.color}15` : "none",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Hot badge */}
                    {space.hot && (
                      <div style={{ position: "absolute", top: 12, right: 12, fontSize: 9, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 10 }}>🔥 TRENDING</div>
                    )}

                    {/* Emoji + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: space.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        {space.emoji}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{space.name}</h3>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{space.members} members</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, margin: "0 0 12px" }}>{space.desc}</p>

                    {/* Footer stats */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8" }}>
                        <span>💬 {space.threads} threads</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                          {space.online} online
                        </span>
                      </div>
                      <button style={{
                        padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                        background: hoveredSpace === space.id ? space.color : "white",
                        color: hoveredSpace === space.id ? "white" : space.color,
                        border: `1px solid ${space.color}40`,
                        cursor: "pointer", transition: "all 0.2s",
                      }}>
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create space CTA */}
              <div style={{ marginTop: 16, background: "linear-gradient(135deg, #f5f3ff, #fdf2f8)", borderRadius: 16, border: "1px dashed #c4b5fd", padding: 24, textAlign: "center" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>🏗️</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b", margin: "0 0 4px" }}>Create Your Own Space</h3>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>Anyone can create a space. You become the moderator. Invite co-mods, set rules, grow your tribe.</p>
                <button style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "white", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Create Space</button>
              </div>
            </>
          )}

          {activeTab === "leaderboard" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>🏆 Community Leaderboard</h2>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>XP earned by posting, answering questions, getting upvotes, and having answers accepted. XP feeds directly into your WhichAi marketplace trust score.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {LEADERBOARD.map(user => (
                  <div key={user.rank} style={{
                    background: user.rank <= 3 ? "linear-gradient(135deg, #fffbeb, #fef3c7)" : "white",
                    borderRadius: 14,
                    border: user.rank <= 3 ? "1px solid #fbbf24" : "1px solid #e5e7eb",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: user.rank <= 3 ? "#b45309" : "#94a3b8", minWidth: 30, textAlign: "center" }}>
                      {user.rank <= 3 ? ["🥇", "🥈", "🥉"][user.rank - 1] : `#${user.rank}`}
                    </span>
                    <span style={{ fontSize: 24 }}>{user.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{user.name}</span>
                        {BADGE_COLORS[user.badge] && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                            background: BADGE_COLORS[user.badge].bg,
                            color: BADGE_COLORS[user.badge].text,
                            border: `1px solid ${BADGE_COLORS[user.badge].border}`,
                          }}>
                            {user.badge}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>🔥 {user.streak}-day streak</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#7c3aed" }}>{(user.xp / 1000).toFixed(1)}K</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>XP</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* XP breakdown */}
              <div style={{ marginTop: 20, background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>How XP Works</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { action: "Create a thread", xp: "+10 XP" },
                    { action: "Reply to a thread", xp: "+5 XP" },
                    { action: "Get an upvote", xp: "+2 XP" },
                    { action: "Answer accepted (Q&A)", xp: "+25 XP" },
                    { action: "Showcase featured", xp: "+50 XP" },
                    { action: "Daily login streak", xp: "+3 XP/day" },
                    { action: "Refer a member", xp: "+100 XP" },
                    { action: "Complete a marketplace sale", xp: "+20 XP" },
                  ].map(item => (
                    <div key={item.action} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 10px", background: "#f8fafc", borderRadius: 8 }}>
                      <span style={{ color: "#475569" }}>{item.action}</span>
                      <span style={{ fontWeight: 700, color: "#7c3aed" }}>{item.xp}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, marginBottom: 0 }}>💡 XP directly boosts your marketplace Trust Score — active community members get higher visibility in search results and a "Trusted" badge on their seller profile.</p>
              </div>
            </div>
          )}

          {activeTab === "my-stuff" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>👤</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Your Community Profile</h2>
              <p style={{ fontSize: 13, color: "#64748b", maxWidth: 400, margin: "0 auto 20px" }}>
                Track your threads, saved posts, joined spaces, XP history, and notification preferences. Your community reputation is linked to your marketplace profile.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                {["My Threads", "Saved", "Joined Spaces", "Notifications"].map(item => (
                  <div key={item} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", fontSize: 12, fontWeight: 600, color: "#475569" }}>{item}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Your XP card */}
          <div style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)", borderRadius: 16, padding: 20, color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🧑‍💻</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>shyam</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Joined today</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Level 1 · Newcomer</span>
              <span style={{ fontSize: 13, fontWeight: 800 }}>0 XP</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, height: 6, overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(90deg, #c084fc, #f472b6)", height: "100%", width: "2%", borderRadius: 10 }}></div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>100 XP to Level 2</div>
          </div>

          {/* Trending spaces */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>🔥 Trending Spaces</h3>
            {SPACES.filter(s => s.hot).map(space => (
              <div key={space.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 18 }}>{space.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{space.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{space.online} online</div>
                </div>
                <button style={{ fontSize: 10, fontWeight: 600, color: space.color, background: space.color + "10", border: `1px solid ${space.color}30`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>Join</button>
              </div>
            ))}
          </div>

          {/* Community rules */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>📋 Community Guidelines</h3>
            {[
              "Be respectful — debate ideas, not people",
              "No spam or self-promo outside Showcase",
              "Cite sources when sharing AI news",
              "Use spoiler tags for paid content",
              "Report, don't retaliate",
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "#475569", marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ color: "#a855f7", fontWeight: 700 }}>{i + 1}.</span>
                {rule}
              </div>
            ))}
          </div>

          {/* Roles & badges */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>🎖️ Roles & Badges</h3>
            {[
              { role: "Newcomer", desc: "0-100 XP", color: "#94a3b8" },
              { role: "Contributor", desc: "100-1K XP", color: "#3b82f6" },
              { role: "Pro", desc: "1K-5K XP", color: "#06b6d4" },
              { role: "Expert", desc: "5K-15K XP", color: "#8b5cf6" },
              { role: "Legend", desc: "15K+ XP", color: "#f59e0b" },
              { role: "Moderator", desc: "Appointed", color: "#ef4444" },
            ].map(r => (
              <div key={r.role} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }}></div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", flex: 1 }}>{r.role}</span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{r.desc}</span>
              </div>
            ))}
          </div>

          {/* Marketplace link */}
          <div style={{ background: "linear-gradient(135deg, #f5f3ff, #fdf2f8)", borderRadius: 14, border: "1px solid #e9d5ff", padding: 16, textAlign: "center" }}>
            <span style={{ fontSize: 20, display: "block", marginBottom: 6 }}>🛒</span>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", margin: "0 0 4px" }}>Community → Marketplace</h3>
            <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 8px" }}>Your XP boosts your Trust Score. Top contributors get seller badges and priority in search.</p>
            <button style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "white", border: "1px solid #c4b5fd", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>View Marketplace →</button>
          </div>
        </div>
      </div>

      {/* ═══ ARCHITECTURE SPEC SECTION ═══ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>📐 Architecture Spec</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Spaces */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", marginBottom: 8 }}>🏘️ Spaces (Who Owns What)</h3>
              <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.8 }}>
                <div><b>Creator</b> = Space owner (full mod powers)</div>
                <div><b>Co-moderators</b> = invited by owner</div>
                <div><b>Public spaces</b> = anyone can join & post</div>
                <div><b>Private spaces</b> = invite-only or approval</div>
                <div><b>Official spaces</b> = created by WhichAi team</div>
                <div><b>Archived</b> = read-only, inactive 90+ days</div>
              </div>
            </div>

            {/* Threads */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#ec4899", marginBottom: 8 }}>💬 Thread Types</h3>
              <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.8 }}>
                <div><b>Discussion</b> — open conversation, Reddit-style</div>
                <div><b>Question</b> — Q&A with accepted answer (Stack Overflow)</div>
                <div><b>Showcase</b> — project demos with media embed</div>
                <div><b>Poll</b> — community votes with results</div>
                <div><b>AMA</b> — scheduled Ask Me Anything events</div>
                <div><b>News</b> — link post with commentary</div>
              </div>
            </div>

            {/* Sorting */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#06b6d4", marginBottom: 8 }}>📊 Sorting & Discovery</h3>
              <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.8 }}>
                <div><b>Hot</b> — (upvotes * recency_weight) decay</div>
                <div><b>New</b> — chronological, newest first</div>
                <div><b>Top</b> — highest upvotes (day/week/month/all)</div>
                <div><b>Unanswered</b> — Q&A without accepted answer</div>
                <div><b>Personalized</b> — based on joined spaces</div>
                <div><b>Global search</b> — full-text across all threads</div>
              </div>
            </div>

            {/* Gamification */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>🎮 Gamification & Reputation</h3>
              <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.8 }}>
                <div><b>XP system</b> — earn for posts, replies, upvotes</div>
                <div><b>Levels</b> — Newcomer → Contributor → Pro → Expert → Legend</div>
                <div><b>Streaks</b> — daily login streak multiplier</div>
                <div><b>Badges</b> — achievement-based (First Post, 100 Upvotes, etc.)</div>
                <div><b>Trust Score link</b> — XP feeds marketplace reputation</div>
                <div><b>Leaderboard</b> — weekly/monthly/all-time rankings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
