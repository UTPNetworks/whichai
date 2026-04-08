"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProfile, type Profile } from "@/lib/auth";

type AssuranceLevel = 'aal1' | 'aal2' | null;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  /** Current MFA assurance level (aal1 = password only, aal2 = MFA verified) */
  mfaLevel: AssuranceLevel;
  /** Whether the user has enrolled MFA factors (even if not yet verified this session) */
  hasMfaEnrolled: boolean;
  /** Re-check MFA status from Supabase */
  refreshMfa: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  mfaLevel: null,
  hasMfaEnrolled: false,
  refreshMfa: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaLevel, setMfaLevel] = useState<AssuranceLevel>(null);
  const [hasMfaEnrolled, setHasMfaEnrolled] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await getProfile(user.id);
    setProfile(p);
  }, [user]);

  const refreshMfa = useCallback(async () => {
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (data) {
        setMfaLevel(data.currentLevel as AssuranceLevel);
        setHasMfaEnrolled(data.nextLevel === 'aal2');
      }
    } catch {
      // MFA check is non-critical
    }
  }, []);

  useEffect(() => {
    // Safety timeout: never let loading stay true for more than 5 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
      clearTimeout(timeout);
    }).catch(() => {
      // If getSession fails for any reason, stop loading so the navbar renders
      setLoading(false);
      clearTimeout(timeout);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const p = await getProfile(session.user.id);
          setProfile(p);
        } else {
          setProfile(null);
          setMfaLevel(null);
          setHasMfaEnrolled(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Check MFA level whenever user changes
  useEffect(() => {
    if (user) {
      refreshMfa();
    }
  }, [user, refreshMfa]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, mfaLevel, hasMfaEnrolled, refreshMfa }}>
      {children}
    </AuthContext.Provider>
  );
}
