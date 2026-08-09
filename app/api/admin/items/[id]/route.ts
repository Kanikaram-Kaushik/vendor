import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// PATCH /api/admin/items/[id] — Update sub item description/notes by Admin
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notes, description } = await request.json()

    const updatedItem = await prisma.submissionItem.update({
      where: { id },
      data: {
        ...(notes !== undefined ? { notes } : {}),
        ...(description !== undefined ? { description } : {})
      }
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Admin item patch error:', error)
    return NextResponse.json({ error: 'Failed to update item description' }, { status: 500 })
  }
}
