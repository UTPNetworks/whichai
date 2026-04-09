'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const next = params.get('next') ?? '/hub';

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

      const user = data?.session?.user;
      if (!user) {
        router.replace(next);
        return;
      }

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (!profile || profile.onboarding_completed === false) {
        // New user or incomplete onboarding → send to onboarding wizard
        router.replace('/auth/onboarding');
      } else {
        // Returning user → go to destination
        router.replace(next);
      }
    });
  }, [router]);

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
