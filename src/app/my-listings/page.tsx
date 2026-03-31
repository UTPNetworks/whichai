'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Eye, Heart, MessageSquare, Trash2, Pencil, Zap, ToggleLeft, ToggleRight,
  TrendingUp, Clock, DollarSign, BarChart3, ArrowUpRight, Search, Filter, ChevronDown,
  MoreHorizontal, X, BadgeCheck, AlertTriangle, Rocket, Star, Copy, ExternalLink,
  Archive, RefreshCw, Tag, Sparkles, Crown, Shield, CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  price: number;
  pricing_type: string;
  status: string;
  views: number;
  saves: number;
  inquiries: number;
  is_boosted: boolean;
  boost_tier: string | null;
  boost_expires_at: string | null;
  photo_urls: string[];
  tags: string[];
  delivery_method: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

type Tab = 'active' | 'draft' | 'paused' | 'sold' | 'all';
type SortBy = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'most-views';

// ── Stats Card ──
const StatCard = ({ icon: Icon, label, value, trend, color }: { icon: any; label: string; value: string | number; trend?: string; color: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-200 transition-all">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}><Icon className="w-4 h-4 text-white" /></div>
      {trend && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{trend}</span>}
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </motion.div>
);

// ── Boost Modal ──
const BoostModal = ({ listing, onClose, onBoost }: { listing: Listing; onClose: () => void; onBoost: (id: string, tier: string) => void }) => {
  const [selected, setSelected] = useState('basic');
  const tiers = [
    { id: 'basic', name: 'Spotlight', price: 4.99, duration: '3 days', icon: Zap, color: 'from-blue-500 to-cyan-500', features: ['2x visibility in search', 'Highlighted border', 'Priority in category'] },
    { id: 'premium', name: 'Featured', price: 12.99, duration: '7 days', icon: Crown, color: 'from-purple-500 to-pink-500', features: ['5x visibility in search', 'Featured badge + top placement', 'Push notification to watchers', 'Social media promotion'] },
    { id: 'mega', name: 'Mega Boost', price: 29.99, duration: '14 days', icon: Rocket, color: 'from-orange-500 to-red-500', features: ['10x visibility everywhere', 'Homepage carousel feature', 'Email blast to category subscribers', 'Dedicated social post', 'Analytics dashboard'] },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Boost Your Listing</h2>
            <p className="text-xs text-slate-400 mt-0.5">"{listing.title}"</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-3">
          {tiers.map((tier) => {
            const TierIcon = tier.icon;
            return (
              <button key={tier.id} onClick={() => setSelected(tier.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected === tier.id ? 'border-purple-400 bg-purple-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-md`}><TierIcon className="w-5 h-5 text-white" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{tier.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-slate-500 font-medium">{tier.duration}</span>
                      </div>
                      <ul className="mt-1.5 space-y-0.5">
                        {tier.features.map((f, i) => (<li key={i} className="text-[11px] text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />{f}</li>))}
                      </ul>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-900">${tier.price}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">Payment integration coming soon</p>
          <button onClick={() => onBoost(listing.id, selected)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-purple-200/50 transition-all flex items-center gap-2">
            <Rocket className="w-4 h-4" />Boost Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Edit Modal ──
const EditModal = ({ listing, onClose, onSave }: { listing: Listing; onClose: () => void; onSave: (id: string, data: Partial<Listing>) => void }) => {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description || '');
  const [price, setPrice] = useState(String(listing.price));
  const [saving, setSaving] = useState(false);
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:bg-white outline-none text-sm text-slate-800 placeholder:text-slate-400 transition-all";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Edit Listing</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} maxLength={120} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={`${inputClass} resize-none`} maxLength={2000} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputClass} pl-7`} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all">Cancel</button>
          <button disabled={saving} onClick={async () => { setSaving(true); await onSave(listing.id, { title, description, price: parseFloat(price) || 0 } as any); setSaving(false); onClose(); }} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Delete Confirmation ──
const DeleteConfirm = ({ listing, onClose, onDelete }: { listing: Listing; onClose: () => void; onDelete: (id: string) => void }) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Listing?</h3>
        <p className="text-sm text-slate-500 mb-5">"{listing.title}" will be permanently removed. This action cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-all">Keep It</button>
          <button disabled={deleting} onClick={async () => { setDeleting(true); await onDelete(listing.id); setDeleting(false); onClose(); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Listing Row Card ──
const ListingCard = ({ listing, onEdit, onDelete, onBoost, onToggleStatus, onDuplicate }: {
  listing: Listing; onEdit: () => void; onDelete: () => void; onBoost: () => void;
  onToggleStatus: () => void; onDuplicate: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    paused: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    sold: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  };
  const sc = statusColors[listing.status] || statusColors.draft;
  const catLabel = listing.category?.split(' > ')[0]?.replace(/-/g, ' ') || 'Uncategorized';
  const daysSinceCreated = Math.floor((Date.now() - new Date(listing.created_at).getTime()) / 86400000);
  const boostActive = listing.is_boosted && listing.boost_expires_at && new Date(listing.boost_expires_at) > new Date();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all group">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
            {listing.photo_urls?.length > 0 ? (
              <img src={listing.photo_urls[0]} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-8 h-8 text-gray-300" />
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{listing.title}</h3>
                  {boostActive && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[9px] font-bold flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />BOOSTED</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{listing.status}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">{catLabel}</span>
                  <span className="text-[10px] text-slate-400">{daysSinceCreated === 0 ? 'Today' : `${daysSinceCreated}d ago`}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{listing.description || 'No description'}</p>
              </div>
              {/* Price */}
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-slate-900">{listing.pricing_type === 'free' ? 'Free' : `$${listing.price.toFixed(2)}`}</p>
                <p className="text-[10px] text-slate-400 capitalize">{listing.pricing_type}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-slate-500"><Eye className="w-3.5 h-3.5" />{listing.views}</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><Heart className="w-3.5 h-3.5" />{listing.saves}</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><MessageSquare className="w-3.5 h-3.5" />{listing.inquiries}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all" title="Edit"><Pencil className="w-4 h-4" /></button>
            <button onClick={onBoost} className="p-2 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all" title="Boost"><Rocket className="w-4 h-4" /></button>
            <button onClick={onToggleStatus} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title={listing.status === 'active' ? 'Pause' : 'Activate'}>
              {listing.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            {/* More menu */}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-all"><MoreHorizontal className="w-4 h-4" /></button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden">
                    <button onClick={() => { onDuplicate(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-gray-50 transition-colors"><Copy className="w-3.5 h-3.5" />Duplicate Listing</button>
                    <button onClick={() => { setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-gray-50 transition-colors"><ExternalLink className="w-3.5 h-3.5" />View in Marketplace</button>
                    <button onClick={() => { onToggleStatus(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-gray-50 transition-colors"><Archive className="w-3.5 h-3.5" />Mark as Sold</button>
                    <div className="border-t border-gray-100" />
                    <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" />Delete Listing</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Page ──
export default function MyListingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [search, setSearch] = useState('');
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [boostingListing, setBoostingListing] = useState<Listing | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const showAction = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const fetchListings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setListings(data as Listing[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) fetchListings(); }, [user, fetchListings]);

  // ── Actions ──
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('user_listings').delete().eq('id', id);
    if (!error) { setListings((prev) => prev.filter((l) => l.id !== id)); showAction('Listing deleted'); }
  };

  const handleEdit = async (id: string, data: Partial<Listing>) => {
    const { error } = await supabase.from('user_listings').update({ title: data.title, description: data.description, price: data.price, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) { setListings((prev) => prev.map((l) => l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l)); showAction('Listing updated'); }
  };

  const handleToggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('user_listings').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', listing.id);
    if (!error) { setListings((prev) => prev.map((l) => l.id === listing.id ? { ...l, status: newStatus } : l)); showAction(`Listing ${newStatus === 'active' ? 'activated' : 'paused'}`); }
  };

  const handleBoost = async (id: string, tier: string) => {
    const durations: Record<string, number> = { basic: 3, premium: 7, mega: 14 };
    const expires = new Date(Date.now() + (durations[tier] || 3) * 86400000).toISOString();
    const { error } = await supabase.from('user_listings').update({ is_boosted: true, boost_tier: tier, boost_expires_at: expires, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) { setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_boosted: true, boost_tier: tier, boost_expires_at: expires } : l)); showAction(`Listing boosted with ${tier} tier!`); }
    setBoostingListing(null);
  };

  const handleDuplicate = async (listing: Listing) => {
    if (!user) return;
    const { data, error } = await supabase.from('user_listings').insert({
      user_id: user.id, title: `${listing.title} (Copy)`, description: listing.description,
      category: listing.category, subcategory: listing.subcategory, price: listing.price,
      pricing_type: listing.pricing_type, tags: listing.tags, delivery_method: listing.delivery_method,
      status: 'draft',
    }).select().single();
    if (!error && data) { setListings((prev) => [data as Listing, ...prev]); showAction('Listing duplicated as draft'); }
  };

  // ── Filtering & Sorting ──
  const filtered = listings
    .filter((l) => tab === 'all' || l.status === tab)
    .filter((l) => !search || l.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'most-views') return b.views - a.views;
      return 0;
    });

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    totalViews: listings.reduce((s, l) => s + (l.views || 0), 0),
    totalSaves: listings.reduce((s, l) => s + (l.saves || 0), 0),
    totalRevenue: listings.filter((l) => l.status === 'sold').reduce((s, l) => s + l.price, 0),
    boosted: listings.filter((l) => l.is_boosted).length,
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: listings.length },
    { id: 'active', label: 'Active', count: stats.active },
    { id: 'draft', label: 'Drafts', count: listings.filter((l) => l.status === 'draft').length },
    { id: 'paused', label: 'Paused', count: listings.filter((l) => l.status === 'paused').length },
    { id: 'sold', label: 'Sold', count: listings.filter((l) => l.status === 'sold').length },
  ];

  if (authLoading) return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <Navbar />
      <div className="flex items-center justify-center pt-40"><div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <Navbar />
      <div className="max-w-md mx-auto mt-32 text-center px-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center mb-4"><Package className="w-8 h-8 text-purple-500" /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to manage your listings</h2>
        <p className="text-sm text-slate-500 mb-6">Create an account or sign in to start selling on WhichAI Marketplace.</p>
        <Link href="/auth/login" className="inline-flex px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        {/* Action toast */}
        <AnimatePresence>
          {actionMsg && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />{actionMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage, boost, and track all your marketplace items</p>
          </div>
          <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-purple-200/50 transition-all">
            <Plus className="w-4 h-4" />New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Package} label="Total Listings" value={stats.total} color="bg-purple-500" />
          <StatCard icon={Eye} label="Total Views" value={stats.totalViews} trend="+12%" color="bg-cyan-500" />
          <StatCard icon={Heart} label="Total Saves" value={stats.totalSaves} trend="+8%" color="bg-pink-500" />
          <StatCard icon={DollarSign} label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="bg-emerald-500" />
        </div>

        {/* Tabs + Search + Sort */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="flex items-center justify-between px-4 pt-3 pb-0 border-b border-gray-100">
            <div className="flex gap-0.5">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all relative ${tab === t.id ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'}`}>
                  {t.label}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab === t.id ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>
                  {tab === t.id && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your listings..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-slate-600 outline-none focus:border-purple-400">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="most-views">Most Views</option>
            </select>
          </div>
        </div>

        {/* Listing Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4"><Package className="w-10 h-10 text-gray-300" /></div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{search ? 'No matching listings' : tab !== 'all' ? `No ${tab} listings yet` : 'No listings yet'}</h3>
            <p className="text-sm text-slate-500 mb-6">{search ? 'Try a different search term' : 'Create your first listing and start selling on WhichAI Marketplace'}</p>
            {!search && (
              <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" />Create Listing
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={() => setEditingListing(listing)}
                onDelete={() => setDeletingListing(listing)}
                onBoost={() => setBoostingListing(listing)}
                onToggleStatus={() => handleToggleStatus(listing)}
                onDuplicate={() => handleDuplicate(listing)}
              />
            ))}
          </div>
        )}

        {/* Seller tips */}
        {listings.length > 0 && listings.length < 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-5 rounded-xl bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Seller Tips</h4>
                <ul className="space-y-1">
                  <li className="text-xs text-slate-600">Add high-quality photos to get 3x more views</li>
                  <li className="text-xs text-slate-600">Listings with detailed descriptions sell 2x faster</li>
                  <li className="text-xs text-slate-600">Boost your listing to appear at the top of search results</li>
                  <li className="text-xs text-slate-600">Respond to inquiries quickly to improve your seller rating</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingListing && <EditModal listing={editingListing} onClose={() => setEditingListing(null)} onSave={handleEdit} />}
        {deletingListing && <DeleteConfirm listing={deletingListing} onClose={() => setDeletingListing(null)} onDelete={handleDelete} />}
        {boostingListing && <BoostModal listing={boostingListing} onClose={() => setBoostingListing(null)} onBoost={handleBoost} />}
      </AnimatePresence>
    </div>
  );
}
