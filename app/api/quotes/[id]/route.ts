import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { verifyToken } from '@/lib/auth'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// PATCH /api/quotes/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const { status, projectName } = await request.json()

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(projectName && { projectName }),
      },
      include: { brand: { select: { name: true } } },
    })

    await createAuditLog({
      action: 'QUOTE_UPDATED',
      entityType: 'quote',
      entityId: quote.id,
      performedBy: admin?.name || 'System',
      details: `Updated quote ${quote.projectName} → ${status}`,
    })

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Quote PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/quotes/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { brand: { select: { name: true } } },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    await prisma.quote.delete({ where: { id } })

    await createAuditLog({
      action: 'QUOTE_DELETED',
      entityType: 'quote',
      entityId: id,
      performedBy: admin?.name || 'System',
      details: `Deleted quote: ${quote.projectName} for ${quote.brand.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quote DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
