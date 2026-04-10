"use client";

/**
 * AdminSessionProvider
 *
 * Historical context: this file used to enforce a per-action "step-up"
 * TOTP prompt. That turned out to be a poor UX — admins were getting
 * TOTP prompts every few clicks and (worse) the step-up flow could
 * fail with "Not authorized" when the underlying session aal had been
 * quietly downgraded by a Supabase refresh-token cycle.
 *
 * The admin area is already MFA-gated at the layout level, so a second
 * per-action TOTP prompt adds no real security — just friction. We
 * therefore removed step-up entirely. This provider now exposes:
 *
 *   - adminFetch(url, init): a thin pass-through to fetch() so existing
 *     callers compile unchanged.
 *   - secondsLeft: always 0 (the chip is hidden).
 *   - openStepUpModal/lock: no-ops kept for API compatibility.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

interface AdminSessionContextValue {
  /** Unix ms when step-up expires. Always 0 — step-up is disabled. */
  stepUpExpiresAt: number;
  /** Seconds remaining on step-up. Always 0 — step-up is disabled. */
  secondsLeft: number;
  /** fetch() wrapper (identity — kept for backwards compatibility). */
  adminFetch: (url: string, init?: RequestInit) => Promise<Response>;
  /** No-op. */
  openStepUpModal: () => void;
  /** No-op. */
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
 * Convenience hook for calling admin APIs.
 */
export function useAdminFetch() {
  const { adminFetch } = useAdminSession();
  return adminFetch;
}

export default function AdminSessionProvider({
  children,
}: {
  children: React.ReactNode;
  /** Accepted for API compatibility but ignored. */
  initialStepUpExpiresAt?: number;
}) {
  const adminFetch = useCallback(
    (url: string, init: RequestInit = {}): Promise<Response> => {
      return fetch(url, init);
    },
    []
  );

  const openStepUpModal = useCallback(() => {
    /* step-up disabled */
  }, []);

  const lock = useCallback(async () => {
    /* step-up disabled */
  }, []);

  const value = useMemo<AdminSessionContextValue>(
    () => ({
      stepUpExpiresAt: 0,
      secondsLeft: 0,
      adminFetch,
      openStepUpModal,
      lock,
    }),
    [adminFetch, openStepUpModal, lock]
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

/**
 * Legacy chip — step-up is disabled, so this renders nothing.
 * Kept as a named export because AdminSidebar still imports it.
 */
export function StepUpChip() {
  return null;
}
