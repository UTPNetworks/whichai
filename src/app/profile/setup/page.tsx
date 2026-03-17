"use client";

import { motion } from "framer-motion";
import { Sparkles, Camera, ArrowRight, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getUser, getProfile, updateProfile } from "@/lib/auth";

const AI_CATEGORIES = [
  { value: "code", label: "Code" },
  { value: "writing", label: "Writing" },
  { value: "image_gen", label: "Image Gen" },
  { value: "voice", label: "Voice" },
  { value: "research", label: "Research" },
  { value: "vision", label: "Vision" },
  { value: "api", label: "API" },
  { value: "web", label: "Web" },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    categories: [] as string[],
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const user = await getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(user.id);

      const profile = await getProfile(user.id);

      // If profile already fully set up, skip to marketplace
      if (profile?.preferred_categories && profile.preferred_categories.length > 0) {
        router.replace("/marketplace");
        return;
      }

      // Pre-fill name from existing profile or auth metadata
      setForm((f) => ({
        ...f,
        firstName: profile?.first_name || (user.user_metadata?.first_name as string) || "",
        lastName: profile?.last_name || (user.user_metadata?.last_name as string) || "",
        bio: profile?.bio || "",
        categories: profile?.preferred_categories || [],
      }));

      if (profile?.avatar_url) setAvatarPreview(profile.avatar_url);

      setChecking(false);
    }
    init();
  }, [router]);

  function toggleCategory(value: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(value)
        ? f.categories.filter((c) => c !== value)
        : [...f.categories, value],
    }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!userId) return;
    if (!form.firstName.trim()) { setError("Please enter your first name."); return; }
    if (form.categories.length === 0) { setError("Please select at least one AI category."); return; }

    setSaving(true);
    setError("");

    let avatar_url: string | undefined;

    // Upload avatar if selected
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        // Non-fatal: warn but continue
        console.warn("Avatar upload failed:", uploadError.message);
      } else {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = data.publicUrl;
      }
    }

    const { error: saveError } = await updateProfile(userId, {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      bio: form.bio.trim() || null,
      preferred_categories: form.categories,
      ...(avatar_url ? { avatar_url } : {}),
    });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    router.push("/marketplace");
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12 bg-gray-50">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-cyan-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-purple-100/50 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-pink-100/40 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Gradient border */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-40 blur-sm bg-gradient-animate" />
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 bg-gradient-animate" />

        <div className="relative bg-white rounded-3xl p-8 md:p-10 border border-gray-200 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-purple-100 mb-4"
            >
              <Sparkles className="w-7 h-7 text-purple-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-900">Create Your Profile</h1>
            <p className="text-sm text-slate-400 mt-2">
              Tell us about yourself to personalise your AI Marketplace
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors group"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-7 h-7 text-purple-400 group-hover:text-purple-600 transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <p className="text-xs text-slate-400">Click to upload photo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all text-sm"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Bio <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all text-sm resize-none"
              />
            </div>

            {/* Preferred categories */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preferred AI Categories <span className="text-slate-400 font-normal">(pick any)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AI_CATEGORIES.map((cat) => {
                  const selected = form.categories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        selected
                          ? "bg-purple-500 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save button */}
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save &amp; Enter Marketplace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
