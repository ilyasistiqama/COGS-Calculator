// Teks siap kirim (WhatsApp friendly: *tebal* dan _miring_).
import type { Product } from './types'
import type { OrderResult } from './order'
import { calculate } from './hpp'
import { num, rupiah } from './format'
import { APP_NAME } from './meta'

export interface PriceListOptions {
  title: string
  note: string
}

export const DEFAULT_PRICE_LIST: PriceListOptions = {
  title: 'Daftar Harga',
  note: 'Bisa pesan untuk acara. Hubungi kami ya!',
}

/** Daftar harga untuk pembeli — tanpa modal/untung. `products` sudah di-resolve. */
export function priceListText(products: Product[], opts: PriceListOptions = DEFAULT_PRICE_LIST): string {
  const rows = products
    .filter((p) => p.name.trim())
    .map((p) => `• ${p.name.trim()} — *${rupiah(calculate(p).sellPrice)}*`)
  return [
    `*${opts.title.trim() || DEFAULT_PRICE_LIST.title}*`,
    '',
    ...rows,
    ...(opts.note.trim() ? ['', `_${opts.note.trim()}_`] : []),
  ].join('\n')
}

/** Ringkasan pesanan + daftar belanja (untuk dicatat / dikirim ke diri sendiri) */
export function orderText(r: OrderResult): string {
  const lines = [
    '*Rencana Pesanan*',
    '',
    ...r.lines.map((l) => `• ${l.product.name || 'Tanpa nama'} × ${num(l.qty)} pcs (masak ${l.batches}×)`),
    '',
    `Total jual: *${rupiah(r.revenue)}*`,
    `Modal: ${rupiah(r.cost)}`,
    `Untung: *${rupiah(r.profit)}*`,
  ]
  if (r.shopping.length || r.supplies.length) {
    lines.push('', '*Belanja*')
    for (const s of r.shopping) {
      lines.push(
        `• ${s.name}: ${num(s.need)} ${s.unit}` +
          (s.packs > 0 ? ` → beli ${s.packs} × ${num(s.packSize)} ${s.unit} (${rupiah(s.cost)})` : ''),
      )
    }
    for (const s of r.supplies) lines.push(`• ${s.name}: ${num(s.qty)} pcs (${rupiah(s.cost)})`)
    lines.push(`Perkiraan belanja: *${rupiah(r.shoppingTotal)}*`)
  }
  lines.push('', `_Dihitung dengan ${APP_NAME}_`)
  return lines.join('\n')
}

export const whatsappUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`
