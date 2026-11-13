import { useState } from 'react'
import type { Product } from '../../core/types'
import { DEFAULT_PRICE_LIST, priceListText } from '../../core/share'
import { HINTS } from '../../core/hints'
import { Sheet } from './Dialog'
import { ShareActions } from './ShareActions'
import { eyebrow, textInput } from '../ui'

/** Bagikan daftar harga ke pembeli (nama & harga jual saja). */
export function PriceListSheet({ open, onClose, products }: { open: boolean; onClose: () => void; products: Product[] }) {
  const [title, setTitle] = useState(DEFAULT_PRICE_LIST.title)
  const [note, setNote] = useState(DEFAULT_PRICE_LIST.note)
  const text = priceListText(products, { title, note })

  return (
    <Sheet open={open} onClose={onClose} labelledBy="pricelist-title">
      <p className={eyebrow}>Bagikan</p>
      <h2 id="pricelist-title" className="mt-1 font-serif text-[1.5rem] leading-tight font-medium tracking-tight">
        Daftar harga
      </h2>
      <p className="mt-1 text-[0.82rem] text-muted">{HINTS.bagikan.body}</p>

      <div className="mt-4 grid gap-2">
        <input className={textInput} value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Judul" placeholder="Judul" />
        <input className={textInput} value={note} onChange={(e) => setNote(e.target.value)} aria-label="Catatan" placeholder="Catatan (opsional)" />
      </div>

      <pre className="mt-3 max-h-48 overflow-auto rounded-2xl bg-sunken px-4 py-3 font-sans text-[0.82rem] leading-relaxed whitespace-pre-wrap text-ink-soft">
        {text}
      </pre>

      <ShareActions text={text} className="mt-4" />
    </Sheet>
  )
}
