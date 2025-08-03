import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // For now, let the client-side handle authentication
  // The middleware will only handle basic route protection
  // Client-side components will handle the actual authentication logic
  
  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login', '/register'];
  
  // If it's a public route, allow access
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // For all other routes, let the client-side handle authentication
  // The ReduxProtectedRoute component will handle the actual auth checks
  return NextResponse.next();
}

// Configure which routes to run middleware on
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
