"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Camera, ShoppingBag, Bookmark, Package, Tag,
  CreditCard, MapPin, Key, Shield, Check, Save, Plus,
  Eye, EyeOff, Copy, Crown, Lock, Smartphone,
  ExternalLink, Clock, ChevronRight, AlertTriangle, Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { updateProfile } from "@/lib/auth";

type Tab =
  | "overview"
  | "purchases"
  | "saved"
  | "listings"
  | "sold"
  | "payments"
  | "addresses"
  | "tokens"
  | "security";

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "purchases", label: "Purchases", icon: ShoppingBag },
  { id: "saved", label: "Saved Listings", icon: Bookmark },
  { id: "listings", label: "My Listings", icon: Tag },
  { id: "sold", label: "Sold Items", icon: Package },
  { id: "payments", label: "Payment Methods", icon: CreditCard },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "tokens", label: "API Tokens", icon: Key },
  { id: "security", label: "Security", icon: Shield },
];

const TIER_COLORS: Record<string, string> = {
  Free: "bg-slate-100 text-slate-600",
  Student: "bg-purple-100 text-purple-600",
  Pro: "bg-yellow-100 text-yellow-700",
};

function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  subtitle: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-300" />
      </div>
      <h3 className="text-base font-semibold text-slate-600 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{subtitle}</p>
      {action && (
        <a
          href={action.href}
          className="mt-5 px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Overview form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Tab data
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [apiTokens, setApiTokens] = useState<any[]>([]);

  // Security
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [tokenVisible, setTokenVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setTabLoading(true);
      try {
        if (activeTab === "saved") {
          const { data } = await supabase
            .from("watchlist")
            .select("*, ai_products(*)")
            .eq("user_id", user.id);
          setSavedListings(data || []);
        } else if (activeTab === "purchases") {
          const { data } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .order("purchased_at", { ascending: false });
          setPurchases(data || []);
        } else if (activeTab === "listings") {
          const { data } = await supabase
            .from("user_listings")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("created_at", { ascending: false });
          setListings(data || []);
        } else if (activeTab === "sold") {
          const { data } = await supabase
            .from("user_listings")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "sold")
            .order("updated_at", { ascending: false });
          setSoldItems(data || []);
        } else if (activeTab === "payments") {
          const { data } = await supabase
            .from("saved_payment_methods")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          setPaymentMethods(data || []);
        } else if (activeTab === "addresses") {
          const { data } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          setAddresses(data || []);
        } else if (activeTab === "tokens") {
          const { data } = await supabase
            .from("user_api_tokens")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          setApiTokens(data || []);
        }
      } catch { /* tables may not have data yet */ }
      setTabLoading(false);
    };
    load();
  }, [activeTab, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl + "?t=" + Date.now();
      await updateProfile(user.id, { avatar_url: url });
      setAvatarUrl(url);
      await refreshProfile();
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await updateProfile(user.id, {
      first_name: firstName,
      last_name: lastName,
      phone,
      bio,
    });
    setSaving(false);
    if (!error) {
      setSaveStatus("success");
      await refreshProfile();
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    alert("Password reset email sent! Please check your inbox.");
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = (
    (profile?.first_name?.[0] || "") + (profile?.last_name?.[0] || "")
  )
    .toUpperCase()
    .trim() || (user?.email?.[0] || "U").toUpperCase();

  const tier = profile?.tier || "Free";
  const whichAiToken = "whai_sk_live_a8f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ââ Sidebar ââ */}
          <aside className="lg:w-72 flex-shrink-0">
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-3">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover ring-2 ring-white shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold ring-2 ring-white shadow-md">
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    title="Upload photo"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 transition-all"
                  >
                    {uploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <h2 className="font-bold text-slate-900 text-lg text-center leading-tight">
                  {displayName}
                </h2>
                <p className="text-xs text-slate-400 text-center mt-0.5 max-w-[180px] truncate">
                  {user?.email}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TIER_COLORS[tier]}`}>
                    {tier} Member
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  Member since {memberSince}
                </div>
              </div>
            </div>

            {/* Nav tabs */}
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {TABS.map((tab, i) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-gradient-to-r from-cyan-50 via-purple-50 to-pink-50 text-purple-700 border-l-[3px] border-purple-500"
                        : "text-slate-600 hover:bg-slate-50 border-l-[3px] border-transparent"
                    } ${i > 0 ? "border-t border-gray-50" : ""}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-purple-500" : "text-slate-400"}`} />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-purple-300" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ââ Main content ââ */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >

                {/* ââ OVERVIEW ââ */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <SectionCard title="Personal Information">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                            First Name
                          </label>
                          <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First name"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                            Last Name
                          </label>
                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                            Email
                          </label>
                          <input
                            value={user?.email || ""}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                            Phone
                          </label>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all bg-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                            Bio
                          </label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            placeholder="Tell the community a bit about yourselfâ¦"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all resize-none bg-white"
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Changes
                        </button>
                        {saveStatus === "success" && (
                          <span className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
                            <Check className="w-4 h-4" /> Saved!
                          </span>
                        )}
                        {saveStatus === "error" && (
                          <span className="text-sm text-red-500 font-medium">Failed â please try again.</span>
                        )}
                      </div>
                    </SectionCard>

                    {/* Membership card */}
                    <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-5 h-5 text-yellow-300" />
                            <span className="font-bold text-lg">{tier} Membership</span>
                          </div>
                          <p className="text-white/70 text-sm">Member since {memberSince} Â· Save up to 50% on AI models</p>
                        </div>
                        <button className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-all border border-white/30">
                          Upgrade
                        </button>
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        {[
                          { label: "Total Saved", value: `$${(profile?.savings_total ?? 0).toFixed(2)}` },
                          { label: "Member Since", value: String(memberSince) },
                          { label: "Plan", value: tier },
                        ].map((s) => (
                          <div key={s.label} className="bg-white/10 rounded-xl px-3 py-2.5 text-center border border-white/10">
                            <p className="text-white/60 text-xs mb-0.5">{s.label}</p>
                            <p className="font-bold text-white text-sm">{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ââ PURCHASES ââ */}
                {activeTab === "purchases" && (
                  <SectionCard title="Purchase History">
                    {purchases.length === 0 ? (
                      <EmptyState
                        icon={ShoppingBag}
                        title="No purchases yet"
                        subtitle="API token packages, subscriptions, and marketplace purchases will all appear here."
                        action={{ label: "Browse Marketplace", href: "/marketplace" }}
                      />
                    ) : (
                      <div className="space-y-2">
                        {purchases.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all">
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{p.item_name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{new Date(p.purchased_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">${p.amount}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "completed" ? "bg-emerald-100 text-emerald-600" : p.status === "refunded" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                )}

                {/* ââ SAVED LISTINGS ââ */}
                {activeTab === "saved" && (
                  <SectionCard title="Saved Listings">
                    {savedListings.length === 0 ? (
                      <EmptyState
                        icon={Bookmark}
                        title="Nothing saved yet"
                        subtitle="Bookmark your favourite AI models and marketplace deals â find them here in one place."
                        action={{ label: "Browse AI Models", href: "/compare" }}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {savedListings.map((item) => {
                          const p = item.ai_products;
                          return (
                            <div key={item.id} className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-all">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm">{p?.name || "Unknown"}</p>
                                  <p className="text-xs text-slate-400">{p?.provider}</p>
                                </div>
                                <span className="text-xs text-slate-300">{new Date(item.added_at).toLocaleDateString()}</span>
                              </div>
                              {p?.base_price_monthly && (
                                <p className="text-sm text-purple-600 font-semibold mt-2">From ${p.base_price_monthly}/mo</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </SectionCard>
                )}

                {/* ââ MY LISTINGS ââ */}
                {activeTab === "listings" && (
                  <SectionCard
                    title="My Active Listings"
                    action={
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                        <Plus className="w-3.5 h-3.5" /> New Listing
                      </button>
                    }
                  >
                    {listings.length === 0 ? (
                      <EmptyState
                        icon={Tag}
                        title="No active listings"
                        subtitle="List GPU compute, API credits, or AI subscriptions you want to sell on the WhichAI marketplace."
                      />
                    ) : (
                      <div className="space-y-2">
                        {listings.map((l) => (
                          <div key={l.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{l.title}</p>
                              <p className="text-xs text-slate-400">{l.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">${l.price}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">{l.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                )}

                {/* ââ SOLD ITEMS ââ */}
                {activeTab === "sold" && (
                  <SectionCard title="Sold Items">
                    {soldItems.length === 0 ? (
                      <EmptyState
                        icon={Package}
                        title="No sold items yet"
                        subtitle="Items you've successfully sold on the WhichAI marketplace will appear here."
                      />
                    ) : (
                      <div className="space-y-2">
                        {soldItems.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{s.title}</p>
                              <p className="text-xs text-slate-400">Sold {new Date(s.updated_at).toLocaleDateString()}</p>
                            </div>
                            <p className="font-bold text-slate-900">${s.price}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                )}

                {/* ââ PAYMENT METHODS ââ */}
                {activeTab === "payments" && (
                  <SectionCard
                    title="Saved Cards"
                    action={
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:border-purple-300 hover:text-purple-600 transition-all">
                        <Plus className="w-3.5 h-3.5" /> Add Card
                      </button>
                    }
                  >
                    {paymentMethods.length === 0 ? (
                      <EmptyState
                        icon={CreditCard}
                        title="No saved cards"
                        subtitle="Add a payment method for one-click checkout on the WhichAI marketplace."
                      />
                    ) : (
                      <div className="space-y-2">
                        {paymentMethods.map((pm) => (
                          <div key={pm.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 text-sm capitalize">{pm.card_brand} Â·Â·Â·Â· {pm.last_four}</p>
                                <p className="text-xs text-slate-400">Expires {pm.exp_month}/{pm.exp_year}</p>
                              </div>
                              {pm.is_default && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">Default</span>
                              )}
                            </div>
                            <button className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                )}

                {/* ââ ADDRESSES ââ */}
                {activeTab === "addresses" && (
                  <div className="space-y-4">
                    {(["shipping", "billing"] as const).map((type) => {
                      const filtered = addresses.filter((a) => a.type === type);
                      return (
                        <SectionCard
                          key={type}
                          title={`${type.charAt(0).toUpperCase() + type.slice(1)} Addresses`}
                          action={
                            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:border-purple-300 hover:text-purple-600 transition-all">
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          }
                        >
                          {filtered.length === 0 ? (
                            <EmptyState
                              icon={MapPin}
                              title={`No ${type} addresses`}
                              subtitle={`Add a ${type} address for faster checkout on orders.`}
                            />
                          ) : (
                            <div className="space-y-2">
                              {filtered.map((addr) => (
                                <div key={addr.id} className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-all">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      {addr.label && <p className="text-xs text-purple-500 font-semibold mb-1 uppercase tracking-wide">{addr.label}</p>}
                                      <p className="font-medium text-slate-800 text-sm">{addr.full_name}</p>
                                      <p className="text-sm text-slate-500">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                                      <p className="text-sm text-slate-500">{addr.city}, {addr.state} {addr.postal_code} Â· {addr.country}</p>
                                    </div>
                                    {addr.is_default && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">Default</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </SectionCard>
                      );
                    })}
                  </div>
                )}

                {/* ââ API TOKENS ââ */}
                {activeTab === "tokens" && (
                  <div className="space-y-4">
                    {/* WhichAI key */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-bold text-slate-900">Your WhichAI API Key</h2>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-gray-100">
                        <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <code className="flex-1 text-sm text-slate-700 font-mono truncate">
                          {tokenVisible ? whichAiToken : whichAiToken.slice(0, 14) + "â¢".repeat(22)}
                        </code>
                        <button onClick={() => setTokenVisible(!tokenVisible)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all" title={tokenVisible ? "Hide" : "Show"}>
                          {tokenVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => copyToken(whichAiToken)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all" title="Copy">
                          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Rate limit: 10,000 req/min Â· Includes member discount on all models</p>
                    </div>

                    {/* External tokens */}
                    <SectionCard
                      title="Saved External API Tokens"
                      action={
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:border-purple-300 hover:text-purple-600 transition-all">
                          <Plus className="w-3.5 h-3.5" /> Add Token
                        </button>
                      }
                    >
                      {apiTokens.length === 0 ? (
                        <EmptyState
                          icon={Key}
                          title="No saved tokens"
                          subtitle="Store your OpenAI, Anthropic, Google, and other provider API keys here â masked and secure."
                        />
                      ) : (
                        <div className="space-y-2">
                          {apiTokens.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-all">
                              <div>
                                <p className="font-medium text-slate-800 text-sm capitalize">{t.provider}</p>
                                <p className="text-xs text-slate-400 font-mono">{t.label ? `${t.label} Â· ` : ""}Â·Â·Â·Â· {t.token_preview}</p>
                              </div>
                              <button className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium">Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </SectionCard>
                  </div>
                )}

                {/* ââ SECURITY ââ */}
                {activeTab === "security" && (
                  <div className="space-y-4">
                    {/* Password */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-900">Password</h2>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 ml-7">
                        We'll send a secure reset link to <strong className="text-slate-700">{user?.email}</strong>.
                      </p>
                      <button
                        onClick={handlePasswordReset}
                        className="ml-7 px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
                      >
                        Send Password Reset Email
                      </button>
                    </div>

                    {/* MFA & Passkeys */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-900">Multi-Factor Authentication &amp; Passkeys</h2>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 ml-7">
                        Set up authenticator apps, passkeys, and manage your security options.
                      </p>
                      <a
                        href="/settings/security"
                        className="ml-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
                      >
                        Manage Security Settings
                      </a>
                    </div>

                    {/* Account info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ExternalLink className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-900">Account Details</h2>
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: "Account ID", value: user?.id ? user.id.slice(0, 24) + "â¦" : "â", mono: true },
                          {
                            label: "Registered",
                            value: profile?.created_at
                              ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                              : "â",
                            mono: false,
                          },
                          {
                            label: "Profile Updated",
                            value: profile?.updated_at
                              ? new Date(profile.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                              : "â",
                            mono: false,
                          },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-slate-50">
                            <p className="text-sm font-medium text-slate-600">{row.label}</p>
                            <p className={`text-sm text-slate-500 ${row.mono ? "font-mono text-xs" : ""}`}>{row.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
}
