import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/'];
const PROTECTED_ROUTES = ['/dashboard', '/users', '/testing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-token');
  const isAuthenticated = !!authToken;

  // Skip middleware for next.js internal routes and static files
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For public routes (like home page)
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If not authenticated, allow access
    return NextResponse.next();
  }

  // For protected routes
  if (PROTECTED_ROUTES.includes(pathname)) {
    // If not authenticated, redirect to home
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If authenticated, allow access
    return NextResponse.next();
  }

  // For all other routes, just proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)']
};