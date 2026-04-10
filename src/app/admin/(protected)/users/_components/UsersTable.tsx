"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical, Shield, EyeOff, Ghost, Trash2, RefreshCw, UserCog, Check,
} from "lucide-react";

interface AdminUser {
  user_id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  tier: string | null;
  avatar_url: string | null;
  signed_up_at: string;
  last_sign_in_at: string | null;
  provider: string | null;
  suspended: boolean;
  shadowbanned: boolean;
  deleted_at: string | null;
  listing_count: number;
  active_listing_count: number;
}

export default function UsersTable({ users }: { users: AdminUser[] }) {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const router = useRouter();

  const act = async (
    url: string,
    body: Record<string, unknown>,
    successMsg: string
  ) => {
    setBusyId(body.user_id as string);
    setOpenRow(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setToast({ msg: successMsg, ok: true });
      router.refresh();
    } catch (err: any) {
      setToast({ msg: err?.message || "Action failed", ok: false });
    } finally {
      setBusyId(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold ${
            toast.ok
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.ok && <Check className="w-4 h-4 inline mr-1.5" />}
          {toast.msg}
        </div>
      )}

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3">Listings</th>
              <th className="text-left px-4 py-3">Signed up</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  No users match these filters.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.user_id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                        {(u.email || "?").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-white">
                        {u.first_name || u.last_name
                          ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                          : u.username || u.email}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                    {u.tier || "Free"}
                  </span>
                  {u.provider === "google" && (
                    <span className="ml-1.5 text-[10px] text-slate-500">google</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {u.active_listing_count}/{u.listing_count}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(u.signed_up_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {u.suspended && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold">SUSPENDED</span>
                    )}
                    {u.shadowbanned && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">SHADOWBAN</span>
                    )}
                    {u.deleted_at && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400 font-semibold">DELETED</span>
                    )}
                    {!u.suspended && !u.shadowbanned && !u.deleted_at && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">ACTIVE</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 relative">
                  <button
                    onClick={() => setOpenRow(openRow === u.user_id ? null : u.user_id)}
                    disabled={busyId === u.user_id}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
                  >
                    {busyId === u.user_id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreVertical className="w-4 h-4" />
                    )}
                  </button>
                  {openRow === u.user_id && (
                    <div className="absolute right-4 top-12 z-10 w-56 rounded-xl bg-[#0a0a14] border border-white/10 shadow-2xl py-1.5">
                      {!u.suspended ? (
                        <MenuAction
                          icon={<Shield className="w-4 h-4" />}
                          label="Suspend account"
                          onClick={() =>
                            act(
                              "/api/admin/users/suspend",
                              { user_id: u.user_id, reason: prompt("Reason for suspension?") || "" },
                              `Suspended ${u.email}`
                            )
                          }
                        />
                      ) : (
                        <MenuAction
                          icon={<Shield className="w-4 h-4" />}
                          label="Unsuspend"
                          onClick={() =>
                            act(
                              "/api/admin/users/unsuspend",
                              { user_id: u.user_id },
                              `Unsuspended ${u.email}`
                            )
                          }
                        />
                      )}
                      <MenuAction
                        icon={<Ghost className="w-4 h-4" />}
                        label={u.shadowbanned ? "Remove shadowban" : "Shadowban"}
                        onClick={() =>
                          act(
                            "/api/admin/users/shadowban",
                            { user_id: u.user_id, shadowban: !u.shadowbanned },
                            `${u.shadowbanned ? "Un-shadowbanned" : "Shadowbanned"} ${u.email}`
                          )
                        }
                      />
                      <MenuAction
                        icon={<UserCog className="w-4 h-4" />}
                        label="Impersonate (debug)"
                        onClick={() =>
                          act(
                            "/api/admin/users/impersonate",
                            { user_id: u.user_id },
                            `Impersonating ${u.email}`
                          )
                        }
                      />
                      <div className="border-t border-white/5 my-1" />
                      <MenuAction
                        icon={<EyeOff className="w-4 h-4" />}
                        label="Hide all listings"
                        onClick={() =>
                          act(
                            "/api/admin/users/hide-listings",
                            { user_id: u.user_id },
                            `Hid all listings for ${u.email}`
                          )
                        }
                      />
                      <MenuAction
                        icon={<Trash2 className="w-4 h-4" />}
                        label="Delete account (30d recovery)"
                        danger
                        onClick={() => {
                          if (
                            confirm(
                              `DELETE ${u.email}?\n\nThe account goes to trash for 30 days before permanent purge. This is destructive.`
                            )
                          ) {
                            act(
                              "/api/admin/users/delete",
                              { user_id: u.user_id, reason: prompt("Reason?") || "" },
                              `Deleted ${u.email}`
                            );
                          }
                        }}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MenuAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-slate-300 hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
