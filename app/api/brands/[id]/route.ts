import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { verifyToken } from '@/lib/auth'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// PATCH /api/brands/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const body = await request.json()

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
        ...(body.status && { status: body.status }),
      },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    })

    await createAuditLog({
      action: 'BRAND_UPDATED',
      entityType: 'brand',
      entityId: brand.id,
      performedBy: admin?.name || 'System',
      details: `Updated brand: ${brand.name}`,
    })

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Brand PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/brands/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const brand = await prisma.brand.findUnique({ where: { id } })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    await prisma.brand.delete({ where: { id } })

    await createAuditLog({
      action: 'BRAND_DELETED',
      entityType: 'brand',
      entityId: id,
      performedBy: admin?.name || 'System',
      details: `Deleted brand: ${brand.name} (${brand.email})`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Brand DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
