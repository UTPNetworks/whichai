"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Fingerprint } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { signIn, signInWithGoogle, getMfaAssuranceLevel, isPasskeySupported } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        setServerError(error.message);
        setSubmitting(false);
        return;
      }

      // Check if user has MFA enabled and needs to verify
      const { data: mfaData } = await getMfaAssuranceLevel();
      if (mfaData && mfaData.nextLevel === 'aal2' && mfaData.currentLevel === 'aal1') {
        // User has MFA enrolled but hasn't verified yet this session
        window.location.replace("/auth/mfa-verify");
        return;
      }

      // No MFA required — go to hub
      window.location.replace("/hub");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setServerError("");
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setServerError(error.message);
        setGoogleLoading(false);
      }
      // If no error, the browser will redirect to Google
    } catch {
      setServerError("Failed to start Google sign-in.");
      setGoogleLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    if (!isPasskeySupported()) {
      setServerError("Passkeys are not supported by your browser.");
      return;
    }
    setPasskeyLoading(true);
    setServerError("");
    try {
      // Attempt WebAuthn-based sign in via Supabase MFA
      // The SDK may not have typed support yet, so we use a safe cast
      const auth = supabase.auth as any;
      if (typeof auth.signInWithPasskey === 'function') {
        const { error } = await auth.signInWithPasskey();
        if (error) {
          setServerError(error.message || 'Passkey sign-in failed');
          setPasskeyLoading(false);
          return;
        }
      } else {
        setServerError("Passkey sign-in is not yet supported by your Supabase version. Please use email or Google.");
        setPasskeyLoading(false);
        return;
      }
      window.location.replace("/hub");
    } catch {
      setServerError("Passkey sign-in failed. Try another method.");
      setPasskeyLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all";

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-[#f4f0eb]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-cyan-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-40 blur-sm bg-gradient-animate" />
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 bg-gradient-animate" />

        <div className="relative bg-white rounded-3xl p-8 md:p-10 border border-gray-200 shadow-lg">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center gap-2.5 mb-5"
            >
              <Image src="/whichai_icon_nav.svg" alt="WhichAi logo" width={40} height={36} priority />
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
                WhichAi
              </span>
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-2">Sign in to your WhichAi account</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* ── Social / Passkey sign-in buttons ── */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 font-medium text-sm transition-all disabled:opacity-50"
            >
              {googleLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </button>

            <button
              onClick={handlePasskeySignIn}
              disabled={passkeyLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 font-medium text-sm transition-all disabled:opacity-50"
            >
              {passkeyLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Fingerprint className="w-5 h-5 text-purple-500" />
              )}
              Sign in with Passkey
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  className={inputClass}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-gray-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-purple-500 hover:text-purple-700 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
