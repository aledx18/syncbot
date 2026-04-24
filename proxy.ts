// proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const AUTH_ROUTES = ['/auth/sign-in', '/auth/sign-up']
const PROTECTED_ROUTES = ['/dashboard']

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  // Si tiene sesión y va a sign-in o sign-up → redirigir al dashboard
  if (
    sessionCookie &&
    AUTH_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si no tiene sesión y va a una ruta protegida → redirigir al login
  if (
    !sessionCookie &&
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/sign-in', '/auth/sign-up']
}
