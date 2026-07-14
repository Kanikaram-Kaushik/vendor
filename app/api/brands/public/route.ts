import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('auth-token')?.value
    const designerToken = request.cookies.get('designer-token')?.value

    const payload = (adminToken ? await verifyToken(adminToken) : null) || 
                    (designerToken ? await verifyToken(designerToken) : null)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brands = await prisma.brand.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Brands public GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
