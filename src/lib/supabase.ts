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

/**
 * Direct REST UPSERT (insert-or-update) that bypasses the GoTrue lock.
 * Uses Supabase's `Prefer: resolution=merge-duplicates` header — rows with a
 * matching primary key are updated, otherwise a new row is inserted.
 * The `data` payload MUST include the primary key column (e.g. `id`).
 */
export async function directUpsert(
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
        Prefer: 'return=minimal,resolution=merge-duplicates',
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
 * Direct REST PATCH (update) that bypasses the GoTrue lock.
 * Pass filters as column→value pairs (all ANDed).
 */
export async function directUpdate(
  table: string,
  data: Record<string, unknown>,
  filters: Record<string, unknown>
): Promise<{ error: Error | null }> {
  const token = await getAccessToken();
  if (!token) return { error: new Error('Not authenticated. Please sign in and try again.') };

  const params = new URLSearchParams();
  for (const [col, val] of Object.entries(filters)) {
    params.set(col, `eq.${val}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
      method: 'PATCH',
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
 * Direct REST DELETE that bypasses the GoTrue lock.
 * Pass filters as column→value pairs (all ANDed).
 */
export async function directDelete(
  table: string,
  filters: Record<string, unknown>
): Promise<{ error: Error | null }> {
  const token = await getAccessToken();
  if (!token) return { error: new Error('Not authenticated. Please sign in and try again.') };

  const params = new URLSearchParams();
  for (const [col, val] of Object.entries(filters)) {
    params.set(col, `eq.${val}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
        Prefer: 'return=minimal',
      },
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

// ══════════════════════════════════════════════════════════════
// MFA helpers that bypass the GoTrue lock.
// These hit the Supabase Auth REST API (/auth/v1/factors/...) directly
// instead of going through supabase.auth.mfa.*, which acquires an
// internal lock that hangs during post-OAuth / auth-intensive flows.
// ══════════════════════════════════════════════════════════════

/**
 * Enroll a new TOTP factor via direct REST. Bypasses the GoTrue lock
 * that `supabase.auth.mfa.enroll()` can hang on during post-OAuth /
 * auth-intensive flows (same root cause as the stuck onboarding button
 * and listing writes).
 *
 * Returns the shape `{ id, totp: { uri, secret, qr_code } }` so callers
 * don't need to change — it matches what `supabase.auth.mfa.enroll()`
 * returns.
 */
export async function directMfaEnroll(
  friendlyName?: string
): Promise<{
  data: { id: string; totp: { uri: string; secret: string; qr_code?: string } } | null;
  error: Error | null;
}> {
  const token = await getAccessToken();
  if (!token) return { data: null, error: new Error('Not authenticated. Please sign in and try again.') };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/factors`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        factor_type: 'totp',
        ...(friendlyName ? { friendly_name: friendlyName } : {}),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { data: null, error: new Error(body?.msg || body?.message || `Server error ${res.status}`) };
    }
    return {
      data: {
        id: body.id,
        totp: {
          uri: body?.totp?.uri || '',
          secret: body?.totp?.secret || '',
          qr_code: body?.totp?.qr_code || '',
        },
      },
      error: null,
    };
  } catch (err: any) {
    clearTimeout(timer);
    return { data: null, error: new Error(err?.message || 'Request failed') };
  }
}

/**
 * Create a verification challenge for an existing MFA factor.
 * Returns { id } where id is the challenge_id to pass to directMfaVerify.
 */
export async function directMfaChallenge(
  factorId: string
): Promise<{ data: { id: string } | null; error: Error | null }> {
  const token = await getAccessToken();
  if (!token) return { data: null, error: new Error('Not authenticated. Please sign in and try again.') };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/factors/${factorId}/challenge`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: '{}',
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { data: null, error: new Error(body?.msg || body?.message || `Server error ${res.status}`) };
    }
    return { data: { id: body.id }, error: null };
  } catch (err: any) {
    clearTimeout(timer);
    return { data: null, error: new Error(err?.message || 'Request failed') };
  }
}

/**
 * Verify a TOTP code against a pending challenge.
 *
 * On success, Supabase returns a fresh session (access_token + refresh_token)
 * that reflects the user's new AAL. For enrollment this elevates status
 * from unverified → verified; for sign-in challenges it elevates the session
 * from aal1 → aal2. We MUST persist these tokens back into the browser
 * client — otherwise server-side cookies still carry the old aal1 JWT and
 * the (protected) admin layout will keep bouncing the user into a loop.
 */
export async function directMfaVerify(
  factorId: string,
  challengeId: string,
  code: string
): Promise<{ error: Error | null }> {
  const token = await getAccessToken();
  if (!token) return { error: new Error('Not authenticated. Please sign in and try again.') };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/factors/${factorId}/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challenge_id: challengeId, code }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: new Error(body?.msg || body?.message || 'Invalid code. Try again.') };
    }

    // Persist the freshly issued session so subsequent server requests
    // see the elevated AAL via the sb-*-auth-token cookie.
    //
    // NOTE: we intentionally do NOT call `supabase.auth.setSession()` on
    // the client here — that acquires the GoTrue internal lock which the
    // whole `directMfa*` family of helpers was written to bypass, and
    // calling it would deadlock the very verify flow we're in. Instead
    // we POST the new tokens to a server route that writes the SSR
    // session cookie via a fresh per-request client.
    if (body?.access_token && body?.refresh_token) {
      const persistController = new AbortController();
      const persistTimer = setTimeout(() => persistController.abort(), 6000);
      try {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: body.access_token,
            refresh_token: body.refresh_token,
          }),
          signal: persistController.signal,
          credentials: 'include',
        });
      } catch (err) {
        console.error('[directMfaVerify] failed to persist new session:', err);
      } finally {
        clearTimeout(persistTimer);
      }
    }

    return { error: null };
  } catch (err: any) {
    clearTimeout(timer);
    return { error: new Error(err?.message || 'Request failed') };
  }
}

