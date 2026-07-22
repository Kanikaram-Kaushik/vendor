import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function getVendor(request: NextRequest) {
  const token = request.cookies.get('vendor-token')?.value
  if (!token) return null
  return verifyToken(token)
}

const DEFAULT_MATRIX = [
  // Code 1 - EBCO
  { code: 1, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 900 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1000 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1200 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1000 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1200 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1400 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1000 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1200 },
  { code: 1, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1400 },

  // Code 1 - HETTICH
  { code: 1, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1050 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1150 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1350 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1150 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1350 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1550 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1150 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1350 },
  { code: 1, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1550 },

  // Code 1 - HAFELE
  { code: 1, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1200 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1300 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1500 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1300 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1500 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1700 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1300 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1500 },
  { code: 1, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1700 },

  // Code 2 - EBCO
  { code: 2, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1200 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1400 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1600 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1400 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1600 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1800 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1400 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1600 },
  { code: 2, hardware: 'EBCO', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1800 },

  // Code 2 - HETTICH
  { code: 2, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1350 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1550 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1750 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1550 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1750 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 1950 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1550 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1750 },
  { code: 2, hardware: 'HETTICH', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 1950 },

  // Code 2 - HAFELE
  { code: 2, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'Laminate', price: 1500 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'Acrylic', price: 1700 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'MR Ply', externalFinish: 'PU', price: 1900 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'Laminate', price: 1700 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'Acrylic', price: 1900 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'BWP Ply', externalFinish: 'PU', price: 2100 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'Laminate', price: 1700 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'Acrylic', price: 1900 },
  { code: 2, hardware: 'HAFELE', coreMaterial: 'HDHMR', externalFinish: 'PU', price: 2100 }
]

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
