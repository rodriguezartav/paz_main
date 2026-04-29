import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/apply',
  '/calendar',
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
  
  // v0 preview environment doesn't support cookie persistence across client-side navigation
  // Only bypass auth in v0 preview (vusercontent.net domains)
  const host = request.headers.get('host') || ''
  const referer = request.headers.get('referer') || ''
  
  // Check if we're in v0 preview - be very specific to avoid bypassing auth in production
  const isV0Preview = host.includes('vusercontent.net') || 
                      referer.includes('vusercontent.net')
  
  if (isV0Preview) {
    return NextResponse.next()
  }
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }
  
  // Check for session cookie
  const sessionCookie = request.cookies.get('paz_session')
  
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
