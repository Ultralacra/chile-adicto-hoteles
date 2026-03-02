import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteByDomain } from '@/lib/sites-config';

const ALLOWED_CORS_ORIGINS = new Set([
  'https://chile-adicto-hoteles-front.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
]);

function applyCorsHeaders(response: NextResponse, origin: string | null) {
  if (!origin || !ALLOWED_CORS_ORIGINS.has(origin)) return response;

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-admin-key, x-site-id, x-site-name',
  );
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.set('Vary', 'Origin');

  return response;
}

/**
 * Middleware to detect the current site based on domain
 * and inject site context into headers for API routes
 */
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  if (isApiRoute && request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    return applyCorsHeaders(preflight, origin);
  }

  const hostname = request.headers.get('host') || '';
  
  // Detect which site we're on based on the domain
  const site = getSiteByDomain(hostname);
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Add the site ID to headers so API routes can access it
  requestHeaders.set('x-site-id', site.id);
  requestHeaders.set('x-site-name', site.name);
  
  // Also add to URL for debugging if needed (optional)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Add site info to response headers for client-side access if needed
  response.headers.set('x-site-id', site.id);

  if (isApiRoute) {
    applyCorsHeaders(response, origin);
  }
  
  return response;
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
