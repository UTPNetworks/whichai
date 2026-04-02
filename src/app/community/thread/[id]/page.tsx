'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getThreadById, getSpaceById, BADGE_STYLES, TYPE_CONFIG } from '@/lib/community-data';
import type { Thread, Reply, CommunityUser } from '@/lib/community-data';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThreadPage() {
  const params = useParams();
  const threadId = params?.id as string;

  const thread = useMemo(() => getThreadById(threadId), [threadId]);
  const space = useMemo(() => thread && getSpaceById(thread.spaceId), [thread]);

  // State management
  const [localReplies, setLocalReplies] = useState<Reply[]>(thread?.replies || []);
  const [threadReactions, setThreadReactions] = useState<Record<string, boolean>>(
    Object.fromEntries(
      ['🔥', '💡', '👏', '🤔', '❤️'].map((emoji) => [emoji, false])
    )
  );
  const [replyReactions, setReplyReactions] = useState<Record<string, Record<string, boolean>>>({});
  const [upvotedReplies, setUpvotedReplies] = useState<Set<string>>(new Set());
  const [downvotedReplies, setDownvotedReplies] = useState<Set<string>>(new Set());
  const [savedState, setSavedState] = useState(false);
  const [pollVotes, setPollVotes] = useState<Record<number, boolean>>(
    Object.fromEntries(
      thread?.pollOptions?.map((_, idx) => [idx, false]) || []
    )
  );
  const [replyText, setReplyText] = useState('');
  const [sortOrder, setSortOrder] = useState<'best' | 'newest' | 'oldest'>('best');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  if (!thread || !space) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thread not found</h1>
          <p className="text-gray-600 mb-8">The thread you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Community
          </Link>
        </div>
      </div>
    );
  }

  // Reaction helpers
  const toggleThreadReaction = (emoji: string) => {
    setThreadReactions((prev) => ({
      ...prev,
      [emoji]: !prev[emoji],
    }));
  };

  const toggleReplyReaction = (replyId: string, emoji: string) => {
    setReplyReactions((prev) => ({
      ...prev,
      [replyId]: {
        ...(prev[replyId] || {}),
        [emoji]: !(prev[replyId]?.[emoji] || false),
      },
    }));
  };

  const toggleUpvote = (replyId: string) => {
    if (upvotedReplies.has(replyId)) {
      setUpvotedReplies((prev) => new Set([...prev].filter((id) => id !== replyId)));
    } else {
      setUpvotedReplies((prev) => new Set([...prev, replyId]));
      setDownvotedReplies((prev) => new Set([...prev].filter((id) => id !== replyId)));
    }
  };

  const togglePollVote = (optionIndex: number) => {
    setPollVotes((prev) => {
      const newVotes = Object.fromEntries(
        Object.keys(prev).map((key) => [key, false])
      );
      newVotes[optionIndex] = true;
      return newVotes;
    });
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;

    const newReply: Reply = {
      id: `r${Date.now()}`,
      author: {
        username: 'current_user',
        avatar: '👤',
        badge: null,
        xp: 0,
        level: 'Newcomer',
        streak: 0,
        joinedDate: 'Now',
        bio: 'Community member',
      },
      content: replyText,
      upvotes: 0,
      time: 'now',
      reactions: {},
    };

    setLocalReplies((prev) => [newReply, ...prev]);
    setReplyText('');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const sortedReplies = useMemo(() => {
    const replies = [...localReplies];
    const acceptedReply = replies.find((r) => r.isAccepted);
    const otherReplies = replies.filter((r) => !r.isAccepted);

    let sorted = otherReplies;
    if (sortOrder === 'best') {
      sorted = [...otherReplies].sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortOrder === 'newest') {
      // Assuming newer replies are at the start
      sorted = otherReplies;
    } else if (sortOrder === 'oldest') {
      sorted = [...otherReplies].reverse();
    }

    return acceptedReply ? [acceptedReply, ...sorted] : sorted;
  }, [localReplies, sortOrder]);

  const threadTypeConfig = TYPE_CONFIG[thread.type];
  const badgeStyle = thread.author.badge ? BADGE_STYLES[thread.author.badge] : null;

  // Reaction emoji list
  const reactionEmojis = ['🔥', '💡', '👏', '🤔', '❤️'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/community" className="hover:text-gray-900 font-medium">
            Community
          </Link>
          <span>/</span>
          <Link href={`/community/${space.id}`} className="hover:text-gray-900 font-medium">
            {space.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{thread.title}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Thread header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
        >
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {/* Space badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: space.color + '20', color: space.color }}
            >
              <span>{space.emoji}</span>
              <span>{space.name}</span>
            </div>

            {/* Type badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: threadTypeConfig.color + '20', color: threadTypeConfig.color }}
            >
              <span>{threadTypeConfig.icon}</span>
              <span>{threadTypeConfig.label}</span>
            </div>

            {/* Indicators */}
            {thread.hot && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
                <span>🔥</span>
                <span>Hot</span>
              </div>
            )}
            {thread.pinned && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                <span>📌</span>
                <span>Pinned</span>
              </div>
            )}
            {thread.answered && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                <span>✅</span>
                <span>Answered</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{thread.title}</h1>

          {/* Author info */}
          <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
            <div className="text-3xl">{thread.author.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{thread.author.username}</span>
                {badgeStyle && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: badgeStyle.bg,
                      color: badgeStyle.text,
                      border: `1px solid ${badgeStyle.border}`,
                    }}
                  >
                    {thread.author.badge}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {thread.time} • {thread.views} views
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6 text-gray-700 whitespace-pre-wrap font-light leading-relaxed">
            {thread.content}
          </div>

          {/* Poll section (if applicable) */}
          {thread.type === 'poll' && thread.pollOptions && (
            <div className="mt-8 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Vote on this poll:</h3>
              {thread.pollOptions.map((option, idx) => {
                const totalVotes = thread.pollOptions!.reduce((sum, o) => sum + o.votes, 0);
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                const isVoted = pollVotes[idx];

                return (
                  <motion.button
                    key={idx}
                    onClick={() => togglePollVote(idx)}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      isVoted
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isVoted ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                        }`}
                      >
                        {isVoted && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.text}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className="bg-indigo-500 h-full"
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Reaction bar */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-2 flex-wrap">
            {reactionEmojis.map((emoji) => (
              <motion.button
                key={emoji}
                onClick={() => toggleThreadReaction(emoji)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  threadReactions[emoji]
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{emoji}</span>
                <span>{(thread.reactions[emoji] || 0) + (threadReactions[emoji] ? 1 : 0)}</span>
              </motion.button>
            ))}
          </div>

          {/* Action bar */}
          <div className="mt-6 flex items-center gap-3 border-t border-gray-200 pt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition"
            >
              <span>💬</span>
              Reply
            </motion.button>
            <motion.button
              onClick={() => setSavedState(!savedState)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                savedState
                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{savedState ? '⭐' : '☆'}</span>
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              <span>🔗</span>
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              <span>⚠️</span>
              Report
            </motion.button>
          </div>
        </motion.div>

        {/* Replies section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {sortedReplies.length} {sortedReplies.length === 1 ? 'Reply' : 'Replies'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'best' | 'newest' | 'oldest')}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="best">Best</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Reply composer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
          >
            <label className="block text-sm font-semibold text-gray-900 mb-3">Write a reply</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply... (Markdown supported)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-light"
              rows={replyText ? 4 : 2}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                {replyText.length} characters
              </div>
              <motion.button
                onClick={handleReplySubmit}
                disabled={!replyText.trim()}
                whileHover={replyText.trim() ? { scale: 1.05 } : {}}
                whileTap={replyText.trim() ? { scale: 0.95 } : {}}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  replyText.trim()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Post Reply
              </motion.button>
            </div>
          </motion.div>

          {/* Success message */}
          <AnimatePresence>
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium"
              >
                ✓ Your reply has been posted!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies list */}
          <div className="space-y-4">
            {sortedReplies.map((reply) => {
              const replyBadgeStyle = reply.author.badge ? BADGE_STYLES[reply.author.badge] : null;
              const hasUpvoted = upvotedReplies.has(reply.id);

              return (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border-2 p-6 transition ${
                    reply.isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {/* Accepted answer badge */}
                  {reply.isAccepted && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                      <span>✅</span>
                      <span>Accepted Answer</span>
                    </div>
                  )}

                  {/* Reply author info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{reply.author.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{reply.author.username}</span>
                        {replyBadgeStyle && (
                          <span
                            className="px-2 py-0.5 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: replyBadgeStyle.bg,
                              color: replyBadgeStyle.text,
                              border: `1px solid ${replyBadgeStyle.border}`,
                            }}
                          >
                            {reply.author.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{reply.time}</div>
                    </div>
                  </div>

                  {/* Reply content */}
                  <div className="text-gray-700 whitespace-pre-wrap font-light leading-relaxed mb-4">
                    {reply.content}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {reactionEmojis.map((emoji) => (
                      <motion.button
                        key={emoji}
                        onClick={() => toggleReplyReaction(reply.id, emoji)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                          replyReactions[reply.id]?.[emoji]
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{(reply.reactions[emoji] || 0) + (replyReactions[reply.id]?.[emoji] ? 1 : 0)}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Upvote button */}
                  <motion.button
                    onClick={() => toggleUpvote(reply.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      hasUpvoted
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>👍</span>
                    <span>{reply.upvotes + (hasUpvoted ? 1 : 0)}</span>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {sortedReplies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-lg border border-gray-200"
            >
              <div className="text-4xl mb-3">💭</div>
              <h3 className="font-semibold text-gray-900 mb-2">No replies yet</h3>
              <p className="text-gray-600 text-sm">Be the first to share your thoughts on this thread.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
