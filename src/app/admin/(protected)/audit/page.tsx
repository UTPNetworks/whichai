import { createAdminClient } from '@/lib/admin';
import {
  Shield, EyeOff, Eye, Ghost, Trash2, UserCog, Power, Lock, AlertTriangle,
  ArchiveRestore, FileText,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AuditEntry {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

async function fetchAudit(action: string, who: string) {
  const client = createAdminClient();
  let q = client
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (action) q = q.ilike('action', `%${action}%`);
  if (who) q = q.ilike('admin_email', `%${who}%`);

  const { data, error } = await q;
  if (error) {
    console.error('[admin/audit] fetch error:', error);
    return [];
  }
  return (data || []) as AuditEntry[];
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'user.suspend': <Shield className="w-3.5 h-3.5" />,
  'user.unsuspend': <Shield className="w-3.5 h-3.5" />,
  'user.shadowban': <Ghost className="w-3.5 h-3.5" />,
  'user.delete': <Trash2 className="w-3.5 h-3.5" />,
  'user.hide_all_listings': <EyeOff className="w-3.5 h-3.5" />,
  'user.impersonate_start': <UserCog className="w-3.5 h-3.5" />,
  'listing.hide': <EyeOff className="w-3.5 h-3.5" />,
  'listing.unhide': <Eye className="w-3.5 h-3.5" />,
  'listing.delete': <Trash2 className="w-3.5 h-3.5" />,
  'flag.site_kill_switch': <Power className="w-3.5 h-3.5" />,
  'flag.read_only_mode': <Lock className="w-3.5 h-3.5" />,
  'flag.signups_disabled': <Lock className="w-3.5 h-3.5" />,
  'trash.restore': <ArchiveRestore className="w-3.5 h-3.5" />,
};

function actionBadge(action: string) {
  if (action.startsWith('flag.')) return 'bg-red-500/15 text-red-300 border-red-500/30';
  if (action === 'user.delete' || action === 'listing.delete') return 'bg-red-500/15 text-red-300 border-red-500/30';
  if (action.startsWith('user.suspend') || action.startsWith('user.shadowban')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (action.startsWith('listing.hide') || action.startsWith('user.hide')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (action.startsWith('trash.restore') || action === 'user.unsuspend' || action === 'listing.unhide') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  return 'bg-white/5 text-slate-300 border-white/10';
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; who?: string }>;
}) {
  const params = await searchParams;
  const action = params.action || '';
  const who = params.who || '';
  const entries = await fetchAudit(action, who);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">Audit Log</h1>
        <p className="text-sm text-slate-500">
          Immutable. {entries.length.toLocaleString()} entries shown (max 500). Every admin action lands here.
        </p>
      </div>

      <form method="get" className="flex items-center gap-2 mb-6 flex-wrap">
        <input
          type="text"
          name="action"
          defaultValue={action}
          placeholder="Filter action (e.g. user.delete)"
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm w-64"
        />
        <input
          type="text"
          name="who"
          defaultValue={who}
          placeholder="Filter admin email"
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm w-64"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold"
        >
          Filter
        </button>
        {(action || who) && (
          <a href="/admin/audit" className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm">
            Clear
          </a>
        )}
      </form>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">When</th>
              <th className="text-left px-4 py-3">Admin</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Target</th>
              <th className="text-left px-4 py-3">Reason</th>
              <th className="text-left px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  No audit entries match.
                </td>
              </tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  {new Date(e.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-300 truncate max-w-[180px]">
                  {e.admin_email}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold tracking-wide ${actionBadge(e.action)}`}>
                    {ACTION_ICONS[e.action] || <FileText className="w-3.5 h-3.5" />}
                    {e.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[11px] text-slate-400 font-mono">
                  {e.target_type ? `${e.target_type}/${e.target_id?.slice(0, 8) || ''}` : '—'}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-400 truncate max-w-xs">
                  {e.reason || '—'}
                </td>
                <td className="px-4 py-2.5 text-[10px] text-slate-600 font-mono">
                  {e.ip_address || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[11px] text-slate-600 flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3" />
        Audit entries cannot be edited or deleted — RLS enforces insert-only.
      </div>
    </div>
  );
}
