import { Check, Tags } from 'lucide-react'
import type { PantryItem } from '../../core/types'
import { num, rupiah } from '../../core/format'
import { Sheet } from './Dialog'
import { cx, eyebrow } from '../ui'

/** Pilih harga bahan tersimpan untuk ditambahkan ke produk. */
export function PantryPickerSheet({
  open,
  onClose,
  pantry,
  usedIds,
  onPick,
}: {
  open: boolean
  onClose: () => void
  pantry: PantryItem[]
  usedIds: Set<string>
  onPick: (item: PantryItem) => void
}) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy="picker-title">
      <p className={eyebrow}>Harga bahan</p>
      <h2 id="picker-title" className="mt-1 font-serif text-[1.5rem] leading-tight font-medium tracking-tight">
        Pilih harga tersimpan
      </h2>
      <p className="mt-1 text-[0.8rem] text-muted">Harganya ikut berubah kalau diubah di halaman Harga bahan.</p>
      {pantry.length === 0 ? (
        <div className="mt-6 grid place-items-center py-6 text-center">
          <Tags size={24} strokeWidth={1.5} className="text-gold" />
          <p className="mt-2 text-sm text-muted">Belum ada harga tersimpan.</p>
        </div>
      ) : (
        <div className="-mx-3 mt-3 max-h-[55vh] overflow-auto">
          {pantry.map((item) => {
            const used = usedIds.has(item.id)
            return (
              <button
                key={item.id}
                disabled={used}
                onClick={() => {
                  onPick(item)
                  onClose()
                }}
                className={cx(
                  'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                  used ? 'opacity-50' : 'hover:bg-sunken',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name || 'Tanpa nama'}</p>
                  <p className="text-[0.78rem] text-muted">
                    {rupiah(item.buyPrice)} / {num(item.buyQty)} {item.unit}
                  </p>
                </div>
                {used && (
                  <span className="flex items-center gap-1 text-[0.75rem] text-muted">
                    <Check size={14} strokeWidth={2} /> Sudah dipakai
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </Sheet>
  )
}
