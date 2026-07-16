import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function getDesigner(request: NextRequest) {
  const token = request.cookies.get('designer-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/designer/quotations — list brand quotations received for designer's submissions
export async function GET(request: NextRequest) {
  try {
    const designer = await getDesigner(request)
    if (!designer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch child quotes where parentQuote.designerId matches
    const quotes = await prisma.quote.findMany({
      where: {
        parentQuoteId: { not: null },
        parentQuote: {
          designerId: designer.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { name: true, email: true } },
        items: true,
        parentQuote: { select: { projectName: true, designerBudget: true } },
      },
    })

    return NextResponse.json({
      quotations: quotes.map((q) => {
        // Calculate total price of the quotation
        let totalPrice = 0
        let isFullyPriced = true

        q.items.forEach((item) => {
          if (item.pricePerSft !== null && item.pricePerSft !== undefined) {
            totalPrice += (item.sft || 0) * item.quantity * item.pricePerSft
          } else {
            isFullyPriced = false
          }
        })

        return {
          id: q.id,
          brandId: q.brandId,
          brandName: q.brand?.name || 'Unknown Brand',
          brandEmail: q.brand?.email || '',
          projectName: q.parentQuote?.projectName || q.projectName,
          designerBudget: q.parentQuote?.designerBudget || q.designerBudget,
          status: q.status === 'REJECTED' ? 'DECLINED' : q.status,
          itemsCount: q.items.length,
          items: q.items,
          totalPrice: isFullyPriced ? totalPrice : null,
          isFullyPriced,
          createdAt: q.createdAt,
          parentQuoteId: q.parentQuoteId,
        }
      }),
    })
  } catch (error) {
    console.error('Designer quotations GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
