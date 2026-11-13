const rupiahFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
const numFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

export const rupiah = (n: number) => `Rp ${rupiahFmt.format(Math.round(n || 0))}`
export const num = (n: number) => numFmt.format(n || 0)
export const pct = (n: number) => `${numFmt.format(Math.round(n || 0))}%`

/** "14.000" -> 14000 */
export const parseMoney = (s: string) => Number(s.replace(/\D/g, '')) || 0
/**
 * Format Indonesia: titik = ribuan, koma = desimal.
 * "1.000" -> 1000, "1,5" -> 1.5, "1.000,5" -> 1000.5, "1.5" -> 1.5 (titik desimal tetap diterima)
 */
export const parseQty = (s: string) => {
  let t = s.trim().replace(/[^\d.,]/g, '')
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '')
  const n = Number(t)
  return Number.isFinite(n) ? n : 0
}

/** Angka mentah untuk diedit: 1000 -> "1000", 1.5 -> "1,5" */
export const editableQty = (n: number) => (n ? String(n).replace('.', ',') : '')

/** "hari ini", "kemarin", "5 hari lalu", "13 Nov 2026" */
export function timeAgo(ts: number | null, now = Date.now()): string {
  if (!ts) return 'belum pernah'
  const day = 86_400_000
  const startOf = (t: number) => new Date(t).setHours(0, 0, 0, 0)
  const diff = Math.round((startOf(now) - startOf(ts)) / day)
  if (diff <= 0) return 'hari ini'
  if (diff === 1) return 'kemarin'
  if (diff < 30) return `${diff} hari lalu`
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(ts)
}

/** Sudah waktunya diingatkan backup? (belum pernah, atau lebih dari 7 hari) */
export const needsBackup = (ts: number | null, now = Date.now()) => !ts || now - ts > 7 * 86_400_000
