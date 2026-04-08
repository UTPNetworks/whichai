"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { directUpdate } from "@/lib/supabase";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, ShieldCheck, Mail, User } from "lucide-react";

export default function CompleteSignupPage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [gender, setGender] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
    if (!authLoading && profile?.onboarding_completed) {
      router.replace("/dashboard");
    }
  }, [user, profile, authLoading, router]);

  const handleNext = () => {
    if (!dobMonth || !dobDay || !dobYear || !gender) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!termsAccepted) return;
    setLoading(true);
    setError(null);

    // Format date of birth for Postgres DATE column (YYYY-MM-DD)
    const formattedMonth = dobMonth.padStart(2, '0');
    const formattedDay = dobDay.padStart(2, '0');
    const dateOfBirth = `${dobYear}-${formattedMonth}-${formattedDay}`;
    
    try {
      if (!user?.id) throw new Error("User not found");

      const { error: updateError } = await directUpdate('profiles', {
        date_of_birth: dateOfBirth,
        gender,
        terms_accepted: true,
        onboarding_completed: true,
      }, { id: user.id });

      if (updateError) throw updateError;

      await refreshProfile();
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image src="/whichai_icon_nav.svg" alt="WhichAi" width={40} height={40} />
          <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            WhichAi
          </span>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Complete your profile</h1>
                  <p className="text-gray-400 text-sm">Help us personalize your AI experience</p>
                </div>

                {/* Read-only fields */}
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email address</label>
                    <div className="flex items-center gap-3 bg-[#1e1e1e] border border-white/5 rounded-lg p-3 text-gray-400 cursor-not-allowed">
                      <Mail size={18} />
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="flex items-center gap-3 bg-[#1e1e1e] border border-white/5 rounded-lg p-3 text-gray-400 cursor-not-allowed">
                      <User size={18} />
                      <span className="text-sm font-medium">{user?.user_metadata?.full_name || 'Guest'}</span>
                    </div>
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">What&apos;s your date of birth?</label>
                  <div className="grid grid-cols-3 gap-3">
                    <select 
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="bg-[#1e1e1e] border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Month</option>
                      {months.map((m, i) => (
                        <option key={m} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      placeholder="DD" 
                      maxLength={2}
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value.replace(/\D/g, ''))}
                      className="bg-[#1e1e1e] border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none text-center"
                    />
                    <input 
                      type="text" 
                      placeholder="YYYY" 
                      maxLength={4}
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value.replace(/\D/g, ''))}
                      className="bg-[#1e1e1e] border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none text-center"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">What&apos;s your gender?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Man', 'Woman', 'Something else', 'Prefer not to say'].map((g) => (
                      <label key={g} className={`
                        flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
                        ${gender === g ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-white/10 bg-[#1e1e1e] text-gray-400 hover:border-white/20'}
                      `}>
                        <input 
                          type="radio" 
                          name="gender" 
                          value={g} 
                          className="hidden" 
                          onChange={(e) => setGender(e.target.value)}
                        />
                        <span className="text-sm font-medium">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                <button
                  onClick={handleNext}
                  className="w-full bg-white text-black font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  Next <ChevronRight size={20} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Terms & Privacy</h1>
                  <p className="text-gray-400 text-sm">One last step before you dive in</p>
                </div>

                <div className="space-y-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input 
                        type="checkbox" 
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="peer h-5 w-5 appearance-none rounded border border-white/20 bg-[#1e1e1e] checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                      />
                      <Check className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" size={14} />
                    </div>
                    <span className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                      Share my registration data with content providers for marketing purposes.
                    </span>
                  </label>

                  <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/5 space-y-4">
                    <p className="text-[13px] text-gray-400 leading-relaxed">
                      By clicking &quot;Sign up&quot;, you agree to WhichAi&apos;s <span className="text-white underline cursor-pointer hover:text-purple-400 transition-colors">Terms and Conditions</span> and <span className="text-white underline cursor-pointer hover:text-purple-400 transition-colors">Privacy Policy</span>.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                      <ShieldCheck size={14} className="text-purple-500" />
                      <span>Bank-grade security</span>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                <div className="space-y-4">
                  <button
                    disabled={!termsAccepted || loading}
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : "Sign up"}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full text-gray-500 text-sm font-bold hover:text-white transition-colors"
                  >
                    Go back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-gray-600 text-[11px] mt-8 uppercase tracking-[0.2em] font-black">
          Powered by WhichAi Identity
        </p>
      </div>
    </div>
  );
}
