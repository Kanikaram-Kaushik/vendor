import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: { select: { quotes: true } },
      },
    })
    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Brands GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/brands
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin(request)
    const { name, email, phone, password, status } = await request.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existing = await prisma.brand.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const brand = await prisma.brand.create({
      data: { name, email, phone, password: hashedPassword, status: status || 'ACTIVE' },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    })

    await createAuditLog({
      action: 'BRAND_CREATED',
      entityType: 'brand',
      entityId: brand.id,
      performedBy: admin?.name || 'System',
      details: `Created brand: ${name} (${email})`,
    })

    return NextResponse.json({ brand }, { status: 201 })
  } catch (error) {
    console.error('Brands POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
