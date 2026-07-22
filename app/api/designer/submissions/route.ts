import { NextRequest, NextResponse } from 'next/server'
import { QuoteStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { getEffectiveQuotationExpiresAt, getQuotationExpiresAt } from '@/lib/quote-window'

interface SubmissionItemInput {
  description: string
  quantity?: number
  notes?: string
  itemType?: string | null
  hardware?: string | null
  coreMaterial?: string | null
  externalFinish?: string | null
  sft?: number | string | null
  image?: string | null
}

async function getDesigner(request: NextRequest) {
  const token = request.cookies.get('designer-token')?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/designer/submissions — list designer's own submissions
export async function GET(request: NextRequest) {
  try {
    const designer = await getDesigner(request)
    if (!designer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // ALL, DRAFT, SUBMITTED, APPROVED, DECLINED

    let dbStatus: QuoteStatus | undefined = undefined
    if (status && status !== 'ALL') {
      if (status === 'DECLINED') {
        dbStatus = 'REJECTED'
      } else if (Object.values(QuoteStatus).includes(status as QuoteStatus)) {
        dbStatus = status as QuoteStatus
      }
    }

    const submissions = await prisma.quote.findMany({
      where: {
        designerId: designer.id,
        parentQuoteId: null, // Only fetch parent submissions
        ...(dbStatus && { status: dbStatus }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { name: true, email: true } },
        items: true,
      },
    })

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        brandId: s.brandId,
        brandName: s.brand?.name || 'Pending Distribution',
        brandEmail: s.brand?.email || '',
        projectName: s.projectName,
        status: s.status === 'REJECTED' ? 'DECLINED' : s.status,
        designerBudget: s.designerBudget,
        itemsCount: s.items.length,
        items: s.items,
        createdAt: s.createdAt,
        quotationExpiresAt: getEffectiveQuotationExpiresAt(s.quotationExpiresAt, s.quotationWindowHours, s.createdAt),
      })),
    })
  } catch (error) {
    console.error('Designer submissions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/designer/submissions — create new submission
export async function POST(request: NextRequest) {
  try {
    const designer = await getDesigner(request)
    if (!designer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectName, status, items, designerBudget, quotationWindowHours, referenceImage } = await request.json()

    if (!projectName) {
      return NextResponse.json(
        { error: 'Project Name is required' },
        { status: 400 }
      )
    }

    // Default status is DRAFT unless specified otherwise
    const targetStatus = status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT'
    const parsedWindowHours = quotationWindowHours === null || quotationWindowHours === undefined || quotationWindowHours === ''
      ? null
      : Number.parseInt(String(quotationWindowHours), 10)

    if (targetStatus === 'SUBMITTED' && (!parsedWindowHours || Number.isNaN(parsedWindowHours) || parsedWindowHours <= 0)) {
      return NextResponse.json({ error: 'Quotation window hours are required when submitting' }, { status: 400 })
    }

    // Create the quote
    const submission = await prisma.quote.create({
      data: {
        projectName,
        designerId: designer.id,
        status: targetStatus,
        quotationWindowHours: targetStatus === 'SUBMITTED' ? parsedWindowHours : null,
        quotationExpiresAt: targetStatus === 'SUBMITTED' ? getQuotationExpiresAt(parsedWindowHours) : null,
        referenceImage: referenceImage || null,
        designerBudget: designerBudget ? parseFloat(designerBudget) : null,
        ...(items && items.length > 0 && {
          items: {
            create: (items as SubmissionItemInput[]).map((item) => ({
              description: item.description,
              quantity: item.quantity || 1,
              notes: item.notes || '',
              itemType: item.itemType || null,
              hardware: item.hardware || null,
              coreMaterial: item.coreMaterial || null,
              externalFinish: item.externalFinish || null,
              sft: item.sft != null ? parseFloat(String(item.sft)) : null,
              image: item.image || null,
            })),
          },
        }),
      },
      include: {
        items: true,
      },
    })

    await createAuditLog({
      action: targetStatus === 'SUBMITTED' ? 'SUBMISSION_SUBMITTED' : 'SUBMISSION_DRAFT_CREATED',
      entityType: 'quote',
      entityId: submission.id,
      performedBy: designer.name,
      details: `Designer created submission: ${projectName} (${targetStatus})`,
    })

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        brandName: 'Pending Distribution',
        projectName: submission.projectName,
        status: submission.status,
        itemsCount: submission.items.length,
        createdAt: submission.createdAt,
        quotationWindowHours: submission.quotationWindowHours,
        quotationExpiresAt: submission.quotationExpiresAt,
        referenceImage: submission.referenceImage,
      },
    })
  } catch (error) {
    console.error('Designer submissions POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
