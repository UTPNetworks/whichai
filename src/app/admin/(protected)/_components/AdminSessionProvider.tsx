"use client";

/**
 * AdminSessionProvider
 *
 * Wraps the entire (protected) admin area and provides:
 *
 *   1. Step-up state: tracks when the admin_stepup cookie will expire
 *      (the server sets a 5-minute cookie after a successful TOTP
 *      verification via POST /api/admin/stepup).
 *
 *   2. adminFetch(url, init): drop-in replacement for fetch() that:
 *        - issues the request
 *        - if the server responds 403 { code: 'stepup_required' },
 *          automatically pops a TOTP modal, verifies the code, then
 *          retries the original request
 *        - returns the final response to the caller
 *
 *   3. A <StepUpModal /> rendered at the provider level — children do
 *      not need to render it themselves.
 *
 *   4. A manual "Unlock" button (wired up in AdminSidebar) so admins
 *      can pre-verify before starting a batch of destructive actions.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Lock, Unlock, ShieldCheck, X, RefreshCw } from "lucide-react";

interface AdminSessionContextValue {
  /** Unix ms when step-up expires. 0 = not unlocked. */
  stepUpExpiresAt: number;
  /** Seconds remaining on step-up, or 0 if not unlocked. */
  secondsLeft: number;
  /** fetch() wrapper that transparently handles stepup_required 403s. */
  adminFetch: (url: string, init?: RequestInit) => Promise<Response>;
  /** Manually open the step-up modal (e.g. from the sidebar "Unlock" button). */
  openStepUpModal: () => void;
  /** Clear the current step-up cookie. */
  lock: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function useAdminSession(): AdminSessionContextValue {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) {
    throw new Error("useAdminSession must be used inside <AdminSessionProvider>");
  }
  return ctx;
}

/**
 * Convenience hook for calling admin APIs with automatic step-up handling.
 */
export function useAdminFetch() {
  const { adminFetch } = useAdminSession();
  return adminFetch;
}

interface PendingRetry {
  url: string;
  init: RequestInit;
  resolve: (res: Response) => void;
  reject: (err: unknown) => void;
}

export default function AdminSessionProvider({
  children,
  initialStepUpExpiresAt = 0,
}: {
  children: React.ReactNode;
  initialStepUpExpiresAt?: number;
}) {
  const [stepUpExpiresAt, setStepUpExpiresAt] = useState(initialStepUpExpiresAt);
  const [now, setNow] = useState(() => Date.now());
  const [modalOpen, setModalOpen] = useState(false);
  const pendingRef = useRef<PendingRetry | null>(null);

  // Tick once a second so the "unlocked for X seconds" chip counts down.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft =
    stepUpExpiresAt > now ? Math.floor((stepUpExpiresAt - now) / 1000) : 0;

  const openStepUpModal = useCallback(() => setModalOpen(true), []);

  const lock = useCallback(async () => {
    try {
      await fetch("/api/admin/stepup", { method: "DELETE" });
    } catch {
      /* noop */
    }
    setStepUpExpiresAt(0);
  }, []);

  const adminFetch = useCallback(
    (url: string, init: RequestInit = {}): Promise<Response> => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await fetch(url, init);
          if (res.status !== 403) return resolve(res);

          // Clone before reading — the caller may still want the body.
          const cloned = res.clone();
          let body: { code?: string } | null = null;
          try {
            body = await cloned.json();
          } catch {
            body = null;
          }
          if (body?.code !== "stepup_required") return resolve(res);

          // Queue the original request and pop the modal.
          pendingRef.current = { url, init, resolve, reject };
          setModalOpen(true);
        } catch (err) {
          reject(err);
        }
      });
    },
    []
  );

  // Called by the modal after a successful TOTP verification.
  const handleStepUpSuccess = useCallback(async (expiresAt: number) => {
    setStepUpExpiresAt(expiresAt);
    setModalOpen(false);

    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending) return;

    try {
      const res = await fetch(pending.url, pending.init);
      pending.resolve(res);
    } catch (err) {
      pending.reject(err);
    }
  }, []);

  const handleStepUpCancel = useCallback(() => {
    setModalOpen(false);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) {
      // Return a synthetic 403 so the caller's error handling still fires.
      pending.resolve(
        new Response(
          JSON.stringify({ error: "Step-up verification cancelled" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        )
      );
    }
  }, []);

  const value = useMemo<AdminSessionContextValue>(
    () => ({
      stepUpExpiresAt,
      secondsLeft,
      adminFetch,
      openStepUpModal,
      lock,
    }),
    [stepUpExpiresAt, secondsLeft, adminFetch, openStepUpModal, lock]
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
      {modalOpen && (
        <StepUpModal
          onSuccess={handleStepUpSuccess}
          onCancel={handleStepUpCancel}
        />
      )}
    </AdminSessionContext.Provider>
  );
}

function StepUpModal({
  onSuccess,
  onCancel,
}: {
  onSuccess: (expiresAt: number) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Enter your 6-digit code");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stepup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setSubmitting(false);
        return;
      }
      onSuccess(data.expires_at || data.expiresAt || Date.now() + 5 * 60 * 1000);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-[#0a0a14] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-white text-base">Step-up required</h2>
              <p className="text-[11px] text-slate-500">Destructive action</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Enter the 6-digit code from your authenticator app. This unlocks
          destructive actions for 5 minutes.
        </p>

        <form onSubmit={submit}>
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
            className="w-full mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-red-500 to-pink-500 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Unlock for 5 minutes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Small chip that shows the current step-up state and doubles as an
 * "unlock" button. Rendered inside AdminSidebar.
 */
export function StepUpChip() {
  const { secondsLeft, openStepUpModal, lock } = useAdminSession();
  const unlocked = secondsLeft > 0;

  if (unlocked) {
    const mm = Math.floor(secondsLeft / 60);
    const ss = secondsLeft % 60;
    return (
      <button
        onClick={lock}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20"
        title="Click to lock again"
      >
        <Unlock className="w-3.5 h-3.5" />
        Unlocked {mm}:{ss.toString().padStart(2, "0")}
      </button>
    );
  }

  return (
    <button
      onClick={openStepUpModal}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20"
    >
      <Lock className="w-3.5 h-3.5" />
      Locked — click to unlock
    </button>
  );
}
