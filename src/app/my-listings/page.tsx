'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Eye, Heart, MessageSquare, Trash2, Pencil, Zap, ToggleLeft, ToggleRight,
  TrendingUp, Clock, DollarSign, BarChart3, ArrowUpRight, Search, Filter, ChevronDown,
  MoreHorizontal, X, BadgeCheck, AlertTriangle, Rocket, Star, Copy, ExternalLink,
  Archive, RefreshCw, Tag, Sparkles, Crown, Shield, CheckCircle2, ArrowLeft, ImagePlus,
  Camera, Upload, Save, ChevronRight, Store, XCircle, EyeOff, Check,
  LayoutGrid, List,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import {
  supabase, safeRefreshSession, directSelect, directInsert,
  directUpdate, directDelete, directUpdateMany, directDeleteMany,
} from '@/lib/supabase';
import AIEnrichmentStatus, { EnrichedListing } from '@/components/AIEnrichmentStatus';

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
  // AI enrichment fields
  enrichment_status?: 'pending' | 'processing' | 'complete' | 'failed' | null;
  enrichment_step?: string | null;
  ai_generated?: boolean;
  refined_title?: string | null;
  refined_description?: string | null;
  technical_specs?: Record<string, string> | null;
  ai_compatibility?: string[] | null;
  suggested_hashtags?: string[] | null;
}

type Tab = 'active' | 'draft' | 'paused' | 'sold' | 'hidden' | 'archived' | 'all';
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
            <p className="text-xs text-slate-400 mt-0.5">&ldquo;{listing.title}&rdquo;</p>
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

