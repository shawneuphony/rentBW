// middleware.js
import { NextResponse } from 'next/server';

// For development - allow access to all routes
// Set this to false when you want to enable authentication
const DEV_MODE = true;

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
];

// All routes are accessible in development mode
const allRoutes = [
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
  '/tenant',
  '/tenant/dashboard',
  '/tenant/saved',
  '/tenant/applications',
  '/tenant/messages',
  '/tenant/profile',
  '/tenant/settings',
  '/landlord',
  '/landlord/dashboard',
  '/landlord/listings',
  '/landlord/listings/new',
  '/landlord/messages',
  '/landlord/analytics',
  '/landlord/profile',
  '/investor',
  '/investor/dashboard',
  '/investor/yield-analysis',
  '/investor/geospatial',
  '/investor/market-overview',
  '/investor/saved-reports',
  '/investor/settings',
  '/admin',
  '/admin/dashboard',
  '/admin/moderation',
  '/admin/users',
  '/admin/data-management',
  '/admin/reports',
  '/admin/settings',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // DEVELOPMENT MODE: Allow access to all routes
  if (DEV_MODE) {
    // Check if the route is in our allowed routes
    const isAllowedRoute = allRoutes.some(route => {
      if (route.includes('[id]')) {
        const pattern = route.replace('[id]', '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(pathname);
      }
      return pathname === route || pathname.startsWith(route + '/');
    });

    // If it's an allowed route or starts with /api, allow access
    if (isAllowedRoute || pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // For any other routes, still allow but log warning
    console.warn(`[DEV MODE] Accessing unlisted route: ${pathname}`);
    return NextResponse.next();
  }

  // PRODUCTION MODE: Normal authentication checks
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('[id]')) {
      const pattern = route.replace('[id]', '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
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