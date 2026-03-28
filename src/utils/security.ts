/** Escapes HTML special characters to prevent XSS. */
export function escapeHtml(text: string | null | undefined): string {
  if (text === null || text === undefined) return ''
  const div = document.createElement('div')
  div.textContent = String(text)
  return div.innerHTML
}

/** Strips all characters except digits and + from a phone string. */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return ''
  return String(phone).replace(/[^\d+]/g, '')
}
