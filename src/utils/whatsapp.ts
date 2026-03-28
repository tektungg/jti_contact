import { sanitizePhone } from './security'

/**
 * Converts a raw Indonesian phone number to a wa.me URL and opens it.
 * Replaces leading 0 with country code 62.
 */
export function openWhatsApp(rawPhone: string): void {
  let formatted = sanitizePhone(rawPhone)
  if (!formatted) return

  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.slice(1)
  }

  if (!/^\d{10,15}$/.test(formatted)) return

  window.open(`https://wa.me/${formatted}`, '_blank', 'noopener,noreferrer')
}
