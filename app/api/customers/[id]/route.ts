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

// PATCH /api/customers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const { name, email, password } = await request.json()

    const updateData: Record<string, string> = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.password = await bcrypt.hash(password, 12)

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    })

    await createAuditLog({
      action: 'CUSTOMER_UPDATED',
      entityType: 'customer',
      entityId: customer.id,
      performedBy: admin?.name || 'System',
      details: `Updated customer: ${customer.name}`,
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Customer PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/customers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const customer = await prisma.customer.findUnique({ where: { id } })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    await prisma.customer.delete({ where: { id } })

    await createAuditLog({
      action: 'CUSTOMER_DELETED',
      entityType: 'customer',
      entityId: id,
      performedBy: admin?.name || 'System',
      details: `Deleted customer: ${customer.name} (${customer.email})`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Customer DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
