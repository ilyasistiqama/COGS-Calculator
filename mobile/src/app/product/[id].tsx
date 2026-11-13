import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Check, ChevronDown, ChevronUp, Link2, Tags, Plus, Trash2, TriangleAlert } from 'lucide-react-native'
import type { Ingredient, OtherCost, PantryItem, Product } from '@core/types'
import { findPantryByName } from '@core/pantry'
import { MARKUP_PRESETS, calculate, getWarnings, ingredientCost, roundedPriceOptions } from '@core/hpp'
import { newCost, newIngredient } from '@core/factory'
import { num, pct, rupiah } from '@core/format'
import { EDITOR_TIPS, FIELD_HINTS, HINTS, MARKUP_GUIDE, UNITS, type FieldHintKey } from '@core/hints'
import { useStore } from '@/lib/products'
import { Sheet, useDialog } from '@/components/dialog'
import { PantryPickerSheet, SimulationSection } from '@/components/features'
import {
  AddButton,
  Eyebrow,
  FieldHint,
  HintBody,
  HintButton,
  Icon,
  IconButton,
  NameInput,
  Note,
  NumberField,
  Section,
  Segmented,
  Serif,
  T,
  Warnings,
  cx,
  useHint,
} from '@/components/ui'

const QUICK_COSTS: { name: string; perPcs: boolean }[] = [
  { name: 'Gas / listrik', perPcs: false },
  { name: 'Minyak goreng', perPcs: false },
  { name: 'Kemasan / mika', perPcs: true },
  { name: 'Plastik', perPcs: true },
  { name: 'Stiker', perPcs: true },
]

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { products, pantry, update, remove, saveIngredientToPantry } = useStore()
  const p = products.find((x) => x.id === id)
  if (!p) return null
  return (
    <Editor
      key={p.id}
      product={p}
      pantry={pantry}
      onChange={update}
      onSaveToPantry={(ingredientId) => saveIngredientToPantry(p.id, ingredientId)}
      onDelete={() => remove(p.id)}
    />
  )
}

function Label({ children }: { children: string }) {
  return <T className="mb-1.5 font-sans-medium text-[12px] text-muted">{children}</T>
}

