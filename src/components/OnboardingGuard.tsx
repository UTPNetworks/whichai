"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Only guard if user is logged in
    if (user && profile) {
      const isAuthPage = pathname.startsWith('/auth');
      const isOnboardingPage = pathname.startsWith('/onboarding');

      // If onboarding is not completed and they are not on an auth/onboarding page, redirect
      if (!profile.onboarding_completed && !isAuthPage && !isOnboardingPage) {
        router.replace('/onboarding');
      }
    }
  }, [user, profile, loading, pathname, router]);

  return <>{children}</>;
}
