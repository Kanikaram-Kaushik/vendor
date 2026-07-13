import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalUsers, totalBrands, totalQuotes, quotePipeline, recentQuotes, recentBrands, recentAuditLogs] =
      await Promise.all([
        prisma.user.count(),
        prisma.brand.count(),
        prisma.quote.count(),
        prisma.quote.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        prisma.quote.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: { brand: { select: { name: true } } },
        }),
        prisma.brand.findMany({
          take: 4,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
      ])

    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const designerCount = await prisma.user.count({ where: { role: 'DESIGNER' } })

    const pipeline = {
      SUBMITTED: 0,
      APPROVED: 0,
      REJECTED: 0,
      ACTIVE: 0,
    }
    quotePipeline.forEach((item) => {
      pipeline[item.status as keyof typeof pipeline] = item._count.status
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBrands,
        totalQuotes,
        adminCount,
        designerCount,
      },
      pipeline,
      recentQuotes: recentQuotes.map((q) => ({
        id: q.id,
        brandName: q.brand.name,
        projectName: q.projectName,
        status: q.status,
        createdAt: q.createdAt,
      })),
      recentBrands: recentBrands.map((b) => ({
        id: b.id,
        name: b.name,
        email: b.email,
        status: b.status,
        createdAt: b.createdAt,
      })),
      recentAuditLogs: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        performedBy: log.performedBy,
        details: log.details,
        createdAt: log.createdAt,
      })),
    })
  } catch (error) {
    console.error('Overview error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
