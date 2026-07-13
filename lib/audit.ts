import { prisma } from './prisma'

export async function createAuditLog({
  action,
  entityType,
  entityId,
  performedBy,
  details,
}: {
  action: string
  entityType: string
  entityId: string
  performedBy: string
  details?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        performedBy,
        details,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
