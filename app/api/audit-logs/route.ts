import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/audit-logs
export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Audit logs GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
