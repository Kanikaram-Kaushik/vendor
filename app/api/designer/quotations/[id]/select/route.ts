import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

async function getDesigner(request: NextRequest) {
  const token = request.cookies.get('designer-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// POST /api/designer/quotations/[id]/select — Approve/select a brand quotation for a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const designer = await getDesigner(request)
    if (!designer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the target child quote
    const childQuote = await prisma.quote.findUnique({
      where: { id },
      include: {
        parentQuote: true,
        brand: { select: { name: true } },
      },
    })

    if (!childQuote || !childQuote.parentQuote) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    const parentQuote = childQuote.parentQuote

    // Verify ownership
    if (parentQuote.designerId !== designer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Update target child quote to APPROVED
    await prisma.quote.update({
      where: { id: childQuote.id },
      data: { status: 'APPROVED' },
    })

    // 2. Reject sibling child quotes
    await prisma.quote.updateMany({
      where: {
        parentQuoteId: parentQuote.id,
        id: { not: childQuote.id },
      },
      data: { status: 'REJECTED' },
    })

    // 3. Update parent quote: set brandId, status to ACTIVE (representing finalised contract/active project)
    await prisma.quote.update({
      where: { id: parentQuote.id },
      data: {
        brandId: childQuote.brandId,
        status: 'ACTIVE',
      },
    })

    // 4. Copy item prices from selected child quote to parent quote items
    const parentItems = await prisma.submissionItem.findMany({
      where: { quoteId: parentQuote.id },
    })
    const childItems = await prisma.submissionItem.findMany({
      where: { quoteId: childQuote.id },
    })

    for (const pItem of parentItems) {
      const cItem = childItems.find((c) => c.description === pItem.description)
      if (cItem && cItem.pricePerSft !== null) {
        await prisma.submissionItem.update({
          where: { id: pItem.id },
          data: { pricePerSft: cItem.pricePerSft },
        })
      }
    }

    await createAuditLog({
      action: 'DESIGNER_SELECTED_BRAND_QUOTE',
      entityType: 'quote',
      entityId: parentQuote.id,
      performedBy: designer.name,
      details: `Designer approved quotation from ${childQuote.brand?.name || 'Unknown'} for project "${parentQuote.projectName}"`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Designer select quotation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
