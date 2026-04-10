"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User, Calendar, Sparkles, Bell, ChevronRight, ChevronLeft,
  Check, Pencil, Shield, Rocket, Camera, RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { directUpsert, supabase } from "@/lib/supabase";

// ── Fun rotating taglines for the avatar prompt ──
const AVATAR_HYPE = [
  "That Google pic is giving 2014 LinkedIn energy 😬 Let's fix that.",
  "Drop your best shot — the one where you look unreasonably cool 😎",
  "Show us the face behind the genius. No pressure. Okay, maybe a little. ✨",
  "Upload something iconic. This is your villain origin story profile pic. 🔥",
  "Your current pic was chosen by an algorithm. Let's go with vibes instead. 🎨",
  "Legend has it, the users who upload their own photo get 43% more serotonin. 📸",
];

// ── AI preference categories (equivalent to genre selection) ──
const AI_CATEGORIES = [
  { id: "llms", label: "Large Language Models", emoji: "🧠", desc: "GPT, Claude, Gemini, Llama" },
  { id: "image-gen", label: "Image Generation", emoji: "🎨", desc: "DALL-E, Midjourney, Stable Diffusion" },
  { id: "code-ai", label: "Code & Dev Tools", emoji: "💻", desc: "Copilot, Cursor, Cody" },
  { id: "video-ai", label: "Video & Animation", emoji: "🎬", desc: "Runway, Pika, Sora" },
  { id: "audio-ai", label: "Audio & Music", emoji: "🎵", desc: "ElevenLabs, Suno, Udio" },
  { id: "ml-ops", label: "ML & Training", emoji: "⚙️", desc: "Fine-tuning, datasets, MLOps" },
  { id: "gpu-compute", label: "GPU & Compute", emoji: "⚡", desc: "Cloud GPUs, rentals, benchmarks" },
  { id: "ai-agents", label: "AI Agents & Automation", emoji: "🤖", desc: "AutoGPT, workflows, chains" },
  { id: "research", label: "AI Research", emoji: "📚", desc: "Papers, breakthroughs, benchmarks" },
  { id: "prompt-eng", label: "Prompt Engineering", emoji: "✍️", desc: "Techniques, templates, optimization" },
  { id: "data-ai", label: "Data & Analytics", emoji: "📊", desc: "Data science, visualization, BI" },
  { id: "business-ai", label: "Business & Productivity", emoji: "💼", desc: "CRM, marketing, sales tools" },
];

