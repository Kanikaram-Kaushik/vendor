import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/seed — seeds the database with initial data
export async function POST() {
  try {
    // Clear existing data
    await prisma.auditLog.deleteMany()
    await prisma.quote.deleteMany()
    await prisma.brand.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.user.deleteMany()

    // Create users (admins + designers)
    const adminPassword = await bcrypt.hash('admin123', 12)
    const designerPassword = await bcrypt.hash('designer123', 12)

    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@designbhk.com',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    await prisma.user.createMany({
      data: [
        {
          name: 'Khursheed',
          email: 'kfm.hyd2005@gmail.com',
          password: designerPassword,
          role: 'DESIGNER',
        },
        {
          name: 'D3',
          email: 'designer@test.com',
          password: designerPassword,
          role: 'DESIGNER',
        },
        {
          name: 'D2',
          email: 'designertest2@gmail.com',
          password: designerPassword,
          role: 'DESIGNER',
        },
      ],
    })

    // Create brands (vendors)
    const brandPassword = await bcrypt.hash('brand123', 12)
    const brand1 = await prisma.brand.create({
      data: {
        name: 'Brand1',
        email: 'b1@gmail.com',
        phone: '9876543210',
        password: brandPassword,
        status: 'ACTIVE',
      },
    })
    const brand2 = await prisma.brand.create({
      data: {
        name: 'Brand2',
        email: 'b2@test.com',
        phone: '9876543211',
        password: brandPassword,
        status: 'ACTIVE',
      },
    })
    await prisma.brand.createMany({
      data: [
        { name: 'Brand3', email: 'b3@test.com', phone: '9876543212', password: brandPassword, status: 'ACTIVE' },
        { name: 'Brand4', email: 'brand@test.com', phone: '9876543213', password: brandPassword, status: 'ACTIVE' },
        { name: 'Brand5', email: 'b5@gmail.com', phone: '9876543214', password: brandPassword, status: 'ACTIVE' },
      ],
    })

    // Create customers
    const customerPassword = await bcrypt.hash('customer123', 12)
    await prisma.customer.create({
      data: {
        name: 'Demo Customer',
        email: 'demo.customer@designbhk.com',
        password: customerPassword,
      },
    })

    // Create quotes
    await prisma.quote.createMany({
      data: [
        { brandId: brand1.id, projectName: 'Project 12 Name', status: 'APPROVED' },
        { brandId: brand1.id, projectName: 'Project 13 Name', status: 'APPROVED' },
        { brandId: brand2.id, projectName: 'Project 14 Name', status: 'APPROVED' },
        { brandId: brand2.id, projectName: 'Project 15 Name', status: 'APPROVED' },
        { brandId: brand1.id, projectName: 'Project 16 Name', status: 'APPROVED' },
        { brandId: brand2.id, projectName: 'Project 17 Name', status: 'SUBMITTED' },
      ],
    })

    // Seed audit log
    await prisma.auditLog.create({
      data: {
        action: 'SEED_COMPLETED',
        entityType: 'system',
        entityId: 'seed',
        performedBy: 'System',
        details: 'Database seeded with initial data',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      credentials: {
        admin: { email: 'admin@designbhk.com', password: 'admin123' },
        designer: { email: 'designer@test.com', password: 'designer123' },
        brand: { email: 'b1@gmail.com', password: 'brand123' },
        customer: { email: 'demo.customer@designbhk.com', password: 'customer123' },
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 })
  }
}
