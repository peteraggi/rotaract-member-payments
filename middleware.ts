import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET
    
  });
  
  const { pathname, searchParams } = request.nextUrl;

  const callbackUrl = searchParams.get('callbackUrl') || '/registration';

  // Public routes that don't need protection
  const publicRoutes = ['/', '/auth','/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes
  const protectedRoutes = ['/registration'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Handle protected routes without token
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/', request.url);
    signInUrl.searchParams.set('callbackUrl', encodeURIComponent(request.url));
    return NextResponse.redirect(signInUrl);
  }

  // Handle auth routes with token
  if (pathname === '/' && token) {
    // If coming from callback, proceed to the callbackUrl
    if (searchParams.has('callbackUrl')) {
      const callbackUrl = searchParams.get('callbackUrl')!;
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    // Otherwise redirect to default protected route
    return NextResponse.redirect(new URL('/registration', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};