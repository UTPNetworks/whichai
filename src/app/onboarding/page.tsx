"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { directUpdate } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Sparkles, 
  Check, 
  Bell, 
  Calendar,
  Globe,
  Zap,
  ShieldCheck,
  Type,
  Mic,
  Settings,
  Code,
  Video,
  BarChart
} from "lucide-react";

const CATEGORIES = [
  { id: "llms", name: "LLMs", icon: Sparkles, color: "from-purple-500 to-indigo-600" },
  { id: "image-gen", name: "Image Generation", icon: Globe, color: "from-pink-500 to-rose-600" },
  { id: "voice-ai", name: "Voice AI", icon: Mic, color: "from-cyan-500 to-blue-600" },
  { id: "automation", name: "Automation", icon: Settings, color: "from-emerald-500 to-teal-600" },
  { id: "coding", name: "Coding Assistants", icon: Code, color: "from-amber-500 to-orange-600" },
  { id: "video", name: "Video Creation", icon: Video, color: "from-red-500 to-pink-600" },
  { id: "analytics", name: "Data Analytics", icon: BarChart, color: "from-violet-500 to-purple-600" },
];

export default function OnboardingPage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Identity
  const [username, setUsername] = useState("");
  
  // Step 2: Demographics
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [gender, setGender] = useState("");
  
  // Step 3: Preferences
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Step 4: Notifications
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }
      
      // Auto-generate username from name or email
      if (!username) {
        const base = user.user_metadata?.full_name?.split(' ')[0].toLowerCase() || 
                     user.email?.split('@')[0].toLowerCase() || 
                     "user";
        const random = Math.floor(Math.random() * 9000) + 1000;
        setUsername(`${base}${random}`);
      }
    }
  }, [user, profile, authLoading, router]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!username || !/^[a-zA-Z0-9_]+$/.test(username)) {
        setError("Please enter a valid alphanumeric username.");
        return;
      }
    } else if (step === 2) {
      if (!dobMonth || !dobDay || !dobYear || !gender) {
        setError("All fields are required to proceed.");
        return;
      }
    } else if (step === 3) {
      if (selectedCategories.length < 3) {
        setError("Please select at least 3 categories.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    const formattedMonth = dobMonth.padStart(2, '0');
    const formattedDay = dobDay.padStart(2, '0');
    const dateOfBirth = `${dobYear}-${formattedMonth}-${formattedDay}`;

    try {
      if (!user?.id) throw new Error("Authentication error");

      const { error: updateError } = await directUpdate('profiles', {
        username,
        date_of_birth: dateOfBirth,
        gender,
        ai_preferences: selectedCategories,
        notifications_enabled: notifications,
        onboarding_completed: true,
      }, { id: user.id });

      if (updateError) throw updateError;

      await refreshProfile();
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
      setLoading(false);
    }
  };

  if (authLoading) return null;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 selection:bg-purple-500/30">
      {/* Premium Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-12 px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className={`
                h-1.5 flex-1 rounded-full transition-all duration-500
                ${step >= i ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-zinc-800'}
              `} />
              {i < 4 && <div className="w-4" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl"
          >
            {step === 1 && (
              <div className="space-y-8">
                <header className="space-y-2">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <User className="text-purple-400" size={24} />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">Public Identity</h1>
                  <p className="text-zinc-400">This is how you&apos;ll be known in the WhichAi community.</p>
                </header>

                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 block">Choose your username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">@</span>
                      <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-10 pr-4 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-600 flex items-center gap-2">
                    <Sparkles size={12} /> Alphanumeric and underscores only
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10">
                <header className="space-y-2">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="text-indigo-400" size={24} />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">Personal Details</h1>
                  <p className="text-zinc-400">Help us ensure a safe and compliant experience.</p>
                </header>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] block">Date of birth</label>
                    <div className="grid grid-cols-3 gap-3">
                      <select 
                        value={months.indexOf(dobMonth) + 1 || ""}
                        onChange={(e) => setDobMonth(months[parseInt(e.target.value) - 1])}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Month</option>
                        {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                      </select>
                      <input 
                        type="text" placeholder="DD" maxLength={2} value={dobDay}
                        onChange={(e) => setDobDay(e.target.value.replace(/\D/g, ''))}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 outline-none focus:border-indigo-500/50 text-center"
                      />
                      <input 
                        type="text" placeholder="YYYY" maxLength={4} value={dobYear}
                        onChange={(e) => setDobYear(e.target.value.replace(/\D/g, ''))}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 outline-none focus:border-indigo-500/50 text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] block">Identity</label>
                    <div className="flex flex-wrap gap-2">
                      {['Man', 'Woman', 'Non-binary', 'Prefer not to say', 'Something else'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`
                            px-5 py-2.5 rounded-full text-sm font-medium border transition-all
                            ${gender === g ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}
                          `}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10">
                <header className="space-y-2">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="text-pink-400" size={24} />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">AI Interests</h1>
                  <p className="text-zinc-400">Select at least <span className="text-pink-400 font-bold">3 categories</span> to personalize your hub.</p>
                </header>

                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`
                          p-5 rounded-3xl border text-left transition-all duration-300 group
                          ${isSelected 
                            ? `bg-zinc-800 border-zinc-600 ring-2 ring-pink-500/20` 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}
                        `}
                      >
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-active:scale-95
                          ${isSelected ? `bg-gradient-to-br ${cat.color} text-white` : 'bg-zinc-900 text-zinc-500'}
                        `}>
                          <Icon size={20} />
                        </div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{cat.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12">
                <header className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Bell className="text-emerald-400" size={24} />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">Stay Updated</h1>
                  <p className="text-zinc-400">Get notified about new AI drops and pro tips.</p>
                </header>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-zinc-950 border border-zinc-800 rounded-[2rem]">
                    <div className="space-y-1">
                      <p className="font-bold">Enable Notifications</p>
                      <p className="text-xs text-zinc-500">Personalized updates and announcements.</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(!notifications)}
                      className={`
                        w-14 h-8 rounded-full relative transition-colors duration-300
                        ${notifications ? 'bg-emerald-500' : 'bg-zinc-800'}
                      `}
                    >
                      <div className={`
                        absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300
                        ${notifications ? 'left-7 shadow-lg' : 'left-1'}
                      `} />
                    </button>
                  </div>

                  <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] flex gap-4">
                    <ShieldCheck className="text-indigo-400 shrink-0" size={20} />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      By completing setup, you agree to our Terms of Service and Privacy Policy. We take your data security seriously.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-8 flex items-center gap-2 font-medium"
              >
                <div className="w-1 h-1 bg-red-400 rounded-full" /> {error}
              </motion.p>
            )}

            <div className="mt-12 flex gap-4">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 bg-zinc-950 text-zinc-400 font-bold py-5 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={20} /> Back
                </button>
              )}
              <button
                onClick={step === 4 ? handleComplete : handleNext}
                disabled={loading}
                className={`
                  flex-[2] py-5 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                  ${loading ? 'bg-zinc-800 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-600 hover:shadow-indigo-500/20'}
                `}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 4 ? "Complete Setup" : "Continue"} <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-zinc-700 text-[10px] mt-12 uppercase tracking-[0.4em] font-black pointer-events-none">
          Strict Security Protocol Active
        </p>
      </div>
    </div>
  );
}
