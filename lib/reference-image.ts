export function parseReferenceImages(referenceImage?: string | null): string[] {
  if (!referenceImage) return []
  const trimmed = referenceImage.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter((img): img is string => typeof img === 'string' && Boolean(img.trim()))
      }
    } catch {
      // Fall through to single string return
    }
  }

  return [trimmed]
}

export function formatReferenceImages(images: string[]): string | null {
  const clean = images.filter((img) => Boolean(img && img.trim()))
  if (clean.length === 0) return null
  return JSON.stringify(clean)
}
