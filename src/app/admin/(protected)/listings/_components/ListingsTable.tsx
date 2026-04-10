"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical, EyeOff, Eye, Trash2, RefreshCw, Check, ExternalLink,
} from "lucide-react";

interface AdminListing {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  price: number;
  status: string;
  hidden: boolean;
  hidden_reason: string | null;
  deleted_at: string | null;
  created_at: string;
  photo_urls: string[] | null;
  profiles: { email: string | null; username: string | null } | null;
}

export default function ListingsTable({ listings }: { listings: AdminListing[] }) {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const router = useRouter();

  const act = async (
    url: string,
    body: Record<string, unknown>,
    successMsg: string
  ) => {
    setBusyId(body.listing_id as string);
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
            toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
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
              <th className="text-left px-4 py-3">Listing</th>
              <th className="text-left px-4 py-3">Owner</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Created</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  No listings match these filters.
                </td>
              </tr>
            )}
            {listings.map((l) => (
              <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {l.photo_urls && l.photo_urls[0] ? (
                      <img
                        src={l.photo_urls[0]}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                        {l.title.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 max-w-xs">
                      <div className="font-semibold truncate text-white">{l.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{l.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 truncate max-w-[180px]">
                  {l.profiles?.email || l.profiles?.username || l.user_id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.category || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-300">${Number(l.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(l.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {l.hidden && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">HIDDEN</span>
                    )}
                    {l.deleted_at && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400 font-semibold">DELETED</span>
                    )}
                    {!l.hidden && !l.deleted_at && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{l.status?.toUpperCase() || "ACTIVE"}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 relative">
                  <button
                    onClick={() => setOpenRow(openRow === l.id ? null : l.id)}
                    disabled={busyId === l.id}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
                  >
                    {busyId === l.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreVertical className="w-4 h-4" />
                    )}
                  </button>
                  {openRow === l.id && (
                    <div className="absolute right-4 top-12 z-10 w-56 rounded-xl bg-[#0a0a14] border border-white/10 shadow-2xl py-1.5">
                      <a
                        href={`/listing/${l.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open public page
                      </a>
                      <div className="border-t border-white/5 my-1" />
                      {!l.hidden ? (
                        <MenuAction
                          icon={<EyeOff className="w-4 h-4" />}
                          label="Hide listing"
                          onClick={() =>
                            act(
                              "/api/admin/listings/hide",
                              { listing_id: l.id, reason: prompt("Reason?") || "" },
                              `Hid ${l.title}`
                            )
                          }
                        />
                      ) : (
                        <MenuAction
                          icon={<Eye className="w-4 h-4" />}
                          label="Unhide listing"
                          onClick={() =>
                            act(
                              "/api/admin/listings/unhide",
                              { listing_id: l.id },
                              `Unhid ${l.title}`
                            )
                          }
                        />
                      )}
                      <MenuAction
                        icon={<Trash2 className="w-4 h-4" />}
                        label="Delete listing (30d recovery)"
                        danger
                        onClick={() => {
                          if (confirm(`DELETE "${l.title}"?\n\nGoes to trash for 30 days before permanent purge.`)) {
                            act(
                              "/api/admin/listings/delete",
                              { listing_id: l.id, reason: prompt("Reason?") || "" },
                              `Deleted ${l.title}`
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
        danger ? "text-red-400 hover:bg-red-500/10" : "text-slate-300 hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
