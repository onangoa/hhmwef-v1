import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration for public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login-screen',
  '/member-registration-wizard',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-reset-token',
  '/api/members', // Allow registration POST
];

const PASSWORD_CHANGE_ROUTES = [
  '/change-password',
  '/api/auth/change-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Also allow static files and next internal routes
  const isInternal = pathname.startsWith('/_next') || 
                     pathname.startsWith('/favicon.ico') || 
                     pathname.startsWith('/assets/');

  if (isInternal) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const session = request.cookies.get('session');
  
  // Check if it's a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isPasswordChangeRoute = PASSWORD_CHANGE_ROUTES.some(route => pathname.startsWith(route));
  const isLoginPage = pathname === '/login-screen';

  if (!session && !isPublicRoute) {
    // Redirect to login if no session exists and trying to access a protected route
    const loginUrl = new URL('/login-screen', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginPage) {
    // Redirect to home if already logged in and trying to access login page
    // The home page will then redirect to the correct dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if user must change password and is not already on password change page
  if (session && !isPublicRoute && !isPasswordChangeRoute) {
    // For now, we'll check this client-side since we don't have user data in the middleware
    // In a real implementation, you might want to decode the JWT or check a session cookie
    // that contains the mustChangePassword flag
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled internally or explicitly allowed)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
