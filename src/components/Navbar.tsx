"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "@/lib/auth";

const mockNotifications = [
  { id: 1, text: "🔥 New deal: OpenAI credits 10% off!", time: "2m ago" },
  { id: 2, text: "🎓 Student pricing now available for Claude Pro", time: "1h ago" },
  { id: 3, text: "⚡ GPU flash sale: H100 instances at $2.49/hr", time: "3h ago" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHomepage = pathname === "/";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    try {
      setDropdownOpen(false);
      setMobileOpen(false);
      await signOut();
    } catch {
      // Ignore errors — still redirect
    } finally {
      // Force a full page reload so all client state (auth, cache) is cleared
      window.location.href = "/";
    }
  };

  const displayName = profile?.first_name || user?.email?.split("@")[0] || "User";
  const initials = profile
    ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src="/whichai_icon_nav.svg" alt="WhichAi logo" width={32} height={29} priority />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            WhichAi
          </span>
        </Link>
      </motion.div>

      {/* Right side auth */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex items-center gap-3"
      >
        {/* Dashboard button — shown on all pages except homepage */}
        {!isHomepage && (
          <Link
            href="/hub"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              pathname === "/hub"
                ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                : "bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 hover:border-violet-300"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        )}

        {!loading && user ? (
          <>
            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-slate-900">Notifications</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {mockNotifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0">
                          <p className="text-sm text-slate-700">{n.text}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-gray-200 hover:border-purple-200 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : !loading ? (
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-full text-sm font-semibold text-slate-700 border border-slate-300 bg-white hover:border-purple-300 hover:text-purple-600 transition-all duration-200 shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        ) : null}
      </motion.div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden"
        >
          <div className="flex flex-col p-4 gap-2">
            {/* Dashboard link — visible on mobile on all non-homepage pages */}
            {!isHomepage && (
              <Link
                href="/hub"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard — All Sections
              </Link>
            )}
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-semibold text-center text-slate-700 border border-gray-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-semibold text-center text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
