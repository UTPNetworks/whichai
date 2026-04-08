'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Mail, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'verification' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const next = params.get('next') ?? '/';

    if (!code) {
      router.replace('/auth/login?error=auth_callback_error');
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error) {
        setErrorMsg(error.message);
        setStatus('error');
        setTimeout(() => router.replace('/auth/login?error=auth_callback_error'), 3000);
        return;
      }

      // Check if this is a new user (first-time Google sign-up)
      // Supabase sets created_at ≈ last_sign_in_at for brand new users
      const user = data?.session?.user;
      if (user) {
        setUserEmail(user.email || '');

        const createdAt = new Date(user.created_at).getTime();
        const now = Date.now();
        const isNewUser = (now - createdAt) < 60_000; // Created within the last 60 seconds

        if (isNewUser) {
          // New Google sign-up → show verification message
          // Sign them out so they can't access anything until they verify
          await supabase.auth.signOut();
          setStatus('verification');
          return;
        }
      }

      // Returning user → go straight to destination
      router.replace(next);
    });
  }, [router]);

  const handleOk = () => {
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f0eb] px-4">
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="inline-block w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-5" />
            <p className="text-slate-600 font-medium">Completing sign in&hellip;</p>
            <p className="text-slate-400 text-sm mt-1">Please wait a moment</p>
          </motion.div>
        )}

        {status === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative w-full max-w-md"
          >
            {/* Gradient border */}
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-40 blur-sm bg-gradient-animate" />
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 bg-gradient-animate" />

            <div className="relative bg-white rounded-3xl p-8 md:p-10 border border-gray-200 shadow-lg text-center">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2.5 mb-6">
                <Image src="/whichai_icon_nav.svg" alt="WhichAi logo" width={36} height={32} priority />
                <span className="text-xl font-black bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
                  WhichAi
                </span>
              </div>

              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 mx-auto mb-5">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-slate-900 mb-3">
                Verification email sent!
              </h1>

              {/* Message */}
              <div className="bg-slate-50 rounded-2xl border border-gray-100 p-5 mb-6 text-left">
                <p className="text-sm text-slate-600 leading-relaxed">
                  A verification email has been sent to{' '}
                  <strong className="text-purple-600">{userEmail}</strong>.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mt-3">
                  Please verify your email to continue. Due to security reasons, we request you to verify your email first and then try to login using Google.
                </p>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>This helps us protect your account</span>
              </div>

              {/* OK Button */}
              <motion.button
                onClick={handleOk}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300"
              >
                OK
              </motion.button>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-slate-800 font-semibold mb-1">Authentication failed</p>
            <p className="text-slate-500 text-sm mb-2">{errorMsg}</p>
            <p className="text-slate-400 text-xs">Redirecting you back to sign in&hellip;</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
