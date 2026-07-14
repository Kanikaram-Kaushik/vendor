import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

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
      select: { designerId: true, status: true, projectName: true },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.designerId !== designer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { projectName, status, items } = await request.json()

    // Map DECLINED from frontend to REJECTED in database if any, but designers don't reject their own submissions.
    // They can transition from DRAFT to SUBMITTED.
    const targetStatus = status === 'SUBMITTED' ? 'SUBMITTED' : (status || submission.status)

    // Update quote
    const updated = await prisma.quote.update({
      where: { id },
      data: {
        ...(projectName && { projectName }),
        status: targetStatus,
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
          data: items.map((item: any) => ({
            quoteId: id,
            description: item.description,
            quantity: item.quantity || 1,
            notes: item.notes || '',
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

    return NextResponse.json({ success: true, submission: updated })
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
