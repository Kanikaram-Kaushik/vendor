import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { verifyToken } from '@/lib/auth'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/quotes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const quotes = await prisma.quote.findMany({
      where: {
        brandId: { not: null },
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: 'desc' },
      include: { brand: { select: { name: true, email: true } } },
    })

    return NextResponse.json({
      quotes: quotes.map((q) => ({
        id: q.id,
        brandId: q.brandId,
        brandName: q.brand?.name || 'Pending Distribution',
        brandEmail: q.brand?.email || '',
        projectName: q.projectName,
        status: q.status,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Quotes GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/quotes
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin(request)
    const { brandId, projectName, status } = await request.json()

    if (!brandId || !projectName) {
      return NextResponse.json({ error: 'brandId and projectName are required' }, { status: 400 })
    }

    const quote = await prisma.quote.create({
      data: { brandId, projectName, status: status || 'SUBMITTED' },
      include: { brand: { select: { name: true } } },
    })

    await createAuditLog({
      action: 'QUOTE_CREATED',
      entityType: 'quote',
      entityId: quote.id,
      performedBy: admin?.name || 'System',
      details: `Created quote: ${projectName} for ${quote.brand?.name || 'Unknown'}`,
    })

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    console.error('Quotes POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
