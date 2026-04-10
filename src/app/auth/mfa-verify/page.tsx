"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { listMfaFactors, verifyTotp } from "@/lib/auth";

// Honor the `next` query param so /auth/login?next=/admin → MFA → /admin
function getSafeNext(fallback = "/hub"): string {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = new URLSearchParams(window.location.search).get("next");
    if (!raw) return fallback;
    if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
    return raw;
  } catch {
    return fallback;
  }
}

export default function MfaVerifyPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the user's TOTP factor
    listMfaFactors().then(({ data }) => {
      if (data?.totp && data.totp.length > 0) {
        // Use the first verified TOTP factor
        const verified = data.totp.find((f: any) => f.status === 'verified');
        if (verified) {
          setFactorId(verified.id);
        } else if (data.totp.length > 0) {
          setFactorId(data.totp[0].id);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!factorId) {
      setError("No MFA factor found. Please set up MFA first.");
      return;
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Enter a valid 6-digit code");
      return;
    }

    setSubmitting(true);
    try {
      const { error: verifyError } = await verifyTotp(factorId, code);
      if (verifyError) {
        setError(verifyError.message || "Invalid code. Please try again.");
        setSubmitting(false);
        return;
      }
      // MFA verified — honor ?next= (e.g. /admin) with safe fallback to /hub
      window.location.replace(getSafeNext());
    } catch {
      setError("Verification failed. Please try again.");
      setSubmitting(false);
    }
  };

  // Auto-focus and auto-submit when 6 digits entered
  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f0eb]">
        <div className="inline-block w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
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

            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-purple-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Two-factor authentication</h1>
            <p className="text-sm text-slate-400 mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="000000"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 rounded-xl bg-white border border-gray-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                maxLength={6}
              />
            </div>

            <motion.button
              type="submit"
              disabled={submitting || code.length !== 6}
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
                  Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </motion.button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Lost access to your authenticator?{" "}
            <Link href="/auth/login" className="text-purple-500 hover:text-purple-700 font-medium transition-colors">
              Sign in with another method
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
