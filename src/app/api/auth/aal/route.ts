import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Report the current user's MFA assurance level.
 *
 * This exists specifically so the client-side MFA verify page can check
 * "am I already aal2?" without calling `supabase.auth.mfa.getAuthenticator
 * AssuranceLevel()` — that SDK method acquires the browser GoTrue lock and
 * hangs during post-OAuth / auth-intensive flows (the same root cause the
 * other `direct*` helpers exist to work around). Doing it in a server
 * route uses a fresh SSR client with no shared lock state.
 *
 * Returns:
 *   { currentLevel: 'aal1' | 'aal2' | null, nextLevel: 'aal1' | 'aal2' | null, hasUser: boolean }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Guard: if there's no user, there's nothing to say about AAL.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { currentLevel: null, nextLevel: null, hasUser: false },
        { status: 200 }
      );
    }

    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) {
      return NextResponse.json(
        { currentLevel: null, nextLevel: null, hasUser: true, error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        currentLevel: data?.currentLevel ?? null,
        nextLevel: data?.nextLevel ?? null,
        hasUser: true,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        currentLevel: null,
        nextLevel: null,
        hasUser: false,
        error: (err as Error)?.message || 'Unknown error',
      },
      { status: 200 }
    );
  }
}
