import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname === '/login' || pathname === '/customer/login' || pathname === '/designer/login' || pathname === '/vendor/login' || pathname === '/') {
    return NextResponse.next()
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await verifyToken(token)

    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }

    // Only ADMINs can access admin routes
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  // Protect /designer routes
  if (pathname.startsWith('/designer')) {
    const token = request.cookies.get('designer-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/designer/login', request.url))
    }

    const payload = await verifyToken(token)

    if (!payload) {
      const response = NextResponse.redirect(new URL('/designer/login', request.url))
      response.cookies.delete('designer-token')
      return response
    }

    // Only DESIGNERs can access designer routes
    if (payload.role !== 'DESIGNER') {
      return NextResponse.redirect(new URL('/designer/login', request.url))
    }

    return NextResponse.next()
  }

  // Protect /vendor routes
  if (pathname.startsWith('/vendor')) {
    const token = request.cookies.get('vendor-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/vendor/login', request.url))
    }

    const payload = await verifyToken(token)

    if (!payload) {
      const response = NextResponse.redirect(new URL('/vendor/login', request.url))
      response.cookies.delete('vendor-token')
      return response
    }

    // Only VENDORs can access vendor routes
    if (payload.role !== 'VENDOR') {
      return NextResponse.redirect(new URL('/vendor/login', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/designer/:path*', '/vendor/:path*', '/login', '/customer/login', '/designer/login', '/vendor/login'],
}
