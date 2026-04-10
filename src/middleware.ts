import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
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
  // AUTH-REQUIRED ROUTES
  // ============================================================
  const needsAuth = authRequired.some((route) => pathname.startsWith(route));
  if (!needsAuth) return NextResponse.next();

  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.includes('auth-token') && cookie.value
  );

  if (!hasAuthCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except static files so admin subdomain rewriting works
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
