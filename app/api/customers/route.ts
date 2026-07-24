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

// GET /api/customers — list all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Customers GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/customers — create a new customer
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin(request)
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existing = await prisma.customer.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const customer = await prisma.customer.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    })

    await createAuditLog({
      action: 'CUSTOMER_CREATED',
      entityType: 'customer',
      entityId: customer.id,
      performedBy: admin?.name || 'System',
      details: `Created customer: ${name} (${email})`,
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error('Customers POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
