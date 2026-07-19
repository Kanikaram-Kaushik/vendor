import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

async function getVendor(request: NextRequest) {
  const token = request.cookies.get('vendor-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/vendor/hiring — Get all hiring posts from all vendors
export async function GET(request: NextRequest) {
  try {
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await prisma.hiringPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            email: true,
            logo: true,
          },
        },
      },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Hiring GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/vendor/hiring — Create a hiring post
export async function POST(request: NextRequest) {
  try {
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, role, location, salary, contactInfo } = body

    if (!title || !description || !role) {
      return NextResponse.json({ error: 'Title, description, and role are required.' }, { status: 400 })
    }

    const post = await prisma.hiringPost.create({
      data: {
        brandId: vendor.id,
        title,
        description,
        role,
        location,
        salary,
        contactInfo,
      },
    })

    await createAuditLog({
      action: 'HIRING_POST_CREATED',
      entityType: 'HiringPost',
      entityId: post.id,
      performedBy: vendor.name,
      details: `Created job post: ${title} (${role})`,
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Hiring POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/vendor/hiring — Delete a hiring post
export async function DELETE(request: NextRequest) {
  try {
    const vendor = await getVendor(request)
    if (!vendor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const post = await prisma.hiringPost.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: 'Hiring post not found' }, { status: 404 })
    }

    if (post.brandId !== vendor.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.hiringPost.delete({
      where: { id },
    })

    await createAuditLog({
      action: 'HIRING_POST_DELETED',
      entityType: 'HiringPost',
      entityId: id,
      performedBy: vendor.name,
      details: `Deleted job post: ${post.title}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hiring DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
