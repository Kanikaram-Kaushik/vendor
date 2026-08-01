export function getQuotationExpiresAt(windowHours?: number | null, baseDate = new Date()) {
  if (!windowHours || windowHours <= 0) return null
  return new Date(baseDate.getTime() + windowHours * 60 * 60 * 1000)
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Parse a deadline picked by the designer. Accepts the `datetime-local` value
 * (`YYYY-MM-DDTHH:mm:ss`, interpreted in the browser's local time) or an ISO string.
 */
export function parseQuotationDeadline(value: Date | string | null | undefined) {
  if (!value) return null
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Deadline rendered as DD/MM/YYYY, hh:mm:ss AM/PM. */
export function formatQuotationDeadline(value: Date | string | null | undefined) {
  const d = parseQuotationDeadline(value)
  if (!d) return 'No deadline set'
  const day = pad(d.getDate())
  const month = pad(d.getMonth() + 1)
  const year = d.getFullYear()
  
  let hours = d.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // 0 becomes 12
  
  const formattedHours = pad(hours)
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())

  return `${day}/${month}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`
}

/** Value for an `<input type="datetime-local" step="1">` field. */
export function toDateTimeLocalValue(value: Date | string | null | undefined) {
  const d = parseQuotationDeadline(value)
  if (!d) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** Whole hours between now and the deadline — kept so legacy `quotationWindowHours` rows stay meaningful. */
export function getWindowHoursUntil(deadline: Date, baseDate = new Date()) {
  const diffHours = Math.ceil((deadline.getTime() - baseDate.getTime()) / (60 * 60 * 1000))
  return diffHours > 0 ? diffHours : null
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