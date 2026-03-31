'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Upload, Code2, Eye, Mic, Image, Globe, Zap, BadgeCheck, ChevronRight,
  Brain, Monitor, X, Sparkles, Loader2, Tag, ShoppingBag, Search as SearchIcon,
  Key, MessageSquare, Cpu,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CategorySidebar from '@/components/marketplace/CategorySidebar';
import HeroSearchBar from '@/components/marketplace/HeroSearchBar';
import PowerFilterPanel, { FilterState } from '@/components/marketplace/PowerFilterPanel';
import LocationSearch from '@/components/marketplace/LocationSearch';
import MapView from '@/components/marketplace/MapView';
import ListingCardV3 from '@/components/marketplace/ListingCardV3';
import ComputeHeatmap from '@/components/marketplace/ComputeHeatmap';
import CompatibilityChecker from '@/components/marketplace/CompatibilityChecker';
import {
  getAllProducts, marketplaceDeals, marketplaceCategories, getDiscountPct,
  allListingsV3, getListingsByCategory, type AIProduct, type MarketplaceCategory,
  type MarketListingV3, calculateDistance,
} from '@/lib/data';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

type BigTab = 'all' | 'digital-assets' | 'compute-hub' | 'hardware-corner';

const DealCard = ({ deal, index }: { deal: typeof marketplaceDeals[0]; index: number }) => {
  const discountPct = getDiscountPct(deal.original_price, deal.discounted_price);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-5 rounded-xl bg-white border border-gray-200 hover:border-purple-300 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{deal.provider}</span>
        {deal.badge && (<span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r text-white ${{ 'Hot Deal': 'from-red-500 to-orange-500', 'Popular': 'from-purple-500 to-pink-500', 'New': 'from-cyan-500 to-blue-500', 'Student Special': 'from-violet-500 to-purple-500', 'Best Value': 'from-emerald-500 to-green-500', 'Team Deal': 'from-blue-500 to-indigo-500', 'Limited': 'from-amber-500 to-yellow-500', 'Budget Pick': 'from-teal-500 to-cyan-500' }[deal.badge] || ''}`}>{deal.badge}</span>)}
      </div>
      <h3 className="font-bold text-slate-900 mb-1 text-sm line-clamp-1">{deal.name}</h3>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{deal.description}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-lg font-bold text-slate-900">${deal.discounted_price.toFixed(2)}</span>
        <span className="text-xs text-slate-400 line-through">${deal.original_price.toFixed(2)}</span>
        <span className="text-xs font-semibold text-green-600 ml-auto">Save {discountPct}%</span>
      </div>
      <p className="text-xs text-slate-400 mb-3">{deal.unit}</p>
      <button className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all">Claim Deal</button>
    </motion.div>
  );
};

const ToolCard = ({ product, index }: { product: AIProduct; index: number }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-5 rounded-xl bg-white border border-gray-200 hover:border-purple-300 transition-all group">
      <div className="flex items-start gap-3 mb-3">
        {product.logo_url ? (<img src={product.logo_url} alt={product.name} className="w-10 h-10 rounded" />) : (<div className="w-10 h-10 rounded bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">{product.name.charAt(0)}</div>)}
        <div><h3 className="font-bold text-slate-900 text-sm">{product.name}</h3><p className="text-xs text-slate-500">{product.provider}</p></div>
      </div>
      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{product.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {product.features.vision && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Vision</span>}
        {product.features.voice && <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">Voice</span>}
        {product.features.image_gen && <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">Image</span>}
      </div>
      <Link href={`/product/${product.slug}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 text-xs font-semibold hover:bg-slate-200 transition-all">View <ChevronRight size={14} /></Link>
    </motion.div>
  );
};

// ── Category / subcategory structure for listing ──────────────
const LISTING_CATEGORIES = [
  { id: 'digital-assets', label: 'Digital Assets', icon: Code2, subcategories: ['Prompts', 'LoRAs', 'Fine-tuned Models', 'Agents', 'Datasets', 'Workflows', 'API Keys / Credits'] },
  { id: 'compute-hub', label: 'Compute Hub', icon: Cpu, subcategories: ['GPU Rental', 'Cloud Credits', 'Training Jobs', 'Inference Endpoints'] },
  { id: 'hardware-corner', label: 'Hardware', icon: Monitor, subcategories: ['GPUs', 'Servers', 'Edge Devices', 'Networking', 'Accessories'] },
];
const CONDITION_OPTIONS = [
  { value: 'new', label: 'New / Unused' }, { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' },
];
const PRICING_TYPES = [
  { value: 'fixed', label: 'Fixed Price' }, { value: 'negotiable', label: 'Negotiable' },
  { value: 'auction', label: 'Auction' }, { value: 'free', label: 'Free' },
  { value: 'pay-what-you-want', label: 'Pay What You Want' },
];
const LICENSE_TYPES = ['MIT', 'Apache 2.0', 'Commercial', 'Personal Use Only', 'Creative Commons', 'Custom'];

const SellModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [pricingType, setPricingType] = useState('fixed');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [license, setLicense] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [frameworks, setFrameworks] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('instant');
  const [location, setLocation] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCat = LISTING_CATEGORIES.find((c) => c.id === category);
  const handlePhotoAdd = () => { if (photos.length < 10) fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - photos.length;
    const toAdd = files.slice(0, remaining);
    const newPhotos = toAdd.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handlePhotoRemove = (idx: number) => {
    URL.revokeObjectURL(photos[idx].preview);
    setPhotos(photos.filter((_, i) => i !== idx));
  };
  const handlePublish = async () => {
    if (!user) { alert('Please sign in to publish a listing.'); return; }
    setPublishing(true);
    try {
      // Refresh the session to ensure a valid auth token is sent
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        // Try refreshing the session
        await supabase.auth.refreshSession();
      }

      // Upload photos to Supabase Storage first
      const photoUrls: string[] = [];
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const ext = photo.file.name.split('.').pop() || 'jpg';
          const path = `listings/${user.id}/${Date.now()}-${i}.${ext}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('listing-photos')
            .upload(path, photo.file, { upsert: true });
          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage.from('listing-photos').getPublicUrl(uploadData.path);
            if (urlData?.publicUrl) photoUrls.push(urlData.publicUrl);
          }
        }
      }

      // Build the insert payload
      const payload = {
        user_id: user.id,
        title,
        description,
        category: `${category}${subcategory ? ` > ${subcategory}` : ''}`,
        subcategory: subcategory || null,
        price: pricingType === 'free' ? 0 : parseFloat(price) || 0,
        pricing_type: pricingType,
        condition: condition || null,
        tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        license: license || null,
        demo_url: demoUrl || null,
        frameworks: frameworks || null,
        delivery_method: deliveryMethod,
        location: location || null,
        photo_urls: photoUrls,
        status: 'active',
      };

      // Insert with a timeout to prevent infinite hang
      const insertPromise = supabase.from('user_listings').insert(payload);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please check your connection and try again.')), 15000)
      );

      const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;
      if (error) throw error;
      setPublished(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      console.error('Publish error:', err);
      alert(`Failed to publish: ${err?.message || 'Unknown error. Please try again.'}`);
    } finally {
      setPublishing(false);
    }
  };
  const canGoNext = () => { if (step === 1) return title.trim().length > 0 && category !== ''; if (step === 2) return description.trim().length > 0; return true; };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:bg-white outline-none text-sm text-slate-800 placeholder:text-slate-400 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-md"><Upload className="w-4 h-4 text-white" /></div>
            <div><h2 className="text-lg font-bold text-slate-900">List Your Item</h2><p className="text-[11px] text-slate-400">Step {step} of {totalSteps}</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        {/* Progress bar */}
        <div className="px-6 pt-3 shrink-0"><div className="flex gap-1.5">{Array.from({ length: totalSteps }).map((_, i) => (<div key={i} className={`h-1 rounded-full flex-1 transition-all duration-300 ${i < step ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-200'}`} />))}</div></div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                {/* Photos */}
                <div>
                  <label className={labelClass}>Photos / Screenshots (up to 10)</label>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  <div className="grid grid-cols-5 gap-2">
                    {photos.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden group">
                        <img src={p.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => handlePhotoRemove(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {photos.length < 10 && (
                      <button onClick={handlePhotoAdd} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 flex flex-col items-center justify-center gap-1 transition-colors hover:bg-purple-50/50">
                        <Upload className="w-4 h-4 text-slate-400" /><span className="text-[9px] text-slate-400 font-medium">Add</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">First photo will be the cover. Drag to reorder.</p>
                </div>
                {/* Title */}
                <div>
                  <label className={labelClass}>Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., GPT-4 Marketing Prompt Pack (50 prompts)" className={inputClass} maxLength={120} />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{title.length}/120</p>
                </div>
                {/* Category */}
                <div>
                  <label className={labelClass}>Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LISTING_CATEGORIES.map((cat) => { const CatIcon = cat.icon; return (
                      <button key={cat.id} onClick={() => { setCategory(cat.id); setSubcategory(''); }} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${category === cat.id ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                        <CatIcon className="w-5 h-5" /><span className="text-xs font-semibold">{cat.label}</span>
                      </button>
                    ); })}
                  </div>
                </div>
                {/* Subcategory */}
                {selectedCat && (
                  <div>
                    <label className={labelClass}>Type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCat.subcategories.map((sub) => (
                        <button key={sub} onClick={() => setSubcategory(sub)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${subcategory === sub ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-slate-600 hover:bg-gray-200'}`}>{sub}</button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Pricing Type</label>
                    <select value={pricingType} onChange={(e) => setPricingType(e.target.value)} className={inputClass}>
                      {PRICING_TYPES.map((pt) => (<option key={pt.value} value={pt.value}>{pt.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{pricingType === 'free' ? 'Price' : pricingType === 'auction' ? 'Starting Bid' : 'Price (USD)'}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                      <input type="number" value={pricingType === 'free' ? '0' : price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" disabled={pricingType === 'free'} className={`${inputClass} pl-7`} />
                    </div>
                  </div>
                </div>
                {/* Condition (hardware only) */}
                {category === 'hardware-corner' && (
                  <div>
                    <label className={labelClass}>Condition</label>
                    <div className="flex flex-wrap gap-1.5">
                      {CONDITION_OPTIONS.map((opt) => (
                        <button key={opt.value} onClick={() => setCondition(opt.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${condition === opt.value ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-slate-600 hover:bg-gray-200'}`}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className={labelClass}>Description *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you're selling, how it works, what makes it unique, and what the buyer gets..." rows={5} className={`${inputClass} resize-none`} maxLength={2000} />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{description.length}/2000</p>
                </div>
                <div>
                  <label className={labelClass}>Tags / Keywords</label>
                  <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., GPT-4, marketing, copywriting, SaaS (comma-separated)" className={inputClass} />
                  {tags && (<div className="flex flex-wrap gap-1 mt-2">{tags.split(',').map((t, i) => t.trim() && (<span key={i} className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-semibold">{t.trim()}</span>))}</div>)}
                </div>
                {category === 'digital-assets' && (
                  <div>
                    <label className={labelClass}>License Type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {LICENSE_TYPES.map((lic) => (<button key={lic} onClick={() => setLicense(lic)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${license === lic ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-slate-600 hover:bg-gray-200'}`}>{lic}</button>))}
                    </div>
                  </div>
                )}
                {(category === 'digital-assets' || category === 'compute-hub') && (
                  <div>
                    <label className={labelClass}>Compatible Frameworks / Models</label>
                    <input type="text" value={frameworks} onChange={(e) => setFrameworks(e.target.value)} placeholder="e.g., PyTorch, TensorFlow, GPT-4, Llama 3, SDXL" className={inputClass} />
                  </div>
                )}
                <div>
                  <label className={labelClass}>Demo URL / Preview Link (optional)</label>
                  <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://your-demo-or-github.com" className={inputClass} />
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className={labelClass}>Delivery Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'instant', label: 'Instant Download', desc: 'Buyer gets file immediately' },
                      { value: 'manual', label: 'Manual Delivery', desc: 'You send within 24-48hrs' },
                      { value: 'api', label: 'API Access', desc: 'Buyer gets API endpoint' },
                      { value: 'shipping', label: 'Physical Shipping', desc: 'For hardware items' },
                    ].map((dm) => (
                      <button key={dm.value} onClick={() => setDeliveryMethod(dm.value)} className={`text-left p-3 rounded-xl border-2 transition-all ${deliveryMethod === dm.value ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <div className="text-xs font-semibold text-slate-800">{dm.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{dm.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {(category === 'hardware-corner' || deliveryMethod === 'shipping') && (
                  <div><label className={labelClass}>Your Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State or Zip Code" className={inputClass} /></div>
                )}
                {/* Review summary */}
                <div className="mt-2 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-purple-50/30 border border-gray-200">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Listing Preview</h4>
                  <div className="space-y-2">
                    {title && (<div className="flex justify-between"><span className="text-xs text-slate-500">Title</span><span className="text-xs font-semibold text-slate-800 text-right max-w-[60%] truncate">{title}</span></div>)}
                    {category && (<div className="flex justify-between"><span className="text-xs text-slate-500">Category</span><span className="text-xs font-semibold text-slate-800">{selectedCat?.label}{subcategory ? ` → ${subcategory}` : ''}</span></div>)}
                    <div className="flex justify-between"><span className="text-xs text-slate-500">Price</span><span className="text-xs font-semibold text-slate-800">{pricingType === 'free' ? 'Free' : price ? `$${price}` : '—'} · {PRICING_TYPES.find(p => p.value === pricingType)?.label}</span></div>
                    {photos.length > 0 && (<div className="flex justify-between"><span className="text-xs text-slate-500">Photos</span><span className="text-xs font-semibold text-slate-800">{photos.length} uploaded</span></div>)}
                    {tags && (<div className="flex justify-between items-start"><span className="text-xs text-slate-500 shrink-0">Tags</span><div className="flex flex-wrap gap-1 justify-end max-w-[60%]">{tags.split(',').slice(0, 5).map((t, i) => t.trim() && (<span key={i} className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-semibold">{t.trim()}</span>))}</div></div>)}
                  </div>
                </div>
                {/* Escrow notice */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div><p className="text-xs font-semibold text-emerald-800">Protected by WhichAI Escrow</p><p className="text-[10px] text-emerald-600 mt-0.5">Payment is held securely until the buyer confirms delivery. 0% fee on your first 3 sales.</p></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          {step > 1 ? (<button onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all">Back</button>) : (<div />)}
          {step < totalSteps ? (
            <button onClick={() => canGoNext() && setStep(step + 1)} disabled={!canGoNext()} className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${canGoNext() ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-purple-200/50' : 'bg-gray-300 cursor-not-allowed'}`}>Next</button>
          ) : (
            <button onClick={handlePublish} disabled={publishing || published} className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 ${published ? 'bg-emerald-500' : publishing ? 'bg-gray-400 cursor-wait' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:shadow-lg hover:shadow-purple-200/50'}`}>
              {published ? (<><BadgeCheck className="w-4 h-4" />Listed!</>) : publishing ? (<><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>) : (<><Sparkles className="w-4 h-4" />Publish Listing</>)}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper: convert a Supabase user_listings row into a MarketplaceListing
function supabaseRowToListing(row: any): MarketListingV3 {
  // Map the stored category string to a BigCategory value
  const catStr = (row.category || '').toLowerCase();
  let bigCategory: 'digital-assets' | 'compute-hub' | 'hardware-corner' = 'digital-assets';
  if (catStr.includes('compute')) bigCategory = 'compute-hub';
  else if (catStr.includes('hardware')) bigCategory = 'hardware-corner';

  return {
    id: `user-${row.id}`,
    name: row.title || 'Untitled Listing',
    description: row.description || '',
    bigCategory,
    subcategory: row.subcategory || '',
    price: row.price || 0,
    unit: row.pricing_type === 'free' ? 'free' : 'one-time',
    seller: {
      name: row.seller_name || 'WhichAI Seller',
      rating: 5.0,
      reviews: 0,
      verified: true,
      badge: 'new' as const,
    },
    badge: row.is_boosted ? 'Boosted' : undefined,
    featured: row.is_boosted || false,
    tags: Array.isArray(row.tags) ? row.tags : [],
    emoji: bigCategory === 'compute-hub' ? '⚡' : bigCategory === 'hardware-corner' ? '🖥️' : '🤖',
    images: Array.isArray(row.photo_urls) ? row.photo_urls : [],
    trendingScore: row.views || 0,
  };
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [showSellModal, setShowSellModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bigTab, setBigTab] = useState<BigTab>('all');
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | null>(null);
  const [toolFilter, setToolFilter] = useState('all');
  const [activeCategory2, setActiveCategory2] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(500);
  const [filters, setFilters] = useState<FilterState>({ sortBy: 'trending', priceRange: [0, 10000], minRating: 0, vramMin: 0, frameworks: [], subcategories: [], maxDistance: 500 });
  const [userListings, setUserListings] = useState<MarketListingV3[]>([]);

  // Fetch AI tools directory
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingTools(true);
      const data = await getAllProducts();
      setProducts(data);
      setLoadingTools(false);
    };
    loadProducts();
  }, []);

  // Fetch user-created listings from Supabase
  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        // 1. Fetch all active listings
        const { data: listings, error } = await supabase
          .from('user_listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) { console.error('Error fetching user listings:', error); return; }
        if (!listings || listings.length === 0) { setUserListings([]); return; }

        // 2. Fetch seller profiles for those user IDs
        const userIds = [...new Set(listings.map((l: any) => l.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        const profileMap = new Map<string, any>();
        (profiles || []).forEach((p: any) => profileMap.set(p.id, p));

        // 3. Convert to MarketplaceListing format
        const converted = listings.map((row: any) => {
          const profile = profileMap.get(row.user_id);
          const sellerName = profile
            ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email?.split('@')[0] || 'WhichAI Seller'
            : 'WhichAI Seller';
          return supabaseRowToListing({ ...row, seller_name: sellerName });
        });
        setUserListings(converted);
      } catch (err) {
        console.error('Failed to fetch user listings:', err);
      }
    };
    fetchUserListings();
  }, [showSellModal]); // Re-fetch on mount and when sell modal closes

  const getFilteredListings = () => {
    // Merge static demo listings with real user listings from Supabase
    const allCombinedListings = [...userListings, ...allListingsV3];
    let filtered = allCombinedListings.filter((listing) => {
      if (searchQuery) { const q = searchQuery.toLowerCase().replace(/^#/, ''); return listing.name.toLowerCase().includes(q) || listing.description.toLowerCase().includes(q) || listing.tags.some((t) => t.toLowerCase().replace(/^#/, '').includes(q)) || (listing.subcategory || '').toLowerCase().includes(q); }
      return true;
    });
    // When user is actively searching, skip category filters (like eBay/Amazon behavior)
    if (!searchQuery) {
      if (activeCategory2) { filtered = filtered.filter((l) => l.bigCategory === activeCategory2); } else if (bigTab !== 'all') { filtered = filtered.filter((l) => l.bigCategory === bigTab); }
    }
    if (userLocation) { filtered = filtered.filter((listing) => { if (!listing.location) return true; const dist = calculateDistance(userLocation.lat, userLocation.lng, listing.location.lat, listing.location.lng); return dist <= searchRadius; }); }
    if (!searchQuery) { filtered = filtered.filter((l) => l.price >= filters.priceRange[0] && l.price <= filters.priceRange[1]); }
    if (filters.vramMin > 0) { filtered = filtered.filter((l) => { if (!l.techSpecs?.vram) return false; return l.techSpecs.vram >= filters.vramMin; }); }
    if (filters.frameworks.length > 0) { filtered = filtered.filter((l) => { if (!l.techSpecs?.framework) return false; return filters.frameworks.some((fw) => l.techSpecs?.framework?.includes(fw)); }); }
    filtered = filtered.filter((l) => l.seller.rating >= filters.minRating);
    const sorted = [...filtered].sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.seller.rating - a.seller.rating;
      if (filters.sortBy === 'trending') { const scoreA = (a.trendingScore || 0) + (a.featured ? 100 : 0); const scoreB = (b.trendingScore || 0) + (b.featured ? 100 : 0); return scoreB - scoreA; }
      if (filters.sortBy === 'distance' && userLocation && a.location && b.location) { const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng); const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng); return distA - distB; }
      return 0;
    });
    return sorted;
  };

  const filteredListings = getFilteredListings();
  const filteredDeals = activeCategory ? marketplaceDeals.filter((d) => d.category === activeCategory) : marketplaceDeals;
  const sortedDeals = [...filteredDeals].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const filteredTools = toolFilter === 'all' ? products : products.filter((p) => { if (toolFilter === 'voice') return p.features.voice === true; if (toolFilter === 'vision') return p.features.vision === true; return p.category === toolFilter; });
  const handleCompare = (id: string) => { setCompareIds((prev) => { if (prev.includes(id)) { return prev.filter((cid) => cid !== id); } return prev.length < 3 ? [...prev, id] : prev; }); };

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="relative z-10 bg-[#f4f0eb]/80 backdrop-blur-sm border-b border-gray-200"><Navbar /></div>
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-white to-cyan-50 border border-purple-100">
          <div className="rounded-2xl px-6 md:px-8 py-10 md:py-14">
            <div className="absolute inset-0 rounded-2xl opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-600 text-xs font-medium mb-4">
                  <Store className="w-3.5 h-3.5" /> World&apos;s First AI Marketplace
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">The AI{' '}<span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Marketplace</span></h1>
                <p className="text-slate-500 text-sm max-w-lg">Buy prompts, rent GPUs, sell agents, and discover hardware â all in one place.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => setShowSellModal(true)} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 animate-pulse-slow">
                  <Upload className="w-4 h-4" /> List Your Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex gap-6">
        <CategorySidebar activeCategory={activeCategory2} onCategoryChange={setActiveCategory2} activeSub={activeSub} onSubChange={setActiveSub} />
        <main className="flex-1 min-w-0">
          <HeroSearchBar value={searchQuery} onChange={setSearchQuery} onFilterToggle={() => {}} filterCount={filters.frameworks.length + (filters.maxDistance < 500 ? 1 : 0)} />
          <PowerFilterPanel filters={filters} onFiltersChange={setFilters} listingCount={filteredListings.length} />
          <LocationSearch onLocationChange={(coords) => { if (coords) { setUserLocation({ lat: coords.lat, lng: coords.lng }); } else { setUserLocation(null); } }} onRadiusChange={setSearchRadius} radius={searchRadius} />
          <div className="mb-6 flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowMap(!showMap)} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${ showMap ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`}>
              ð {showMap ? 'Hide' : 'Show'} Map
            </motion.button>
          </div>
          {showMap && userLocation && (<MapView listings={filteredListings} userLocation={userLocation} radiusMiles={searchRadius} />)}
          <ComputeHeatmap />
          {filteredListings.filter((l) => l.techSpecs?.gpuType).length > 0 && (<CompatibilityChecker listing={filteredListings.find((l) => l.techSpecs?.gpuType)!} />)}
          <motion.section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Sparkles size={24} className="text-purple-500" /> Marketplace Listings</h2>
            <AnimatePresence mode="wait">
              <motion.div key={bigTab + searchQuery + JSON.stringify(filters)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredListings.map((listing, idx) => (<ListingCardV3 key={listing.id} listing={listing} index={idx} onCompare={handleCompare} />))}
              </motion.div>
            </AnimatePresence>
            {filteredListings.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-slate-700 font-medium">No listings found.</p>
                <p className="text-slate-500 text-sm mt-1">Try a different search or category.</p>
              </div>
            )}
          </motion.section>
          {(bigTab === 'all' || bigTab === 'digital-assets') && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
              <div className="flex items-center gap-2 mb-5"><Sparkles className="w-5 h-5 text-purple-500" /><h2 className="text-2xl font-bold text-slate-900">AI Tools Directory</h2></div>
              <div className="flex flex-wrap gap-2 mb-6">
                {[{value:'all',label:'â¨ All Tools'},{value:'code',label:'ð» Code'},{value:'vision',label:'ðï¸ Vision'},{value:'voice',label:'ð¤ Voice'},{value:'image',label:'ð¼ï¸ Image Gen'},{value:'chatbot',label:'ð¬ Chat'},{value:'multimodal',label:'â¡ Multimodal'}].map(({ value, label }) => (
                  <motion.button key={value} onClick={() => setToolFilter(value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${ toolFilter === value ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`} whileHover={{ scale: 1.05 }}>{label}</motion.button>
                ))}
              </div>
              {loadingTools ? (<div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-purple-500" /></div>) : (
                <AnimatePresence mode="wait"><motion.div key={toolFilter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filteredTools.map((product, i) => (<ToolCard key={product.id} product={product} index={i} />))}</motion.div></AnimatePresence>
              )}
            </motion.section>
          )}
          {(bigTab === 'all' || bigTab === 'compute-hub') && (
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-12">
              <div className="flex items-center gap-2 mb-4"><Tag className="w-5 h-5 text-cyan-500" /><h2 className="text-2xl font-bold text-slate-900">Exclusive Deals</h2></div>
              <p className="text-slate-500 text-sm mb-5">Discounted API tokens, subscriptions, and GPU rentals â curated for developers, researchers, and teams.</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <motion.button onClick={() => setActiveCategory(null)} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${ activeCategory === null ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`} whileHover={{ scale: 1.05 }}>All Deals</motion.button>
                {marketplaceCategories.map((cat) => (<motion.button key={cat.value} onClick={() => setActiveCategory(cat.value)} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${ activeCategory === cat.value ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200' }`} whileHover={{ scale: 1.05 }}>{cat.label}</motion.button>))}
              </div>
              <AnimatePresence mode="wait"><motion.div key={activeCategory || 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{sortedDeals.map((deal, i) => (<DealCard key={deal.id} deal={deal} index={i} />))}</motion.div></AnimatePresence>
            </motion.section>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-12 mb-12 text-center">
            <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
              <div className="bg-white rounded-2xl px-8 py-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Have something to sell?</h3>
                <p className="text-sm text-slate-500 mb-4">Join 6,400+ sellers on the world&apos;s first AI marketplace. Free to list, 0% fee on your first 3 sales.</p>
                <motion.button onClick={() => setShowSellModal(true)} whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"><Upload className="w-4 h-4" /> List Your Item Free</motion.button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      {compareIds.length > 0 && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-200 backdrop-blur-sm p-4 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div><p className="text-slate-900 font-semibold">{compareIds.length} item{compareIds.length !== 1 ? 's' : ''} selected for comparison</p><p className="text-slate-500 text-sm">{compareIds.map((id) => [...userListings, ...allListingsV3].find((l) => l.id === id)?.name).join(', ')}</p></div>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-lg bg-purple-100 border border-purple-300 text-purple-700 font-semibold text-sm">Compare Now</motion.button>
              <motion.button onClick={() => setCompareIds([])} whileHover={{ scale: 1.05 }} className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm">Clear</motion.button>
            </div>
          </div>
        </motion.div>
      )}
      <AnimatePresence>{showSellModal && <SellModal onClose={() => setShowSellModal(false)} />}</AnimatePresence>
    </div>
  );
}
