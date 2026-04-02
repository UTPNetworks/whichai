'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getSpaceById, getThreadsBySpace, SPACES, USERS, TYPE_CONFIG, BADGE_STYLES } from '@/lib/community-data';

type SortType = 'hot' | 'new' | 'top' | 'unanswered';
type TabType = 'threads' | 'about' | 'members';

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params?.id as string;

  const space = spaceId ? getSpaceById(spaceId) : null;
  const allThreads = spaceId ? getThreadsBySpace(spaceId) : [];

  const [activeTab, setActiveTab] = useState<TabType>('threads');
  const [sortBy, setSortBy] = useState<SortType>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    type: 'discussion' as 'discussion' | 'question' | 'showcase',
    title: '',
    content: '',
    tags: '',
  });

  if (!space) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Space not found</h1>
            <p className="text-slate-600 mb-6">The space you're looking for doesn't exist.</p>
            <Link
              href="/community"
              className="inline-block px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition"
            >
              Back to Community
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sort and filter threads
  const sortedThreads = useMemo(() => {
    let result = [...allThreads];

    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'hot':
        result.sort((a, b) => {
          const aScore = a.upvotes + a.replyCount * 2 + (a.hot ? 100 : 0);
          const bScore = b.upvotes + b.replyCount * 2 + (b.hot ? 100 : 0);
          return bScore - aScore;
        });
        break;
      case 'new':
        // Assume time strings like "2h ago", "1h ago", etc.
        result.sort((a, b) => {
          const aTime = parseInt(a.time) || 999;
          const bTime = parseInt(b.time) || 999;
          return aTime - bTime;
        });
        break;
      case 'top':
        result.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'unanswered':
        result = result.filter((t) => t.type === 'question' && !t.answered);
        result.sort((a, b) => b.views - a.views);
        break;
    }

    return result;
  }, [allThreads, sortBy, searchQuery]);

  const moderators = space.moderators
    .map((username) => USERS[username as keyof typeof USERS])
    .filter(Boolean);

  // Mock members for Members tab
  const mockMembers = [
    ...moderators.map((u) => ({ ...u, isModerator: true })),
    ...Object.values(USERS)
      .filter((u) => !moderators.includes(u))
      .slice(0, 12)
      .map((u) => ({ ...u, isModerator: false })),
  ];

  const relatedSpaces = SPACES.filter(
    (s) => s.category === space.category && s.id !== space.id
  ).slice(0, 3);

  const handleJoinToggle = () => {
    setIsJoined(!isJoined);
  };

  const handleCreateThread = () => {
    if (createForm.title.trim() && createForm.content.trim()) {
      setShowCreateModal(false);
      setCreateForm({ type: 'discussion', title: '', content: '', tags: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-48 sm:h-64 overflow-hidden"
        style={{ background: space.bannerGradient }}
      >
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        <div className="relative h-full flex items-end p-6 sm:p-8">
          <div className="flex items-end gap-4 w-full">
            <div className="text-6xl sm:text-7xl">{space.emoji}</div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{space.name}</h1>
              <p className="text-white text-sm sm:text-base opacity-90">{space.description}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinToggle}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition ${
                isJoined
                  ? 'bg-white text-violet-600 hover:bg-slate-100'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/40'
              }`}
            >
              {isJoined ? 'Joined' : 'Join'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Space Stats Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-8 text-sm sm:text-base overflow-x-auto">
          <div className="flex gap-2 whitespace-nowrap">
            <span className="font-semibold text-slate-900">{space.members.toLocaleString()}</span>
            <span className="text-slate-600">Members</span>
          </div>
          <div className="flex gap-2 whitespace-nowrap">
            <span className="font-semibold text-slate-900">{space.threadCount}</span>
            <span className="text-slate-600">Threads</span>
          </div>
          <div className="flex gap-2 whitespace-nowrap">
            <span className="font-semibold text-slate-900">{space.online}</span>
            <span className="text-slate-600">Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 py-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tab Bar */}
          <div className="flex gap-1 mb-8 border-b border-slate-200">
            {(['threads', 'about', 'members'] as TabType[]).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold capitalize transition-colors relative ${
                  activeTab === tab ? 'text-violet-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Threads Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'threads' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Sort & Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search threads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(['hot', 'new', 'top', 'unanswered'] as SortType[]).map((sort) => (
                      <motion.button
                        key={sort}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSortBy(sort)}
                        className={`px-4 py-2 rounded-lg font-semibold capitalize transition ${
                          sortBy === sort
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {sort}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* New Thread Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="w-full mb-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  + New Thread
                </motion.button>

                {/* Thread List */}
                <div className="space-y-4">
                  {sortedThreads.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-600">No threads found</p>
                    </div>
                  ) : (
                    sortedThreads.map((thread, idx) => {
                      const typeConfig = TYPE_CONFIG[thread.type];
                      return (
                        <motion.div
                          key={thread.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition"
                        >
                          <div className="flex gap-4">
                            {/* Upvote Section */}
                            <div className="flex flex-col items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-2xl hover:opacity-70 transition"
                              >
                                👆
                              </motion.button>
                              <span className="text-sm font-semibold text-slate-700">{thread.upvotes}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex gap-2 mb-2 flex-wrap">
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                  style={{ backgroundColor: typeConfig.color }}
                                >
                                  {typeConfig.icon} {typeConfig.label}
                                </span>
                                {thread.pinned && (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    📌 Pinned
                                  </span>
                                )}
                                {thread.hot && (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                    🔥 Hot
                                  </span>
                                )}
                              </div>

                              <Link href={`/community/thread/${thread.id}`}>
                                <h3 className="text-lg font-bold text-slate-900 hover:text-violet-600 transition mb-3 line-clamp-2">
                                  {thread.title}
                                </h3>
                              </Link>

                              <div className="flex items-center gap-3 mb-3 text-sm text-slate-600">
                                <span className="font-semibold text-slate-900">
                                  {thread.author.username}
                                </span>
                                <span>{thread.time}</span>
                              </div>

                              <div className="flex gap-4 text-sm text-slate-600">
                                <span>{thread.replyCount} replies</span>
                                <span>{thread.views} views</span>
                                {thread.answered && (
                                  <span className="text-green-600 font-semibold">✓ Answered</span>
                                )}
                              </div>

                              {/* Reactions Preview */}
                              {Object.keys(thread.reactions).length > 0 && (
                                <div className="flex gap-2 mt-3 text-sm">
                                  {Object.entries(thread.reactions).map(([emoji, count]) => (
                                    <span
                                      key={emoji}
                                      className="px-2 py-1 bg-slate-100 rounded-full"
                                    >
                                      {emoji} {count}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Description */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">About this space</h2>
                  <p className="text-slate-700 text-lg leading-relaxed">{space.description}</p>
                </div>

                {/* Rules */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Space Rules</h2>
                  <ol className="space-y-3">
                    {space.rules.map((rule, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="font-bold text-violet-600 flex-shrink-0">{idx + 1}.</span>
                        <span className="text-slate-700">{rule}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Moderators */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Moderators</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {moderators.map((mod) => (
                      <div key={mod.username} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="text-3xl">{mod.avatar}</div>
                        <div>
                          <p className="font-semibold text-slate-900">{mod.username}</p>
                          {mod.badge && (
                            <p className="text-xs font-semibold text-slate-600">{mod.badge}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Created By & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Created by</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {USERS[space.createdBy as keyof typeof USERS]?.username || space.createdBy}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Category</p>
                    <p className="text-lg font-semibold text-slate-900">{space.category}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {space.members.toLocaleString()} members
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockMembers.map((member) => {
                    const badgeStyle = member.isModerator
                      ? BADGE_STYLES['Moderator']
                      : member.badge
                      ? BADGE_STYLES[member.badge] || { bg: '#f0f0f0', text: '#333', border: '#ccc' }
                      : null;

                    return (
                      <motion.div
                        key={member.username}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-lg transition"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-4xl">{member.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{member.username}</p>
                            <p className="text-xs text-slate-600">{member.level}</p>
                          </div>
                        </div>

                        {badgeStyle && (
                          <div className="mb-3 px-3 py-1 rounded-full text-xs font-semibold inline-block"
                               style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text, border: `1px solid ${badgeStyle.border}` }}>
                            {member.isModerator ? '🔨 Moderator' : member.badge}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-50 rounded-lg p-2">
                            <p className="text-slate-600">XP</p>
                            <p className="font-bold text-slate-900">{member.xp.toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2">
                            <p className="text-slate-600">Joined</p>
                            <p className="font-bold text-slate-900">{member.joinedDate}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Space Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">Space Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Threads</span>
                <span className="font-semibold text-slate-900">{space.threadCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Members</span>
                <span className="font-semibold text-slate-900">{space.members.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Online now</span>
                <span className="font-semibold text-slate-900">{space.online}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between">
                <span className="text-slate-600">Category</span>
                <span className="font-semibold text-slate-900">{space.category}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Rules</h3>
            <ul className="space-y-2 text-sm">
              {space.rules.slice(0, 3).map((rule, idx) => (
                <li key={idx} className="flex gap-2 text-slate-700">
                  <span className="flex-shrink-0">✓</span>
                  <span className="line-clamp-2">{rule}</span>
                </li>
              ))}
              {space.rules.length > 3 && (
                <p className="text-xs text-slate-600 pt-2">
                  +{space.rules.length - 3} more rules
                </p>
              )}
            </ul>
          </motion.div>

          {/* Related Spaces */}
          {relatedSpaces.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">Related Spaces</h3>
              <div className="space-y-3">
                {relatedSpaces.map((related) => (
                  <Link
                    key={related.id}
                    href={`/community/space/${related.id}`}
                    className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{related.emoji}</span>
                      <p className="font-semibold text-slate-900 group-hover:text-violet-600 transition">
                        {related.name}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600">{related.members.toLocaleString()} members</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Report Space */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 text-center text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            Report Space
          </motion.button>
        </div>
      </div>

      {/* Create Thread Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">New Thread in {space.name}</h2>

              {/* Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Thread Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['discussion', 'question', 'showcase'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setCreateForm({ ...createForm, type })}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm capitalize transition ${
                        createForm.type === type
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Give your thread a clear title..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or showcase..."
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  placeholder="e.g., ai, beginner, help"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateThread}
                  disabled={!createForm.title.trim() || !createForm.content.trim()}
                  className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Post Thread
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
