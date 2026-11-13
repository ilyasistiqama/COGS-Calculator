import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, Plus, Tags, Trash2, TriangleAlert } from 'lucide-react'
import type { PantryItem } from '../../core/types'
import { pantryImpact } from '../../core/pantry'
import { num, pct, rupiah } from '../../core/format'
import { FIELD_HINTS, HINTS } from '../../core/hints'
import type { ProductStore } from '../../core/useProducts'
import { NumberField } from './NumberField'
import { FieldHint, HintToggle } from './Hint'
import { UnitSheet } from './UnitSheet'
import { useDialog } from './dialogContext'
import { btnIcon, card, cardBase, cx, eyebrow, fieldBox, label, nameInput, serifNum } from '../ui'

export function PantryPage({ store, onBack, onOpenProduct }: { store: ProductStore; onBack: () => void; onOpenProduct: (id: string) => void }) {
  const { pantry, products, addPantryItem, updatePantryItem, removePantryItem } = store
  const { confirm, toast } = useDialog()
  const [unitFor, setUnitFor] = useState<string | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const impact = useMemo(() => pantryImpact(products), [products])
  const unitItem = pantry.find((x) => x.id === unitFor) ?? null
  const lossCount = new Set([...impact.values()].flat().filter((x) => x.isLoss).map((x) => x.productId)).size

  const set = (item: PantryItem, patch: Partial<PantryItem>) => updatePantryItem({ ...item, ...patch })
  const fh = (key: string) => ({ onFocus: () => setFocus(key), onBlur: () => setFocus((f) => (f === key ? null : f)) })

  const askRemove = async (item: PantryItem) => {
    const used = impact.get(item.id)?.length ?? 0
    const ok = await confirm({
      title: `Hapus ${item.name ? `“${item.name}”` : 'harga ini'}?`,
      message: used
        ? `Dipakai di ${used} produk. Bahannya tetap ada di produk tersebut dengan harga terakhir (jadi harga sendiri).`
        : 'Harga ini belum dipakai di produk mana pun.',
      confirmLabel: 'Hapus',
      tone: 'danger',
    })
    if (ok) {
      removePantryItem(item.id)
      toast(`${item.name || 'Harga bahan'} dihapus`)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 pb-16">
      <header className="sticky top-0 z-10 -mx-5 flex h-14 items-center bg-bg/85 px-3 backdrop-blur-md">
        <button className={btnIcon} onClick={onBack} aria-label="Kembali ke daftar produk">
          <ArrowLeft size={20} strokeWidth={1.6} />
        </button>
      </header>

      <div className="pt-2 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cx(eyebrow, 'flex-1 text-gold')}>Harga bahan</p>
          <HintToggle hint={HINTS.hargaBahan} />
        </div>
        <h1 className="mt-2 font-serif text-[2.1rem] leading-tight font-medium tracking-tight">Harga tersimpan</h1>
        <p className="mt-1 text-sm text-muted">
          Ubah harga di sini, semua produk yang memakainya ikut terhitung ulang. Hanya daftar harga, bukan catatan stok.
        </p>
      </div>

      {lossCount > 0 && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-loss-soft px-4 py-3 text-sm text-loss">
          <TriangleAlert size={16} strokeWidth={1.75} className="shrink-0" />
          {lossCount} produk sekarang rugi. Naikkan harga jualnya di halaman produk.
        </p>
      )}

      <button
        className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink font-medium text-on-ink transition active:scale-[0.99]"
        onClick={addPantryItem}
      >
        <Plus size={18} strokeWidth={1.75} /> Tambah harga bahan
      </button>

      {pantry.length === 0 ? (
        <div className={cx(card, 'grid place-items-center py-12 text-center')}>
          <span className="grid size-14 place-items-center rounded-full bg-sunken text-gold">
            <Tags size={24} strokeWidth={1.5} />
          </span>
          <p className="mt-4 font-serif text-xl">Belum ada harga tersimpan</p>
          <p className="mt-1 max-w-72 text-sm text-muted">
            Tambah di sini, atau tekan <b className="font-medium text-ink-soft">“Simpan harganya”</b> di bawah bahan pada
            halaman produk.
          </p>
        </div>
      ) : (
        <div className={cx(cardBase, 'divide-y divide-line px-5')}>
          {pantry.map((item) => {
            const used = impact.get(item.id) ?? []
            const unitPrice = item.buyQty > 0 ? item.buyPrice / item.buyQty : 0
            const hint = focus?.startsWith(`${item.id}:`) ? FIELD_HINTS[focus.split(':')[1] as 'buyPrice' | 'buyQty'] : null
            return (
              <div key={item.id} className="grid gap-3 py-5">
                <div className="flex items-center gap-2">
                  <input
                    className={nameInput}
                    value={item.name}
                    autoFocus={!item.name}
                    placeholder="Nama bahan, misal Terigu"
                    aria-label="Nama bahan"
                    onChange={(e) => set(item, { name: e.target.value })}
                  />
                  <button
                    className={cx(btnIcon, 'hover:bg-loss-soft hover:text-loss')}
                    aria-label={`Hapus ${item.name || 'harga bahan'}`}
                    onClick={() => askRemove(item)}
                  >
                    <Trash2 size={17} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className={label}>Harga beli</span>
                    <NumberField
                      money
                      prefix="Rp"
                      placeholder="14.000"
                      ariaLabel="Harga beli"
                      value={item.buyPrice}
                      onChange={(n) => set(item, { buyPrice: n })}
                      {...fh(`${item.id}:buyPrice`)}
                    />
                  </div>
                  <div>
                    <span className={label}>Isi kemasan</span>
                    <div className={cx(fieldBox, 'overflow-hidden')}>
                      <NumberField
                        bare
                        placeholder="1000"
                        ariaLabel="Isi kemasan"
                        className="flex-1"
                        value={item.buyQty}
                        onChange={(n) => set(item, { buyQty: n })}
                        {...fh(`${item.id}:buyQty`)}
                      />
                      <button
                        type="button"
                        aria-label={`Satuan: ${item.unit}. Ketuk untuk ganti`}
                        onClick={() => setUnitFor(item.id)}
                        className="flex h-full w-[4.5rem] shrink-0 items-center justify-center gap-1 border-l border-line text-sm text-ink-soft transition hover:bg-line/50"
                      >
                        <span className="truncate">{item.unit}</span>
                        <ChevronDown size={13} strokeWidth={1.75} className="shrink-0 text-muted" />
                      </button>
                    </div>
                  </div>
                </div>
                <FieldHint text={hint} />

                {/* Dampak ke produk */}
                <div className="rounded-xl bg-sunken px-3.5 py-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.75rem] text-muted">
                      {used.length ? `Dipakai di ${used.length} produk` : 'Belum dipakai di produk'}
                    </span>
                    {unitPrice > 0 && (
                      <span className={cx(serifNum, 'shrink-0 text-sm')}>
                        {unitPrice < 1 ? `Rp${num(unitPrice)}` : rupiah(unitPrice)}/{item.unit}
                      </span>
                    )}
                  </div>
                  {used.length > 0 && (
                    <ul className="mt-1.5 grid gap-1">
                      {used.map((u) => (
                        <li key={u.productId}>
                          <button
                            onClick={() => onOpenProduct(u.productId)}
                            className="flex w-full items-center justify-between gap-3 text-left text-[0.8rem] hover:underline"
                          >
                            <span className="truncate text-ink-soft">{u.name}</span>
                            <span className={cx('shrink-0 font-medium tabular-nums', u.isLoss ? 'text-loss' : 'text-ok')}>
                              {u.isLoss ? `Rugi ${rupiah(-u.profitPerPcs)}` : `Untung ${rupiah(u.profitPerPcs)} · ${pct(u.profitPct)}`}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <UnitSheet
        ingredient={unitItem ? { ...unitItem, useQty: 0 } : null}
        onClose={() => setUnitFor(null)}
        onPick={(id, unit) => {
          const it = pantry.find((x) => x.id === id)
          if (it) set(it, { unit })
        }}
      />
    </div>
  )
}
