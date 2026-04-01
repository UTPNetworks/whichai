"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const NAV_TILES = [
  {
    href: "/marketplace",
    label: "Marketplace",
    description: "Buy, sell & trade AI assets",
    gradient: "from-violet-500 to-purple-600",
    shadow: "hover:shadow-purple-200",
    icon: (
      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    ),
  },
  {
    href: "/compare",
    label: "Know Your AI",
    description: "Compare models side by side",
    gradient: "from-cyan-500 to-blue-600",
    shadow: "hover:shadow-cyan-200",
    icon: (
      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    href: "/learn",
    label: "Learning Hub",
    description: "Guides, courses & resources",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "hover:shadow-emerald-200",
    icon: (
      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
];

export default function WelcomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users back to login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Derive display name: prefer profile, fall back to Google metadata, then email
  const googleMeta = user.user_metadata;
  const displayName =
    profile?.first_name
      ? `${profile.first_name}${profile.last_name ? " " + profile.last_name : ""}`
      : googleMeta?.full_name ?? googleMeta?.name ?? user.email?.split("@")[0] ?? "there";

  const avatarUrl =
    profile?.avatar_url ?? googleMeta?.avatar_url ?? googleMeta?.picture ?? null;

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            whichAi
          </span>
        </Link>

        {/* Profile chip */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">{displayName}</span>
            <span className="text-xs text-slate-400">{user.email}</span>
          </div>

          <div className="relative group">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200 cursor-pointer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer ring-2 ring-purple-200">
                {initials}
              </div>
            )}

            {/* Dropdown */}
            <div className="absolute right-0 top-12 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              {displayName.split(" ")[0]}
            </span>{" "}
            👋
          </h1>
          <p className="text-slate-500 text-lg">
            Where would you like to go today?
          </p>
        </motion.div>

        {/* Three navigation tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          {NAV_TILES.map((tile, i) => (
            <motion.div
              key={tile.href}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: "easeOut" }}
            >
              <Link href={tile.href} className="block group">
                <div
                  className={`
                    relative rounded-3xl p-8 flex flex-col items-center text-center gap-4
                    bg-gradient-to-br ${tile.gradient}
                    shadow-xl ${tile.shadow} hover:shadow-2xl
                    transition-all duration-300
                    hover:-translate-y-2 active:scale-95 cursor-pointer
                  `}
                >
                  {/* Icon bubble */}
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {tile.icon}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {tile.label}
                    </h2>
                    <p className="text-white/75 text-sm">{tile.description}</p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="text-center py-6 text-xs text-slate-300">
        whichAi.cloud &copy; {new Date().getFullYear()} — The World&apos;s AI at Your Fingertips
      </footer>
    </div>
  );
}
