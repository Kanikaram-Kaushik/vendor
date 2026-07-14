import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

async function getVendor(request: NextRequest) {
  const token = request.cookies.get('vendor-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { brand: { select: { name: true } } },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Verify this quote belongs to the vendor's brand
    if (quote.brandId !== vendor.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { status, items } = await request.json()

    // 1. Update items pricePerSft if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (!item.id) continue
        
        let priceValue: number | null = null
        if (item.pricePerSft !== undefined && item.pricePerSft !== null && item.pricePerSft !== '') {
          priceValue = parseFloat(item.pricePerSft)
          if (isNaN(priceValue)) priceValue = null
        }

        await prisma.submissionItem.update({
          where: { id: item.id, quoteId: id },
          data: { pricePerSft: priceValue },
        })
      }
    }

    // 2. Update quote status if provided
    let targetStatus = quote.status
    if (status) {
      if (status === 'DECLINED') {
        targetStatus = 'REJECTED'
      } else {
        targetStatus = status
      }
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status: targetStatus },
      include: { items: true },
    })

    await createAuditLog({
      action: 'QUOTE_PRICED_BY_VENDOR',
      entityType: 'quote',
      entityId: id,
      performedBy: vendor.name,
      details: `Vendor priced/updated quote: ${quote.projectName} (${targetStatus})`,
    })

    return NextResponse.json({ success: true, quote: updatedQuote })
  } catch (error) {
    console.error('Vendor quote PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
