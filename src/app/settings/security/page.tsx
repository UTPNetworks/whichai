"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ShieldCheck, Smartphone, Fingerprint, Trash2,
  CheckCircle2, AlertCircle, Plus, Copy, Check,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import {
  listMfaFactors,
  enrollTotp,
  verifyTotp,
  unenrollMfaFactor,
  enrollPasskey,
  isPasskeySupported,
} from "@/lib/auth";

interface Factor {
  id: string;
  type: string;
  friendly_name?: string;
  status: string;
  created_at: string;
}

export default function SecuritySettingsPage() {
  const { user } = useAuth();

  // MFA state
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState<{ id: string; uri: string; secret: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Passkey state
  const [passkeySupported] = useState(isPasskeySupported());
  const [enrollingPasskey, setEnrollingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 4000); };

  const fetchFactors = async () => {
    setLoading(true);
    const { data } = await listMfaFactors();
    if (data) {
      const all: Factor[] = [
        ...(data.totp || []).map((f: any) => ({ ...f, type: 'totp' })),
        ...(data.phone || []).map((f: any) => ({ ...f, type: 'phone' })),
      ];
      setFactors(all);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchFactors();
  }, [user]);

  // ── TOTP enrollment ──
  const handleEnrollTotp = async () => {
    setEnrolling(true);
    setEnrollData(null);
    setVerifyError("");
    setVerifyCode("");
    const { data, error } = await enrollTotp("WhichAI Authenticator");
    if (error) {
      setVerifyError(error.message);
      setEnrolling(false);
      return;
    }
    if (data) {
      setEnrollData({
        id: data.id,
        uri: (data as any).totp?.uri || '',
        secret: (data as any).totp?.secret || '',
      });
    }
  };

  const handleVerifyEnrollment = async (e: FormEvent) => {
    e.preventDefault();
    if (!enrollData) return;
    setVerifyError("");

    if (verifyCode.length !== 6 || !/^\d{6}$/.test(verifyCode)) {
      setVerifyError("Enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    const { error } = await verifyTotp(enrollData.id, verifyCode);
    if (error) {
      setVerifyError(error.message || "Invalid code. Try again.");
      setVerifying(false);
      return;
    }
    // Success
    setEnrolling(false);
    setEnrollData(null);
    setVerifyCode("");
    setVerifying(false);
    showMsg("Two-factor authentication enabled!");
    fetchFactors();
  };

  const handleCancelEnroll = () => {
    // If we enrolled but didn't verify, unenroll the pending factor
    if (enrollData) {
      unenrollMfaFactor(enrollData.id);
    }
    setEnrolling(false);
    setEnrollData(null);
    setVerifyCode("");
    setVerifyError("");
  };

  const handleRemoveFactor = async (factorId: string) => {
    setRemovingId(factorId);
    const { error } = await unenrollMfaFactor(factorId);
    if (error) {
      showMsg(`Failed to remove: ${error.message}`);
    } else {
      showMsg("Factor removed successfully");
      fetchFactors();
    }
    setRemovingId(null);
  };

  const handleCopySecret = () => {
    if (enrollData?.secret) {
      navigator.clipboard.writeText(enrollData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  // ── Passkey enrollment ──
  const handleEnrollPasskey = async () => {
    setEnrollingPasskey(true);
    setPasskeyError("");
    try {
      const { error } = await enrollPasskey("WhichAI Passkey");
      if (error) {
        setPasskeyError(error.message || "Failed to register passkey");
      } else {
        showMsg("Passkey registered successfully!");
        fetchFactors();
      }
    } catch {
      setPasskeyError("Passkey registration failed. Make sure your browser supports WebAuthn.");
    }
    setEnrollingPasskey(false);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#f4f0eb]">
          <div className="text-center">
            <p className="text-slate-600 mb-4">Please sign in to manage security settings.</p>
            <Link href="/auth/login" className="text-purple-500 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </>
    );
  }

  const verifiedFactors = factors.filter(f => f.status === 'verified');
  const hasMfa = verifiedFactors.length > 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f0eb] pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to profile
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Security Settings</h1>
            <p className="text-slate-500 mt-2">Manage your account security, two-factor authentication, and passkeys.</p>
          </div>

          {/* Action message */}
          <AnimatePresence>
            {actionMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {actionMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ MFA Section ═══ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h2>
                <p className="text-xs text-slate-400">
                  {hasMfa ? "Enabled" : "Not enabled"} &mdash; Use an authenticator app for an extra layer of security
                </p>
              </div>
              {hasMfa && (
                <span className="ml-auto px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  Active
                </span>
              )}
            </div>

            {/* Enrolled factors list */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {verifiedFactors.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {verifiedFactors.map((factor) => (
                      <div key={factor.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {factor.friendly_name || "Authenticator app"}
                            </p>
                            <p className="text-xs text-slate-400">
                              Added {new Date(factor.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFactor(factor.id)}
                          disabled={removingId === factor.id}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Remove factor"
                        >
                          {removingId === factor.id ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enrollment flow */}
                <AnimatePresence mode="wait">
                  {enrolling ? (
                    <motion.div
                      key="enroll"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {enrollData ? (
                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                          <h3 className="text-sm font-bold text-slate-900 mb-3">
                            Step 1: Scan the QR code with your authenticator app
                          </h3>
                          <div className="flex justify-center mb-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                              <QRCodeSVG value={enrollData.uri} size={180} />
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-1">Or enter this secret manually:</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-white px-3 py-2 rounded-lg border border-purple-100 font-mono text-slate-700 break-all">
                                {enrollData.secret}
                              </code>
                              <button
                                onClick={handleCopySecret}
                                className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
                                title="Copy secret"
                              >
                                {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                              </button>
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 mb-2">
                            Step 2: Enter the 6-digit code from your app
                          </h3>

                          {verifyError && (
                            <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {verifyError}
                            </div>
                          )}

                          <form onSubmit={handleVerifyEnrollment} className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              autoFocus
                              value={verifyCode}
                              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="000000"
                              className="flex-1 text-center text-lg tracking-[0.3em] font-mono py-2.5 rounded-xl bg-white border border-gray-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                              maxLength={6}
                            />
                            <button
                              type="submit"
                              disabled={verifying || verifyCode.length !== 6}
                              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg transition-all disabled:opacity-50"
                            >
                              {verifying ? "..." : "Verify"}
                            </button>
                          </form>

                          <button
                            onClick={handleCancelEnroll}
                            className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            Cancel setup
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleEnrollTotp}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 text-sm font-medium transition-all w-full justify-center"
                    >
                      <Plus className="w-4 h-4" />
                      {hasMfa ? "Add another authenticator" : "Set up authenticator app"}
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* ═══ Passkey Section ═══ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-100">
                <Fingerprint className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Passkeys</h2>
                <p className="text-xs text-slate-400">
                  Sign in with fingerprint, face recognition, or security key
                </p>
              </div>
            </div>

            {passkeyError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passkeyError}
              </div>
            )}

            {passkeySupported ? (
              <button
                onClick={handleEnrollPasskey}
                disabled={enrollingPasskey}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-cyan-300 text-cyan-600 hover:bg-cyan-50 text-sm font-medium transition-all w-full justify-center disabled:opacity-50"
              >
                {enrollingPasskey ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Waiting for device...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Register a passkey
                  </>
                )}
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                Your browser does not support passkeys (WebAuthn). Try using Chrome, Safari, or Edge on a modern device.
              </div>
            )}

            <p className="text-xs text-slate-400 mt-3">
              Passkeys use your device&apos;s biometric authentication (fingerprint, face, PIN) or a physical security key.
              They&apos;re more secure than passwords and can&apos;t be phished.
            </p>
          </div>

          {/* ═══ Session Info ═══ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Account Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-700 font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sign-in method</span>
                <span className="text-slate-700 font-medium">
                  {user.app_metadata?.provider === 'google' ? 'Google' : 'Email / Password'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MFA status</span>
                <span className={`font-medium ${hasMfa ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {hasMfa ? 'Enabled' : 'Not enabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
