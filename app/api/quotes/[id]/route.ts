import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { verifyToken } from '@/lib/auth'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/quotes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            name: true,
            email: true,
            phone: true,
            description: true,
            addressLine1: true,
            addressLine2: true,
            locality: true,
            city: true,
            state: true,
            pincode: true,
            termsAndConditions: true,
          },
        },
        items: true,
        parentQuote: { select: { projectName: true, designerBudget: true, referenceImage: true } },
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    let totalPrice = 0
    let isFullyPriced = true
    quote.items.forEach((item) => {
      if (item.pricePerSft !== null && item.pricePerSft !== undefined) {
        totalPrice += (item.sft || 0) * item.quantity * item.pricePerSft
      } else {
        isFullyPriced = false
      }
    })

    return NextResponse.json({
      quote: {
        id: quote.id,
        brandId: quote.brandId,
        brandName: quote.brand?.name || 'Unknown Brand',
        brandEmail: quote.brand?.email || '',
        brandPhone: quote.brand?.phone || '',
        brandDescription: quote.brand?.description || '',
        brandAddressLine1: quote.brand?.addressLine1 || '',
        brandAddressLine2: quote.brand?.addressLine2 || '',
        brandLocality: quote.brand?.locality || '',
        brandCity: quote.brand?.city || '',
        brandState: quote.brand?.state || '',
        brandPincode: quote.brand?.pincode || '',
        projectName: quote.parentQuote?.projectName || quote.projectName,
        designerBudget: quote.parentQuote?.designerBudget || quote.designerBudget,
        status: quote.status === 'REJECTED' ? 'DECLINED' : quote.status,
        itemsCount: quote.items.length,
        items: quote.items,
        totalPrice: isFullyPriced ? totalPrice : null,
        isFullyPriced,
        createdAt: quote.createdAt,
        parentQuoteId: quote.parentQuoteId,
        referenceImage: quote.parentQuote?.referenceImage || quote.referenceImage,
        brandTerms: quote.brand?.termsAndConditions || null,
      }
    })
  } catch (error) {
    console.error('Admin GET quote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/quotes/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const { status, projectName } = await request.json()

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(projectName && { projectName }),
      },
      include: { brand: { select: { name: true } } },
    })

    await createAuditLog({
      action: 'QUOTE_UPDATED',
      entityType: 'quote',
      entityId: quote.id,
      performedBy: admin?.name || 'System',
      details: `Updated quote ${quote.projectName} → ${status}`,
    })

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Quote PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/quotes/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { brand: { select: { name: true } } },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    await prisma.quote.delete({ where: { id } })

    await createAuditLog({
      action: 'QUOTE_DELETED',
      entityType: 'quote',
      entityId: id,
      performedBy: admin?.name || 'System',
      details: `Deleted quote: ${quote.projectName} for ${quote.brand?.name || 'Pending Distribution'}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quote DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
