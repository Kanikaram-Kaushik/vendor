import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Clearing existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding users...')
  const adminPassword = await bcrypt.hash('admin123', 12)
  const designerPassword = await bcrypt.hash('designer123', 12)

  await prisma.user.create({
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

  console.log('Seeding brands...')
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

  console.log('Seeding quotes...')
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

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
