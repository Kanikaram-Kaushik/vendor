import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function getVendor(request: NextRequest) {
  const token = request.cookies.get('vendor-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/vendor/quotes — list quotes for this brand
export async function GET(request: NextRequest) {
  try {
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quotes = await prisma.quote.findMany({
      where: {
        brandId: vendor.id,
        // Typically, vendors see APPROVED or SUBMITTED quotes, let's show all
      },
      orderBy: { createdAt: 'desc' },
      include: {
        designer: { select: { name: true, email: true } },
        items: true,
      },
    })

    return NextResponse.json({
      quotes: quotes.map((q) => ({
        id: q.id,
        projectName: q.projectName,
        status: q.status === 'REJECTED' ? 'DECLINED' : q.status,
        designerName: q.designer ? q.designer.name : 'System/Admin',
        designerEmail: q.designer ? q.designer.email : '',
        itemsCount: q.items.length,
        items: q.items,
        createdAt: q.createdAt,
      })),
    })
  } catch (error) {
    console.error('Vendor quotes GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
