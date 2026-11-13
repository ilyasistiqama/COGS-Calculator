import { useMemo } from 'react'
import { ArrowLeft, ClipboardList, Minus, Plus, ShoppingBasket } from 'lucide-react'
import { computeOrder } from '../../core/order'
import { calculate } from '../../core/hpp'
import { num, rupiah } from '../../core/format'
import { HINTS } from '../../core/hints'
import { orderText } from '../../core/share'
import type { ProductStore } from '../../core/useProducts'
import { NumberField } from './NumberField'
import { HintToggle } from './Hint'
import { ShareActions } from './ShareActions'
import { useDialog } from './dialogContext'
import { btnIcon, card, cardBase, cx, eyebrow, serifNum } from '../ui'

export function OrderPage({ store, onBack }: { store: ProductStore; onBack: () => void }) {
  const { products, order, setOrderQty, clearOrder } = store
  const { confirm } = useDialog()
  const qtyOf = (id: string) => order.find((l) => l.productId === id)?.qty ?? 0
  const result = useMemo(() => computeOrder(order, products), [order, products])
  const hasOrder = result.lines.length > 0

  return (
    <div className="mx-auto max-w-xl px-5 pb-16">
      <header className="sticky top-0 z-10 -mx-5 flex h-14 items-center justify-between bg-bg/85 px-3 backdrop-blur-md">
        <button className={btnIcon} onClick={onBack} aria-label="Kembali ke daftar produk">
          <ArrowLeft size={20} strokeWidth={1.6} />
        </button>
        {hasOrder && (
          <button
            className="h-9 rounded-full px-3 text-sm text-muted transition hover:bg-sunken hover:text-ink"
            onClick={async () => {
              if (await confirm({ title: 'Kosongkan pesanan?', message: 'Semua jumlah pesanan akan direset ke 0.', confirmLabel: 'Kosongkan' }))
                clearOrder()
            }}
          >
            Kosongkan
          </button>
        )}
      </header>

      <div className="pt-2 pb-6">
        <div className="flex items-center gap-2">
          <p className={cx(eyebrow, 'flex-1 text-gold')}>Kalkulator pesanan</p>
          <HintToggle hint={HINTS.pesanan} />
        </div>
        <h1 className="mt-2 font-serif text-[2.1rem] leading-tight font-medium tracking-tight">Hitung pesanan</h1>
        <p className="mt-1 text-sm text-muted">Isi jumlah pesanan, modal & belanjaan langsung keluar.</p>
      </div>

      {/* Pilih jumlah */}
      <section className={cx(cardBase, 'mb-4 divide-y divide-line')}>
        {products.length === 0 && <p className="p-6 text-center text-sm text-muted">Belum ada produk.</p>}
        {products.map((p) => {
          const q = qtyOf(p.id)
          return (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className={cx('truncate font-medium', !q && 'text-ink-soft')}>{p.name || 'Tanpa nama'}</p>
                <p className="text-[0.78rem] text-muted">{rupiah(calculate(p).sellPrice)} / pcs</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="grid size-10 place-items-center rounded-full bg-sunken text-ink-soft transition hover:bg-line disabled:opacity-30"
                  aria-label={`Kurangi ${p.name}`}
                  disabled={!q}
                  onClick={() => setOrderQty(p.id, Math.max(0, q - 1))}
                >
                  <Minus size={16} strokeWidth={1.75} />
                </button>
                <NumberField
                  value={q}
                  ariaLabel={`Jumlah pesanan ${p.name}`}
                  className="w-20 [&_input]:text-center"
                  onChange={(n) => setOrderQty(p.id, Math.floor(n))}
                />
                <button
                  className="grid size-10 place-items-center rounded-full bg-sunken text-ink-soft transition hover:bg-line"
                  aria-label={`Tambah ${p.name}`}
                  onClick={() => setOrderQty(p.id, q + 1)}
                >
                  <Plus size={16} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          )
        })}
      </section>

      {!hasOrder ? (
        <div className={cx(card, 'grid place-items-center py-10 text-center')}>
          <span className="grid size-14 place-items-center rounded-full bg-sunken text-gold">
            <ClipboardList size={24} strokeWidth={1.5} />
          </span>
          <p className="mt-4 font-serif text-xl">Belum ada pesanan</p>
          <p className="mt-1 max-w-64 text-sm text-muted">Tambah jumlah di atas untuk melihat modal dan daftar belanja.</p>
        </div>
      ) : (
        <>
          {/* Ringkasan */}
          <section className="mb-4 rounded-[22px] bg-panel p-5 text-on-panel">
            <p className="text-[0.68rem] tracking-[0.14em] text-panel-muted uppercase">Total jual</p>
            <p className={cx(serifNum, 'mt-0.5 text-[2.4rem] leading-none font-medium text-panel-gold')}>
              {rupiah(result.revenue)}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-sm tabular-nums">
              <div>
                <p className="text-[0.72rem] text-panel-muted">Modal</p>
                <p>{rupiah(result.cost)}</p>
              </div>
              <div>
                <p className="text-[0.72rem] text-panel-muted">{result.profit < 0 ? 'Rugi' : 'Untung'}</p>
                <p className={result.profit < 0 ? 'text-panel-loss' : 'text-panel-ok'}>{rupiah(Math.abs(result.profit))}</p>
              </div>
              <div>
                <p className="text-[0.72rem] text-panel-muted">Masak</p>
                <p>{result.batches}×</p>
              </div>
            </div>
          </section>

          {/* Per produk */}
          <section className={cx(card, 'mb-4')}>
            <p className={eyebrow}>Per produk</p>
            <div className="mt-3 divide-y divide-line">
              {result.lines.map((l) => (
                <div key={l.product.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {l.product.name || 'Tanpa nama'} <span className="text-muted">× {num(l.qty)}</span>
                    </p>
                    <p className="text-[0.78rem] text-muted">
                      Masak {l.batches}× · jadi {num(l.batches * l.product.yieldQty)} pcs
                      {l.leftover > 0 && <span className="text-gold"> · sisa {num(l.leftover)} bisa dijual lagi</span>}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm tabular-nums">
                    <p>{rupiah(l.revenue)}</p>
                    <p className={cx('text-[0.75rem]', l.profit < 0 ? 'text-loss' : 'text-ok')}>
                      {l.profit < 0 ? 'Rugi ' : '+'}
                      {rupiah(Math.abs(l.profit))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Belanja */}
          {(result.shopping.length > 0 || result.supplies.length > 0) && (
            <section className={cx(card, 'mb-4')}>
              <div className="flex items-center gap-2">
                <ShoppingBasket size={16} strokeWidth={1.6} className="text-gold" />
                <p className={cx(eyebrow, 'flex-1')}>Daftar belanja</p>
              </div>
              <div className="mt-3 divide-y divide-line">
                {result.shopping.map((s) => (
                  <div key={s.key} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-medium">
                        <span className="truncate">{s.name}</span>
                      </p>
                      <p className="text-[0.78rem] text-muted">
                        Butuh {num(s.need)} {s.unit}
                        {s.packs > 0 && ` · beli ${s.packs} × ${num(s.packSize)} ${s.unit}`}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm tabular-nums">{rupiah(s.cost)}</p>
                  </div>
                ))}
                {result.supplies.map((s) => (
                  <div key={s.name} className="flex items-start justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-[0.78rem] text-muted">{num(s.qty)} pcs</p>
                    </div>
                    <p className="shrink-0 text-sm tabular-nums">{rupiah(s.cost)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className={eyebrow}>Perkiraan belanja</span>
                <span className={cx(serifNum, 'text-xl')}>{rupiah(result.shoppingTotal)}</span>
              </div>
              <p className="mt-2 text-[0.75rem] text-muted">
                Dihitung per kemasan utuh. Sisa bahan bisa dipakai untuk masak berikutnya.
              </p>
            </section>
          )}

          <ShareActions text={orderText(result)} label="Kirim ringkasan pesanan" />
        </>
      )}
    </div>
  )
}