function generateUsername(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${suffix}`;
}

// ── Step indicator ──
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            animate={{
              width: i === current ? 32 : 10,
              backgroundColor: i <= current ? "#8B5CF6" : "#e2e8f0",
            }}
            transition={{ duration: 0.3 }}
            className="h-2.5 rounded-full"
          />
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Step 1: Username + Avatar upload
  const [username, setUsername] = useState("");
  const [usernameEditing, setUsernameEditing] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [avatarHype, setAvatarHype] = useState(AVATAR_HYPE[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pick a random hype line on mount so each user gets a different vibe
  useEffect(() => {
    setAvatarHype(AVATAR_HYPE[Math.floor(Math.random() * AVATAR_HYPE.length)]);
  }, []);

  // Step 2: DOB + Gender
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Step 3: AI Preferences
  const [selectedAI, setSelectedAI] = useState<string[]>([]);

  // Step 4: Notifications + Terms
  const [notifications, setNotifications] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Auto-generate username from Google profile data
  useEffect(() => {
    if (user) {
      const meta = user.user_metadata;
      const displayName = meta?.full_name || meta?.name ||
        [meta?.first_name, meta?.last_name].filter(Boolean).join("") ||
        (user.email?.split("@")[0] || "user");
      setUsername(generateUsername(displayName));
    }
  }, [user]);

  const googleAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const avatarUrl = customAvatarUrl || googleAvatarUrl;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name ||
    [user?.user_metadata?.first_name, user?.user_metadata?.last_name].filter(Boolean).join(" ") ||
    "there";

  // ── Avatar upload handler ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Client-side sanity checks
    if (!file.type.startsWith("image/")) {
      setUploadError("That's not an image — try a PNG, JPG, or GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Whoa, big file! Keep it under 5MB please.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Add a cache-buster so the <img> refreshes instantly on re-upload
      const freshUrl = `${data.publicUrl}?t=${Date.now()}`;
      setCustomAvatarUrl(freshUrl);
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setUploadError(err?.message || "Upload failed. Try a different image?");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const rerollHype = () => {
    // Ensure we pick a different line than the current one
    const pool = AVATAR_HYPE.filter((x) => x !== avatarHype);
    setAvatarHype(pool[Math.floor(Math.random() * pool.length)]);
  };

  // ── Validation ──
  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return username.trim().length >= 3;
      case 1: return dob !== "" && gender !== "";
      case 2: return selectedAI.length >= 3;
      case 3: return termsAccepted;
      default: return false;
    }
  }, [step, username, dob, gender, selectedAI, termsAccepted]);

  const validateUsername = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9._]/g, "");
    setUsername(clean);
    if (clean.length < 3) setUsernameError("At least 3 characters");
    else if (clean.length > 30) setUsernameError("Maximum 30 characters");
    else setUsernameError("");
  };

  const toggleAI = (id: string) => {
    setSelectedAI((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── Final save ──
  // NOTE: We use directUpsert (raw REST) instead of supabase.from().update()
  // to bypass the GoTrue lock contention bug, which causes the Supabase JS
  // client to hang indefinitely during auth-intensive flows like OAuth
  // callback + profile write. This is the same pattern we use elsewhere
  // (marketplace listings) to avoid the "Creating account..." stuck state.
  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const firstName =
        user.user_metadata?.first_name ||
        user.user_metadata?.given_name ||
        displayName.split(" ")[0] ||
        null;
      const lastName =
        user.user_metadata?.last_name ||
        user.user_metadata?.family_name ||
        displayName.split(" ").slice(1).join(" ") ||
        null;

      // Strip the ?t=... cache-buster before persisting — storage URL is stable
      const persistedAvatarUrl = avatarUrl ? avatarUrl.split("?")[0] : null;

      const { error } = await directUpsert("profiles", {
        id: user.id,
        email: user.email,
        username,
        date_of_birth: dob,
        gender,
        ai_preferences: selectedAI,
        notifications_enabled: notifications,
        terms_accepted: termsAccepted,
        onboarding_completed: true,
        avatar_url: persistedAvatarUrl,
        first_name: firstName,
        last_name: lastName,
      });

      if (error) {
        console.error("Onboarding save error:", error);
        setSaving(false);
        return;
      }

      // Best-effort profile refresh — don't block the UI on this since it
      // goes through the Supabase JS client and may be slow. Use a short
      // timeout so we redirect even if refresh hangs.
      try {
        await Promise.race([
          refreshProfile(),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      } catch {
        // Ignore — we'll refresh on next page load
      }

      setShowWelcome(true);

      // Show welcome animation then redirect
      setTimeout(() => {
        window.location.replace("/hub");
      }, 2800);
    } catch (err) {
      console.error("Onboarding failed:", err);
      setSaving(false);
    }
  };

  // ── Welcome celebration screen ──
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f0eb] px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 via-cyan-500 to-pink-500 mb-6 shadow-[0_0_60px_rgba(168,85,247,0.4)]"
          >
            <Rocket className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-black text-slate-900 mb-2"
          >
            Welcome to WhichAI!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-500"
          >
            Your account is ready. Taking you to the hub...
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1.8, ease: "linear" }}
            className="mt-6 h-1 w-48 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 origin-left"
          />
        </motion.div>
      </div>
    );
  }

  // ── Loading state ──
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f0eb]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f4f0eb] px-4 py-8">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-1/2 w-64 h-64 bg-pink-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2.5 mb-2"
        >
          <Image src="/whichai_icon_nav.svg" alt="WhichAi" width={32} height={28} priority />
          <span className="text-lg font-black bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
            WhichAi
          </span>
        </motion.div>

        <StepIndicator current={step} total={4} />

        <AnimatePresence mode="wait">
          {/* ═══════════ STEP 1: USERNAME ═══════════ */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                <div className="text-center mb-6">
                  {/* Hidden file input — triggered by clicking the avatar */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  {/* Clickable avatar w/ camera overlay + pulsing ring */}
                  <div className="relative inline-block mb-4 group">
                    {/* Animated glow ring — subtle hype */}
                    <motion.div
                      animate={{
                        boxShadow: customAvatarUrl
                          ? "0 0 0 0 rgba(16, 185, 129, 0)"
                          : [
                              "0 0 0 0 rgba(168, 85, 247, 0.4)",
                              "0 0 0 12px rgba(168, 85, 247, 0)",
                            ],
                      }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                    />

                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      disabled={uploading}
                      className="relative block rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all"
                      aria-label="Upload a profile photo"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-white transition-all group-hover:brightness-75"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 flex items-center justify-center shadow-md transition-all group-hover:brightness-90">
                          <User className="w-12 h-12 text-white" />
                        </div>
                      )}

                      {/* Hover overlay with camera icon */}
                      <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                          <Camera className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>

                      {/* Uploading spinner overlay */}
                      {uploading && (
                        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                          <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Camera badge in corner — signals this is clickable */}
                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      disabled={uploading}
                      className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 border-2 border-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                      aria-label="Upload a photo"
                    >
                      {customAvatarUrl ? (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900">
                    Hey, {displayName.split(" ")[0]}! 👋
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Let&apos;s get you a username and a pic that actually slaps.
                  </p>
                </div>

                {/* Fun rotating avatar hype box */}
                <motion.div
                  key={avatarHype}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-5 p-3 rounded-xl border flex items-start gap-2.5 ${
                    customAvatarUrl
                      ? "bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200"
                      : "bg-gradient-to-r from-purple-50 via-pink-50 to-cyan-50 border-purple-100"
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">
                    {customAvatarUrl ? "🎉" : "📸"}
                  </span>
                  <div className="flex-1 min-w-0">
                    {customAvatarUrl ? (
                      <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                        Looking iconic. This pic is officially part of your WhichAi lore.
                      </p>
                    ) : (
                      <p className="text-xs text-slate-600 leading-relaxed">{avatarHype}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={triggerFilePicker}
                        disabled={uploading}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700 disabled:opacity-50"
                      >
                        {customAvatarUrl ? "Swap it again" : "Tap to upload →"}
                      </button>
                      {!customAvatarUrl && (
                        <button
                          type="button"
                          onClick={rerollHype}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-500 transition-colors"
                          title="New line, who dis?"
                        >
                          <RefreshCw className="w-3 h-3" />
                          reroll
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {uploadError && (
                  <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                    {uploadError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => validateUsername(e.target.value)}
                        onFocus={() => setUsernameEditing(true)}
                        className="w-full pl-9 pr-10 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 font-medium focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                        maxLength={30}
                      />
                      <button
                        onClick={() => {
                          setUsernameEditing(true);
                          // Focus the input
                          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                          input?.focus();
                          input?.select();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    {usernameError && (
                      <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1.5">
                      Auto-generated from your name. You can edit it anytime.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span>Your email <strong className="text-slate-700">{user.email}</strong> is linked via Google. No password needed.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ STEP 2: DOB + GENDER ═══════════ */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 mb-3">
                    <Calendar className="w-7 h-7 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">About you</h2>
                  <p className="text-sm text-slate-400 mt-1">Helps us personalize your experience</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0]}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                    />
                    <p className="text-xs text-slate-400 mt-1">You must be at least 13 years old to use WhichAI.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                            gender === g
                              ? "border-purple-400 bg-purple-50 text-purple-700 ring-2 ring-purple-100"
                              : "border-gray-200 bg-gray-50 text-slate-600 hover:border-gray-300 hover:bg-white"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ STEP 3: AI PREFERENCES ═══════════ */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-purple-100 mb-3">
                    <Sparkles className="w-7 h-7 text-cyan-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">What interests you?</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Pick at least 3 to personalize your feed
                    <span className={`ml-2 font-semibold ${selectedAI.length >= 3 ? "text-emerald-500" : "text-purple-500"}`}>
                      {selectedAI.length}/3
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {AI_CATEGORIES.map((cat) => {
                    const selected = selectedAI.includes(cat.id);
                    return (
                      <motion.button
                        key={cat.id}
                        onClick={() => toggleAI(cat.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`relative p-3 rounded-xl border text-left transition-all ${
                          selected
                            ? "border-purple-400 bg-purple-50/80 ring-2 ring-purple-100"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <span className="text-xl mb-1 block">{cat.emoji}</span>
                        <p className={`text-xs font-semibold ${selected ? "text-purple-700" : "text-slate-700"}`}>
                          {cat.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{cat.desc}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ STEP 4: NOTIFICATIONS + TERMS ═══════════ */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 mb-3">
                    <Bell className="w-7 h-7 text-pink-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Almost there!</h2>
                  <p className="text-sm text-slate-400 mt-1">Just a couple more things</p>
                </div>

                <div className="space-y-4">
                  {/* Notifications toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Notifications</p>
                        <p className="text-xs text-slate-400">New tools, price drops, community updates</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                        notifications ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-slate-200"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${
                        notifications ? "left-5.5" : "left-0.5"
                      }`} style={{ left: notifications ? "22px" : "2px" }} />
                    </button>
                  </div>

                  {/* What you get */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-100">
                    <p className="text-xs font-semibold text-purple-700 mb-2">Your free account includes:</p>
                    <div className="space-y-1.5">
                      {[
                        "Compare 50+ AI models side-by-side",
                        "Browse the AI marketplace",
                        "Access community forums",
                        "3 free prompts per day",
                        "1 free course module",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          </div>
                          <span className="text-xs text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        termsAccepted
                          ? "bg-purple-500 border-purple-500"
                          : "border-gray-300 bg-white group-hover:border-purple-300"
                      }`}>
                        {termsAccepted && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 leading-relaxed">
                      I agree to the <a href="#" className="text-purple-500 hover:underline font-medium">Terms of Service</a> and{" "}
                      <a href="#" className="text-purple-500 hover:underline font-medium">Privacy Policy</a>.
                      I understand that WhichAI will create a Free account using my Google profile data.
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation buttons ── */}
        <div className="flex items-center justify-between mt-6 gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <motion.button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              whileHover={{ scale: canProceed ? 1.02 : 1 }}
              whileTap={{ scale: canProceed ? 0.98 : 1 }}
              className="flex items-center gap-1.5 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleComplete}
              disabled={!canProceed || saving}
              whileHover={{ scale: canProceed ? 1.02 : 1 }}
              whileTap={{ scale: canProceed ? 0.98 : 1 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Launch my account
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Skip text for optional step */}
        {step === 3 && (
          <p className="text-center text-xs text-slate-400 mt-3">
            Notifications are optional. Terms acceptance is required.
          </p>
        )}
      </div>
    </div>
  );
}
