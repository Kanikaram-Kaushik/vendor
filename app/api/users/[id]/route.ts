import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { verifyToken } from '@/lib/auth'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// PATCH /api/users/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const { name, email, role } = await request.json()

    const user = await prisma.user.update({
      where: { id },
      data: { ...(name && { name }), ...(email && { email }), ...(role && { role }) },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    await createAuditLog({
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: user.id,
      performedBy: admin?.name || 'System',
      details: `Updated user: ${user.name}`,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    await createAuditLog({
      action: 'USER_DELETED',
      entityType: 'user',
      entityId: id,
      performedBy: admin?.name || 'System',
      details: `Deleted user: ${user.name} (${user.email})`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
