import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

async function getVendor(request: NextRequest) {
  const token = request.cookies.get('vendor-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/vendor/profile
export async function GET(request: NextRequest) {
  try {
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brand = await prisma.brand.findUnique({
      where: { id: vendor.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        coverImage: true,
        logo: true,
        description: true,
        addressLine1: true,
        addressLine2: true,
        locality: true,
        city: true,
        state: true,
        pincode: true,
        latitude: true,
        longitude: true,
        website: true,
        linkedin: true,
        facebook: true,
        twitter: true,
        instagram: true,
        portfolio: true,
      },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Vendor profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/vendor/profile
export async function PUT(request: NextRequest) {
  try {
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const updated = await prisma.brand.update({
      where: { id: vendor.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        coverImage: body.coverImage,
        logo: body.logo,
        description: body.description,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        locality: body.locality,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        latitude: body.latitude,
        longitude: body.longitude,
        website: body.website,
        linkedin: body.linkedin,
        facebook: body.facebook,
        twitter: body.twitter,
        instagram: body.instagram,
        portfolio: body.portfolio ? JSON.stringify(body.portfolio) : null,
      },
      select: { id: true, name: true, email: true },
    })

    await createAuditLog({
      action: 'VENDOR_PROFILE_UPDATED',
      entityType: 'brand',
      entityId: vendor.id,
      performedBy: updated.name,
      details: `Vendor updated profile details`,
    })

    return NextResponse.json({ success: true, brand: updated })
  } catch (error) {
    console.error('Vendor profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
