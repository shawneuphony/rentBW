// middleware.js
import { NextResponse } from 'next/server';

// Set to false to enable authentication and role-based access control
const DEV_MODE = false;

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/property',
  '/property/search',
  '/property/[id]',
  '/about',
  '/contact',
  '/faq',
  '/terms',
  '/privacy',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/properties',
  '/api/stats',
  '/api/diagnostic',
  '/api/health',
  '/api/ping',
];

// Helper to decode JWT payload in Edge Runtime
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('JWT Decode Error:', error);
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Allow access to public routes
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('[id]')) {
      const pattern = route.replace('[id]', '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. Check for authentication token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // If it's an API route, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If accessing a protected page without a token, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-based Access Control
  const user = decodeJwt(token);
  
  if (!user) {
    // Invalid token structure
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Protect role-specific routes
  const rolePrefixes = ['/tenant', '/landlord', '/investor', '/admin'];
  const currentRolePrefix = rolePrefixes.find(prefix => pathname.startsWith(prefix));

  if (currentRolePrefix) {
    const requiredRole = currentRolePrefix.substring(1); // 'tenant', 'landlord', etc.
    
    if (user.role !== requiredRole) {
      // User is trying to access a route for a different role
      console.warn(`Unauthorized access attempt: User ${user.email} (role: ${user.role}) tried to access ${pathname}`);
      
      // Redirect to their own dashboard
      return NextResponse.redirect(new URL(`/${user.role}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images).*)',
  ],
};