"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArchiveRestore, RefreshCw, Check, Clock } from "lucide-react";
import { useAdminFetch } from "../../_components/AdminSessionProvider";

interface TrashItem {
  id: string;
  resource_type: 'user' | 'listing';
  resource_id: string;
  resource_data: Record<string, any>;
  deleted_by_email: string;
  reason: string | null;
  deleted_at: string;
  purge_after: string;
}

function daysUntil(dateStr: string) {
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function TrashTable({ items }: { items: TrashItem[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const router = useRouter();
  const adminFetch = useAdminFetch();

  const restore = async (item: TrashItem) => {
    if (!confirm(`Restore this ${item.resource_type}? It will reappear immediately.`)) return;
    setBusyId(item.id);
    try {
      const res = await adminFetch(`/api/admin/trash/${item.id}/restore`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Restore failed');
      setToast({ msg: `Restored ${item.resource_type}`, ok: true });
      router.refresh();
    } catch (err: any) {
      setToast({ msg: err?.message || 'Failed', ok: false });
    } finally {
      setBusyId(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-semibold ${
          toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.ok && <Check className="w-4 h-4 inline mr-1.5" />}
          {toast.msg}
        </div>
      )}

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Identifier</th>
              <th className="text-left px-4 py-3">Deleted by</th>
              <th className="text-left px-4 py-3">Reason</th>
              <th className="text-left px-4 py-3">Deleted</th>
              <th className="text-left px-4 py-3">Purges in</th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  Trash is empty.
                </td>
              </tr>
            )}
            {items.map((item) => {
              const days = daysUntil(item.purge_after);
              const label =
                item.resource_type === 'user'
                  ? item.resource_data?.profile?.email || item.resource_id.slice(0, 8)
                  : item.resource_data?.title || item.resource_id.slice(0, 8);
              return (
                <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-bold uppercase">
                      {item.resource_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white truncate max-w-xs">{label}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 truncate max-w-[180px]">{item.deleted_by_email}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 truncate max-w-xs">{item.reason || '—'}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">
                    {new Date(item.deleted_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                      days < 3 ? "text-red-400" : days < 7 ? "text-amber-400" : "text-slate-400"
                    }`}>
                      <Clock className="w-3 h-3" />
                      {days}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => restore(item)}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold disabled:opacity-50"
                    >
                      {busyId === item.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ArchiveRestore className="w-3.5 h-3.5" />
                      )}
                      Restore
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
