import { useState, type ReactNode } from 'react'
import { ArrowLeft, Check, ChevronDown, ChevronUp, Link2, Plus, Tags, Trash2, TriangleAlert } from 'lucide-react'
import type { Ingredient, OtherCost, PantryItem, Product } from '../../core/types'
import { findPantryByName } from '../../core/pantry'
import { MARKUP_PRESETS, calculate, getWarnings, ingredientCost, roundedPriceOptions } from '../../core/hpp'
import { newCost, newIngredient } from '../../core/factory'
import { num, pct, rupiah } from '../../core/format'
import { EDITOR_TIPS, FIELD_HINTS, HINTS, MARKUP_GUIDE, type FieldHintKey } from '../../core/hints'
import { NumberField } from './NumberField'
import { FieldHint, HintToggle, Note, Warnings } from './Hint'
import { useDialog } from './dialogContext'
import { UnitSheet } from './UnitSheet'
import { PantryPickerSheet } from './PantryPickerSheet'
import { SimulationSection } from './SimulationSection'
import { btnAdd, btnIcon, card, cx, eyebrow, fieldBox, label, nameInput, serifNum } from '../ui'

interface Props {
  product: Product
  pantry: PantryItem[]
  /** mengembalikan nama bahan yang barusan jadi "harga sendiri" */
  onChange: (p: Product) => string[] | void
  onSaveToPantry: (ingredientId: string) => void
  onBack: () => void
  onDelete: () => void
}

const QUICK_COSTS: { name: string; perPcs: boolean }[] = [
  { name: 'Gas / listrik', perPcs: false },
  { name: 'Minyak goreng', perPcs: false },
  { name: 'Kemasan / mika', perPcs: true },
  { name: 'Plastik', perPcs: true },
  { name: 'Stiker', perPcs: true },
]

/* ---------- Bagian kecil yang dipakai ulang ---------- */

