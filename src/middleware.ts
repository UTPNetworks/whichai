import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require authentication on the main app
const authRequired = ['/dashboard', '/my-listings', '/settings', '/hub', '/profile'];

// Methods considered "writes" for read-only mode enforcement
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Paths that are always allowed through, even during maintenance
// (so admins can still log in and flip the switch back off)
const ALWAYS_ALLOWED_PREFIXES = [
  '/admin',
  '/auth',
  '/api/admin',
  '/api/auth',
  '/_next',
  '/favicon',
  '/public',
  '/maintenance',
];

// Lightweight in-memory cache for system_flags — avoids hammering the DB
// on every request. 30s TTL is enough for ops emergencies.
type Flags = {
  site_kill_switch: boolean;
  read_only_mode: boolean;
  signups_disabled: boolean;
  maintenance_banner: string | null;
};
let flagsCache: { data: Flags | null; expiresAt: number } = {
  data: null,
  expiresAt: 0,
};

async function fetchFlags(request: NextRequest): Promise<Flags | null> {
  const now = Date.now();
  if (flagsCache.data && flagsCache.expiresAt > now) return flagsCache.data;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `${supabaseUrl}/rest/v1/system_flags?select=site_kill_switch,read_only_mode,signups_disabled,maintenance_banner&id=eq.1`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!res.ok) return flagsCache.data;
    const rows = await res.json();
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    const data: Flags = {
      site_kill_switch: !!row?.site_kill_switch,
      read_only_mode: !!row?.read_only_mode,
      signups_disabled: !!row?.signups_disabled,
      maintenance_banner: row?.maintenance_banner || null,
    };
    flagsCache = { data, expiresAt: now + 30_000 };
    return data;
  } catch {
    return flagsCache.data;
  }
}

/**
 * Refresh the Supabase session in middleware so that every downstream
 * server component and route handler gets a fresh access token in the
 * cookie. Without this, the access token expires after ~1 hour and
 * `getUser()` returns null — which breaks admin identity checks.
 */
async function refreshSupabaseSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return response;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed tokens back to both the request (so downstream
          // server components see them) and the response (so the browser
          // stores them).
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // getUser() triggers a token refresh if the access token is expired.
    // This is the standard Supabase SSR middleware pattern.
    await supabase.auth.getUser();
  } catch {
    // Non-fatal — if refresh fails, the user will just see a login page.
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('host') || '').toLowerCase();

  // ============================================================
  // ADMIN SUBDOMAIN ROUTING
  // `admin.whichai.cloud` rewrites to `/admin/*` internally.
  // ============================================================
  const isAdminHost = host.startsWith('admin.') || host === 'admin.localhost:3000';
  if (isAdminHost) {
    // Paths that should render as-is on the admin subdomain (NOT rewritten
    // under /admin). The /auth/* routes are allowed through so admins can
    // sign in on the admin subdomain directly — that way the Supabase
    // session cookie is set on admin.whichai.cloud and is available to
    // the admin area without needing to share cookies across subdomains.
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/admin')
    ) {
      // Refresh session on every admin request to prevent token expiry
      const response = NextResponse.next();
      return refreshSupabaseSession(request, response);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`;
    const response = NextResponse.rewrite(url);
    return refreshSupabaseSession(request, response);
  }

  // ============================================================
  // KILL SWITCH + READ-ONLY MODE (main site only)
  // ============================================================
  const isAlwaysAllowed = ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isAlwaysAllowed) {
    const flags = await fetchFlags(request);
    if (flags?.site_kill_switch) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
    if (flags?.read_only_mode && WRITE_METHODS.has(request.method)) {
      return NextResponse.json(
        { error: 'Site is in read-only mode. Please try again later.' },
        { status: 503 }
      );
    }
    if (flags?.signups_disabled && pathname.startsWith('/auth/register')) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      url.searchParams.set('reason', 'signups_disabled');
      return NextResponse.rewrite(url);
    }
  }

  // ============================================================
  // SESSION REFRESH (all routes)
  // ============================================================
  let response = NextResponse.next();
  response = await refreshSupabaseSession(request, response);

  // ============================================================
  // AUTH-REQUIRED ROUTES
  // ============================================================
  const needsAuth = authRequired.some((route) => pathname.startsWith(route));
  if (!needsAuth) return response;

  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.includes('auth-token') && cookie.value
  );

  if (!hasAuthCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match everything except static files so admin subdomain rewriting works
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
