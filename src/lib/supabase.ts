import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use createBrowserClient from @supabase/ssr so that sessions are stored in
// cookies (not localStorage). This makes the session visible to Next.js
// middleware and server components, fixing the post-login redirect loop.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Safely warm up the Supabase auth session before write operations.
 * Uses getSession (read-only, no network call when token is fresh) so the
 * GoTrue lock is acquired and released quickly. If the lock is already stuck
 * the call resolves after `timeoutMs` (default 6 s — enough for GoTrue's
 * own 5 s forced-release to kick in) and execution continues normally.
 */
export async function safeRefreshSession(timeoutMs = 6000): Promise<void> {
  try {
    const session = supabase.auth.getSession();
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
    await Promise.race([session, timeout]);
  } catch {
    // Silently ignore — the operation will proceed with whatever session exists
  }
}
