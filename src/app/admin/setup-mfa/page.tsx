"use client";

/**
 * Admin MFA force-enrollment page.
 *
 * Lives OUTSIDE the (protected) route group so admins without MFA
 * can reach it without being bounced by the aal2 gate in the
 * protected layout. The page itself still verifies the caller is
 * a signed-in admin before showing the QR code.
 */

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Copy, Check, RefreshCw, ArrowRight } from "lucide-react";
import {
  enrollTotp,
  verifyTotp,
  listMfaFactors,
  unenrollMfaFactor,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function AdminSetupMfaPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"loading" | "enroll" | "verify" | "done" | "error">("loading");
  const [error, setError] = useState("");
  const [enrollData, setEnrollData] = useState<{
    id: string;
    uri: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // On mount: confirm the user is signed in, then start TOTP enrollment.
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/admin/login");
          return;
        }

        // Clean up any unverified factors from a prior aborted attempt.
        const { data: existing } = await listMfaFactors();
        if (existing?.totp) {
          for (const f of existing.totp) {
            if (f.status !== "verified") {
              try {
                await unenrollMfaFactor(f.id);
              } catch {
                /* best effort */
              }
            }
          }
          // If a verified factor already exists, the admin was sent
          // here by accident — just bounce to the normal MFA challenge.
          const verified = existing.totp.find((f) => f.status === "verified");
          if (verified) {
            router.replace("/auth/mfa-verify?next=/admin");
            return;
          }
        }

        const { data, error: enrollErr } = await enrollTotp("WhichAi Admin");
        if (enrollErr || !data) {
          setError(enrollErr?.message || "Failed to start MFA enrollment");
          setStage("error");
          return;
        }
        setEnrollData({
          id: data.id,
          uri: data.totp?.uri || "",
          secret: data.totp?.secret || "",
        });
        setStage("enroll");
      } catch (err: any) {
        setError(err?.message || "Unexpected error");
        setStage("error");
      }
    })();
  }, [router]);

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!enrollData) return;
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Enter your 6-digit code");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { error: vErr } = await verifyTotp(enrollData.id, code);
      if (vErr) {
        setError(vErr.message || "Invalid code. Please try again.");
        setSubmitting(false);
        return;
      }
      setStage("done");
      // Give the user a beat to see the success state, then bounce to /admin
      setTimeout(() => {
        window.location.replace("/admin");
      }, 1200);
    } catch {
      setError("Verification failed. Please try again.");
      setSubmitting(false);
    }
  };

  const copySecret = async () => {
    if (!enrollData) return;
    try {
      await navigator.clipboard.writeText(enrollData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] text-white px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-red-500 to-pink-500 mb-4 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black mb-1">MFA required for admin access</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            You need to enroll an authenticator app before you can use the
            admin console. This is a one-time setup.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          {stage === "loading" && (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin" />
              Starting enrollment…
            </div>
          )}

          {stage === "error" && (
            <div className="py-8 text-center">
              <p className="text-red-400 font-semibold mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-white/10 text-sm hover:bg-white/20"
              >
                Try again
              </button>
            </div>
          )}

          {stage === "enroll" && enrollData && (
            <>
              <ol className="text-xs text-slate-400 space-y-2 mb-5 leading-relaxed list-decimal list-inside">
                <li>Open your authenticator app (Google Authenticator, 1Password, Authy, Bitwarden, Raivo, etc.)</li>
                <li>Scan the QR code below — or paste the secret manually.</li>
                <li>Enter the 6-digit code your app generates to confirm.</li>
              </ol>

              <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-4">
                {enrollData.uri ? (
                  <QRCodeSVG value={enrollData.uri} size={180} level="M" />
                ) : (
                  <div className="text-red-500 text-xs">QR unavailable — use manual secret below</div>
                )}
              </div>

              <div className="mb-5">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">
                  Secret (manual entry)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-amber-300 break-all">
                    {enrollData.secret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                    title="Copy secret"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <form onSubmit={submitCode}>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-center text-xl font-mono tracking-[0.4em] focus:outline-none focus:border-amber-400"
                />
                {error && (
                  <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-red-500 to-pink-500 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      Enable MFA & continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {stage === "done" && (
            <div className="py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center mb-4">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-emerald-300 font-semibold mb-1">MFA enabled</p>
              <p className="text-xs text-slate-500">Redirecting to admin console…</p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-600 text-center mt-4 leading-relaxed">
          Store your authenticator backups safely. If you lose access, another
          owner admin will have to reset MFA for you.
        </p>
      </div>
    </div>
  );
}
