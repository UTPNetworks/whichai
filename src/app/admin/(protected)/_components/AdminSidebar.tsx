"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Package, Radio, ScrollText, Trash2,
  LogOut, ShieldAlert, Zap, UserCog,
} from "lucide-react";
import { StepUpChip } from "./AdminSessionProvider";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/admins", label: "Admins", icon: UserCog },
  { href: "/admin/kill-switch", label: "Kill Switch", icon: Radio, danger: true },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
  { href: "/admin/trash", label: "Trash (30d)", icon: Trash2 },
];

export default function AdminSidebar({
  adminEmail,
  adminRole,
}: {
  adminEmail: string;
  adminRole: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-[#06060f] border-r border-white/5 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight">WhichAi</div>
            <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Admin Console</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? item.danger
                    ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/30"
                    : "bg-white/5 text-white"
                  : item.danger
                  ? "text-red-400/70 hover:bg-red-500/5 hover:text-red-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {item.danger && !isActive && (
                <Zap className="w-3 h-3 ml-auto opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5 space-y-3">
        {/* Step-up lock status / unlock button */}
        <StepUpChip />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
            {adminEmail.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate">{adminEmail}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{adminRole}</div>
          </div>
        </div>
        <Link
          href="/api/admin/signout"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out of admin
        </Link>
      </div>
    </aside>
  );
}
