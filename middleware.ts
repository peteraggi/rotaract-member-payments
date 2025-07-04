// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(request: NextRequest) {
//   const token = await getToken({ 
//     req: request,
//     secret: process.env.AUTH_SECRET
    
//   });
  
//   const { pathname, searchParams } = request.nextUrl;

//   // Protected routes
//   const protectedRoutes = ['/registration'];
//   const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

//   // Auth routes
//   const authRoutes = ['/'];
//   const isAuthRoute = authRoutes.includes(pathname);

//   if (isProtected && !token) {
//     return NextResponse.redirect(
//       new URL(`/?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
//     );
//   }

//   // if (isAuthRoute && token) {
//   //   return NextResponse.redirect(new URL('/registration', request.url));
//   // }
//   const isFromCallback = searchParams.has('callbackUrl');

//   if (isAuthRoute && token && !isFromCallback) {
//   return NextResponse.rewrite(new URL("/registration", request.url))};

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET
  });
  
  const { pathname, searchParams } = request.nextUrl;

  // 1. Define your actual protected routes (dashboard, profile, etc.)
  const protectedRoutes = ['/dashboard', '/profile']; // Add your real protected routes here
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  // 2. Auth route (login page)
  const isLoginPage = pathname === '/';

  // 3. Homepage route
  const isHomePage = pathname === '/registration';

  // Rule 1: If trying to access protected route without token → redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL(`/?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // Rule 2: If already logged in and trying to access login page → redirect to homepage
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/registration', request.url));
  }

  // Rule 3: Allow everyone to access homepage (/registration)
  if (isHomePage) {
    return NextResponse.next();
  }

  // Default: Continue with request
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};