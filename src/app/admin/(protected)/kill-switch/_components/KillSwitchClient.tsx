"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Power, Lock, UserX, ShoppingBag, MessageCircle, Cpu, Ban, Megaphone,
  Check, RefreshCw, ShieldAlert,
} from "lucide-react";
import { useAdminFetch } from "../../_components/AdminSessionProvider";

interface Flags {
  id: number;
  site_kill_switch: boolean;
  read_only_mode: boolean;
  signups_disabled: boolean;
  marketplace_frozen: boolean;
  oauth_google_disabled: boolean;
  forums_disabled: boolean;
  comments_disabled: boolean;
  ai_compare_disabled: boolean;
  maintenance_banner: string | null;
  updated_at: string;
  updated_by: string | null;
}

export default function KillSwitchClient({ flags: initial, role }: { flags: Flags; role: string }) {
  const [flags, setFlags] = useState(initial);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState(initial?.maintenance_banner || "");
  const router = useRouter();
  const adminFetch = useAdminFetch();

  const setFlag = async (key: keyof Flags, value: boolean) => {
    setBusy(key);
    try {
      const res = await adminFetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      setFlags((f) => ({ ...f, [key]: value }));
      setToast({ msg: `${key} → ${value ? "ON" : "OFF"}`, ok: true });
      router.refresh();
    } catch (err: any) {
      setToast({ msg: err?.message || "Failed", ok: false });
    } finally {
      setBusy(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const saveBanner = async () => {
    setBusy("maintenance_banner");
    try {
      const res = await adminFetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "maintenance_banner", value: banner || null }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      setToast({ msg: "Banner saved", ok: true });
    } catch (err: any) {
      setToast({ msg: err?.message || "Failed", ok: false });
    } finally {
      setBusy(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const flipToggles: Array<{ key: keyof Flags; label: string; description: string; icon: React.ReactNode; danger?: boolean }> = [
    {
      key: "read_only_mode",
      label: "Read-only mode",
      description: "Serve all reads but reject POST/PUT/PATCH/DELETE with 503. Use during migrations or database incidents.",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      key: "signups_disabled",
      label: "Disable new signups",
      description: "Block /auth/signup and OAuth signup callbacks. Existing users can still log in.",
      icon: <UserX className="w-5 h-5" />,
    },
    {
      key: "marketplace_frozen",
      label: "Freeze marketplace",
      description: "Block all listing creates, edits, purchases, and bids. Browsing still works.",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      key: "oauth_google_disabled",
      label: "Disable Google OAuth",
      description: "Useful if Google Workspace is down or token exchange is failing.",
      icon: <Ban className="w-5 h-5" />,
    },
    {
      key: "forums_disabled",
      label: "Disable forums",
      description: "Hide all forum threads and block new posts.",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      key: "comments_disabled",
      label: "Disable comments",
      description: "Block new comments across listings and forums.",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      key: "ai_compare_disabled",
      label: "Disable AI Compare",
      description: "Turn off the model-compare feature if OpenRouter is on fire.",
      icon: <Cpu className="w-5 h-5" />,
    },
  ];

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

      {/* ── THE BIG RED BUTTON ─────────────────────────────────────── */}
      <NuclearButton
        armed={flags.site_kill_switch}
        disabled={role !== "owner"}
        onFire={() => setFlag("site_kill_switch", !flags.site_kill_switch)}
      />

      {/* ── FLAG TOGGLES ───────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
        {flipToggles.map((t) => (
          <FlagRow
            key={t.key}
            label={t.label}
            description={t.description}
            icon={t.icon}
            enabled={!!flags[t.key]}
            busy={busy === t.key}
            onToggle={() => setFlag(t.key, !flags[t.key])}
          />
        ))}
      </div>

      {/* ── MAINTENANCE BANNER ─────────────────────────────────────── */}
      <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-4 h-4 text-amber-400" />
          <div className="text-sm font-bold text-amber-400">Maintenance banner</div>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Text set here appears as a site-wide yellow banner. Leave blank to hide.
        </p>
        <textarea
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          rows={2}
          placeholder="e.g. Scheduled maintenance from 2am-4am UTC"
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-amber-500/20 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button
          onClick={saveBanner}
          disabled={busy === "maintenance_banner"}
          className="mt-3 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold disabled:opacity-50"
        >
          {busy === "maintenance_banner" ? "Saving..." : "Save banner"}
        </button>
      </div>

      {flags.updated_at && (
        <div className="mt-6 text-[11px] text-slate-600 font-mono">
          Last change: {new Date(flags.updated_at).toLocaleString()} {flags.updated_by && `by ${flags.updated_by}`}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   NUCLEAR BUTTON — flip cover, 3-second hold-to-confirm, scrolling
   terminal log for extra drama. Only firable by role=owner.
   ══════════════════════════════════════════════════════════════════ */
function NuclearButton({
  armed,
  disabled,
  onFire,
}: {
  armed: boolean;
  disabled: boolean;
  onFire: () => void;
}) {
  const [coverOpen, setCoverOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [log, setLog] = useState<string[]>([
    "$ killswitch boot",
    "[ok] auth online",
    "[ok] listings online",
    "[ok] forums online",
    "[ready] awaiting operator",
  ]);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef<number>(0);

  useEffect(() => {
    if (armed) {
      setLog((l) => [...l.slice(-20), "!! KILL SWITCH ENGAGED — traffic rerouted to /maintenance"]);
    }
  }, [armed]);

  const startHold = () => {
    if (disabled || !coverOpen) return;
    holdStart.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - holdStart.current;
      const pct = Math.min(elapsed / 3000, 1);
      setHoldProgress(pct);
      if (pct >= 1) {
        stopHold();
        setLog((l) => [...l.slice(-20), "$ firing killswitch..."]);
        setTimeout(() => onFire(), 300);
      } else {
        holdTimer.current = window.requestAnimationFrame(tick);
      }
    };
    holdTimer.current = window.requestAnimationFrame(tick);
  };

  const stopHold = () => {
    if (holdTimer.current) {
      window.cancelAnimationFrame(holdTimer.current);
      holdTimer.current = null;
    }
    setHoldProgress(0);
  };

  return (
    <div className="rounded-3xl border-2 border-red-500/40 bg-gradient-to-br from-red-950/60 via-black to-black p-6 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
      <div className="flex items-start gap-6">
        {/* ── Button with lift-up cover ────────────────────────────── */}
        <div className="relative w-60 h-60 flex-shrink-0">
          {/* Base metal ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 shadow-inner" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950" />

          {/* The button itself */}
          <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            disabled={disabled}
            className={`absolute inset-6 rounded-full font-black text-white text-lg tracking-widest select-none
              ${armed
                ? "bg-gradient-to-br from-red-500 to-red-800 animate-pulse"
                : "bg-gradient-to-br from-red-600 to-red-900"}
              ${coverOpen && !disabled ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
              shadow-[inset_0_6px_20px_rgba(0,0,0,0.6),0_6px_30px_rgba(239,68,68,0.4)]
              transition-transform duration-75
              ${holdProgress > 0 ? "scale-95" : ""}`}
          >
            {armed ? "ENGAGED" : "FIRE"}
            {holdProgress > 0 && (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white/20"
                  style={{ height: `${holdProgress * 100}%` }}
                />
              </div>
            )}
          </button>

          {/* Plastic flip cover */}
          <div
            className={`absolute inset-0 rounded-full transition-transform duration-500 origin-top
              ${coverOpen ? "-rotate-180 opacity-0" : "rotate-0 opacity-100"}
              pointer-events-none`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/90 via-yellow-500/80 to-yellow-700/90 border-4 border-yellow-600/80 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[10px] font-black text-black/70 tracking-widest rotate-[-20deg] border-2 border-black/50 px-2 py-0.5 rounded">
                  ⚡ DANGER ⚡
                </div>
              </div>
            </div>
          </div>

          {/* Flip cover toggle */}
          <button
            onClick={() => setCoverOpen((v) => !v)}
            disabled={disabled}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 bg-black/80 border border-white/10 px-3 py-1 rounded-full hover:bg-black disabled:opacity-50"
          >
            {coverOpen ? "close cover" : "lift cover"}
          </button>
        </div>

        {/* ── Description + terminal log ───────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <div className="text-sm font-bold text-red-400 tracking-wider">
              {armed ? "SITE KILL SWITCH — ENGAGED" : "SITE KILL SWITCH"}
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Engaging this reroutes every non-admin route to <code>/maintenance</code>. Logins, listings, forums — all frozen.
            Admins keep their access so you can dig into the incident. <br />
            <span className="text-red-300">Lift the cover, hold the button for 3 seconds, release to fire.</span>
            {disabled && (
              <span className="block mt-2 text-amber-400">
                ⚠ Only <code>owner</code> role can fire the kill switch.
              </span>
            )}
          </p>

          {/* Fake terminal */}
          <div className="rounded-lg bg-black border border-red-500/20 p-3 font-mono text-[11px] text-green-400 h-32 overflow-y-auto">
            {log.map((line, i) => (
              <div key={i} className={line.startsWith("!!") ? "text-red-400" : ""}>
                {line}
              </div>
            ))}
            <div className="inline-block w-2 h-3 bg-green-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Standard flag toggle row ─────────────────────────────────────── */
function FlagRow({
  label,
  description,
  icon,
  enabled,
  busy,
  onToggle,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-2xl border p-4 transition-colors ${enabled ? "border-red-500/40 bg-red-500/5" : "border-white/10 bg-white/[0.02]"}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${enabled ? "bg-red-500/20 text-red-300" : "bg-white/5 text-slate-400"}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">{label}</div>
            <button
              onClick={onToggle}
              disabled={busy}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                enabled ? "bg-red-500" : "bg-white/10"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
              {busy && <RefreshCw className="absolute inset-0 m-auto w-3 h-3 animate-spin text-white" />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
