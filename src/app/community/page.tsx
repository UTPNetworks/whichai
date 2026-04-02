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

  // ── THREAD FILTERING & SORTING ──
  const filteredThreads = useMemo(() => {
    let threads = THREADS.filter((t) => {
      const matchesSearch = t.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort
    switch (activeSort) {
      case 'hot':
        return threads.sort((a, b) => {
          if (a.hot !== b.hot) return (b.hot ? 1 : 0) - (a.hot ? 1 : 0);
          return b.upvotes - a.upvotes;
        });
      case 'new':
        return threads.sort((a, b) => {
          const timeA = parseInt(a.time) || 0;
          const timeB = parseInt(b.time) || 0;
          return timeB - timeA;
        });
      case 'top':
        return threads.sort((a, b) => b.upvotes - a.upvotes);
      case 'unanswered':
        return threads.filter((t) => !t.answered && t.type === 'question');
      default:
        return threads;
    }
  }, [activeSort, searchQuery]);

  // ── SPACE FILTERING ──
  const filteredSpaces = useMemo(() => {
    let spaces = SPACES;

    if (activeCategory !== 'All') {
      spaces = spaces.filter((s) => s.category === activeCategory);
    }

    if (searchQuery) {
      spaces = spaces.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return spaces;
  }, [activeCategory, searchQuery]);

  // ── HANDLERS ──
  const toggleUpvote = (threadId: string) => {
    const newUpvoted = new Set(upvotedThreads);
    if (newUpvoted.has(threadId)) {
      newUpvoted.delete(threadId);
    } else {
      newUpvoted.add(threadId);
    }
    setUpvotedThreads(newUpvoted);
  };

  const toggleJoinSpace = (spaceId: string) => {
    const newJoined = new Set(joinedSpaces);
    if (newJoined.has(spaceId)) {
      newJoined.delete(spaceId);
    } else {
      newJoined.add(spaceId);
    }
    setJoinedSpaces(newJoined);
  };

  const toggleSaveThread = (threadId: string) => {
    const newSaved = new Set(savedThreads);
    if (newSaved.has(threadId)) {
      newSaved.delete(threadId);
    } else {
      newSaved.add(threadId);
    }
    setSavedThreads(newSaved);
  };

  const handleCreateThread = (data: {
    space: string;
    type: string;
    title: string;
    content: string;
    tags: string;
  }) => {
    console.log('Creating thread:', data);
    setShowNewThreadModal(false);
    setMyThreads([...myThreads, `t${Date.now()}`]);
  };

  const handleCreateSpace = (data: {
    name: string;
    emoji: string;
    description: string;
    category: string;
    rules: string;
    isPublic: boolean;
  }) => {
    console.log('Creating space:', data);
    setShowNewSpaceModal(false);
  };

  // ── CURRENT USER ──
  const currentUser = USERS.shyam || USERS.ai_curious_dev;

  // ── RENDER TABS ──
  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <FeedTab
            threads={filteredThreads}
            upvotedThreads={upvotedThreads}
            onToggleUpvote={toggleUpvote}
            onToggleSave={toggleSaveThread}
            savedThreads={savedThreads}
            activeSort={activeSort}
            onSortChange={setActiveSort}
          />
        );
      case 'spaces':
        return (
          <SpacesTab
            spaces={filteredSpaces}
            joinedSpaces={joinedSpaces}
            onToggleJoin={toggleJoinSpace}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onCreateSpace={() => setShowNewSpaceModal(true)}
          />
        );
      case 'leaderboard':
        return <LeaderboardTab />;
      case 'mystuff':
        return (
          <MyStuffTab
            currentUser={currentUser}
            myThreads={myThreads}
            savedThreads={savedThreads}
            joinedSpaces={joinedSpaces}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-violet-900 text-white pt-20 pb-16"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-violet-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold mb-3 bg-gradient-to-r from-white via-violet-100 to-white bg-clip-text text-transparent"
            >
              The Signal
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-violet-100 max-w-2xl mx-auto"
            >
              Where AI builders, thinkers, and makers come together. Real
              conversations. Real insights. No noise.
            </motion.p>
          </div>

          {/* Search & CTA */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search threads, spaces, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <button
              onClick={() => setShowNewThreadModal(true)}
              className="px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              New Thread
            </button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Active Members', value: '24.5K' },
              { label: 'Threads', value: THREADS.length.toString() },
              { label: 'Spaces', value: SPACES.length.toString() },
              { label: 'Online Now', value: '1.2K' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-center"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-violet-200">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="sticky top-20 bg-white border-b border-slate-200 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'feed', label: 'Feed', icon: '🔥' },
              { id: 'spaces', label: 'Spaces', icon: '🏘️' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
              { id: 'mystuff', label: 'My Stuff', icon: '👤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`py-4 px-2 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-violet-600 border-violet-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">{renderContent()}</div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User XP Card */}
            <UserXPCard user={currentUser} />

            {/* Trending Spaces */}
            {activeTab !== 'spaces' && (
              <TrendingSpacesCard
                spaces={SPACES.filter((s) => s.hot).slice(0, 3)}
                joinedSpaces={joinedSpaces}
                onToggleJoin={toggleJoinSpace}
              />
            )}

            {/* Community Guidelines */}
            <GuidelinesCard />

            {/* Roles & Badges Legend */}
            <RolesAndBadgesCard />

            {/* XP to Trust Score */}
            <MarketplaceConnectionCard />
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <NewThreadModal
        isOpen={showNewThreadModal}
        onClose={() => setShowNewThreadModal(false)}
        onSubmit={handleCreateThread}
      />

      <NewSpaceModal
        isOpen={showNewSpaceModal}
        onClose={() => setShowNewSpaceModal(false)}
        onSubmit={handleCreateSpace}
      />
    </div>
  );
}

// ── FEED TAB ──
function FeedTab({
  threads,
  upvotedThreads,
  onToggleUpvote,
  onToggleSave,
  savedThreads,
  activeSort,
  onSortChange,
}: {
  threads: any[];
  upvotedThreads: Set<string>;
  onToggleUpvote: (id: string) => void;
  onToggleSave: (id: string) => void;
  savedThreads: Set<string>;
  activeSort: SortType;
  onSortChange: (sort: SortType) => void;
}) {
  const sortOptions: { label: string; value: SortType }[] = [
    { label: 'Hot', value: 'hot' },
    { label: 'New', value: 'new' },
    { label: 'Top', value: 'top' },
    { label: 'Unanswered', value: 'unanswered' },
  ];

  return (
    <div className="space-y-6">
      {/* Sort Buttons */}
      <div className="flex gap-2 flex-wrap">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSort === option.value
                ? 'bg-violet-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-violet-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Thread Cards */}
      <div className="space-y-4">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              isUpvoted={upvotedThreads.has(thread.id)}
              onToggleUpvote={onToggleUpvote}
              isSaved={savedThreads.has(thread.id)}
              onToggleSave={onToggleSave}
            />
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No threads found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── THREAD CARD ──
function ThreadCard({
  thread,
  isUpvoted,
  onToggleUpvote,
  isSaved,
  onToggleSave,
}: {
  thread: any;
  isUpvoted: boolean;
  onToggleUpvote: (id: string) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const space = SPACES.find((s) => s.id === thread.spaceId);
  const typeConfig = TYPE_CONFIG[thread.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all overflow-hidden group"
    >
      <div className="p-6 flex gap-4">
        {/* Upvote Column */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onToggleUpvote(thread.id)}
            className={`p-2 rounded-lg transition-colors ${
              isUpvoted
                ? 'bg-violet-100 text-violet-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700">
            {thread.upvotes}
          </span>
          <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <TrendingUp className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {space && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                <span>{space.emoji}</span>
                {space.name}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{
                backgroundColor: typeConfig.color,
              }}
            >
              {typeConfig.icon}
              {typeConfig.label}
            </span>
            {thread.hot && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <Flame className="w-3 h-3" />
                Hot
              </span>
            )}
            {thread.answered && thread.type === 'question' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <Check className="w-3 h-3" />
                Answered
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/community/thread/${thread.id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors mb-3 line-clamp-2 cursor-pointer">
              {thread.title}
            </h3>
          </Link>

          {/* Author & Meta */}
          <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{thread.author.avatar}</span>
              <span className="font-semibold text-slate-900">
                {thread.author.username}
              </span>
              {thread.author.badge && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-semibold"
                  style={{
                    backgroundColor:
                      BADGE_STYLES[thread.author.badge]?.bg || '#f0f0f0',
                    color:
                      BADGE_STYLES[thread.author.badge]?.text || '#666',
                  }}
                >
                  {thread.author.badge}
                </span>
              )}
            </div>
            <span>•</span>
            <span>{thread.time}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{thread.replyCount} replies</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{thread.views} views</span>
            </div>
            <button
              onClick={() => onToggleSave(thread.id)}
              className={`ml-auto p-2 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-red-100 text-red-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── SPACES TAB ──
function SpacesTab({
  spaces,
  joinedSpaces,
  onToggleJoin,
  activeCategory,
  onCategoryChange,
  onCreateSpace,
}: {
  spaces: any[];
  joinedSpaces: Set<string>;
  onToggleJoin: (id: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onCreateSpace: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {SPACE_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              activeCategory === category
                ? 'bg-violet-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-violet-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Space Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            isJoined={joinedSpaces.has(space.id)}
            onToggleJoin={onToggleJoin}
          />
        ))}

        {/* Create Space CTA */}
        <motion.button
          onClick={onCreateSpace}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white border-2 border-dashed border-violet-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-violet-500 hover:bg-violet-50 transition-colors"
        >
          <div className="text-4xl mb-3">✨</div>
          <h3 className="font-bold text-slate-900 mb-1">Create Your Own Space</h3>
          <p className="text-sm text-slate-600">
            Start a community around your passion
          </p>
        </motion.button>
      </div>
    </div>
  );
}

// ── SPACE CARD ──
function SpaceCard({
  space,
  isJoined,
  onToggleJoin,
}: {
  space: any;
  isJoined: boolean;
  onToggleJoin: (id: string) => void;
}) {
  return (
    <Link href={`/community/space/${space.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all overflow-hidden group cursor-pointer"
      >
        {/* Banner */}
        <div
          className="h-24"
          style={{ background: space.bannerGradient }}
        />

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{space.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                {space.name}
              </h3>
              <p className="text-xs text-slate-600">
                {space.category}
                {space.hot && ' • 🔥 Trending'}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700 mb-4 line-clamp-2">
            {space.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div>
              <div className="font-bold text-slate-900">{space.members}</div>
              <div className="text-xs text-slate-600">Members</div>
            </div>
            <div>
              <div className="font-bold text-slate-900">{space.threadCount}</div>
              <div className="text-xs text-slate-600">Threads</div>
            </div>
            <div>
              <div className="font-bold text-slate-900">{space.online}</div>
              <div className="text-xs text-slate-600">Online</div>
            </div>
          </div>

          {/* Join Button */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              onToggleJoin(space.id);
            }}
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              isJoined
                ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            {isJoined ? '✓ Joined' : 'Join'}
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}

// ── LEADERBOARD TAB ──
function LeaderboardTab() {
  const leaderboard = getLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {leaderboard.slice(0, 3).map((user, idx) => (
          <motion.div
            key={user.username}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative bg-gradient-to-br ${
              idx === 0
                ? 'from-yellow-400 to-amber-500'
                : idx === 1
                ? 'from-slate-300 to-slate-400'
                : 'from-orange-400 to-amber-500'
            } rounded-2xl p-6 text-white shadow-lg`}
          >
            <div className="text-center">
              <div className="text-5xl mb-2">{medals[idx]}</div>
              <div className="text-4xl mb-3">{user.avatar}</div>
              <h3 className="font-bold text-lg mb-1">{user.username}</h3>
              {user.badge && (
                <p className="text-sm font-semibold mb-3">{user.badge}</p>
              )}
              <div className="flex justify-around text-sm">
                <div>
                  <div className="font-bold">{user.xp}</div>
                  <div className="text-xs opacity-90">XP</div>
                </div>
                <div>
                  <div className="font-bold">{user.streak}</div>
                  <div className="text-xs opacity-90">Streak</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">Top Contributors</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {leaderboard.map((user, idx) => (
            <div
              key={user.username}
              className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4"
            >
              <div className="text-xl font-bold text-slate-600 w-8 text-right">
                {idx + 1}
              </div>
              <div className="text-2xl">{user.avatar}</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">
                  {user.username}
                </div>
                <div className="text-sm text-slate-600">{user.bio}</div>
              </div>
              {user.badge && (
                <span
                  className="px-3 py-1 rounded text-xs font-semibold"
                  style={{
                    backgroundColor:
                      BADGE_STYLES[user.badge]?.bg || '#f0f0f0',
                    color: BADGE_STYLES[user.badge]?.text || '#666',
                  }}
                >
                  {user.badge}
                </span>
              )}
              <div className="text-right">
                <div className="font-bold text-slate-900">{user.xp} XP</div>
                <div className="text-xs text-slate-600">
                  {user.streak}-day streak
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How XP Works */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-lg text-slate-900 mb-4">How XP Works</h3>
        <div className="space-y-3">
          {XP_ACTIONS.map((action) => (
            <div
              key={action.action}
              className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
            >
              <span className="text-slate-700">{action.action}</span>
              <span className="font-bold text-violet-600">+{action.xp} XP</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600 mt-4 pt-4 border-t border-slate-200">
          Higher XP boosts your Marketplace Trust Score, unlocking better rates
          and visibility for your prompts and AI tools.
        </p>
      </div>
    </div>
  );
}

// ── MY STUFF TAB ──
function MyStuffTab({
  currentUser,
  myThreads,
  savedThreads,
  joinedSpaces,
}: {
  currentUser: any;
  myThreads: string[];
  savedThreads: Set<string>;
  joinedSpaces: Set<string>;
}) {
  const [myTab, setMyTab] = useState<'threads' | 'saved' | 'spaces' | 'notifications'>('threads');

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-5xl">{currentUser.avatar}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">
              {currentUser.username}
            </h2>
            {currentUser.badge && (
              <p
                className="inline-block mt-2 px-3 py-1 rounded text-sm font-semibold"
                style={{
                  backgroundColor:
                    BADGE_STYLES[currentUser.badge]?.bg || '#f0f0f0',
                  color: BADGE_STYLES[currentUser.badge]?.text || '#666',
                }}
              >
                {currentUser.badge}
              </p>
            )}
            <p className="text-slate-600 mt-3">{currentUser.bio}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-slate-200">
          <div>
            <div className="font-bold text-lg text-slate-900">
              {currentUser.xp}
            </div>
            <div className="text-xs text-slate-600">XP</div>
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900">
              {currentUser.level}
            </div>
            <div className="text-xs text-slate-600">Level</div>
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900">
              {currentUser.streak}
            </div>
            <div className="text-xs text-slate-600">Streak</div>
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900">
              {currentUser.joinedDate}
            </div>
            <div className="text-xs text-slate-600">Joined</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 bg-white rounded-t-2xl p-4">
        {[
          { id: 'threads', label: 'My Threads' },
          { id: 'saved', label: 'Saved' },
          { id: 'spaces', label: 'Joined Spaces' },
          { id: 'notifications', label: 'Notifications' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMyTab(tab.id as any)}
            className={`font-semibold pb-2 border-b-2 transition-colors ${
              myTab === tab.id
                ? 'text-violet-600 border-violet-600'
                : 'text-slate-600 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {myTab === 'threads' && (
          <div className="text-center py-8 text-slate-600">
            {myThreads.length === 0 ? (
              <p>You haven't created any threads yet. Start a conversation!</p>
            ) : (
              <p>{myThreads.length} threads created</p>
            )}
          </div>
        )}

        {myTab === 'saved' && (
          <div className="text-center py-8 text-slate-600">
            {savedThreads.size === 0 ? (
              <p>No saved threads yet. Save threads to read later.</p>
            ) : (
              <p>{savedThreads.size} threads saved</p>
            )}
          </div>
        )}

        {myTab === 'spaces' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from(joinedSpaces).map((spaceId) => {
              const space = SPACES.find((s) => s.id === spaceId);
              return space ? (
                <Link key={space.id} href={`/community/space/${space.id}`}>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-violet-300 transition-colors cursor-pointer">
                    <h4 className="font-bold text-slate-900 mb-1">
                      {space.emoji} {space.name}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {space.threadCount} threads • {space.members} members
                    </p>
                  </div>
                </Link>
              ) : null;
            })}
          </div>
        )}

        {myTab === 'notifications' && (
          <div className="space-y-3">
            {[
              {
                type: 'reply',
                text: 'neural_ninja replied to your thread',
                time: '2h ago',
              },
              {
                type: 'upvote',
                text: 'Your thread got 50 upvotes!',
                time: '4h ago',
              },
              {
                type: 'badge',
                text: 'You earned the "Contributor" badge!',
                time: '1d ago',
              },
            ].map((notif, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <p className="text-slate-900 font-medium">{notif.text}</p>
                  <span className="text-xs text-slate-600">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── RIGHT SIDEBAR COMPONENTS ──

function UserXPCard({ user }: { user: any }) {
  const level = LEVELS.find((l) => l.minXP <= user.xp) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.minXP > user.xp) || LEVELS[LEVELS.length - 1];
  const progress =
    ((user.xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100;

  return (
    <div
      className="rounded-2xl p-6 text-white"
      style={{
        background: `linear-gradient(135deg, ${level.color}, ${nextLevel.color})`,
      }}
    >
      <h3 className="font-bold text-lg mb-4">Your XP Progress</h3>
      <div className="mb-4">
        <div className="text-3xl font-bold mb-1">{user.xp}</div>
        <div className="text-sm opacity-90">{user.level}</div>
      </div>
      <div className="mb-4">
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="text-xs opacity-80 mt-2">
          {Math.round(Math.min(progress, 100))}% to {nextLevel.name}
        </div>
      </div>
      <p className="text-xs opacity-90">
        Earn XP by contributing, creating threads, and getting upvotes!
      </p>
    </div>
  );
}

function TrendingSpacesCard({
  spaces,
  joinedSpaces,
  onToggleJoin,
}: {
  spaces: any[];
  joinedSpaces: Set<string>;
  onToggleJoin: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-lg text-slate-900 mb-4">Trending Spaces</h3>
      <div className="space-y-3">
        {spaces.map((space) => (
          <Link key={space.id} href={`/community/space/${space.id}`}>
            <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
              <span className="text-xl">{space.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm">
                  {space.name}
                </h4>
                <p className="text-xs text-slate-600">
                  {space.members.toLocaleString()} members
                </p>
              </div>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleJoin(space.id);
                }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                  joinedSpaces.has(space.id)
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {joinedSpaces.has(space.id) ? '✓' : 'Join'}
              </motion.button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GuidelinesCard() {
  const guidelines = [
    'Be respectful and assume good intent',
    'No spam, self-promotion, or low-effort posts',
    'Share knowledge, ask genuine questions',
    'Credit original creators and sources',
    'Keep discussions focused and on-topic',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-lg text-slate-900 mb-4">
        Community Guidelines
      </h3>
      <ul className="space-y-3">
        {guidelines.map((guideline, idx) => (
          <li key={idx} className="flex gap-3 text-sm">
            <span className="text-violet-600 font-bold flex-shrink-0">✓</span>
            <span className="text-slate-700">{guideline}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RolesAndBadgesCard() {
  const badges = Object.entries(BADGE_STYLES).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-lg text-slate-900 mb-4">Roles & Badges</h3>
      <div className="space-y-2">
        {badges.map(([badgeName, style]) => (
          <div key={badgeName} className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded text-xs font-semibold"
              style={{
                backgroundColor: style.bg,
                color: style.text,
              }}
            >
              {badgeName}
            </span>
          </div>
        ))}
        <p className="text-xs text-slate-600 mt-4 pt-4 border-t border-slate-200">
          Earn badges by reaching milestones, helping others, and contributing
          quality content.
        </p>
      </div>
    </div>
  );
}

function MarketplaceConnectionCard() {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-6">
      <h3 className="font-bold text-lg text-slate-900 mb-3">
        Community → Marketplace
      </h3>
      <p className="text-sm text-slate-700 mb-4">
        Your community XP directly boosts your Marketplace Trust Score. More XP
        = higher rates, better visibility, and featured placement for your
        prompts and AI tools.
      </p>
      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-violet-600 font-bold">→</span>
          <span>XP earned = Trust Score growth</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-violet-600 font-bold">→</span>
          <span>Badges unlock special selling privileges</span>
        </div>
      </div>
    </div>
  );
}

// ── MODALS ──

function NewThreadModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    space: 'model-arena',
    type: 'discussion',
    title: '',
    content: '',
    tags: '',
  });

  const handleSubmit = () => {
    if (formData.title && formData.content) {
      onSubmit(formData);
      setFormData({
        space: 'model-arena',
        type: 'discussion',
        title: '',
        content: '',
        tags: '',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-slate-900">New Thread</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Space Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Space
                  </label>
                  <select
                    value={formData.space}
                    onChange={(e) =>
                      setFormData({ ...formData, space: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {SPACES.map((space) => (
                      <option key={space.id} value={space.id}>
                        {space.emoji} {space.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Markdown supported. Share your thoughts, code, ideas, or questions..."
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-sm"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="e.g., Claude, Benchmarks, AI"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.title || !formData.content}
                    className="px-6 py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Thread
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NewSpaceModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '💡',
    description: '',
    category: 'Discussion',
    rules: '',
    isPublic: true,
  });

  const handleSubmit = () => {
    if (formData.name && formData.description) {
      onSubmit(formData);
      setFormData({
        name: '',
        emoji: '💡',
        description: '',
        category: 'Discussion',
        rules: '',
        isPublic: true,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-slate-900">
                  Create New Space
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Space Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., AI Safety Research"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Emoji */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emoji: e.target.value.slice(0, 2),
                      })
                    }
                    placeholder="Pick an emoji"
                    maxLength={2}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-2xl"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="What is this space about?"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {SPACE_CATEGORIES.filter((c) => c !== 'All').map(
                      (category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Rules */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Community Rules (one per line)
                  </label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) =>
                      setFormData({ ...formData, rules: e.target.value })
                    }
                    placeholder="E.g.&#10;Be respectful&#10;No spam&#10;Source your claims"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-sm"
                  />
                </div>

                {/* Public/Private */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm text-slate-700">
                    Make this space public (anyone can discover & join)
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.description}
                    className="px-6 py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Space
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
