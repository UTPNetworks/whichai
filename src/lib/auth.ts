import {
  supabase,
  directMfaChallenge,
  directMfaVerify,
  directMfaListFactors,
  directMfaUnenroll,
} from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  tier: 'Free' | 'Student' | 'Pro';
  savings_total: number;
  bio: string | null;
  avatar_url: string | null;
  preferred_categories: string[] | null;
  ai_preferences: string[] | null;
  notifications_enabled: boolean;
  onboarding_completed: boolean;
  terms_accepted: boolean;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

// ── Sign Up ──────────────────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  metadata: { first_name: string; last_name: string; phone?: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
}

// ── Sign In ──────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// ── Google OAuth ─────────────────────────────────────────────
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// ── Sign Out ─────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ── Get Current Session / User ───────────────────────────────
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ── Profile helpers ──────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'username' | 'phone' | 'tier' | 'bio' | 'avatar_url' | 'preferred_categories' | 'ai_preferences' | 'notifications_enabled' | 'onboarding_completed' | 'terms_accepted' | 'date_of_birth' | 'gender'>>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

// ══════════════════════════════════════════════════════════════
// MFA (TOTP) helpers
// ══════════════════════════════════════════════════════════════

/**
 * Check the user's current MFA assurance level.
 * Returns { currentLevel, nextLevel } where levels are 'aal1' or 'aal2'.
 * If nextLevel > currentLevel, the user needs to complete an MFA challenge.
 */
export async function getMfaAssuranceLevel() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return { data, error };
}

/**
 * List all enrolled MFA factors for the current user.
 *
 * Uses a direct REST call to `/auth/v1/user` to bypass the Supabase JS
 * client's GoTrue lock, which can hang during auth-intensive flows.
 * Shapes the result to match what `supabase.auth.mfa.listFactors()` returns
 * so callers don't need to change (`data.totp`, `data.phone`).
 */
export async function listMfaFactors() {
  const { data, error } = await directMfaListFactors();
  if (error || !data) return { data: null, error };

  const totp = data
    .filter((f) => f.factor_type === 'totp')
    .map((f) => ({
      id: f.id,
      friendly_name: f.friendly_name,
      status: f.status,
      created_at: f.created_at,
      factor_type: 'totp',
    }));
  const phone = data
    .filter((f) => f.factor_type === 'phone')
    .map((f) => ({
      id: f.id,
      friendly_name: f.friendly_name,
      status: f.status,
      created_at: f.created_at,
      factor_type: 'phone',
    }));

  return { data: { all: data, totp, phone }, error: null };
}

/**
 * Enroll a new TOTP factor. Returns a QR code URI + secret for the user to scan.
 */
export async function enrollTotp(friendlyName?: string) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    ...(friendlyName ? { friendlyName } : {}),
  });
  return { data, error };
}

/**
 * Create a challenge for an existing factor, then verify it with the TOTP code.
 *
 * Uses direct REST calls to the Supabase Auth API to bypass the JS client's
 * GoTrue lock, which hangs during post-OAuth / auth-intensive flows (same
 * root cause as the stuck onboarding button and stuck listing writes).
 */
export async function verifyTotp(factorId: string, code: string) {
  // Step 1: create the challenge
  const { data: challenge, error: challengeError } = await directMfaChallenge(factorId);
  if (challengeError || !challenge) {
    return { data: null, error: challengeError || new Error('Failed to create challenge') };
  }

  // Step 2: verify with the 6-digit code
  const { error } = await directMfaVerify(factorId, challenge.id, code);
  if (error) return { data: null, error };

  return { data: { factorId }, error: null };
}

/**
 * Unenroll (remove) an MFA factor.
 *
 * Uses direct REST to bypass the GoTrue lock.
 */
export async function unenrollMfaFactor(factorId: string) {
  const { error } = await directMfaUnenroll(factorId);
  return { data: error ? null : { factorId }, error };
}

// ══════════════════════════════════════════════════════════════
// Passkey (WebAuthn) helpers
// ══════════════════════════════════════════════════════════════

/**
 * Check if the current browser supports WebAuthn / passkeys.
 */
export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function';
}

/**
 * Enroll a new passkey (WebAuthn) factor for the current user.
 * The browser will prompt for biometric / security key.
 */
export async function enrollPasskey(friendlyName?: string) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'webauthn' as any,
    ...(friendlyName ? { friendlyName } : {}),
  });
  return { data, error };
}