/**
 * List the current user's MFA factors via the auth REST API.
 * Returns the raw list of factors (all statuses). Callers can filter by
 * `status === 'verified'` and `factor_type` as needed.
 */
export async function directMfaListFactors(): Promise<{
  data: Array<{ id: string; factor_type: string; friendly_name?: string; status: string; created_at: string }> | null;
  error: Error | null;
}> {
  const token = await getAccessToken();
  if (!token) return { data: null, error: new Error('Not authenticated. Please sign in and try again.') };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    // `/auth/v1/factors` is not a documented public endpoint — factors come
    // back inside the user object at `/auth/v1/user`. Hit that instead.
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { data: null, error: new Error(body?.msg || body?.message || `Server error ${res.status}`) };
    }
    const factors = Array.isArray(body?.factors) ? body.factors : [];
    return { data: factors, error: null };
  } catch (err: any) {
    clearTimeout(timer);
    return { data: null, error: new Error(err?.message || 'Request failed') };
  }
}

/**
 * Unenroll (delete) an MFA factor via direct REST.
 */
export async function directMfaUnenroll(
  factorId: string
): Promise<{ error: Error | null }> {
  const token = await getAccessToken();
  if (!token) return { error: new Error('Not authenticated. Please sign in and try again.') };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/factors/${factorId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: new Error(body?.msg || body?.message || `Server error ${res.status}`) };
    }
    return { error: null };
  } catch (err: any) {
    clearTimeout(timer);
    return { error: new Error(err?.message || 'Request failed') };
  }
}

/**
 * Bulk PATCH — updates multiple rows by ID in a single REST call.
 * Uses Supabase's `id=in.(id1,id2,...)` filter syntax.
 */
export async function directUpdateMany(
  table: string,
  data: Record<string, unknown>,
  ids: string[]
): Promise<{ error: Error | null }> {
  if (ids.length === 0) return { error: null };
  const token = await getAccessToken();
  if (!token) return { error: new Error('Not authenticated. Please sign in and try again.') };

  const params = new URLSearchParams();
  params.set('id', `in.(${ids.join(',')})`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
      method: 'PATCH',
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
 * Bulk DELETE — removes multiple rows by ID in a single REST call.
 * Uses Supabase's `id=in.(id1,id2,...)` filter syntax.
 */
export async function directDeleteMany(
  table: string,
  ids: string[]
): Promise<{ error: Error | null }> {
  if (ids.length === 0) return { error: null };
  const token = await getAccessToken();
  if (!token) return { error: new Error('Not authenticated. Please sign in and try again.') };

  const params = new URLSearchParams();
  params.set('id', `in.(${ids.join(',')})`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
        Prefer: 'return=minimal',
      },
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
