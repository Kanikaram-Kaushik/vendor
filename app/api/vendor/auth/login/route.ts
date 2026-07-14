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

    const brand = await prisma.brand.findUnique({ where: { email } })

    if (!brand) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

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
    })

    response.cookies.set('vendor-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Vendor login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
