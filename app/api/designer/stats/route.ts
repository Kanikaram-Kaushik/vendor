import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function getDesigner(request: NextRequest) {
  const token = request.cookies.get('designer-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const designer = await getDesigner(request)
    if (!designer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const designerId = designer.id

    // Fetch stats for this designer
    const [totalCount, draftCount, submittedCount, approvedCount, recentSubmissions] = await Promise.all([
      prisma.quote.count({ where: { designerId } }),
      prisma.quote.count({ where: { designerId, status: 'DRAFT' } }),
      prisma.quote.count({ where: { designerId, status: 'SUBMITTED' } }),
      prisma.quote.count({ where: { designerId, status: 'APPROVED' } }),
      prisma.quote.findMany({
        where: { designerId },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          brand: { select: { name: true } },
          _count: { select: { items: true } }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        total: totalCount,
        drafts: draftCount,
        submitted: submittedCount,
        approved: approvedCount
      },
      recent: recentSubmissions.map(q => ({
        id: q.id,
        customerName: q.brand.name,
        projectName: q.projectName,
        status: q.status,
        itemsCount: q._count.items,
        createdAt: q.createdAt
      }))
    })
  } catch (error) {
    console.error('Designer stats GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
