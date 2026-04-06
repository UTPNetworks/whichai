import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use createBrowserClient from @supabase/ssr so that sessions are stored in
// cookies (not localStorage). This makes the session visible to Next.js
// middleware and server components, fixing the post-login redirect loop.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the current access token with a hard timeout.
 * Bypasses GoTrue lock contention by racing getSession against a timer.
 * Returns null if no session or if the call times out.
 */
export async function getAccessToken(timeoutMs = 8000): Promise<string | null> {
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    if (!result) return null;
    return (result as any).data?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Direct REST insert that bypasses the Supabase client's internal GoTrue lock.
 * Extracts the access token once upfront, then uses a plain fetch() so no
 * further lock acquisitions are needed during the request.
 */
export async function directInsert(
  table: string,
  data: Record<string, unknown>
): Promise<{ error: Error | null }> {
  const token = await getAccessToken();
  if (!token) return { error: new Error('Not authenticated. Please sign in and try again.') };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: new Error(body?.message || `Server error ${res.status}`) };
    }
    return { error: null };
  } catch (err: any) {
    clearTimeout(timer);
    return { error: new Error(err?.message || 'Request failed') };
  }
}

/**
 * Direct REST select that bypasses the Supabase client's internal GoTrue lock.
 * Pass filters as a Record of column→value pairs (all joined with AND).
 */
export async function directSelect(
  table: string,
  filters: Record<string, unknown> = {},
  orderBy?: { column: string; ascending?: boolean },
  timeoutMs = 12000
): Promise<{ data: unknown[] | null; error: Error | null }> {
  const token = await getAccessToken();

  const params = new URLSearchParams({ select: '*' });
  for (const [col, val] of Object.entries(filters)) {
    params.set(col, `eq.${val}`);
  }
  if (orderBy) {
    params.set('order', `${orderBy.column}.${orderBy.ascending ? 'asc' : 'desc'}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
      headers: {
        // Include token if available; public reads still work with anon key only
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        apikey: supabaseAnonKey,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: new Error(body?.message || `Server error ${res.status}`) };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err: any) {
    clearTimeout(timer);
    return { data: null, error: new Error(err?.message || 'Request failed') };
  }
}

/**
 * Safely warm up the Supabase auth session before write operations.
 * Used as a best-effort pre-warm; prefer directInsert/directSelect for
 * operations where reliability matters.
 */
export async function safeRefreshSession(timeoutMs = 6000): Promise<void> {
  try {
    const session = supabase.auth.getSession();
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
    await Promise.race([session, timeout]);
  } catch {
    // Silently ignore
  }
}
