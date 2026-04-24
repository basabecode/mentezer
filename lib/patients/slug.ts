export function toPatientSlug(name: string, id: string): string {
  const nameSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return `${nameSlug}--${id}`
}

export function parsePatientSlug(slug: string): string {
  const idx = slug.indexOf('--')
  if (idx !== -1) return slug.slice(idx + 2)
  return slug // fallback: treat as plain id (backward compat)
}
