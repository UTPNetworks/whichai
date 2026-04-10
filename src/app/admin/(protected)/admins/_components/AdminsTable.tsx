"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, Trash2, RefreshCw, Check, KeyRound, ShieldCheck,
  AlertCircle, UserCog, X,
} from "lucide-react";
import { useAdminFetch } from "../../_components/AdminSessionProvider";

export type AdminRole = "owner" | "support" | "moderator";

export interface AdminRow {
  user_id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  has_mfa: boolean;
  is_self: boolean;
}

const ROLE_META: Record<
  AdminRole,
  { label: string; description: string; color: string }
> = {
  owner: {
    label: "Owner",
    description: "Full power, including kill-switch and admin management.",
    color: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  support: {
    label: "Support",
    description: "User management, flag toggles (non-nuclear), trash restore.",
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  moderator: {
    label: "Moderator",
    description: "Listing moderation only (hide/unhide/delete).",
    color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
};

export default function AdminsTable({
  admins,
  myRole,
}: {
  admins: AdminRow[];
  myRole: AdminRole;
}) {
  const router = useRouter();
  const adminFetch = useAdminFetch();
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const canManage = myRole === "owner";

  const notify = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const changeRole = async (row: AdminRow, nextRole: AdminRole) => {
    if (nextRole === row.role) return;
    if (!confirm(`Change ${row.email} from ${row.role} → ${nextRole}?`)) return;
    setBusyId(row.user_id);
    try {
      const res = await adminFetch("/api/admin/admins/change-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: row.user_id, role: nextRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      notify(`Role updated to ${nextRole}`, true);
      router.refresh();
    } catch (err: any) {
      notify(err?.message || "Failed", false);
    } finally {
      setBusyId(null);
    }
  };

  const removeAdmin = async (row: AdminRow) => {
    if (
      !confirm(
        `Remove ${row.email} from the admin team? Their user account stays, but they lose all admin access immediately.`
      )
    )
      return;
    setBusyId(row.user_id);
    try {
      const res = await adminFetch("/api/admin/admins/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: row.user_id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      notify(`${row.email} removed`, true);
      router.refresh();
    } catch (err: any) {
      notify(err?.message || "Failed", false);
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = async (row: AdminRow) => {
    if (
      !confirm(
        `Send a password reset email to ${row.email}? They'll receive a Supabase recovery link.`
      )
    )
      return;
    setBusyId(row.user_id);
    try {
      const res = await adminFetch("/api/admin/admins/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: row.user_id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      notify(`Reset email sent to ${row.email}`, true);
    } catch (err: any) {
      notify(err?.message || "Failed", false);
    } finally {
      setBusyId(null);
    }
  };

  const resetMfa = async (row: AdminRow) => {
    if (
      !confirm(
        `Reset MFA for ${row.email}? All existing authenticator factors will be removed. They will be forced to re-enroll on their next admin login.`
      )
    )
      return;
    setBusyId(row.user_id);
    try {
      const res = await adminFetch("/api/admin/admins/reset-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: row.user_id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      notify(`MFA cleared for ${row.email}`, true);
      router.refresh();
    } catch (err: any) {
      notify(err?.message || "Failed", false);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 ${
            toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-slate-500">
          {admins.length} admin{admins.length === 1 ? "" : "s"}
        </div>
        {canManage && (
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-xs font-semibold shadow-lg hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
          >
            <UserPlus className="w-4 h-4" />
            Add admin
          </button>
        )}
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">MFA</th>
              <th className="text-left px-4 py-3">Added</th>
              <th className="w-[260px] text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  No admins yet — how did you even get here?
                </td>
              </tr>
            )}
            {admins.map((row) => {
              const meta = ROLE_META[row.role];
              return (
                <tr
                  key={row.user_id}
                  className="border-t border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">
                      {row.email}
                      {row.is_self && (
                        <span className="ml-2 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">you</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canManage && !row.is_self ? (
                      <select
                        value={row.role}
                        onChange={(e) => changeRole(row, e.target.value as AdminRole)}
                        disabled={busyId === row.user_id}
                        className={`text-xs px-2 py-1 rounded-md border bg-black/40 ${meta.color}`}
                        title={meta.description}
                      >
                        <option value="owner">Owner</option>
                        <option value="support">Support</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    ) : (
                      <span
                        className={`text-[11px] px-2 py-1 rounded-md border font-semibold ${meta.color}`}
                        title={meta.description}
                      >
                        {meta.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.has_mfa ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Enrolled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Not enrolled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {busyId === row.user_id ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-400 inline" />
                    ) : (
                      canManage && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => resetPassword(row)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200"
                            title="Send password reset email"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => resetMfa(row)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-amber-300"
                            title="Reset MFA (clear all factors)"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                          {!row.is_self && (
                            <button
                              onClick={() => removeAdmin(row)}
                              className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                              title="Remove admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!canManage && (
        <p className="mt-4 text-xs text-slate-500">
          You need <code className="text-amber-300">owner</code> role to add or
          remove admins. Contact another owner if you need to promote someone.
        </p>
      )}

      {addOpen && (
        <AddAdminModal
          onClose={() => setAddOpen(false)}
          onSuccess={(email) => {
            notify(`${email} is now an admin`, true);
            setAddOpen(false);
            router.refresh();
          }}
          notify={notify}
        />
      )}
    </>
  );
}

function AddAdminModal({
  onClose,
  onSuccess,
  notify,
}: {
  onClose: () => void;
  onSuccess: (email: string) => void;
  notify: (msg: string, ok: boolean) => void;
}) {
  const adminFetch = useAdminFetch();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("moderator");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("Enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/admins/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed");
        setSubmitting(false);
        return;
      }
      onSuccess(trimmed);
    } catch (err: any) {
      setError(err?.message || "Failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-[#0a0a14] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-white text-base">Add admin</h2>
              <p className="text-[11px] text-slate-500">Promotes an existing user</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 block">
              Email address
            </label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="alice@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400"
            />
            <p className="text-[10px] text-slate-500 mt-1.5">
              The user must already have a WhichAi account. They'll be asked
              to enroll MFA on their first admin login.
            </p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 block">
              Role
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(ROLE_META) as AdminRole[]).map((r) => {
                const meta = ROLE_META[r];
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
                      active
                        ? meta.color
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    }`}
                    title={meta.description}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
              {ROLE_META[role].description}
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !email}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add as {ROLE_META[role].label}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
