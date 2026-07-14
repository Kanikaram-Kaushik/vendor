import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // 1. Try to find the email in the User table (ADMIN or DESIGNER)
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const token = await signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })

      let redirect = '/admin/overview'
      let cookieName = 'auth-token'

      if (user.role === 'DESIGNER') {
        redirect = '/designer/submissions'
        cookieName = 'designer-token'
      }

      await createAuditLog({
        action: `${user.role}_LOGIN`,
        entityType: 'user',
        entityId: user.id,
        performedBy: user.name,
        details: `${user.role} login from ${request.headers.get('x-forwarded-for') || 'unknown'}`,
      })

      const response = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        redirect,
      })

      response.cookies.set(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return response
    }

    // 2. Try to find the email in the Brand table (VENDOR / Brand)
    const brand = await prisma.brand.findUnique({ where: { email } })

    if (brand) {
      if (brand.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Access denied. Account is inactive or pending approval.' },
          { status: 403 }
        )
      }

      const passwordMatch = await bcrypt.compare(password, brand.password)
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const token = await signToken({
        id: brand.id,
        name: brand.name,
        email: brand.email,
        role: 'VENDOR',
      })

      await createAuditLog({
        action: 'VENDOR_LOGIN',
        entityType: 'brand',
        entityId: brand.id,
        performedBy: brand.name,
        details: `Vendor login from ${request.headers.get('x-forwarded-for') || 'unknown'}`,
      })

      const response = NextResponse.json({
        success: true,
        brand: { id: brand.id, name: brand.name, email: brand.email },
        redirect: '/vendor/quotations',
      })

      response.cookies.set('vendor-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return response
    }

    // 3. If neither table has a match
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Unified login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
