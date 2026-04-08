import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const authRequired = ['/dashboard', '/my-listings', '/settings'];

// Routes that require MFA (aal2) in addition to authentication
// These are sensitive routes involving money or account changes
const mfaRequired = ['/dashboard', '/settings/security'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  const needsAuth = authRequired.some((route) => pathname.startsWith(route));
  if (!needsAuth) return NextResponse.next();

  // Check for Supabase auth tokens in cookies
  // Supabase stores session as sb-<project-ref>-auth-token
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.includes('auth-token') && cookie.value
  );

  if (!hasAuthCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For MFA-required routes, we can't verify aal2 in edge middleware
  // (Supabase MFA state lives in the client-side session, not in cookies).
  // The MFA enforcement is handled client-side by the AuthProvider + page components:
  // - After login, login page checks assurance level and redirects to /auth/mfa-verify
  // - The security settings page checks MFA enrollment status
  // - Individual pages can use `useAuth().mfaLevel` to gate sensitive actions

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/my-listings/:path*', '/settings/:path*'],
};
