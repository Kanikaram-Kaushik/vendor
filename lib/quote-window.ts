export function getQuotationExpiresAt(windowHours?: number | null, baseDate = new Date()) {
  if (!windowHours || windowHours <= 0) return null
  return new Date(baseDate.getTime() + windowHours * 60 * 60 * 1000)
}

export function getEffectiveQuotationExpiresAt(
  expiresAt: Date | string | null | undefined,
  windowHours?: number | null,
  createdAt?: Date | string | null
) {
  if (expiresAt) return new Date(expiresAt)
  if (createdAt) return getQuotationExpiresAt(windowHours, new Date(createdAt))
  return null
}

export function isQuotationWindowClosed(
  expiresAt: Date | string | null | undefined,
  windowHours?: number | null,
  createdAt?: Date | string | null,
  now = new Date()
) {
  const effectiveExpiresAt = getEffectiveQuotationExpiresAt(expiresAt, windowHours, createdAt)
  if (!effectiveExpiresAt) return false
  return effectiveExpiresAt.getTime() <= now.getTime()
}