function Section({
  no,
  title,
  desc,
  hint,
  children,
}: {
  no: string
  title: string
  desc?: ReactNode
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <section className={cx(card, 'mb-4')}>
      <div className="flex flex-wrap items-center gap-x-3">
        <span className="font-serif text-sm text-gold tabular-nums">{no}</span>
        <h2 className="flex-1 font-serif text-[1.35rem] font-medium tracking-tight">{title}</h2>
        {hint}
      </div>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Segmented<T extends string | number | boolean>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: T | null
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  ariaLabel: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cx('flex rounded-xl bg-sunken p-1', className)}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={on}
            className={cx(
              'h-9 flex-1 rounded-[9px] px-3 text-[0.82rem] whitespace-nowrap transition',
              on ? 'bg-surface font-semibold text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Halaman ---------- */

export function ProductEditor({ product: p, pantry, onChange, onSaveToPantry, onBack, onDelete }: Props) {
  const [showDetail, setShowDetail] = useState(false)
  const [unitFor, setUnitFor] = useState<string | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { confirm, toast } = useDialog()
  /** Pasang di kolom supaya penjelasannya muncul saat kolom diisi */
  const fh = (scope: string, key: FieldHintKey) => ({
    onFocus: () => setFocus(`${scope}:${key}`),
    onBlur: () => setFocus((f) => (f === `${scope}:${key}` ? null : f)),
  })
  const hintFor = (scope: string) =>
    focus?.startsWith(`${scope}:`) ? FIELD_HINTS[focus.slice(scope.length + 1) as FieldHintKey] : null
  const r = calculate(p)
  const warnings = getWarnings(p)
  const warnFor = (target: string) => warnings.filter((w) => w.target === target)

  const set = (patch: Partial<Product>) => {
    const detached = onChange({ ...p, ...patch })
    if (detached?.length) toast(`${detached.join(', ')} sekarang pakai harga sendiri di produk ini`, 'info')
  }
  const setIng = (id: string, patch: Partial<Ingredient>) =>
    set({ ingredients: p.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  const setCost = (id: string, patch: Partial<OtherCost>) =>
    set({ costs: p.costs.map((c) => (c.id === id ? { ...c, ...patch } : c)) })

  const existingCostNames = new Set(p.costs.map((c) => c.name.toLowerCase()))
  const quickCosts = QUICK_COSTS.filter((q) => !existingCostNames.has(q.name.toLowerCase()))
  const priceOptions = roundedPriceOptions(r.hppPerPcs, p.markupPct)
  const perBatchShare = p.yieldQty > 0 ? (r.ingredientsTotal + r.batchCostsTotal) / p.yieldQty : 0

  return (
    <div className="mx-auto max-w-xl px-5">
      {/* ---------- TOP BAR ---------- */}
      <header className="sticky top-0 z-10 -mx-5 flex h-14 items-center justify-between bg-bg/85 px-3 backdrop-blur-md">
        <button className={btnIcon} onClick={onBack} aria-label="Kembali ke daftar produk">
          <ArrowLeft size={20} strokeWidth={1.6} />
        </button>
        <span className="flex items-center gap-1.5 pr-2 text-xs text-muted">
          <Check size={14} strokeWidth={2} className="text-ok" />
          Tersimpan otomatis
        </span>
      </header>

      {/* ---------- NAMA ---------- */}
      <div className="pt-4 pb-6">
        <label htmlFor="pname" className={cx(eyebrow, 'text-gold')}>
          Nama produk
        </label>
        <input
          id="pname"
          className="mt-2 w-full border-b border-line bg-transparent pb-2 font-serif text-[2rem] leading-tight font-medium tracking-tight outline-none placeholder:text-muted/50 focus:border-gold"
          value={p.name}
          autoFocus={!p.name}
          placeholder="Misal: Risol Mayo"
          onChange={(e) => set({ name: e.target.value })}
        />
      </div>

      {r.ingredientsTotal === 0 && (
        <section className="mb-4 rounded-[22px] bg-gold-soft px-5 py-4">
          <p className={eyebrow}>Tips mengisi</p>
          <ul className="mt-2 grid gap-1.5 text-[0.85rem] text-ink-soft">
            {EDITOR_TIPS.map((t, k) => (
              <li key={t} className="flex gap-2.5">
                <span className="font-serif text-gold tabular-nums">{k + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- 01 BAHAN ---------- */}
      <Section
        no="01"
        title="Bahan"
        desc="Untuk satu kali masak."
        hint={<HintToggle hint={HINTS.bahan} />}
      >
        {p.ingredients.length === 0 && <p className="py-4 text-center text-sm text-muted">Belum ada bahan.</p>}

        <div className="divide-y divide-line">
          {p.ingredients.map((i, idx) => {
            const cost = ingredientCost(i)
            const unitPrice = i.buyQty > 0 ? i.buyPrice / i.buyQty : 0
            return (
              <div key={i.id} className="grid gap-3 py-4 first:pt-0">
                <div className="flex items-center gap-2">
                  <input
                    className={nameInput}
                    value={i.name}
                    placeholder={`Bahan ${idx + 1} — misal Terigu`}
                    aria-label={`Nama bahan ${idx + 1}`}
                    onChange={(e) => setIng(i.id, { name: e.target.value })}
                  />
                  <button
                    className={cx(btnIcon, 'hover:bg-loss-soft hover:text-loss')}
                    aria-label={`Hapus ${i.name || 'bahan'}`}
                    onClick={() => set({ ingredients: p.ingredients.filter((x) => x.id !== i.id) })}
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
                      {...fh(i.id, 'buyPrice')}
                      value={i.buyPrice}
                      onChange={(n) => setIng(i.id, { buyPrice: n })}
                    />
                  </div>
                  <div>
                    <span className={label}>Isi kemasan</span>
                    <div className={cx(fieldBox, 'overflow-hidden')}>
                      <NumberField
                        bare
                        placeholder="1000"
                        ariaLabel="Isi kemasan"
                        {...fh(i.id, 'buyQty')}
                        className="flex-1"
                        value={i.buyQty}
                        onChange={(n) => setIng(i.id, { buyQty: n })}
                      />
                      <button
                        type="button"
                        aria-label={`Satuan: ${i.unit}. Ketuk untuk ganti`}
                        onClick={() => setUnitFor(i.id)}
                        className="flex h-full w-[4.5rem] shrink-0 items-center justify-center gap-1 border-l border-line text-sm text-ink-soft transition hover:bg-line/50"
                      >
                        <span className="truncate">{i.unit}</span>
                        <ChevronDown size={13} strokeWidth={1.75} className="shrink-0 text-muted" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 items-end gap-2.5">
                  <div>
                    <span className={label}>Dipakai</span>
                    <NumberField
                      placeholder="250"
                      ariaLabel="Jumlah dipakai"
                      {...fh(i.id, 'useQty')}
                      suffix={i.unit}
                      value={i.useQty}
                      onChange={(n) => setIng(i.id, { useQty: n })}
                    />
                  </div>
                  <div className="pb-1.5 text-right">
                    <p className="text-[0.7rem] text-muted">
                      {unitPrice > 0
                        ? `${unitPrice < 1 ? `Rp${num(unitPrice)}` : rupiah(unitPrice)} / ${i.unit}`
                        : 'Biaya'}
                    </p>
                    <p className={cx(serifNum, 'text-xl')}>{rupiah(cost)}</p>
                  </div>
                </div>

                <FieldHint text={hintFor(i.id)} />
                {!focus?.startsWith(`${i.id}:`) && <Warnings items={warnFor(i.id)} />}

                {i.pantryId ? (
                  <p className="flex items-start gap-2 rounded-xl bg-gold-soft/70 px-3 py-2 text-[0.78rem] text-ink-soft">
                    <Link2 size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold" />
                    <span>
                      <b className="font-medium">Harga tersimpan.</b> Ikut berubah kalau diubah di Harga bahan. Ubah
                      angkanya di sini kalau produk ini pakai harga sendiri.
                    </span>
                  </p>
                ) : findPantryByName(pantry, i.name) ? (
                  (() => {
                    const match = findPantryByName(pantry, i.name)!
                    return (
                      <button
                        className="flex items-center gap-2 self-start rounded-full bg-gold-soft px-3 py-1.5 text-[0.78rem] font-medium text-ink-soft transition hover:ring-1 hover:ring-gold/50"
                        onClick={() => setIng(i.id, { pantryId: match.id })}
                      >
                        <Tags size={13} strokeWidth={1.75} className="text-gold" />
                        Pakai harga tersimpan: {rupiah(match.buyPrice)} / {num(match.buyQty)} {match.unit}
                      </button>
                    )
                  })()
                ) : (
                  i.name.trim() &&
                  i.buyPrice > 0 &&
                  i.buyQty > 0 && (
                    <button
                      className="flex items-center gap-1.5 self-start rounded-full px-1 text-[0.78rem] font-medium text-gold transition hover:underline"
                      onClick={() => onSaveToPantry(i.id)}
                    >
                      <Tags size={13} strokeWidth={1.75} /> Simpan harganya
                    </button>
                  )
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-x-1">
          <button className={btnAdd} onClick={() => set({ ingredients: [...p.ingredients, newIngredient()] })}>
            <Plus size={16} strokeWidth={1.75} /> Tambah bahan
          </button>
          {pantry.length > 0 && (
            <button className={btnAdd} onClick={() => setPickerOpen(true)}>
              <Tags size={16} strokeWidth={1.75} /> Pilih harga tersimpan
            </button>
          )}
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className={eyebrow}>Total bahan</span>
          <span className={cx(serifNum, 'text-2xl')}>{rupiah(r.ingredientsTotal)}</span>
        </div>

        <Note>
          <span className="font-medium text-ink-soft">{HINTS.satuan.title}.</span> {HINTS.satuan.body}
        </Note>
      </Section>

      {/* ---------- 02 BIAYA LAIN ---------- */}
      <Section
        no="02"
        title="Biaya lain"
        desc={
          <>
            <b className="font-medium text-ink-soft">Sekali masak</b> dibagi ke semua pcs ·{' '}
            <b className="font-medium text-ink-soft">Per pcs</b> dihitung tiap biji
          </>
        }
        hint={<HintToggle hint={HINTS.biaya} />}
      >
        <div className="divide-y divide-line">
          {p.costs.map((c) => {
            const share = c.perPcs ? c.amount : p.yieldQty > 0 ? c.amount / p.yieldQty : 0
            return (
              <div key={c.id} className="grid gap-2.5 py-4 first:pt-0">
                <div className="flex items-center gap-2">
                  <input
                    className={nameInput}
                    value={c.name}
                    placeholder="Nama biaya"
                    aria-label="Nama biaya"
                    onChange={(e) => setCost(c.id, { name: e.target.value })}
                  />
                  <button
                    className={cx(btnIcon, 'hover:bg-loss-soft hover:text-loss')}
                    aria-label={`Hapus ${c.name || 'biaya'}`}
                    onClick={() => set({ costs: p.costs.filter((x) => x.id !== c.id) })}
                  >
                    <Trash2 size={17} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2.5">
                  <NumberField
                    money
                    prefix="Rp"
                    ariaLabel={`Biaya ${c.name}`}
                    {...fh(c.id, 'cost')}
                    value={c.amount}
                    onChange={(n) => setCost(c.id, { amount: n })}
                  />
                  <Segmented
                    ariaLabel="Cara hitung"
                    value={c.perPcs}
                    onChange={(v) => setCost(c.id, { perPcs: v })}
                    options={[
                      { value: false, label: 'Sekali masak' },
                      { value: true, label: 'Per pcs' },
                    ]}
                  />
                </div>
                <FieldHint text={hintFor(c.id)} />
                {c.amount > 0 && (
                  <p className="text-[0.78rem] text-muted">
                    {c.perPcs
                      ? 'Ditambahkan ke setiap pcs → '
                      : `${rupiah(c.amount)} ÷ ${num(p.yieldQty)} pcs → `}
                    <span className="font-medium text-ink">{rupiah(share)} / pcs</span>
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <button className={btnAdd} onClick={() => set({ costs: [...p.costs, newCost()] })}>
          <Plus size={16} strokeWidth={1.75} /> Tambah biaya
        </button>

        {quickCosts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {quickCosts.map((q) => (
              <button
                key={q.name}
                className="h-8 rounded-full px-3 text-[0.78rem] text-ink-soft ring-1 ring-line transition hover:bg-gold-soft hover:ring-gold/40"
                onClick={() => set({ costs: [...p.costs, { ...newCost(q.perPcs), name: q.name }] })}
              >
                + {q.name}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* ---------- 03 HASIL ---------- */}
      <Section no="03" title="Jumlah hasil" hint={<HintToggle hint={HINTS.hasil} />}>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-sm text-ink-soft">Sekali masak jadi berapa?</span>
          <NumberField
            value={p.yieldQty}
            suffix="pcs"
            ariaLabel="Jumlah hasil"
            className="w-32"
            onChange={(n) => set({ yieldQty: n })}
            {...fh('yield', 'yieldQty')}
          />
        </div>
        <div className="mt-3 grid gap-2">
          <FieldHint text={hintFor('yield')} />
          <Warnings items={warnFor('yield')} />
        </div>
      </Section>

      {/* ---------- 04 HARGA JUAL ---------- */}
      <Section
        no="04"
        title="Harga jual"
        hint={
          <HintToggle hint={HINTS.untung}>
            <table className="mt-3 w-full text-[0.82rem]">
              <tbody>
                {MARKUP_GUIDE.map((g) => (
                  <tr key={g.label} className="border-t border-gold/20">
                    <td className="py-1.5">{g.label}</td>
                    <td className="py-1.5 pl-2 text-right font-medium whitespace-nowrap text-ink">{g.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-muted italic">Patokan kasar — sesuaikan dengan harga pasaran di sekitarmu.</p>
          </HintToggle>
        }
      >
        <span className={label}>Untung yang kamu mau</span>
        <div className="flex gap-2.5">
          <Segmented
            ariaLabel="Untung persen"
            className="flex-1"
            value={r.isCustomPrice ? null : p.markupPct}
            onChange={(m) => set({ markupPct: m, customPrice: null })}
            options={MARKUP_PRESETS.map((m) => ({ value: m, label: `${m}%` }))}
          />
          <NumberField
            value={p.markupPct}
            suffix="%"
            ariaLabel="Untung persen lainnya"
            className="w-24"
            onChange={(n) => set({ markupPct: n, customPrice: null })}
            {...fh('price', 'markup')}
          />
        </div>
        {!r.isCustomPrice && r.hppPerPcs > 0 && (
          <p className="mt-2.5 text-[0.78rem] text-muted">
            {rupiah(r.hppPerPcs)} + {pct(p.markupPct)} = {rupiah(r.hppPerPcs * (1 + p.markupPct / 100))}
          </p>
        )}
        {priceOptions.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1">
              <span className={cx(label, 'mb-0 flex-1')}>Pilih harga bulat</span>
              <HintToggle hint={HINTS.pembulatan} />
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {priceOptions.map((o) => {
                const on = r.sellPrice === o.price
                return (
                  <button
                    key={o.price}
                    onClick={() => set({ customPrice: o.price === r.suggestedPrice ? null : o.price })}
                    className={cx(
                      'rounded-xl px-3.5 py-2.5 text-left transition',
                      on ? 'bg-ink text-on-ink' : 'bg-sunken text-ink hover:bg-line',
                    )}
                  >
                    <span className={cx(serifNum, 'block text-lg')}>{rupiah(o.price)}</span>
                    <span className={cx('block text-[0.75rem]', on ? 'text-on-ink/70' : 'text-muted')}>
                      untung {pct(o.pct)} · {rupiah(o.price - r.hppPerPcs)}/pcs
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <FieldHint text={hintFor('price')} />

        <div className="my-5 flex items-center gap-3 text-[0.7rem] tracking-[0.14em] text-muted uppercase before:flex-1 before:border-t before:border-line after:flex-1 after:border-t after:border-line">
          atau
        </div>

        <div className="flex items-center gap-1">
          <span className={cx(label, 'mb-0 flex-1')}>Tentukan harga jual sendiri</span>
          <HintToggle hint={HINTS.hargaManual} />
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <NumberField
            money
            prefix="Rp"
            ariaLabel="Harga jual manual"
            {...fh('price', 'customPrice')}
            className="flex-1"
            placeholder={`misal ${new Intl.NumberFormat('id-ID').format(r.suggestedPrice || 5000)}`}
            value={p.customPrice ?? 0}
            onChange={(n) => set({ customPrice: n || null })}
          />
          {r.isCustomPrice && (
            <button
              className="h-11 rounded-xl px-3 text-sm font-medium text-gold hover:bg-gold-soft"
              onClick={() => set({ customPrice: null })}
            >
              Pakai %
            </button>
          )}
        </div>
      </Section>

      <SimulationSection product={p} />

      <button
        className="mx-auto mt-2 mb-6 flex h-11 items-center gap-2 rounded-full px-4 text-sm text-muted transition hover:bg-loss-soft hover:text-loss"
        onClick={async () => {
          const ok = await confirm({
            title: `Hapus ${p.name ? `“${p.name}”` : 'produk ini'}?`,
            message: 'Produk beserta semua bahan dan biayanya akan dihapus permanen.',
            confirmLabel: 'Hapus',
            tone: 'danger',
          })
          if (ok) {
            onDelete()
            toast(`${p.name || 'Produk'} dihapus`)
          }
        }}
      >
        <Trash2 size={15} strokeWidth={1.5} /> Hapus produk
      </button>

      {/* ---------- RINGKASAN ---------- */}
      <section
        aria-live="polite"
        className="sticky bottom-0 -mx-5 rounded-t-[28px] bg-panel px-6 pt-2 pb-[calc(18px+env(safe-area-inset-bottom))] text-on-panel shadow-[0_-12px_40px_-12px_rgb(0_0_0/0.35)]"
      >
        <button
          className="mx-auto flex h-8 items-center gap-1 px-3 text-[0.7rem] tracking-[0.14em] text-panel-muted uppercase"
          aria-expanded={showDetail}
          onClick={() => setShowDetail((s) => !s)}
        >
          {showDetail ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          {showDetail ? 'Tutup rincian' : 'Rincian'}
        </button>

        {showDetail && (
          <div className="mb-4 animate-fade rounded-2xl bg-panel-raise px-4 py-3 text-[0.82rem] tabular-nums">
            {(
              [
                ['Bahan', r.ingredientsTotal],
                ['Biaya sekali masak', r.batchCostsTotal],
                [`Dibagi ${num(p.yieldQty)} pcs`, perBatchShare],
                ['Biaya per pcs', r.perPcsCostsTotal],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 text-panel-muted">
                <span>{k}</span>
                <span className="text-on-panel">{rupiah(v)}</span>
              </div>
            ))}
            <div className="my-1.5 border-t border-white/10" />
            <div className="flex justify-between py-1 text-panel-muted">
              <span>Modal sekali masak</span>
              <span className="text-on-panel">{rupiah(r.batchTotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-panel-muted">
              <span>Untung sekali masak</span>
              <span className={r.isLoss ? 'text-panel-loss' : 'text-panel-ok'}>{rupiah(r.profitPerBatch)}</span>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] tracking-[0.14em] text-panel-muted uppercase">Harga jual / pcs</p>
            <p className={cx(serifNum, 'mt-0.5 text-[2.4rem] leading-none font-medium text-panel-gold')}>
              {rupiah(r.sellPrice)}
            </p>
          </div>
          <div className="grid gap-1 pb-0.5 text-right text-[0.8rem] tabular-nums">
            <p className="text-panel-muted">
              Modal <span className="text-on-panel">{rupiah(r.hppPerPcs)}</span>
            </p>
            <p className="text-panel-muted">
              {r.isLoss ? 'Rugi' : 'Untung'}{' '}
              <span className={cx('font-medium', r.isLoss ? 'text-panel-loss' : 'text-panel-ok')}>
                {rupiah(Math.abs(r.profitPerPcs))} · {pct(Math.abs(r.profitPct))}
              </span>
            </p>
          </div>
        </div>

        {r.isLoss && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-panel-loss/15 px-3 py-2 text-[0.8rem] text-panel-loss">
            <TriangleAlert size={15} strokeWidth={1.75} className="shrink-0" />
            Harga jualmu di bawah modal. Naikkan harga atau kurangi biaya.
          </p>
        )}
      </section>

      <PantryPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        pantry={pantry}
        usedIds={new Set(p.ingredients.map((i) => i.pantryId).filter((x): x is string => !!x))}
        onPick={(item) =>
          set({
            ingredients: [
              ...p.ingredients.filter((i) => i.name.trim() || i.buyPrice || i.useQty),
              { ...newIngredient(), name: item.name, buyPrice: item.buyPrice, buyQty: item.buyQty, unit: item.unit, pantryId: item.id },
            ],
          })
        }
      />
      <UnitSheet
        ingredient={p.ingredients.find((i) => i.id === unitFor) ?? null}
        onClose={() => setUnitFor(null)}
        onPick={(id, unit) => setIng(id, { unit })}
      />
    </div>
  )
}
