import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth';

const publicPaths = ['/login', '/'];
const adminOnlyPaths = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check for auth token
  const authToken = request.cookies.get('auth-token')?.value;
  
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Validate token
  const user = validateAuthToken(authToken);
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
  
  // Check admin-only paths
  if (adminOnlyPaths.some(path => pathname.startsWith(path))) {
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};