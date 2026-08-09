import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getEffectiveQuotationExpiresAt } from '@/lib/quote-window'
import { ITEM_TYPES, findMatrixPrice } from '@/lib/pricing-matrix'

async function getAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/admin/submissions — List all designer submissions with brand estimations
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all submissions where brandId is null and parentQuoteId is null
    const submissions = await prisma.quote.findMany({
      where: {
        brandId: null,
        parentQuoteId: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        designer: { select: { name: true, email: true } },
        items: true,
      },
    })

    // Fetch all active brands & pricing cells to calculate estimates
    const brands = await prisma.brand.findMany({
      where: { status: 'ACTIVE' },
      include: { 
        matrixCells: true,
        nonWoodMatrixCells: true 
      },
    })

    // For each submission, compute estimations for each brand
    const enrichedSubmissions = submissions.map((sub) => {
      const brandEstimations = brands.map((brand) => {
        let totalCost = 0
        let isComplete = true

        sub.items.forEach((item) => {
          if (!item.itemType) {
            isComplete = false
            return
          }

          let price: number | null = null

          const matchedType = ITEM_TYPES.find(it => it.name === item.itemType)
          if (matchedType && item.hardware && item.coreMaterial && item.externalFinish && item.sft) {
            price = findMatrixPrice(
              brand.matrixCells,
              matchedType.code,
              item.hardware,
              item.coreMaterial,
              item.externalFinish
            )
          } else {
            // Check non-wood items
            const unit = item.sft ? 'sft' : 'nos'
            const cell = brand.nonWoodMatrixCells.find(c => c.itemType === item.itemType && c.unit === unit)
            if (cell) {
              price = cell.price
            }
          }

          if (price != null) {
            const area = item.sft ? item.sft : item.quantity
            totalCost += area * price
          } else {
            isComplete = false
          }
        })

        return {
          brandId: brand.id,
          brandName: brand.name,
          totalCost: isComplete ? totalCost : null,
          isComplete,
        }
      })

      return {
        id: sub.id,
        projectName: sub.projectName,
        status: sub.status === 'REJECTED' ? 'DECLINED' : sub.status,
        designerName: sub.designer?.name || 'Unknown',
        designerEmail: sub.designer?.email || '',
        designerBudget: sub.designerBudget,
        itemsCount: sub.items.length,
        items: sub.items,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        quotationExpiresAt: getEffectiveQuotationExpiresAt(sub.quotationExpiresAt, sub.quotationWindowHours, sub.createdAt),
        referenceImage: sub.referenceImage,
        brandEstimations,
      }
    })

    return NextResponse.json({ submissions: enrichedSubmissions })
  } catch (error) {
    console.error('Admin submissions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
