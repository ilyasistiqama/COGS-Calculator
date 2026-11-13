import { useState, type ReactNode } from 'react'
import { ChevronDown, TrendingUp, Scale, Target } from 'lucide-react'
import type { Product } from '../../core/types'
import { calculate } from '../../core/hpp'
import { breakEvenPcs, pcsForTarget, simulateIngredientChange } from '../../core/simulate'
import { num, rupiah } from '../../core/format'
import { HINTS } from '../../core/hints'
import { NumberField } from './NumberField'
import { HintToggle } from './Hint'
import { card, cx, serifNum } from '../ui'

const CHANGE_PRESETS = [10, 20, 30]

function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="flex items-center gap-2 text-sm font-medium">
        <span className="text-gold">{icon}</span>
        {title}
      </p>
      <div className="mt-2.5">{children}</div>
    </div>
  )
}

export function SimulationSection({ product: p }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const [change, setChange] = useState(20)
  const [target, setTarget] = useState(1_000_000)
  const r = calculate(p)
  const sim = simulateIngredientChange(p, change)
  const bep = breakEvenPcs(p)
  const goal = pcsForTarget(p, target)
  const ready = r.hppPerPcs > 0 && r.sellPrice > 0

  return (
    <section className={cx(card, 'mb-4')}>
      <div className="flex flex-wrap items-center gap-x-3">
        <span className="font-serif text-sm text-gold tabular-nums">05</span>
        <h2 className="flex-1 font-serif text-[1.35rem] font-medium tracking-tight">Simulasi</h2>
        <HintToggle hint={HINTS.simulasi} />
      </div>
      <p className="mt-1 text-sm text-muted">Kalau bahan naik? Harus laku berapa? Opsional — buka kalau perlu.</p>
      <button
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-gold transition hover:bg-gold-soft"
      >
        <ChevronDown size={16} strokeWidth={1.75} className={cx('transition', open && 'rotate-180')} />
        {open ? 'Tutup simulasi' : 'Buka simulasi'}
      </button>

      {!open ? null : !ready ? (
        <p className="mt-4 rounded-xl bg-sunken px-4 py-3 text-sm text-muted">Lengkapi bahan dan harga jual dulu.</p>
      ) : (
        <div className="mt-4 divide-y divide-line">
          <Block icon={<TrendingUp size={16} strokeWidth={1.6} />} title="Kalau harga bahan naik">
            <div className="flex flex-wrap items-center gap-2">
              {CHANGE_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChange(c)}
                  className={cx(
                    'h-9 rounded-full px-3.5 text-sm transition',
                    change === c ? 'bg-ink font-medium text-on-ink' : 'bg-sunken text-ink-soft hover:bg-line',
                  )}
                >
                  +{c}%
                </button>
              ))}
              <NumberField value={change} suffix="%" ariaLabel="Kenaikan harga bahan" className="h-9 w-24" onChange={setChange} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-sunken px-3.5 py-2.5">
                <p className="text-[0.72rem] text-muted">Modal jadi</p>
                <p className={serifNum}>
                  {rupiah(sim.hppPerPcs)} <span className="text-[0.72rem] text-muted">dari {rupiah(r.hppPerPcs)}</span>
                </p>
              </div>
              <div className={cx('rounded-xl px-3.5 py-2.5', sim.isLoss ? 'bg-loss-soft' : 'bg-sunken')}>
                <p className="text-[0.72rem] text-muted">{sim.isLoss ? 'Rugi' : 'Untung'} di {rupiah(r.sellPrice)}</p>
                <p className={cx(serifNum, sim.isLoss ? 'text-loss' : 'text-ok')}>{rupiah(Math.abs(sim.profitPerPcs))}</p>
              </div>
            </div>
            {sim.suggestedPrice > r.sellPrice && (
              <p className="mt-2 text-[0.78rem] text-muted">
                Supaya untung tetap {num(p.markupPct)}%, naikkan harga ke{' '}
                <b className="font-medium text-ink">{rupiah(sim.suggestedPrice)}</b>.
              </p>
            )}
          </Block>

          <Block icon={<Scale size={16} strokeWidth={1.6} />} title="Balik modal">
            {bep ? (
              <p className="text-sm text-ink-soft">
                Dari {num(p.yieldQty)} pcs sekali masak, cukup laku{' '}
                <b className={cx(serifNum, 'text-lg text-ink')}>{num(bep)} pcs</b> supaya modal {rupiah(r.batchTotal)}{' '}
                kembali. Sisanya untung.
              </p>
            ) : (
              <p className="text-sm text-loss">Walau semua laku, modal sekali masak belum kembali. Naikkan harga jual.</p>
            )}
          </Block>

          <Block icon={<Target size={16} strokeWidth={1.6} />} title="Target untung">
            <NumberField money prefix="Rp" value={target} ariaLabel="Target untung" onChange={setTarget} />
            {goal ? (
              <p className="mt-2.5 text-sm text-ink-soft">
                Jual <b className={cx(serifNum, 'text-lg text-ink')}>{num(goal.pcs)} pcs</b> ≈ masak {num(goal.batches)}×.
                {goal.batches >= 30 && <> Kira-kira {num(Math.ceil(goal.batches / 30))}× masak per hari selama sebulan.</>}
              </p>
            ) : (
              <p className="mt-2.5 text-sm text-muted">Isi target untung (misal per bulan).</p>
            )}
          </Block>
        </div>
      )}
    </section>
  )
}
