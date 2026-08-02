import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { getEffectiveQuotationExpiresAt } from '@/lib/quote-window'
import { ITEM_TYPES, findMatrixPrice } from '@/lib/pricing-matrix'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await getAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const quotationExpiresAt = getEffectiveQuotationExpiresAt(submission.quotationExpiresAt, submission.quotationWindowHours, submission.createdAt)

    const { brandIds } = await request.json()
    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      return NextResponse.json({ error: 'At least one brand must be selected' }, { status: 400 })
    }

    // Process each brand
    for (const brandId of brandIds) {
      // 1. Fetch brand pricing cells to pre-fill prices
      const brandCells = await prisma.pricingMatrixCell.findMany({
        where: { brandId }
      })

      // 2. Create the quote copy for this brand
      const brandQuote = await prisma.quote.create({
        data: {
          brandId,
          designerId: submission.designerId,
          projectName: submission.projectName,
          parentQuoteId: submission.id,
          status: 'SUBMITTED', // Set status to SUBMITTED so the brand sees it
          quotationWindowHours: submission.quotationWindowHours,
          quotationExpiresAt,
          referenceImage: submission.referenceImage,
          designerBudget: submission.designerBudget,
        }
      })

      // 3. Create copied items, calculating prices from matrix where possible
      const itemsToCreate = submission.items.map((item) => {
        let estimatedPrice: number | null = null

        if (item.itemType && item.hardware && item.coreMaterial && item.externalFinish) {
          const matchedType = ITEM_TYPES.find(it => it.name === item.itemType)
          if (matchedType) {
            estimatedPrice = findMatrixPrice(
              brandCells,
              matchedType.code,
              item.hardware,
              item.coreMaterial,
              item.externalFinish
            )
          }
        }

        return {
          quoteId: brandQuote.id,
          description: item.description,
          quantity: item.quantity,
          notes: item.notes,
          itemType: item.itemType,
          hardware: item.hardware,
          coreMaterial: item.coreMaterial,
          externalFinish: item.externalFinish,
          sft: item.sft,
          image: item.image,
          pricePerSft: estimatedPrice, // Pre-fill price from matrix!
        }
      })

      await prisma.submissionItem.createMany({
        data: itemsToCreate
      })
    }

    // 4. Update the parent submission status to APPROVED
    await prisma.quote.update({
      where: { id },
      data: { status: 'APPROVED' }
    })

    await createAuditLog({
      action: 'SUBMISSION_APPROVED_AND_DISTRIBUTED',
      entityType: 'quote',
      entityId: id,
      performedBy: admin.name,
      details: `Admin approved submission "${submission.projectName}" and distributed to ${brandIds.length} brands.`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submission approval error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
