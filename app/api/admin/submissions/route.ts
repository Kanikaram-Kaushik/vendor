import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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
      include: { matrixCells: true },
    })

    // For each submission, compute estimations for each brand
    const enrichedSubmissions = submissions.map((sub) => {
      const brandEstimations = brands.map((brand) => {
        let totalCost = 0
        let isComplete = true

        sub.items.forEach((item) => {
          if (!item.itemType || !item.hardware || !item.coreMaterial || !item.externalFinish || !item.sft) {
            isComplete = false
            return
          }

          const matchedType = ITEM_TYPES.find(it => it.name === item.itemType)
          if (!matchedType) {
            isComplete = false
            return
          }

          const code = matchedType.code
          const cell = brand.matrixCells.find((c) => 
            c.code === code &&
            c.hardware.toUpperCase() === item.hardware!.toUpperCase() &&
            c.coreMaterial.toUpperCase() === item.coreMaterial!.toUpperCase() &&
            c.externalFinish.toUpperCase() === item.externalFinish!.toUpperCase()
          )

          if (cell) {
            totalCost += (item.sft || 0) * item.quantity * cell.price
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
        brandEstimations,
      }
    })

    return NextResponse.json({ submissions: enrichedSubmissions })
  } catch (error) {
    console.error('Admin submissions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
