import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Admin-only routes
  if (pathname.startsWith('/admin/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url))
    }
    return NextResponse.next()
  }

  // Regular protected routes — redirect to login if no session
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tools/:path*',
    '/analytics/:path*',
    '/admin/dashboard/:path*',
  ],
}