function Editor({
  product: p,
  pantry,
  onChange,
  onSaveToPantry,
  onDelete,
}: {
  product: Product
  pantry: PantryItem[]
  onChange: (p: Product) => string[] | void
  onSaveToPantry: (ingredientId: string) => void
  onDelete: () => void
}) {
  const insets = useSafeAreaInsets()
  const { confirm, toast } = useDialog()
  const [showDetail, setShowDetail] = useState(false)
  const [unitFor, setUnitFor] = useState<string | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fh = (scope: string, key: FieldHintKey) => ({
    onFocus: () => setFocus(`${scope}:${key}`),
    onBlur: () => setFocus((f) => (f === `${scope}:${key}` ? null : f)),
  })
  const hintFor = (scope: string) =>
    focus?.startsWith(`${scope}:`) ? FIELD_HINTS[focus.slice(scope.length + 1) as FieldHintKey] : null
  const hBahan = useHint()
  const hBiaya = useHint()
  const hHasil = useHint()
  const hUntung = useHint()
  const hManual = useHint()
  const hBulat = useHint()

  const r = calculate(p)
  const warnings = getWarnings(p)
  const warnFor = (target: string) => warnings.filter((w) => w.target === target)

  const set = (patch: Partial<Product>) => {
    const detached = onChange({ ...p, ...patch })
    if (detached?.length) toast(`${detached.join(', ')} sekarang pakai harga sendiri di produk ini`, 'info')
  }
  const setIng = (iid: string, patch: Partial<Ingredient>) =>
    set({ ingredients: p.ingredients.map((i) => (i.id === iid ? { ...i, ...patch } : i)) })
  const setCost = (cid: string, patch: Partial<OtherCost>) =>
    set({ costs: p.costs.map((c) => (c.id === cid ? { ...c, ...patch } : c)) })

  const existingCostNames = new Set(p.costs.map((c) => c.name.toLowerCase()))
  const quickCosts = QUICK_COSTS.filter((q) => !existingCostNames.has(q.name.toLowerCase()))
  const priceOptions = roundedPriceOptions(r.hppPerPcs, p.markupPct)
  const perBatchShare = p.yieldQty > 0 ? (r.ingredientsTotal + r.batchCostsTotal) / p.yieldQty : 0
  const unitIng = p.ingredients.find((i) => i.id === unitFor)

  const askDelete = async () => {
    const ok = await confirm({
      title: `Hapus ${p.name ? `“${p.name}”` : 'produk ini'}?`,
      message: 'Produk beserta semua bahan dan biayanya akan dihapus permanen.',
      confirmLabel: 'Hapus',
      tone: 'danger',
    })
    if (!ok) return
    router.back()
    onDelete()
    toast(`${p.name || 'Produk'} dihapus`)
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between bg-bg px-3" style={{ paddingTop: insets.top, height: insets.top + 56 }}>
        <IconButton icon={ArrowLeft} label="Kembali ke daftar produk" size={20} onPress={() => router.back()} />
        <View className="flex-row items-center gap-1.5 pr-2">
          <Icon as={Check} color="ok" size={14} strokeWidth={2} />
          <T className="text-[12px] text-muted">Tersimpan otomatis</T>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-6" keyboardShouldPersistTaps="handled">
        {/* Nama */}
        <View className="pt-4 pb-6">
          <Eyebrow className="text-gold">Nama produk</Eyebrow>
          <TextInput
            className="mt-2 border-b border-line pb-2 font-serif text-[30px] text-ink"
            placeholderTextColorClassName="accent-muted/50"
            cursorColorClassName="accent-gold"
            value={p.name}
            autoFocus={!p.name}
            placeholder="Misal: Risol Mayo"
            onChangeText={(name) => set({ name })}
          />
        </View>

        {r.ingredientsTotal === 0 ? (
          <View className="mb-4 rounded-[22px] bg-gold-soft px-5 py-4">
            <Eyebrow>Tips mengisi</Eyebrow>
            <View className="mt-2 gap-1.5">
              {EDITOR_TIPS.map((t, k) => (
                <View key={t} className="flex-row gap-2.5">
                  <Serif className="text-[14px] text-gold">{k + 1}</Serif>
                  <T className="flex-1 text-[13.5px] text-ink-soft">{t}</T>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 01 Bahan */}
        <Section
          no="01"
          title="Bahan"
          desc="Untuk satu kali masak."
          hint={<HintButton open={hBahan.open} onPress={hBahan.toggle} title={HINTS.bahan.title} />}
        >
          {hBahan.open ? <View className="-mt-2 mb-4"><HintBody hint={HINTS.bahan} /></View> : null}
          {p.ingredients.length === 0 ? <T className="py-4 text-center text-[13px] text-muted">Belum ada bahan.</T> : null}

          {p.ingredients.map((i, idx) => {
            const unitPrice = i.buyQty > 0 ? i.buyPrice / i.buyQty : 0
            return (
              <View key={i.id} className={cx('gap-3 py-4', idx === 0 ? 'pt-0' : 'border-t border-line')}>
                <View className="flex-row items-center gap-2">
                  <NameInput
                    value={i.name}
                    placeholder={`Bahan ${idx + 1} — misal Terigu`}
                    accessibilityLabel={`Nama bahan ${idx + 1}`}
                    onChangeText={(name) => setIng(i.id, { name })}
                  />
                  <IconButton
                    icon={Trash2}
                    label={`Hapus ${i.name || 'bahan'}`}
                    size={17}
                    onPress={() => set({ ingredients: p.ingredients.filter((x) => x.id !== i.id) })}
                  />
                </View>

                <View className="flex-row gap-2.5">
                  <View className="flex-1">
                    <Label>Harga beli</Label>
                    <NumberField money prefix="Rp" placeholder="14.000" label="Harga beli" {...fh(i.id, 'buyPrice')} value={i.buyPrice} onChange={(n) => setIng(i.id, { buyPrice: n })} />
                  </View>
                  <View className="flex-1">
                    <Label>Isi kemasan</Label>
                    <View className="h-11 flex-row overflow-hidden rounded-xl bg-sunken">
                      <NumberField bare className="flex-1" placeholder="1000" label="Isi kemasan" {...fh(i.id, 'buyQty')} value={i.buyQty} onChange={(n) => setIng(i.id, { buyQty: n })} />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Satuan: ${i.unit}`}
                        onPress={() => setUnitFor(i.id)}
                        className="w-[70px] flex-row items-center justify-center gap-1 border-l border-line active:bg-line"
                      >
                        <T className="text-[13px] text-ink-soft">{i.unit}</T>
                        <Icon as={ChevronDown} size={13} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-end gap-2.5">
                  <View className="flex-1">
                    <Label>Dipakai</Label>
                    <NumberField placeholder="250" label="Jumlah dipakai" {...fh(i.id, 'useQty')} suffix={i.unit} value={i.useQty} onChange={(n) => setIng(i.id, { useQty: n })} />
                  </View>
                  <View className="flex-1 items-end pb-1">
                    <T className="text-[11px] text-muted">
                      {unitPrice > 0 ? `${unitPrice < 1 ? `Rp${num(unitPrice)}` : rupiah(unitPrice)} / ${i.unit}` : 'Biaya'}
                    </T>
                    <Serif className="text-[20px] tracking-tight">{rupiah(ingredientCost(i))}</Serif>
                  </View>
                </View>

                <FieldHint text={hintFor(i.id)} />
                {!focus?.startsWith(`${i.id}:`) ? <Warnings items={warnFor(i.id)} /> : null}

                {i.pantryId ? (
                  <View className="flex-row items-start gap-2 rounded-xl bg-gold-soft px-3 py-2">
                    <View className="pt-0.5">
                      <Icon as={Link2} color="gold" size={14} strokeWidth={1.75} />
                    </View>
                    <T className="flex-1 text-[12px] leading-[18px] text-ink-soft">
                      <T className="font-sans-medium text-[12px]">Harga tersimpan. </T>
                      Ikut berubah kalau diubah di Harga bahan. Ubah angkanya di sini kalau produk ini pakai harga sendiri.
                    </T>
                  </View>
                ) : findPantryByName(pantry, i.name) ? (
                  <Pressable
                    onPress={() => setIng(i.id, { pantryId: findPantryByName(pantry, i.name)!.id })}
                    className="flex-row items-center gap-2 self-start rounded-full bg-gold-soft px-3 py-1.5 active:opacity-80"
                  >
                    <Icon as={Tags} color="gold" size={13} strokeWidth={1.75} />
                    <T className="font-sans-medium text-[12px] text-ink-soft">
                      Pakai harga tersimpan: {rupiah(findPantryByName(pantry, i.name)!.buyPrice)} /{' '}
                      {num(findPantryByName(pantry, i.name)!.buyQty)} {findPantryByName(pantry, i.name)!.unit}
                    </T>
                  </Pressable>
                ) : i.name.trim() && i.buyPrice > 0 && i.buyQty > 0 ? (
                  <Pressable onPress={() => onSaveToPantry(i.id)} className="flex-row items-center gap-1.5 self-start py-1">
                    <Icon as={Tags} color="gold" size={13} strokeWidth={1.75} />
                    <T className="font-sans-medium text-[12px] text-gold">Simpan harganya</T>
                  </Pressable>
                ) : null}
              </View>
            )
          })}

          <View className="flex-row flex-wrap gap-x-1">
            <AddButton icon={Plus} label="Tambah bahan" onPress={() => set({ ingredients: [...p.ingredients, newIngredient()] })} />
            {pantry.length > 0 ? <AddButton icon={Tags} label="Pilih harga tersimpan" onPress={() => setPickerOpen(true)} /> : null}
          </View>

          <View className="mt-4 flex-row items-baseline justify-between border-t border-line pt-4">
            <Eyebrow>Total bahan</Eyebrow>
            <Serif className="text-[24px] tracking-tight">{rupiah(r.ingredientsTotal)}</Serif>
          </View>
          <Note>
            <T className="font-sans-medium text-[12.5px] text-ink-soft">{HINTS.satuan.title}. </T>
            {HINTS.satuan.body}
          </Note>
        </Section>

        {/* 02 Biaya lain */}
        <Section
          no="02"
          title="Biaya lain"
          desc={
            <T className="mt-1 text-[13px] text-muted">
              <T className="font-sans-medium text-[13px] text-ink-soft">Sekali masak</T> dibagi ke semua pcs ·{' '}
              <T className="font-sans-medium text-[13px] text-ink-soft">Per pcs</T> dihitung tiap biji
            </T>
          }
          hint={<HintButton open={hBiaya.open} onPress={hBiaya.toggle} title={HINTS.biaya.title} />}
        >
          {hBiaya.open ? <View className="-mt-2 mb-4"><HintBody hint={HINTS.biaya} /></View> : null}
          {p.costs.map((c, idx) => {
            const share = c.perPcs ? c.amount : p.yieldQty > 0 ? c.amount / p.yieldQty : 0
            return (
              <View key={c.id} className={cx('gap-2.5 py-4', idx === 0 ? 'pt-0' : 'border-t border-line')}>
                <View className="flex-row items-center gap-2">
                  <NameInput value={c.name} placeholder="Nama biaya" accessibilityLabel="Nama biaya" onChangeText={(name) => setCost(c.id, { name })} />
                  <IconButton icon={Trash2} label={`Hapus ${c.name || 'biaya'}`} size={17} onPress={() => set({ costs: p.costs.filter((x) => x.id !== c.id) })} />
                </View>
                <NumberField money prefix="Rp" label={`Biaya ${c.name}`} {...fh(c.id, 'cost')} value={c.amount} onChange={(n) => setCost(c.id, { amount: n })} />
                <Segmented
                  label="Cara hitung"
                  value={c.perPcs}
                  onChange={(v) => setCost(c.id, { perPcs: v })}
                  options={[
                    { value: false, label: 'Sekali masak' },
                    { value: true, label: 'Per pcs' },
                  ]}
                />
                <FieldHint text={hintFor(c.id)} />
                {c.amount > 0 ? (
                  <T className="text-[12px] text-muted">
                    {c.perPcs ? 'Ditambahkan ke setiap pcs → ' : `${rupiah(c.amount)} ÷ ${num(p.yieldQty)} pcs → `}
                    <T className="font-sans-medium text-[12px]">{rupiah(share)} / pcs</T>
                  </T>
                ) : null}
              </View>
            )
          })}

          <AddButton icon={Plus} label="Tambah biaya" onPress={() => set({ costs: [...p.costs, newCost()] })} />
          {quickCosts.length > 0 ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {quickCosts.map((q) => (
                <Pressable
                  key={q.name}
                  onPress={() => set({ costs: [...p.costs, { ...newCost(q.perPcs), name: q.name }] })}
                  className="h-8 justify-center rounded-full border border-line px-3 active:bg-gold-soft"
                >
                  <T className="text-[12.5px] text-ink-soft">+ {q.name}</T>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Section>

        {/* 03 Hasil */}
        <Section no="03" title="Jumlah hasil" hint={<HintButton open={hHasil.open} onPress={hHasil.toggle} title={HINTS.hasil.title} />}>
          {hHasil.open ? <View className="-mt-2 mb-4"><HintBody hint={HINTS.hasil} /></View> : null}
          <View className="flex-row items-center gap-3">
            <T className="flex-1 text-[14px] text-ink-soft">Sekali masak jadi berapa?</T>
            <NumberField className="w-32" suffix="pcs" label="Jumlah hasil" {...fh('yield', 'yieldQty')} value={p.yieldQty} onChange={(n) => set({ yieldQty: n })} />
          </View>
          <View className="mt-3 gap-2">
            <FieldHint text={hintFor('yield')} />
            <Warnings items={warnFor('yield')} />
          </View>
        </Section>

        {/* 04 Harga jual */}
        <Section no="04" title="Harga jual" hint={<HintButton open={hUntung.open} onPress={hUntung.toggle} title={HINTS.untung.title} />}>
          {hUntung.open ? (
            <View className="-mt-2 mb-4">
              <HintBody hint={HINTS.untung}>
                <View className="mt-3">
                  {MARKUP_GUIDE.map((g) => (
                    <View key={g.label} className="flex-row justify-between border-t border-gold/20 py-1.5">
                      <T className="flex-1 text-[13px] text-ink-soft">{g.label}</T>
                      <T className="pl-2 font-sans-medium text-[13px]">{g.range}</T>
                    </View>
                  ))}
                </View>
                <T className="mt-2 text-[12.5px] text-muted italic">Patokan kasar — sesuaikan dengan harga pasaran di sekitarmu.</T>
              </HintBody>
            </View>
          ) : null}

          <Label>Untung yang kamu mau</Label>
          <View className="flex-row gap-2.5">
            <Segmented
              label="Untung persen"
              className="flex-1"
              value={r.isCustomPrice ? null : p.markupPct}
              onChange={(m) => set({ markupPct: m, customPrice: null })}
              options={MARKUP_PRESETS.map((m) => ({ value: m, label: `${m}%` }))}
            />
            <NumberField className="w-[84px]" suffix="%" label="Untung persen lainnya" {...fh('price', 'markup')} value={p.markupPct} onChange={(n) => set({ markupPct: n, customPrice: null })} />
          </View>
          {!r.isCustomPrice && r.hppPerPcs > 0 ? (
            <T className="mt-2.5 text-[12px] text-muted">
              {rupiah(r.hppPerPcs)} + {pct(p.markupPct)} = {rupiah(r.hppPerPcs * (1 + p.markupPct / 100))}
            </T>
          ) : null}
          {priceOptions.length > 0 ? (
            <View className="mt-3">
              <View className="flex-row items-center">
                <T className="flex-1 font-sans-medium text-[12px] text-muted">Pilih harga bulat</T>
                <HintButton open={hBulat.open} onPress={hBulat.toggle} title={HINTS.pembulatan.title} />
              </View>
              {hBulat.open ? <View className="mb-2"><HintBody hint={HINTS.pembulatan} /></View> : null}
              <View className="mt-1.5 flex-row gap-2">
                {priceOptions.map((o) => {
                  const on = r.sellPrice === o.price
                  return (
                    <Pressable
                      key={o.price}
                      onPress={() => set({ customPrice: o.price === r.suggestedPrice ? null : o.price })}
                      className={cx('flex-1 rounded-xl px-3.5 py-2.5', on ? 'bg-ink' : 'bg-sunken')}
                    >
                      <Serif className={cx('text-[18px]', on ? 'text-on-ink' : 'text-ink')}>{rupiah(o.price)}</Serif>
                      <T className={cx('text-[11.5px]', on ? 'text-on-ink' : 'text-muted')}>
                        untung {pct(o.pct)} · {rupiah(o.price - r.hppPerPcs)}/pcs
                      </T>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ) : null}
          <View className="mt-2">
            <FieldHint text={hintFor('price')} />
          </View>

          <View className="my-5 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-line" />
            <Eyebrow>atau</Eyebrow>
            <View className="h-px flex-1 bg-line" />
          </View>

          <View className="flex-row items-center">
            <T className="flex-1 font-sans-medium text-[12px] text-muted">Tentukan harga jual sendiri</T>
            <HintButton open={hManual.open} onPress={hManual.toggle} title={HINTS.hargaManual.title} />
          </View>
          {hManual.open ? <View className="mb-3"><HintBody hint={HINTS.hargaManual} /></View> : null}
          <View className="mt-1.5 flex-row items-center gap-2">
            <NumberField
              money
              className="flex-1"
              prefix="Rp"
              label="Harga jual manual"
              {...fh('price', 'customPrice')}
              placeholder={`misal ${new Intl.NumberFormat('id-ID').format(r.suggestedPrice || 5000)}`}
              value={p.customPrice ?? 0}
              onChange={(n) => set({ customPrice: n || null })}
            />
            {r.isCustomPrice ? (
              <Pressable onPress={() => set({ customPrice: null })} className="h-11 justify-center rounded-xl px-3 active:bg-gold-soft">
                <T className="font-sans-medium text-[14px] text-gold">Pakai %</T>
              </Pressable>
            ) : null}
          </View>
        </Section>

        <SimulationSection product={p} />

        <Pressable onPress={askDelete} className="mt-2 mb-2 h-11 flex-row items-center gap-2 self-center rounded-full px-4 active:bg-loss-soft">
          <Icon as={Trash2} size={15} strokeWidth={1.5} />
          <T className="text-[13.5px] text-muted">Hapus produk</T>
        </Pressable>
      </ScrollView>

      {/* Ringkasan */}
      <View className="rounded-t-[28px] bg-panel px-6 pt-2" style={{ paddingBottom: insets.bottom + 18 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showDetail }}
          onPress={() => setShowDetail((s) => !s)}
          className="h-8 flex-row items-center gap-1 self-center px-3"
        >
          <Icon as={showDetail ? ChevronDown : ChevronUp} size={14} color="panel-muted" />
          <T className="text-[10.5px] tracking-[1.6px] text-panel-muted uppercase">{showDetail ? 'Tutup rincian' : 'Rincian'}</T>
        </Pressable>

        {showDetail ? (
          <View className="mb-4 rounded-2xl bg-panel-raise px-4 py-3">
            {(
              [
                ['Bahan', r.ingredientsTotal],
                ['Biaya sekali masak', r.batchCostsTotal],
                [`Dibagi ${num(p.yieldQty)} pcs`, perBatchShare],
                ['Biaya per pcs', r.perPcsCostsTotal],
              ] as const
            ).map(([k, v]) => (
              <View key={k} className="flex-row justify-between py-1">
                <T className="text-[13px] text-panel-muted">{k}</T>
                <T className="text-[13px] text-on-panel">{rupiah(v)}</T>
              </View>
            ))}
            <View className="my-1.5 h-px bg-white/10" />
            <View className="flex-row justify-between py-1">
              <T className="text-[13px] text-panel-muted">Modal sekali masak</T>
              <T className="text-[13px] text-on-panel">{rupiah(r.batchTotal)}</T>
            </View>
            <View className="flex-row justify-between py-1">
              <T className="text-[13px] text-panel-muted">Untung sekali masak</T>
              <T className={cx('text-[13px]', r.isLoss ? 'text-panel-loss' : 'text-panel-ok')}>{rupiah(r.profitPerBatch)}</T>
            </View>
          </View>
        ) : null}

        <View className="flex-row items-end justify-between gap-4">
          <View>
            <T className="text-[10.5px] tracking-[1.6px] text-panel-muted uppercase">Harga jual / pcs</T>
            <Serif className="mt-0.5 text-[38px] leading-[42px] tracking-tight text-panel-gold">{rupiah(r.sellPrice)}</Serif>
          </View>
          <View className="items-end gap-1 pb-1">
            <T className="text-[12.5px] text-panel-muted">
              Modal <T className="text-[12.5px] text-on-panel">{rupiah(r.hppPerPcs)}</T>
            </T>
            <T className="text-[12.5px] text-panel-muted">
              {r.isLoss ? 'Rugi' : 'Untung'}{' '}
              <T className={cx('font-sans-medium text-[12.5px]', r.isLoss ? 'text-panel-loss' : 'text-panel-ok')}>
                {rupiah(Math.abs(r.profitPerPcs))} · {pct(Math.abs(r.profitPct))}
              </T>
            </T>
          </View>
        </View>
        {r.isLoss ? (
          <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-panel-loss/15 px-3 py-2">
            <Icon as={TriangleAlert} size={15} color="panel-loss" strokeWidth={1.75} />
            <T className="flex-1 text-[12.5px] text-panel-loss">Harga jualmu di bawah modal. Naikkan harga atau kurangi biaya.</T>
          </View>
        ) : null}
      </View>

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

      {/* Pilih satuan */}
      <Sheet open={!!unitIng} onClose={() => setUnitFor(null)}>
        <Eyebrow>Satuan</Eyebrow>
        <Serif className="mt-1 text-[24px] tracking-tight">{unitIng?.name || 'Pilih satuan'}</Serif>
        <View className="mt-4 flex-row flex-wrap gap-2">
          {UNITS.map((u) => {
            const on = unitIng?.unit === u
            return (
              <Pressable
                key={u}
                onPress={() => {
                  if (unitIng) setIng(unitIng.id, { unit: u })
                  setUnitFor(null)
                }}
                className={cx('h-11 min-w-[64px] items-center justify-center rounded-xl px-4', on ? 'bg-ink' : 'bg-sunken')}
              >
                <T className={cx('font-sans-medium', on ? 'text-on-ink' : 'text-ink-soft')}>{u}</T>
              </Pressable>
            )
          })}
        </View>
        <T className="mt-4 text-[12.5px] leading-5 text-muted">{HINTS.satuan.body}</T>
      </Sheet>
    </KeyboardAvoidingView>
  )
}