// ── Delete Confirmation ──
const DeleteConfirm = ({ listing, onClose, onDelete }: { listing: Listing; onClose: () => void; onDelete: (id: string) => void }) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Listing?</h3>
        <p className="text-sm text-slate-500 mb-5">&ldquo;{listing.title}&rdquo; will be permanently removed. This action cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-all">Keep It</button>
          <button disabled={deleting} onClick={async () => { setDeleting(true); await onDelete(listing.id); setDeleting(false); onClose(); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Bulk Delete Confirmation ──
const BulkDeleteConfirm = ({ count, onClose, onDelete }: { count: number; onClose: () => void; onDelete: () => Promise<void> }) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Delete {count} Listing{count > 1 ? 's' : ''}?</h3>
        <p className="text-sm text-slate-500 mb-5">These listings will be permanently removed. This action cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
          <button disabled={deleting} onClick={async () => { setDeleting(true); await onDelete(); setDeleting(false); onClose(); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60">
            {deleting ? 'Deleting...' : `Delete ${count}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Full Listing Detail/Edit View ──
const ListingDetailView = ({ listing, onBack, onSave, onDelete }: {
  listing: Listing;
  onBack: () => void;
  onSave: (id: string, data: Partial<Listing>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description || '');
  const [price, setPrice] = useState(String(listing.price));
  const [pricingType, setPricingType] = useState(listing.pricing_type || 'one-time');
  const [tagsStr, setTagsStr] = useState((listing.tags || []).join(', '));
  const [photos, setPhotos] = useState<string[]>(listing.photo_urls || []);
  const [category, setCategory] = useState(listing.category || '');
  const [deliveryMethod, setDeliveryMethod] = useState(listing.delivery_method || 'digital');
  const [location, setLocation] = useState(listing.location || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await safeRefreshSession();
      const newUrls: string[] = [];
      const errors: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `listings/${listing.id}/${Date.now()}-${i}.${ext}`;
        const { data, error } = await supabase.storage.from('listing-photos').upload(path, file, { upsert: true });
        if (error) {
          console.error('Photo upload error:', error);
          errors.push(`${file.name}: ${error.message}`);
        } else if (data) {
          const { data: urlData } = supabase.storage.from('listing-photos').getPublicUrl(data.path);
          if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
        }
      }
      if (newUrls.length > 0) setPhotos((prev) => [...prev, ...newUrls]);
      if (errors.length > 0) alert(`Some photos failed to upload:\n${errors.join('\n')}`);
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      alert(`Photo upload failed: ${err?.message || 'Unknown error'}`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    if (activePhotoIdx >= photos.length - 1) setActivePhotoIdx(Math.max(0, photos.length - 2));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(listing.id, {
        title,
        description,
        price: pricingType === 'free' ? 0 : (parseFloat(price) || 0),
        pricing_type: pricingType,
        tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
        photo_urls: photos,
        category,
        delivery_method: deliveryMethod,
        location: location || null,
      } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:bg-white outline-none text-sm text-slate-800 placeholder:text-slate-400 transition-all";

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-purple-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />My Listings
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Photos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Main Photo */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 relative group">
              {photos.length > 0 ? (
                <img src={photos[activePhotoIdx] || photos[0]} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <Camera className="w-12 h-12 mb-2" />
                  <p className="text-sm font-medium">No photos yet</p>
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute bottom-3 right-3 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700 shadow-lg hover:bg-white transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100">
                {uploading ? <><div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><Upload className="w-3.5 h-3.5" />Add Photo</>}
              </button>
            </div>
            {/* Photo strip */}
            {photos.length > 0 && (
              <div className="p-3 flex gap-2 overflow-x-auto">
                {photos.map((url, i) => (
                  <div key={i} className="relative shrink-0 group/thumb">
                    <button onClick={() => setActivePhotoIdx(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activePhotoIdx ? 'border-purple-500 shadow-md' : 'border-transparent hover:border-gray-300'}`}>
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                    <button onClick={() => removePhoto(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-sm hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 flex items-center justify-center text-gray-400 hover:text-purple-500 transition-all shrink-0">
                  <ImagePlus className="w-5 h-5" />
                </button>
              </div>
            )}
            {photos.length === 0 && (
              <div className="p-4">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 text-sm font-medium text-gray-500 hover:text-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {uploading ? <><div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />Uploading...</> : <><ImagePlus className="w-4 h-4" />Upload Photos</>}
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
          </div>
        </div>

        {/* Right: Editable Fields */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title + Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-purple-500" />Listing Details
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                listing.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                listing.status === 'paused' ? 'bg-amber-50 text-amber-700' :
                listing.status === 'sold' ? 'bg-blue-50 text-blue-700' :
                listing.status === 'hidden' ? 'bg-slate-100 text-slate-600' :
                listing.status === 'archived' ? 'bg-indigo-50 text-indigo-700' :
                'bg-gray-100 text-gray-600'
              }`}>{listing.status.toUpperCase()}</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} maxLength={120} placeholder="What are you selling?" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={`${inputClass} resize-none`} maxLength={2000} placeholder="Describe your item in detail..." />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{description.length}/2000</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-emerald-500" />Pricing
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Pricing Type</label>
                <select value={pricingType} onChange={(e) => setPricingType(e.target.value)} className={inputClass}>
                  <option value="one-time">One-time Purchase</option>
                  <option value="subscription">Subscription</option>
                  <option value="negotiable">Negotiable</option>
                  <option value="free">Free</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputClass} pl-7`} disabled={pricingType === 'free'} placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>

          {/* Tags & Category */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-cyan-500" />Tags & Category
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tags <span className="text-slate-400 normal-case font-normal">(comma separated)</span></label>
                <input type="text" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className={inputClass} placeholder="ai, machine-learning, saas, tool" />
                {tagsStr && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagsStr.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-medium">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Category</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} placeholder="digital-assets" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Delivery</label>
                  <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} className={inputClass}>
                    <option value="digital">Digital Download</option>
                    <option value="api">API Access</option>
                    <option value="physical">Physical Shipping</option>
                    <option value="license">License Key</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Location <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="San Francisco, CA" />
              </div>
            </div>
          </div>

          {/* ── AI Enrichment Status panel ── */}
          {(listing.enrichment_status === 'pending' || listing.enrichment_status === 'processing') && (
            <AIEnrichmentStatus
              listingId={listing.id}
              onComplete={(enriched: EnrichedListing) => {
                if (enriched.refined_title) setTitle(enriched.refined_title);
                if (enriched.refined_description) setDescription(enriched.refined_description);
                if (enriched.suggested_hashtags?.length) setTagsStr(enriched.suggested_hashtags.join(', '));
              }}
            />
          )}

          {/* ── AI-Generated review banner ── */}
          {listing.ai_generated && listing.enrichment_status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 flex items-start gap-3"
            >
              <BadgeCheck className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-fuchsia-800">AI-Generated content — review before publishing</p>
                <p className="text-[11px] text-fuchsia-500 mt-0.5">
                  Claude has filled in the title, description, and tags. Review them above, edit anything you like, then hit <strong>Save Changes</strong> to approve and remove this badge.
                </p>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all flex items-center gap-2">
              <Trash2 className="w-4 h-4" />Delete Listing
            </button>
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-purple-200/50 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                ) : saved ? (
                  <><CheckCircle2 className="w-4 h-4" />Saved!</>
                ) : (
                  <><Save className="w-4 h-4" />Save Changes</>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirm listing={listing} onClose={() => setShowDeleteConfirm(false)} onDelete={async (id) => { await onDelete(id); onBack(); }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Listing Card ──
const ListingCard = ({
  listing, onClick, onEdit, onDelete, onBoost, onToggleStatus, onDuplicate,
  isSelected, onSelect,
}: {
  listing: Listing;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBoost: () => void;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  isSelected: boolean;
  onSelect: (id: string, index: number, isShiftKey: boolean) => void;
  index: number;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    active:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
    paused:   { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500'   },
    draft:    { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400'    },
    sold:     { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500'    },
    hidden:   { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
    archived: { bg: 'bg-indigo-50',   text: 'text-indigo-700',  dot: 'bg-indigo-400'  },
  };
  const sc = statusColors[listing.status] || statusColors.draft;
  const catLabel = listing.category?.split(' > ')[0]?.replace(/-/g, ' ') || 'Uncategorized';
  const daysSinceCreated = Math.floor((Date.now() - new Date(listing.created_at).getTime()) / 86400000);
  const boostActive = listing.is_boosted && listing.boost_expires_at && new Date(listing.boost_expires_at) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(147,51,234,0.08)' }}
      className={`bg-white rounded-xl border transition-all group cursor-pointer ${isSelected ? 'border-purple-400 ring-2 ring-purple-200 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}
    >
      <div className="p-4" onClick={onClick}>
        <div className="flex gap-4">
          {/* Thumbnail with selection checkbox */}
          <div className="relative w-24 h-24 shrink-0">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-purple-200 transition-colors">
              {listing.photo_urls?.length > 0 ? (
                <img src={listing.photo_urls[0]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-gray-300" />
              )}
            </div>
            {/* Selection checkbox — always visible when selected, visible on hover otherwise */}
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(listing.id, index, e.shiftKey); }}
              className={`absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                isSelected
                  ? 'bg-purple-500 border-purple-500 opacity-100'
                  : 'bg-white/85 border-slate-300 opacity-0 group-hover:opacity-100 hover:border-purple-400'
              }`}
              title={isSelected ? 'Deselect' : 'Select'}
            >
              {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-purple-700 transition-colors">{listing.title}</h3>
                  {boostActive && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[9px] font-bold flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />BOOSTED</span>
                  )}
                  {(listing.enrichment_status === 'pending' || listing.enrichment_status === 'processing') && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[9px] font-bold flex items-center gap-0.5 animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" />AI
                    </span>
                  )}
                  {listing.ai_generated && listing.enrichment_status === 'complete' && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 text-[9px] font-bold flex items-center gap-0.5">
                      <BadgeCheck className="w-2.5 h-2.5" />AI
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
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
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 pb-3 border-t border-gray-100 mx-4 pt-3" onClick={(e) => e.stopPropagation()}>
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
    </motion.div>
  );
};

// ── Listing Card (Grid View) ──
const GridListingCard = ({
  listing, onClick, onEdit, onDelete, onBoost, onToggleStatus, onDuplicate,
  isSelected, onSelect,
}: {
  listing: Listing;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBoost: () => void;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  isSelected: boolean;
  onSelect: (id: string, index: number, isShiftKey: boolean) => void;
  index: number;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    active:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
    paused:   { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500'   },
    draft:    { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400'    },
    sold:     { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500'    },
    hidden:   { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
    archived: { bg: 'bg-indigo-50',   text: 'text-indigo-700',  dot: 'bg-indigo-400'  },
  };
  const sc = statusColors[listing.status] || statusColors.draft;
  const boostActive = listing.is_boosted && listing.boost_expires_at && new Date(listing.boost_expires_at) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(147,51,234,0.12)' }}
      className={`bg-white rounded-2xl border transition-all group flex flex-col h-full overflow-hidden ${isSelected ? 'border-purple-400 ring-2 ring-purple-200 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden cursor-pointer" onClick={onClick}>
        {listing.photo_urls?.length > 0 ? (
          <img src={listing.photo_urls[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="w-12 h-12" />
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm ${sc.bg} ${sc.text} backdrop-blur-sm bg-opacity-90`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{listing.status.toUpperCase()}
          </span>
        </div>

        {/* Checkbox Overlay */}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(listing.id, index, e.shiftKey); }}
          className={`absolute top-3 left-3 z-20 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-md ${
            isSelected
              ? 'bg-purple-500 border-purple-500 opacity-100'
              : 'bg-white/90 border-slate-300 opacity-0 group-hover:opacity-100 hover:border-purple-400'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </button>

        {/* Boost/AI Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {boostActive && (
            <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[9px] font-bold flex items-center gap-1 shadow-sm"><Zap className="w-2.5 h-2.5" />BOOSTED</span>
          )}
          {listing.ai_generated && listing.enrichment_status === 'complete' && (
            <span className="px-2 py-0.5 rounded-lg bg-white/95 text-fuchsia-600 border border-fuchsia-100 text-[9px] font-bold flex items-center gap-1 shadow-sm">
              <BadgeCheck className="w-2.5 h-2.5" />AI
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1" onClick={onClick}>
        <div className="mb-2">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-purple-700 transition-colors min-h-[40px]">{listing.title}</h3>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-slate-900 leading-tight">{listing.pricing_type === 'free' ? 'Free' : `$${listing.price.toFixed(2)}`}</span>
            <span className="text-[10px] text-slate-400 font-medium capitalize">{listing.pricing_type}</span>
          </div>

          <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-all"><MoreHorizontal className="w-3.5 h-3.5" /></button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl border border-gray-200 shadow-2xl z-30 overflow-hidden py-1">
                    <button onClick={() => { onBoost(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"><Rocket className="w-3.5 h-3.5" />Boost Visibility</button>
                    <button onClick={() => { onDuplicate(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-gray-50 transition-colors"><Copy className="w-3.5 h-3.5" />Duplicate</button>
                    <button onClick={() => { onToggleStatus(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-gray-50 transition-colors">
                      {listing.status === 'active' ? <><ToggleRight className="w-3.5 h-3.5" />Pause Listing</> : <><ToggleLeft className="w-3.5 h-3.5" />Activate Listing</>}
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats footer (small) */}
        <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views}</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{listing.saves}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{listing.inquiries}</span>
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [boostingListing, setBoostingListing] = useState<Listing | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  // ── Persistence for viewMode ──
  useEffect(() => {
    const saved = localStorage.getItem('my-listings-view-mode');
    if (saved === 'grid' || saved === 'list') setViewMode(saved as 'grid' | 'list');
  }, []);

  const handleToggleView = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('my-listings-view-mode', mode);
  };


  // ── Batch selection state ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const showAction = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const fetchListings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await directSelect(
        'user_listings',
        { user_id: user.id },
        { column: 'created_at', ascending: false }
      );
      if (!error && data) setListings(data as Listing[]);
      else if (error) console.error('Fetch listings error:', error);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) fetchListings(); }, [user, fetchListings]);

  // ── Selection helpers ──
  const toggleSelect = (id: string, index: number, isShiftKey: boolean = false) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      
      if (isShiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = filtered.slice(start, end + 1).map(l => l.id);
        
        const isSelecting = !prev.has(id);
        rangeIds.forEach(rangeId => {
          if (isSelecting) next.add(rangeId);
          else next.delete(rangeId);
        });
      } else {
        if (next.has(id)) next.delete(id); else next.add(id);
      }
      
      return next;
    });
    setLastSelectedIndex(index);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((l) => l.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Individual action handlers (GoTrue-bypass via direct REST) ──
  const handleDelete = async (id: string) => {
    const { error } = await directDelete('user_listings', { id });
    if (error) { alert(`Failed to delete: ${error.message}`); return; }
    setListings((prev) => prev.filter((l) => l.id !== id));
    showAction('Listing deleted');
  };

  const handleEdit = async (id: string, data: Partial<Listing>) => {
    const { error } = await directUpdate(
      'user_listings',
      {
        title: data.title,
        description: data.description,
        price: data.price,
        pricing_type: (data as any).pricing_type,
        tags: (data as any).tags,
        photo_urls: (data as any).photo_urls,
        category: (data as any).category,
        delivery_method: (data as any).delivery_method,
        location: (data as any).location,
        updated_at: new Date().toISOString(),
        ai_generated: false,
      },
      { id }
    );
    if (error) { alert(`Failed to save: ${error.message}`); return; }
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l));
    setSelectedListing((prev) => prev && prev.id === id ? { ...prev, ...data, updated_at: new Date().toISOString() } : prev);
    showAction('Listing updated');
  };

  const handleToggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === 'active' ? 'paused' : 'active';
    const { error } = await directUpdate('user_listings', { status: newStatus, updated_at: new Date().toISOString() }, { id: listing.id });
    if (error) { alert(`Failed: ${error.message}`); return; }
    setListings((prev) => prev.map((l) => l.id === listing.id ? { ...l, status: newStatus } : l));
    showAction(`Listing ${newStatus === 'active' ? 'activated' : 'paused'}`);
  };

  const handleBoost = async (id: string, tier: string) => {
    const durations: Record<string, number> = { basic: 3, premium: 7, mega: 14 };
    const expires = new Date(Date.now() + (durations[tier] || 3) * 86400000).toISOString();
    const { error } = await directUpdate('user_listings', { is_boosted: true, boost_tier: tier, boost_expires_at: expires, updated_at: new Date().toISOString() }, { id });
    if (error) { alert(`Failed to boost: ${error.message}`); return; }
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_boosted: true, boost_tier: tier, boost_expires_at: expires } : l));
    showAction(`Listing boosted with ${tier} tier!`);
    setBoostingListing(null);
  };

  const handleDuplicate = async (listing: Listing) => {
    if (!user) return;
    const { error } = await directInsert('user_listings', {
      user_id: user.id,
      title: `${listing.title} (Copy)`,
      description: listing.description,
      category: listing.category,
      subcategory: listing.subcategory,
      price: listing.price,
      pricing_type: listing.pricing_type,
      tags: listing.tags,
      delivery_method: listing.delivery_method,
      status: 'draft',
    });
    if (!error) { await fetchListings(); showAction('Listing duplicated as draft'); }
    else alert(`Failed to duplicate: ${error.message}`);
  };

  // ── Bulk action handlers ──
  const handleBulkPause = async () => {
    const ids = Array.from(selectedIds);
    setBulkActionLoading(true);
    const { error } = await directUpdateMany('user_listings', { status: 'paused', updated_at: new Date().toISOString() }, ids);
    if (!error) {
      setListings((prev) => prev.map((l) => selectedIds.has(l.id) ? { ...l, status: 'paused' } : l));
      clearSelection();
      showAction(`${ids.length} listing${ids.length > 1 ? 's' : ''} paused`);
    } else {
      alert(`Failed to pause listings: ${error.message}`);
    }
    setBulkActionLoading(false);
  };

  const handleBulkActivate = async () => {
    const ids = Array.from(selectedIds);
    setBulkActionLoading(true);
    const { error } = await directUpdateMany('user_listings', { status: 'active', updated_at: new Date().toISOString() }, ids);
    if (!error) {
      setListings((prev) => prev.map((l) => selectedIds.has(l.id) ? { ...l, status: 'active' } : l));
      clearSelection();
      showAction(`${ids.length} listing${ids.length > 1 ? 's' : ''} activated`);
    } else {
      alert(`Failed to activate listings: ${error.message}`);
    }
    setBulkActionLoading(false);
  };

  const handleBulkHide = async () => {
    const ids = Array.from(selectedIds);
    setBulkActionLoading(true);
    const { error } = await directUpdateMany('user_listings', { status: 'hidden', updated_at: new Date().toISOString() }, ids);
    if (!error) {
      setListings((prev) => prev.map((l) => selectedIds.has(l.id) ? { ...l, status: 'hidden' } : l));
      clearSelection();
      showAction(`${ids.length} listing${ids.length > 1 ? 's' : ''} hidden`);
    } else {
      alert(`Failed to hide listings: ${error.message}`);
    }
    setBulkActionLoading(false);
  };

  const handleBulkArchive = async () => {
    const ids = Array.from(selectedIds);
    setBulkActionLoading(true);
    const { error } = await directUpdateMany('user_listings', { status: 'archived', updated_at: new Date().toISOString() }, ids);
    if (!error) {
      setListings((prev) => prev.map((l) => selectedIds.has(l.id) ? { ...l, status: 'archived' } : l));
      clearSelection();
      showAction(`${ids.length} listing${ids.length > 1 ? 's' : ''} archived`);
    } else {
      alert(`Failed to archive listings: ${error.message}`);
    }
    setBulkActionLoading(false);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setBulkActionLoading(true);
    const { error } = await directDeleteMany('user_listings', ids);
    if (!error) {
      setListings((prev) => prev.filter((l) => !selectedIds.has(l.id)));
      clearSelection();
      showAction(`${ids.length} listing${ids.length > 1 ? 's' : ''} deleted`);
    } else {
      alert(`Failed to delete listings: ${error.message}`);
    }
    setBulkActionLoading(false);
  };

  // ── Filtering & Sorting ──
  const filtered = listings
    .filter((l) => tab === 'all' || l.status === tab)
    .filter((l) => !search || l.title.toLowerCase().includes(search.toLowerCase()) || (l.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase())))
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
    { id: 'all',      label: 'All',      count: listings.length },
    { id: 'active',   label: 'Active',   count: listings.filter((l) => l.status === 'active').length },
    { id: 'draft',    label: 'Drafts',   count: listings.filter((l) => l.status === 'draft').length },
    { id: 'paused',   label: 'Paused',   count: listings.filter((l) => l.status === 'paused').length },
    { id: 'sold',     label: 'Sold',     count: listings.filter((l) => l.status === 'sold').length },
    { id: 'hidden',   label: 'Hidden',   count: listings.filter((l) => l.status === 'hidden').length },
    { id: 'archived', label: 'Archived', count: listings.filter((l) => l.status === 'archived').length },
  ];

  const isAllSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  if (!user && !authLoading) return (
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

  if (!user && authLoading) return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <Navbar />
      <div className="flex items-center justify-center pt-40"><div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
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

        {/* If a listing is selected, show detail view */}
        <AnimatePresence mode="wait">
          {selectedListing ? (
            <ListingDetailView
              key={`detail-${selectedListing.id}`}
              listing={selectedListing}
              onBack={() => { setSelectedListing(null); fetchListings(); }}
              onSave={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Manage, boost, and track all your marketplace items</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/marketplace" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
                    <Store className="w-4 h-4" />Back to Marketplace
                  </Link>
                  <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-purple-200/50 transition-all">
                    <Plus className="w-4 h-4" />New Listing
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard icon={Package} label="Total Listings" value={stats.total} color="bg-purple-500" />
                <StatCard icon={Eye} label="Total Views" value={stats.totalViews} trend="+12%" color="bg-cyan-500" />
                <StatCard icon={Heart} label="Total Saves" value={stats.totalSaves} trend="+8%" color="bg-pink-500" />
                <StatCard icon={DollarSign} label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="bg-emerald-500" />
              </div>

              {/* Tabs + Search + Sort + Bulk Toolbar */}
              <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
                {/* Tab row */}
                <div className="flex items-center justify-between px-4 pt-3 pb-0 border-b border-gray-100 overflow-x-auto">
                  <div className="flex gap-0.5 shrink-0">
                    {tabs.map((t) => (
                      <button key={t.id} onClick={() => { setTab(t.id); clearSelection(); }} className={`px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-all relative whitespace-nowrap ${tab === t.id ? 'text-purple-700 bg-purple-50' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'}`}>
                        {t.label}
                        {t.count > 0 && (
                          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab === t.id ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>
                        )}
                        {tab === t.id && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search + Sort + Toggle row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or #tag..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-slate-600 outline-none focus:border-purple-400 shrink-0">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="most-views">Most Views</option>
                    </select>

                    <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
                      <button 
                        onClick={() => handleToggleView('list')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleView('grid')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                  {filtered.map((listing, index) => (
                    viewMode === 'grid' ? (
                      <GridListingCard
                        key={listing.id}
                        listing={listing}
                        index={index}
                        onClick={() => { clearSelection(); setSelectedListing(listing); }}
                        onEdit={() => { clearSelection(); setSelectedListing(listing); }}
                        onDelete={() => setDeletingListing(listing)}
                        onBoost={() => setBoostingListing(listing)}
                        onToggleStatus={() => handleToggleStatus(listing)}
                        onDuplicate={() => handleDuplicate(listing)}
                        isSelected={selectedIds.has(listing.id)}
                        onSelect={toggleSelect}
                      />
                    ) : (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        index={index}
                        onClick={() => { clearSelection(); setSelectedListing(listing); }}
                        onEdit={() => { clearSelection(); setSelectedListing(listing); }}
                        onDelete={() => setDeletingListing(listing)}
                        onBoost={() => setBoostingListing(listing)}
                        onToggleStatus={() => handleToggleStatus(listing)}
                        onDuplicate={() => handleDuplicate(listing)}
                        isSelected={selectedIds.has(listing.id)}
                        onSelect={toggleSelect}
                      />
                    )
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
                        <li className="text-xs text-slate-600">Hover over a listing to reveal the checkbox — select multiple to bulk-manage them</li>
                        <li className="text-xs text-slate-600">Click any listing to open the full editor with photo management</li>
                        <li className="text-xs text-slate-600">Add high-quality photos to get 3x more views</li>
                        <li className="text-xs text-slate-600">Boost your listing to appear at the top of search results</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Bulk Action Toolbar — slides up from bottom when items are selected ── */}
              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-3xl"
                  >
                    <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden p-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Left: count + select all */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-white font-bold text-sm tracking-tight">{selectedIds.size} Selected</span>
                            <button
                              onClick={clearSelection}
                              className="ml-1 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              title="Clear selection"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={handleSelectAll}
                            className="text-xs text-purple-300 hover:text-white transition-colors font-semibold"
                          >
                            {isAllSelected ? 'Deselect all' : `Select all ${filtered.length}`}
                          </button>
                        </div>

                        {/* Right: action buttons */}
                        <div className="flex items-center gap-2">
                          {bulkActionLoading ? (
                            <div className="flex items-center gap-3 px-6 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm font-bold text-purple-300">Processing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                              {tab !== 'active' && (
                                <button
                                  onClick={handleBulkActivate}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all border border-transparent hover:border-emerald-500/30"
                                >
                                  <ToggleRight className="w-4 h-4" />
                                  <span className="hidden sm:inline">Activate</span>
                                </button>
                              )}
                              {tab !== 'paused' && (
                                <button
                                  onClick={handleBulkPause}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all border border-transparent hover:border-amber-500/30"
                                >
                                  <ToggleLeft className="w-4 h-4" />
                                  <span className="hidden sm:inline">Pause</span>
                                </button>
                              )}
                              <button
                                onClick={handleBulkHide}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                              >
                                <EyeOff className="w-4 h-4" />
                                <span className="hidden sm:inline">Hide</span>
                              </button>
                              <button
                                onClick={handleBulkArchive}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all border border-transparent hover:border-indigo-500/30"
                              >
                                <Archive className="w-4 h-4" />
                                <span className="hidden sm:inline">Archive</span>
                              </button>
                              <div className="w-px h-6 bg-white/10 mx-1" />
                              <button
                                onClick={() => setShowBulkDeleteConfirm(true)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {deletingListing && <DeleteConfirm listing={deletingListing} onClose={() => setDeletingListing(null)} onDelete={handleDelete} />}
        {boostingListing && <BoostModal listing={boostingListing} onClose={() => setBoostingListing(null)} onBoost={handleBoost} />}
        {showBulkDeleteConfirm && (
          <BulkDeleteConfirm
            count={selectedIds.size}
            onClose={() => setShowBulkDeleteConfirm(false)}
            onDelete={handleBulkDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
