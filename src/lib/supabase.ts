import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use createBrowserClient from @supabase/ssr so that sessions are stored in
// cookies (not localStorage). This makes the session visible to Next.js
// middleware and server components, fixing the post-login redirect loop.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Safely attempt to refresh the Supabase auth session.
 * Returns within `timeoutMs` no matter what — never hangs.
 * Use this before write operations. Do NOT use before public reads.
 */
export async function safeRefreshSession(timeoutMs = 3000): Promise<void> {
  try {
    const refresh = supabase.auth.refreshSession();
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
    await Promise.race([refresh, timeout]);
  } catch {
    // Silently ignore — the operation will proceed with whatever session exists
  }
}
