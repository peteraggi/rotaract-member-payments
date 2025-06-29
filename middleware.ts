import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET
    
  });
  
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/registration'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  // Auth routes
  const authRoutes = ['/'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL(`/?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // if (isAuthRoute && token) {
  //   return NextResponse.redirect(new URL('/registration', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};