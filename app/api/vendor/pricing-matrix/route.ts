import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { DEFAULT_MATRIX } from '@/lib/pricing-matrix'

async function getVendor(request: NextRequest) {
  const token = request.cookies.get('vendor-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/vendor/pricing-matrix
export async function GET(request: NextRequest) {
  try {
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cells = await prisma.pricingMatrixCell.findMany({
      where: { brandId: vendor.id }
    })

    if (cells.length === 0) {
      // Return fallback defaults
      return NextResponse.json({ cells: DEFAULT_MATRIX, isDefault: true })
    }

    return NextResponse.json({ cells, isDefault: false })
  } catch (error) {
    console.error('Pricing matrix GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/vendor/pricing-matrix
export async function PATCH(request: NextRequest) {
  try {
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cells } = await request.json()

    if (!cells || !Array.isArray(cells)) {
      return NextResponse.json({ error: 'Invalid cells list' }, { status: 400 })
    }

    // Process bulk upsert inside transaction
    interface MatrixCellInput {
      code: number
      hardware: string
      coreMaterial: string
      externalFinish: string
      price: number | string
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing pricing matrix cells for this brand
      await tx.pricingMatrixCell.deleteMany({
        where: { brandId: vendor.id }
      })

      // 2. Insert new ones
      if (cells.length > 0) {
        await tx.pricingMatrixCell.createMany({
          data: (cells as MatrixCellInput[]).map((cell) => ({
            brandId: vendor.id,
            code: Number(cell.code),
            hardware: cell.hardware,
            coreMaterial: cell.coreMaterial,
            externalFinish: cell.externalFinish,
            price: parseFloat(String(cell.price)) || 0
          }))
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Pricing matrix PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
