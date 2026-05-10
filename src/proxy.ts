import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'vika-bouquets-secret-key-12345');

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Paths that require ADMIN role
  const adminPaths = ['/admin', '/api/admin']; // Added /api/admin for future protection
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  // Paths that require USER role (any authenticated user)
  const protectedPaths = ['/profile', '/checkout'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Auth paths (redirect to home if already logged in)
  const authPaths = ['/login', '/signup', '/verify', '/forgot-password'];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userRole = payload.role as string;

      // If user is already logged in, don't allow them to go to auth pages
      if (isAuthPath) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Check admin access
      if (isAdminPath && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    } catch (err) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // No token - check if trying to access protected paths
  if (isAdminPath || isProtectedPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/profile',
    '/profile/:path*',
    '/checkout',
    '/checkout/:path*',
    '/login',
    '/signup',
    '/verify',
    '/forgot-password',
  ],
};
