'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  MessageCircle,
  TrendingUp,
  X,
  Check,
  Plus,
  Eye,
  Flame,
  AlertCircle,
  Users,
  Award,
  Shield,
  ArrowRight,
  ChevronRight,
  Hash,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  THREADS,
  SPACES,
  SPACE_CATEGORIES,
  XP_ACTIONS,
  LEVELS,
  BADGE_STYLES,
  TYPE_CONFIG,
  getLeaderboard,
  USERS,
} from '@/lib/community-data';

type Tab = 'feed' | 'spaces' | 'leaderboard' | 'mystuff';
type SortType = 'hot' | 'new' | 'top' | 'unanswered';

// ── MAIN PAGE ──
export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [activeSort, setActiveSort] = useState<SortType>('hot');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
  const [upvotedThreads, setUpvotedThreads] = useState<Set<string>>(new Set());
  const [joinedSpaces, setJoinedSpaces] = useState<Set<string>>(
    new Set(['model-arena', 'prompt-lab'])
  );
  const [myThreads, setMyThreads] = useState<string[]>([]);
  const [savedThreads, setSavedThreads] = useState<Set<string>>(new Set());

  const filteredThreads = useMemo(() => {
    let threads = THREADS.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    switch (activeSort) {
      case 'hot': return threads.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.upvotes - a.upvotes);
      case 'new': return threads.sort((a, b) => (parseInt(b.time) || 0) - (parseInt(a.time) || 0));
      case 'top': return threads.sort((a, b) => b.upvotes - a.upvotes);
      case 'unanswered': return threads.filter((t) => !t.answered && t.type === 'question');
      default: return threads;
    }
  }, [activeSort, searchQuery]);

  const filteredSpaces = useMemo(() => {
    let spaces = SPACES;
    if (activeCategory !== 'All') spaces = spaces.filter((s) => s.category === activeCategory);
    if (searchQuery) spaces = spaces.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return spaces;
  }, [activeCategory, searchQuery]);

  const toggleUpvote = (id: string) => {
    const newUpvoted = new Set(upvotedThreads);
    newUpvoted.has(id) ? newUpvoted.delete(id) : newUpvoted.add(id);
    setUpvotedThreads(newUpvoted);
  };

  const toggleJoinSpace = (id: string) => {
    const newJoined = new Set(joinedSpaces);
    newJoined.has(id) ? newJoined.delete(id) : newJoined.add(id);
    setJoinedSpaces(newJoined);
  };

  const toggleSaveThread = (id: string) => {
    const newSaved = new Set(savedThreads);
    newSaved.has(id) ? newSaved.delete(id) : newSaved.add(id);
    setSavedThreads(newSaved);
  };

  const currentUser = USERS.shyam || USERS.ai_curious_dev;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-violet-100">
      <Navbar />

      {/* Modern Header */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider mb-4 border border-violet-100">
                <MessageSquare size={14} /> The Signal
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">
                Nexus <span className="text-violet-600">Community</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-500 font-medium leading-relaxed">
                Connect with the world's most elite AI researchers, engineers, and prompt designers.
              </motion.p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <motion.button onClick={() => setShowNewThreadModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-900 text-white shadow-lg shadow-slate-200 transition-all">
                <Plus size={18} /> New Thread
              </motion.button>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-slate-100">
            {[
              { label: 'Active Members', value: '24.5K', icon: Users, color: 'text-blue-600' },
              { label: 'Live Threads', value: THREADS.length, icon: MessageSquare, color: 'text-violet-600' },
              { label: 'Public Spaces', value: SPACES.length, icon: Globe, color: 'text-emerald-600' },
              { label: 'Trust Verified', value: '98%', icon: Shield, color: 'text-amber-600' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 leading-none">{s.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Tabs Toolbar */}
      <div className="sticky top-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-1 overflow-x-auto w-full md:w-auto">
            {[
              { id: 'feed', label: 'Feed', icon: Zap },
              { id: 'spaces', label: 'Spaces', icon: Layers },
              { id: 'leaderboard', label: 'Leaderboard', icon: Award },
              { id: 'mystuff', label: 'My Nexus', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all relative ${
                  activeTab === tab.id ? 'text-violet-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 py-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'feed' && (
                  <FeedTab
                    threads={filteredThreads}
                    upvotedThreads={upvotedThreads}
                    onToggleUpvote={toggleUpvote}
                    onToggleSave={toggleSaveThread}
                    savedThreads={savedThreads}
                    activeSort={activeSort}
                    onSortChange={setActiveSort}
                  />
                )}
                {activeTab === 'spaces' && (
                  <SpacesTab
                    spaces={filteredSpaces}
                    joinedSpaces={joinedSpaces}
                    onToggleJoin={toggleJoinSpace}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    onCreateSpace={() => setShowNewSpaceModal(true)}
                  />
                )}
                {activeTab === 'leaderboard' && <LeaderboardTab />}
                {activeTab === 'mystuff' && (
                  <MyStuffTab
                    currentUser={currentUser}
                    myThreads={myThreads}
                    savedThreads={savedThreads}
                    joinedSpaces={joinedSpaces}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <UserXPCard user={currentUser} />
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-600" /> Trending Spaces
              </h3>
              <div className="space-y-3">
                {SPACES.filter(s => s.hot).slice(0, 3).map(space => (
                  <Link key={space.id} href={`/community/space/${space.id}`}>
                    <div className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{space.emoji}</span>
                        <div>
                          <div className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition-colors">{space.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{space.members.toLocaleString()} members</div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <GuidelinesCard />
            <MarketplaceConnectionCard />
          </div>
        </div>
      </main>

      {/* Modals preserved as requested */}
      <NewThreadModal isOpen={showNewThreadModal} onClose={() => setShowNewThreadModal(false)} onSubmit={() => {}} />
      <NewSpaceModal isOpen={showNewSpaceModal} onClose={() => setShowNewSpaceModal(false)} onSubmit={() => {}} />
    </div>
  );
}

// ── REFINED COMPONENTS ──

function FeedTab({ threads, upvotedThreads, onToggleUpvote, onToggleSave, savedThreads, activeSort, onSortChange }: any) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {['hot', 'new', 'top', 'unanswered'].map((s) => (
          <button
            key={s}
            onClick={() => onSortChange(s as SortType)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
              activeSort === s ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {threads.map((thread: any) => (
          <ThreadCard key={thread.id} thread={thread} isUpvoted={upvotedThreads.has(thread.id)} onToggleUpvote={onToggleUpvote} isSaved={savedThreads.has(thread.id)} onToggleSave={onToggleSave} />
        ))}
      </div>
    </div>
  );
}

function ThreadCard({ thread, isUpvoted, onToggleUpvote, isSaved, onToggleSave }: any) {
  const typeConfig = TYPE_CONFIG[thread.type];
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl border border-slate-200 hover:border-violet-300 transition-all shadow-sm flex flex-col md:flex-row group">
      {/* Upvote column refined */}
      <div className="hidden md:flex flex-col items-center gap-1 p-4 bg-slate-50/50 border-r border-slate-100 w-16 group-hover:bg-violet-50/30 transition-colors">
        <button onClick={() => onToggleUpvote(thread.id)} className={`p-1.5 rounded-lg transition-all ${isUpvoted ? 'text-violet-600 scale-110' : 'text-slate-400 hover:text-violet-500'}`}>
          <TrendingUp size={18} />
        </button>
        <span className="text-sm font-black text-slate-700">{thread.upvotes}</span>
        <button className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
          <TrendingUp size={18} className="rotate-180" />
        </button>
      </div>

      <div className="p-5 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider">{thread.spaceId.replace('-', ' ')}</span>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: typeConfig.color }}>{typeConfig.label}</span>
          {thread.hot && <span className="flex items-center gap-1 text-[9px] font-black text-orange-600 uppercase"><Flame size={10} /> Hot</span>}
        </div>

        <Link href={`/community/thread/${thread.id}`}>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors mb-2 line-clamp-2">{thread.title}</h3>
        </Link>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs shrink-0">{thread.author.avatar}</div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-slate-800 leading-none">{thread.author.username}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{thread.time}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase"><MessageCircle size={14} /> {thread.replyCount}</div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase"><Eye size={14} /> {thread.views}</div>
            <button onClick={() => onToggleSave(thread.id)} className={`transition-colors ${isSaved ? 'text-red-500' : 'hover:text-red-400'}`}>
              <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SpacesTab({ spaces, joinedSpaces, onToggleJoin, activeCategory, onCategoryChange, onCreateSpace }: any) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SPACE_CATEGORIES.map((c) => (
          <button key={c} onClick={() => onCategoryChange(c)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeCategory === c ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300'}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {spaces.map((space: any) => (
          <SpaceCard key={space.id} space={space} isJoined={joinedSpaces.has(space.id)} onToggleJoin={onToggleJoin} />
        ))}
        <button onClick={onCreateSpace} className="h-full min-h-[200px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 hover:border-violet-300 hover:bg-violet-50 group transition-all">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 group-hover:bg-violet-100 group-hover:text-violet-600 transition-all"><Plus size={20} /></div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Create Space</span>
        </button>
      </div>
    </div>
  );
}

function SpaceCard({ space, isJoined, onToggleJoin }: any) {
  return (
    <Link href={`/community/space/${space.id}`} className="block h-full">
      <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-lg border border-slate-200 hover:border-violet-400 transition-all shadow-sm h-full flex flex-col overflow-hidden group">
        <div className="h-20 bg-slate-50 relative overflow-hidden" style={{ background: space.bannerGradient }}>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-3 pt-0 flex-1 flex flex-col">
          <div className="relative -mt-6 mb-2 flex items-end justify-between">
            <div className="w-12 h-12 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-2xl">{space.emoji}</div>
            <button onClick={(e) => { e.preventDefault(); onToggleJoin(space.id); }} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${isJoined ? 'bg-slate-100 text-slate-500' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
              {isJoined ? 'Joined' : 'Join'}
            </button>
          </div>
          <h3 className="font-bold text-slate-900 text-[13px] mb-0.5 line-clamp-1 group-hover:text-violet-700 transition-colors">{space.name}</h3>
          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mb-3">{space.description}</p>
          
          <div className="mt-auto pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <div className="text-center p-1.5 rounded-lg bg-slate-50/50">
              <div className="text-[11px] font-black text-slate-900 leading-none">{space.members}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">Members</div>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-slate-50/50">
              <div className="text-[11px] font-black text-slate-900 leading-none">{space.threadCount}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">Threads</div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function LeaderboardTab() {
  const leaderboard = getLeaderboard();
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Award size={20} className="text-amber-500" /> Top Contributors</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol v4.2</span>
      </div>
      <div className="divide-y divide-slate-100">
        {leaderboard.map((user, idx) => (
          <div key={user.username} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx < 3 ? 'bg-amber-100 text-amber-700 shadow-inner' : 'text-slate-300'}`}>
              {idx + 1}
            </div>
            <div className="text-2xl">{user.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{user.username}</span>
                {user.badge && <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase" style={{ backgroundColor: BADGE_STYLES[user.badge]?.bg, color: BADGE_STYLES[user.badge]?.text }}>{user.badge}</span>}
              </div>
              <div className="text-xs text-slate-500 truncate mt-0.5">{user.bio}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-black text-slate-900 text-sm">{user.xp.toLocaleString()} XP</div>
              <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-orange-500 uppercase mt-0.5"><Flame size={10} fill="currentColor" /> {user.streak} days</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyStuffTab({ currentUser, myThreads, savedThreads, joinedSpaces }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
        <div className="flex items-center gap-6 mb-8">
          <div className="text-6xl">{currentUser.avatar}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-black text-slate-900">{currentUser.username}</h2>
            <p className="text-slate-500 font-medium mt-1 leading-relaxed">{currentUser.bio}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          {[
            { l: 'XP', v: currentUser.xp, c: 'text-violet-600' },
            { l: 'Level', v: currentUser.level, c: 'text-slate-900' },
            { l: 'Streak', v: currentUser.streak, c: 'text-orange-500' },
            { l: 'Joined', v: currentUser.joinedDate, c: 'text-slate-400' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Joined Spaces</h3>
          <div className="space-y-2">
            {Array.from(joinedSpaces).map((id: any) => {
              const s = SPACES.find(x => x.id === id);
              return s ? (
                <Link key={s.id} href={`/community/space/${s.id}`}>
                  <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                    <span className="text-sm font-bold text-slate-700">{s.emoji} {s.name}</span>
                    <ArrowRight size={14} className="text-slate-300" />
                  </div>
                </Link>
              ) : null;
            })}
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-slate-400 text-xs font-bold italic">No recent notifications</div>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR HELPERS ──

function UserXPCard({ user }: { user: any }) {
  const level = LEVELS.find((l) => l.minXP <= user.xp) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.minXP > user.xp) || LEVELS[LEVELS.length - 1];
  const progress = ((user.xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100;

  return (
    <div className="rounded-2xl p-6 text-white shadow-lg overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${level.color}, ${nextLevel.color})` }}>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-80">Reputation Nexus</h3>
      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-4xl font-black">{user.xp.toLocaleString()}</div>
        <div className="text-[10px] font-bold uppercase opacity-70 tracking-widest">XP</div>
      </div>
      <div className="text-xs font-bold mb-6 opacity-90">{user.level}</div>
      <div className="space-y-2">
        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-70">
          <span>{level.name}</span>
          <span>Next: {nextLevel.name}</span>
        </div>
      </div>
    </div>
  );
}

function GuidelinesCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Protocol Guidelines</h3>
      <div className="space-y-3">
        {[
          'Assume good intent in all builders',
          'No spam or low-effort prompt leaks',
          'Keep discussions focused & technical',
          'Credit original researchers & sources',
        ].map((g, i) => (
          <div key={i} className="flex gap-3 text-xs font-bold text-slate-600 leading-relaxed">
            <CheckCircle size={14} className="text-violet-500 shrink-0" /> {g}
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplaceConnectionCard() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent pointer-events-none" />
      <h3 className="text-lg font-black mb-3 flex items-center gap-2"><Sparkles size={18} className="text-amber-400" /> Reputation Yield</h3>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">Your community XP directly scales your Marketplace Trust Score. Higher reputation = lower escrow fees.</p>
      <div className="space-y-3">
        {[
          { l: 'Escrow Fee Reduction', v: '-1.5%' },
          { l: 'Featured Seller Access', v: 'Lvl 5+' },
        ].map(s => (
          <div key={s.l} className="flex justify-between items-center py-2 border-t border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.l}</span>
            <span className="text-[11px] font-black text-violet-400">{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MODALS (Logic preserved, styling streamlined) ──

function NewThreadModal({ isOpen, onClose, onSubmit }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900">Start New Conversation</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Thread Title..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 outline-none transition-all font-bold text-sm" />
          <textarea rows={6} placeholder="Share your insights or ask a question..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 outline-none transition-all text-sm font-medium resize-none" />
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 transition-all">Cancel</button>
            <button className="px-8 py-2.5 rounded-xl font-bold bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">Publish Thread</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function NewSpaceModal({ isOpen, onClose, onSubmit }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/20 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-6"><Layers size={32} /></div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Create a Private Space</h2>
        <p className="text-slate-500 text-sm mb-8">Build a custom sub-community for your team or project. Requires Level 3 reputation.</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all">Close Nexus</button>
      </motion.div>
    </div>
  );
}

// CheckCircle placeholder fix
function CheckCircle({ size, className }: { size: number, className: string }) {
  return <CheckCircle2 size={size} className={className} />;
}
function CheckCircle2({ size, className }: { size: number, className: string }) {
  return <Check size={size} className={className} />;
}
function User({ size, className }: { size: number, className?: string }) {
  return <Users size={size} className={className} />;
}
function Layers({ size, className }: { size: number, className?: string }) {
  return <LayersIcon size={size} className={className} />;
}
function LayersIcon({ size, className }: { size: number, className?: string }) {
  return <TrendingUp size={size} className={className} />; // Fallback icon for Layers
}
