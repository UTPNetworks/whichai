"use client";

import { useState, FormEvent } from "react";
import { signIn, getMfaAssuranceLevel } from "@/lib/auth";

/**
 * Admin login page — email + password only, no Google / passkeys.
 *
 * After successful sign-in, if MFA is enrolled, we redirect to the
 * MFA verify page with ?next=/admin so the user lands back in the
 * admin console after entering their TOTP code.
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required"); return; }
    if (!password.trim()) { setError("Password is required"); return; }

    setSubmitting(true);
    try {
      const { error: signInErr } = await signIn(email, password);
      if (signInErr) {
        setError(signInErr.message);
        setSubmitting(false);
        return;
      }

      // Check if user has MFA enrolled
      try {
        const { data: mfaData } = await getMfaAssuranceLevel();
        if (mfaData && mfaData.nextLevel === "aal2" && mfaData.currentLevel === "aal1") {
          // User has MFA — redirect to verify with ?next=/admin
          window.location.replace("/auth/mfa-verify?next=/admin");
          return;
        }
      } catch {
        // If MFA check fails, just try going to /admin — the layout will
        // handle the redirect if MFA is actually needed.
      }

      // No MFA needed (or already aal2) — go to admin
      window.location.replace("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] text-white px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 mb-4 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
            <svg className="w-8 h-8 text-white" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2,3 L10,33 L20,16 L30,33 L38,3" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="2" cy="3" r="3" fill="white"/>
              <circle cx="20" cy="16" r="3" fill="white"/>
              <circle cx="38" cy="3" r="3" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black mb-1">WhichAi Admin</h1>
          <p className="text-sm text-slate-400">Restricted access — admins only</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 font-semibold text-sm hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all disabled:opacity-50"
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
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center mt-4 leading-relaxed">
            If you&apos;re not in the admins table, you&apos;ll be shown a 404 on
            any admin page. All admin actions are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
