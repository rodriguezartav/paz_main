import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/dashboard',
  '/login',
  '/apply',
  '/auth/callback',
  '/setup',
]

// Check if path starts with any public route
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }
  
  // Check for session cookie
  const sessionCookie = request.cookies.get('paz_session')
  
  console.log('[v0] Middleware checking path:', pathname, 'Cookie present:', !!sessionCookie?.value)
  
  if (!sessionCookie?.value) {
    // Redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // Session exists, allow request
  return NextResponse.next()
}
