import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

const ITEM_TYPES = [
  { name: 'Tv Cabinet', code: 1 },
  { name: 'Crockery Unit', code: 2 },
  { name: 'Puja Unit', code: 2 },
  { name: 'Partition', code: 1 },
  { name: 'Wardrobe', code: 2 },
  { name: 'Tv Unit', code: 1 },
  { name: 'Study Unit', code: 1 },
  { name: 'Bed', code: 2 },
  { name: 'Bedside Table', code: 1 },
  { name: 'Dressing Unit', code: 2 },
  { name: 'Base Unit (Kitchen)', code: 2 },
  { name: 'Wall Unit (Kitchen)', code: 2 },
  { name: 'Loft', code: 1 },
  { name: 'Tall units (Kitchen)', code: 2 },
  { name: 'Shoerack', code: 1 }
]

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
          designerBudget: submission.designerBudget,
        }
      })

      // 3. Create copied items, calculating prices from matrix where possible
      const itemsToCreate = submission.items.map((item) => {
        let estimatedPrice: number | null = null

        if (item.itemType && item.hardware && item.coreMaterial && item.externalFinish) {
          const matchedType = ITEM_TYPES.find(it => it.name === item.itemType)
          if (matchedType) {
            const code = matchedType.code
            const cell = brandCells.find((c) =>
              c.code === code &&
              c.hardware.toUpperCase() === item.hardware!.toUpperCase() &&
              c.coreMaterial.toUpperCase() === item.coreMaterial!.toUpperCase() &&
              c.externalFinish.toUpperCase() === item.externalFinish!.toUpperCase()
            )
            if (cell) {
              estimatedPrice = cell.price
            }
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
