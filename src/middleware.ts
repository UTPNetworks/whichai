import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/marketplace'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/marketplace/:path*'],
};
