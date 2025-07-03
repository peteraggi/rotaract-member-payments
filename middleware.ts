import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// export async function middleware(request: NextRequest) {
//   const token = await getToken({ 
//     req: request,
//     secret: process.env.AUTH_SECRET
    
//   });
  
//   const { pathname, searchParams } = request.nextUrl;

//   const callbackUrl = searchParams.get('callbackUrl') || '/registration';

//   // Public routes that don't need protection
//   const publicRoutes = ['/', '/auth','/login'];
//   const isPublicRoute = publicRoutes.includes(pathname);

//   // Protected routes
//   const protectedRoutes = ['/registration'];
//   const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

//   // Handle protected routes without token
//   if (isProtectedRoute && !token) {
//     const signInUrl = new URL('/', request.url);
//     signInUrl.searchParams.set('callbackUrl', encodeURIComponent(request.url));
//     return NextResponse.redirect(signInUrl);
//   }

//   // Handle auth routes with token
//   if (pathname === '/registration') {
//     if (!token) {
//       return NextResponse.redirect(
//         new URL(`/?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
//       );
//     }
//     return NextResponse.next();
//   }
// }

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
// };


export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const { pathname, searchParams } = request.nextUrl;
  
  // Decode any existing callbackUrl
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/registration';
  const callbackUrl = decodeURIComponent(rawCallbackUrl);

  // Protected routes
  if (pathname.startsWith('/registration')) {
    if (!token) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname); // Single encode
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from login
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }

  return NextResponse.next();
}