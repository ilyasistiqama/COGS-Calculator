import { useState } from 'react'
import { ArrowUpRight, Tags, ChevronRight, ClipboardList, CookingPot, DatabaseBackup, Monitor, Moon, Plus, Share2, Sun, X } from 'lucide-react'
import { CREDIT_LABEL, CREDIT_URL, type ThemeMode } from '../../core/meta'
import { InstallCard } from './InstallCard'
import type { Product } from '../../core/types'
import { calculate } from '../../core/hpp'
import { needsBackup, rupiah, timeAgo } from '../../core/format'
import { HINTS, ONBOARDING_STEPS } from '../../core/hints'
import { btnPrimary, card, cardBase, cx, eyebrow, serifNum } from '../ui'

interface Props {
  products: Product[]
  onOpen: (id: string) => void
  onAdd: () => void
  onBackup: () => void
  lastBackupAt: number | null
  onTheme: () => void
  themeMode: ThemeMode
  onPantry: () => void
  onOrder: () => void
  onSharePrices: () => void
  pantryCount: number
  orderCount: number
}

const THEME_ICON = { system: Monitor, light: Sun, dark: Moon } as const

const INTRO_KEY = 'kalkulator-hpp:intro-hidden'
const readIntroHidden = () => {
  try {
    return localStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

export function ProductList({
  products,
  onOpen,
  onAdd,
  onBackup,
  lastBackupAt,
  onTheme,
  themeMode,
  onPantry,
  onOrder,
  onSharePrices,
  pantryCount,
  orderCount,
}: Props) {
  const ThemeIcon = THEME_ICON[themeMode]
  const [introHidden, setIntroHidden] = useState(readIntroHidden)

  const toggleIntro = (hidden: boolean) => {
    setIntroHidden(hidden)
    try {
      localStorage.setItem(INTRO_KEY, hidden ? '1' : '0')
    } catch {
      /* abaikan */
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 pb-32">
      <header className="pt-10 pb-6">
        <div className="flex items-center justify-between">
          <p className={cx(eyebrow, 'text-gold')}>Kalkulator HPP</p>
          <div className="-my-2 -mr-2 flex">
            <button
              className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink"
              aria-label="Ganti tema"
              onClick={onTheme}
            >
              <ThemeIcon size={19} strokeWidth={1.5} />
            </button>
            <button
              className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink"
              aria-label="Backup & pulihkan data"
              onClick={onBackup}
            >
              <DatabaseBackup size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <h1 className="mt-2 font-serif text-[2.1rem] leading-tight font-medium tracking-tight">Produk saya</h1>
        <p className="mt-1 text-sm text-muted">
          {products.length ? `${products.length} produk tersimpan` : 'Hitung modal & harga jual dengan tenang'}
        </p>
      </header>

      {!introHidden ? (
        <section className="relative mb-6 rounded-[22px] bg-gold-soft px-5 pt-5 pb-4">
          <button
            className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-muted hover:text-ink"
            aria-label="Tutup cara pakai"
            onClick={() => toggleIntro(true)}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
          <p className={eyebrow}>Cara pakai</p>
          <ol className="mt-3 grid gap-3">
            {ONBOARDING_STEPS.map((s, i) => (
              <li key={s.title} className="flex items-baseline gap-3.5">
                <span className="w-6 font-serif text-lg text-gold tabular-nums">0{i + 1}</span>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-gold/20 pt-3 text-[0.8rem] leading-relaxed text-ink-soft">
            <span className="font-medium">{HINTS.hpp.title}</span> {HINTS.hpp.body}
          </p>
        </section>
      ) : (
        <button className="mb-4 -ml-1 px-1 text-sm font-medium text-gold" onClick={() => toggleIntro(false)}>
          Lihat cara pakai
        </button>
      )}

      <InstallCard />

      {/* Menu cepat */}
      <nav aria-label="Menu" className="mb-4 grid grid-cols-3 gap-2.5">
        {[
          { icon: Tags, label: 'Harga bahan', sub: pantryCount ? `${pantryCount} tersimpan` : 'Ubah sekali', onClick: onPantry },
          { icon: ClipboardList, label: 'Pesanan', sub: orderCount ? `${orderCount} produk` : 'Hitung & belanja', onClick: onOrder },
          { icon: Share2, label: 'Bagikan', sub: 'Daftar harga', onClick: onSharePrices },
        ].map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={cx(cardBase, 'flex flex-col items-start gap-2.5 p-3.5 text-left transition hover:ring-gold/50')}
          >
            <span className="grid size-9 place-items-center rounded-full bg-gold-soft text-gold">
              <a.icon size={17} strokeWidth={1.6} />
            </span>
            <span>
              <span className="block text-[0.85rem] leading-tight font-medium">{a.label}</span>
              <span className="block text-[0.72rem] text-muted">{a.sub}</span>
            </span>
          </button>
        ))}
      </nav>

      {products.length > 0 && needsBackup(lastBackupAt) && (
        <button
          className="mb-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 ring-line transition hover:bg-surface"
          onClick={onBackup}
        >
          <DatabaseBackup size={18} strokeWidth={1.5} className="shrink-0 text-gold" />
          <span className="flex-1 text-[0.82rem] text-ink-soft">
            Backup terakhir <b className="font-medium">{timeAgo(lastBackupAt)}</b>. Amankan datamu sekarang.
          </span>
          <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
        </button>
      )}

      {products.length === 0 ? (
        <div className={cx(card, 'grid place-items-center py-12 text-center')}>
          <span className="grid size-14 place-items-center rounded-full bg-sunken text-gold">
            <CookingPot size={24} strokeWidth={1.5} />
          </span>
          <p className="mt-4 font-serif text-xl">Belum ada produk</p>
          <p className="mt-1 max-w-60 text-sm text-muted">Tambahkan produk pertamamu untuk mulai menghitung.</p>
        </div>
      ) : (
        <ul className={cx(cardBase, 'divide-y divide-line')}>
          {products.map((p) => {
            const r = calculate(p)
            return (
              <li key={p.id}>
                <button
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition first:rounded-t-[22px] last:rounded-b-[22px] hover:bg-sunken/60"
                  onClick={() => onOpen(p.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name || 'Tanpa nama'}</p>
                    <p className="mt-0.5 text-[0.8rem] text-muted">Modal {rupiah(r.hppPerPcs)}</p>
                  </div>
                  <div className="text-right">
                    <p className={cx(serifNum, 'text-xl')}>{rupiah(r.sellPrice)}</p>
                    <p className={cx('mt-0.5 text-[0.75rem] font-medium', r.isLoss ? 'text-loss' : 'text-ok')}>
                      {r.isLoss ? `Rugi ${rupiah(-r.profitPerPcs)}` : `Untung ${rupiah(r.profitPerPcs)}`}
                    </p>
                  </div>
                  <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-muted" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <footer className="mt-10 text-center text-[0.75rem] text-muted">
        Created by{' '}
        <a
          href={CREDIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-ink-soft underline decoration-gold/50 underline-offset-4 transition hover:text-gold"
        >
          {CREDIT_LABEL}
          <ArrowUpRight size={12} strokeWidth={2} />
        </a>
      </footer>

      <div className="fixed inset-x-0 bottom-0 bg-linear-to-b from-transparent via-bg/90 to-bg px-5 pt-8 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[536px]">
          <button className={cx(btnPrimary, 'inline-flex items-center justify-center gap-2')} onClick={onAdd}>
            <Plus size={18} strokeWidth={1.75} />
            Tambah produk
          </button>
        </div>
      </div>
    </div>
  )
}
