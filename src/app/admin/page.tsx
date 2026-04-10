import { createAdminClient } from '@/lib/admin';
import Link from 'next/link';
import {
  Users, Package, AlertTriangle, TrendingUp, Activity,
  UserPlus, ShieldAlert, EyeOff,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchDashboardStats() {
  const client = createAdminClient();
  const nowIso = new Date().toISOString();
  const yesterdayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersTotal,
    usersToday,
    usersWeek,
    suspended,
    shadowbanned,
    listingsTotal,
    listingsActive,
    listingsHidden,
    listingsToday,
    recentActions,
    flags,
  ] = await Promise.all([
    client.from('profiles').select('*', { count: 'exact', head: true }),
    client.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayIso),
    client.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoIso),
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('suspended', true),
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('shadowbanned', true),
    client.from('user_listings').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    client.from('user_listings').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('hidden', false).is('deleted_at', null),
    client.from('user_listings').select('*', { count: 'exact', head: true }).eq('hidden', true),
    client.from('user_listings').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayIso),
    client.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(5),
    client.from('system_flags').select('*').eq('id', 1).single(),
  ]);

  return {
    usersTotal: usersTotal.count || 0,
    usersToday: usersToday.count || 0,
    usersWeek: usersWeek.count || 0,
    suspended: suspended.count || 0,
    shadowbanned: shadowbanned.count || 0,
    listingsTotal: listingsTotal.count || 0,
    listingsActive: listingsActive.count || 0,
    listingsHidden: listingsHidden.count || 0,
    listingsToday: listingsToday.count || 0,
    recentActions: recentActions.data || [],
    flags: flags.data || null,
    fetchedAt: nowIso,
  };
}

export default async function AdminDashboard() {
  const stats = await fetchDashboardStats();
  const anyFlagOn =
    !!stats.flags &&
    (stats.flags.site_kill_switch ||
      stats.flags.read_only_mode ||
      stats.flags.signups_disabled ||
      stats.flags.marketplace_frozen ||
      stats.flags.oauth_google_disabled ||
      stats.flags.forums_disabled ||
      stats.flags.comments_disabled ||
      stats.flags.ai_compare_disabled);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Mission Control</h1>
          <p className="text-sm text-slate-500">
            Live snapshot of WhichAi &middot; refreshed at {new Date(stats.fetchedAt).toLocaleTimeString()}
          </p>
        </div>
        <form>
          <button
            formAction={async () => {
              'use server';
              // Bump the cache by revalidating this route
              const { revalidatePath } = await import('next/cache');
              revalidatePath('/admin');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
          >
            Refresh
          </button>
        </form>
      </div>

      {/* Active flags warning */}
      {anyFlagOn && (
        <Link
          href="/admin/kill-switch"
          className="block mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/30 hover:border-red-500/50 transition-all"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-300">System flags active</p>
              <p className="text-xs text-red-400/80 mt-0.5">
                {[
                  stats.flags?.site_kill_switch && 'KILL SWITCH',
                  stats.flags?.read_only_mode && 'read-only',
                  stats.flags?.signups_disabled && 'signups off',
                  stats.flags?.marketplace_frozen && 'marketplace frozen',
                  stats.flags?.oauth_google_disabled && 'Google OAuth off',
                  stats.flags?.forums_disabled && 'forums off',
                  stats.flags?.comments_disabled && 'comments off',
                  stats.flags?.ai_compare_disabled && 'AI compare off',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <span className="text-xs font-semibold text-red-400">→ Manage</span>
          </div>
        </Link>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total users"
          value={stats.usersTotal.toLocaleString()}
          delta={`+${stats.usersToday} today`}
          icon={<Users className="w-5 h-5" />}
          accent="purple"
          href="/admin/users"
        />
        <StatCard
          label="Signups (7d)"
          value={stats.usersWeek.toLocaleString()}
          delta={`${Math.round((stats.usersWeek / 7) * 10) / 10}/day avg`}
          icon={<UserPlus className="w-5 h-5" />}
          accent="cyan"
          href="/admin/users"
        />
        <StatCard
          label="Active listings"
          value={stats.listingsActive.toLocaleString()}
          delta={`+${stats.listingsToday} today · ${stats.listingsTotal} total`}
          icon={<Package className="w-5 h-5" />}
          accent="emerald"
          href="/admin/listings"
        />
        <StatCard
          label="Moderation queue"
          value={(stats.suspended + stats.shadowbanned + stats.listingsHidden).toString()}
          delta={`${stats.suspended} susp · ${stats.shadowbanned} shadow · ${stats.listingsHidden} hidden`}
          icon={<ShieldAlert className="w-5 h-5" />}
          accent="red"
          href="/admin/users"
        />
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Recent admin actions</h2>
          </div>
          {stats.recentActions.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No actions logged yet. Peaceful times.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentActions.map((a: any) => (
                <div key={a.id} className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-purple-300 truncate">{a.action}</p>
                    <p className="text-[10px] text-slate-500 truncate">by {a.admin_email}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              <Link
                href="/admin/audit"
                className="block pt-3 text-[11px] text-center text-slate-500 hover:text-purple-400"
              >
                View full log →
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Quick actions</h2>
          </div>
          <div className="space-y-2">
            <QuickAction href="/admin/users" icon={<Users className="w-4 h-4" />}>Browse users</QuickAction>
            <QuickAction href="/admin/listings" icon={<Package className="w-4 h-4" />}>Browse listings</QuickAction>
            <QuickAction href="/admin/listings?filter=hidden" icon={<EyeOff className="w-4 h-4" />}>Review hidden listings</QuickAction>
            <QuickAction href="/admin/kill-switch" icon={<Radio />} danger>Open kill switch console</QuickAction>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, delta, icon, accent, href,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ReactNode;
  accent: 'purple' | 'cyan' | 'emerald' | 'red';
  href: string;
}) {
  const accents = {
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
  };

  return (
    <Link
      href={href}
      className={`block p-5 rounded-2xl bg-gradient-to-br ${accents[accent]} border hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="text-[11px] text-slate-500 mt-1">{delta}</div>
    </Link>
  );
}

function QuickAction({
  href, icon, children, danger,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
        danger
          ? 'bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/20'
          : 'bg-white/5 hover:bg-white/10 text-slate-300'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function Radio() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
    </svg>
  );
}
