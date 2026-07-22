import { NextRequest, NextResponse } from 'next/server'
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

// PATCH /api/designer/submissions/[id] — update or submit a submission
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const designer = await getDesigner(request)
    if (!designer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.quote.findUnique({
      where: { id },
      select: { designerId: true, status: true, projectName: true, quotationExpiresAt: true, quotationWindowHours: true, referenceImage: true, createdAt: true },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.designerId !== designer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { projectName, status, items, designerBudget, quotationWindowHours, referenceImage } = await request.json()

    // Map DECLINED from frontend to REJECTED in database if any, but designers don't reject their own submissions.
    // They can transition from DRAFT to SUBMITTED.
    const targetStatus = status === 'SUBMITTED' ? 'SUBMITTED' : (status || submission.status)
    const parsedWindowHours = quotationWindowHours === null || quotationWindowHours === undefined || quotationWindowHours === ''
      ? submission.quotationWindowHours
      : Number.parseInt(String(quotationWindowHours), 10)

    if (targetStatus === 'SUBMITTED' && (!parsedWindowHours || Number.isNaN(parsedWindowHours) || parsedWindowHours <= 0)) {
      return NextResponse.json({ error: 'Quotation window hours are required when submitting' }, { status: 400 })
    }

    // Update quote
    const updated = await prisma.quote.update({
      where: { id },
      data: {
        ...(projectName && { projectName }),
        status: targetStatus,
        ...(targetStatus === 'SUBMITTED' && {
          quotationWindowHours: parsedWindowHours,
          quotationExpiresAt: getQuotationExpiresAt(parsedWindowHours),
        }),
        ...(referenceImage !== undefined && { referenceImage: referenceImage || null }),
        designerBudget: designerBudget !== undefined ? (designerBudget ? parseFloat(designerBudget) : null) : undefined,
      },
      include: {
        brand: { select: { name: true } },
      },
    })

    // If items are provided, replace them
    if (items) {
      // Delete old items
      await prisma.submissionItem.deleteMany({ where: { quoteId: id } })
      // Create new ones
      if (items.length > 0) {
        await prisma.submissionItem.createMany({
          data: (items as SubmissionItemInput[]).map((item) => ({
            quoteId: id,
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
        })
      }
    }

    await createAuditLog({
      action: status === 'SUBMITTED' ? 'SUBMISSION_SUBMITTED' : 'SUBMISSION_UPDATED',
      entityType: 'quote',
      entityId: id,
      performedBy: designer.name,
      details: `Designer updated submission: ${updated.projectName} (${targetStatus})`,
    })

    return NextResponse.json({
      success: true,
      submission: {
        ...updated,
        quotationExpiresAt: getEffectiveQuotationExpiresAt(updated.quotationExpiresAt, updated.quotationWindowHours, updated.createdAt),
      },
    })
  } catch (error) {
    console.error('Designer submission PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/designer/submissions/[id] — delete draft submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const designer = await getDesigner(request)
    if (!designer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.quote.findUnique({
      where: { id },
      select: { designerId: true, status: true, projectName: true },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.designerId !== designer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Designers can only delete DRAFT submissions
    if (submission.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft submissions can be deleted' },
        { status: 400 }
      )
    }

    await prisma.quote.delete({ where: { id } })

    await createAuditLog({
      action: 'SUBMISSION_DELETED',
      entityType: 'quote',
      entityId: id,
      performedBy: designer.name,
      details: `Designer deleted draft submission: ${submission.projectName}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Designer submission DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
