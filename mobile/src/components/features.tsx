// Komponen fitur tambahan versi HP: bagikan teks, simulasi, kepala halaman.
import { useState, type ReactNode } from 'react'
import { Linking, Pressable, ScrollView, Share, View } from 'react-native'
import { Check, ChevronDown, ChevronUp, MessageCircle, Scale, Share2, Target, Tags, TrendingUp, type LucideIcon } from 'lucide-react-native'
import type { PantryItem, Product } from '@core/types'
import { calculate } from '@core/hpp'
import { breakEvenPcs, pcsForTarget, simulateIngredientChange } from '@core/simulate'
import { num, rupiah } from '@core/format'
import { HINTS } from '@core/hints'
import { whatsappUrl } from '@core/share'
import { Sheet, useDialog } from './dialog'
import { Eyebrow, HintBody, HintButton, Icon, NumberField, PrimaryButton, Serif, T, cardClass, cx, useHint } from './ui'

/* ---------- Bagikan ---------- */

export function ShareActions({ text, label }: { text: string; label?: string }) {
  const { toast } = useDialog()
  const wa = async () => {
    try {
      await Linking.openURL(whatsappUrl(text))
    } catch {
      toast('WhatsApp tidak bisa dibuka. Coba “Bagikan”.', 'error')
    }
  }
  return (
    <View className="gap-2.5">
      {label ? <T className="text-center text-[12px] text-muted">{label}</T> : null}
      <PrimaryButton label="Kirim ke WhatsApp" icon={MessageCircle} onPress={wa} />
      <PrimaryButton tone="soft" label="Bagikan / salin" icon={Share2} onPress={() => Share.share({ message: text })} />
    </View>
  )
}

/* ---------- Simulasi ---------- */

const CHANGE_PRESETS = [10, 20, 30]

function Block({ icon, title, first, children }: { icon: LucideIcon; title: string; first?: boolean; children: ReactNode }) {
  return (
    <View className={cx('py-4', first ? 'pt-0' : 'border-t border-line')}>
      <View className="flex-row items-center gap-2">
        <Icon as={icon} color="gold" size={16} />
        <T className="font-sans-medium text-[14px]">{title}</T>
      </View>
      <View className="mt-2.5">{children}</View>
    </View>
  )
}

export function SimulationSection({ product: p }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const [change, setChange] = useState(20)
  const [target, setTarget] = useState(1_000_000)
  const hint = useHint()
  const r = calculate(p)
  const sim = simulateIngredientChange(p, change)
  const bep = breakEvenPcs(p)
  const goal = pcsForTarget(p, target)
  const ready = r.hppPerPcs > 0 && r.sellPrice > 0

  return (
    <View className={cx(cardClass, 'mb-4 p-5')}>
      <View className="flex-row items-center gap-3">
        <Serif className="text-[13px] text-gold">05</Serif>
        <Serif className="flex-1 text-[22px] tracking-tight">Simulasi</Serif>
        <HintButton open={hint.open} onPress={hint.toggle} title={HINTS.simulasi.title} />
      </View>
      <T className="mt-1 text-[13px] text-muted">Kalau bahan naik? Harus laku berapa? Opsional — buka kalau perlu.</T>
      {hint.open ? <HintBody hint={HINTS.simulasi} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        className="mt-3 h-10 flex-row items-center gap-1.5 self-start rounded-full px-3 active:bg-gold-soft"
      >
        <Icon as={open ? ChevronUp : ChevronDown} color="gold" size={16} strokeWidth={1.75} />
        <T className="font-sans-medium text-[14px] text-gold">{open ? 'Tutup simulasi' : 'Buka simulasi'}</T>
      </Pressable>

      {!open ? null : !ready ? (
        <T className="mt-4 rounded-xl bg-sunken px-4 py-3 text-[13px] text-muted">Lengkapi bahan dan harga jual dulu.</T>
      ) : (
        <View className="mt-4">
          <Block first icon={TrendingUp} title="Kalau harga bahan naik">
            <View className="flex-row flex-wrap items-center gap-2">
              {CHANGE_PRESETS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setChange(c)}
                  className={cx('h-9 justify-center rounded-full px-3.5', change === c ? 'bg-ink' : 'bg-sunken')}
                >
                  <T className={cx('text-[13px]', change === c ? 'font-sans-medium text-on-ink' : 'text-ink-soft')}>+{c}%</T>
                </Pressable>
              ))}
              <NumberField value={change} suffix="%" label="Kenaikan harga bahan" className="w-24" onChange={setChange} />
            </View>
            <View className="mt-3 flex-row gap-2">
              <View className="flex-1 rounded-xl bg-sunken px-3.5 py-2.5">
                <T className="text-[11.5px] text-muted">Modal jadi</T>
                <Serif className="text-[16px]">{rupiah(sim.hppPerPcs)}</Serif>
                <T className="text-[11px] text-muted">dari {rupiah(r.hppPerPcs)}</T>
              </View>
              <View className={cx('flex-1 rounded-xl px-3.5 py-2.5', sim.isLoss ? 'bg-loss-soft' : 'bg-sunken')}>
                <T className="text-[11.5px] text-muted">
                  {sim.isLoss ? 'Rugi' : 'Untung'} di {rupiah(r.sellPrice)}
                </T>
                <Serif className={cx('text-[16px]', sim.isLoss ? 'text-loss' : 'text-ok')}>{rupiah(Math.abs(sim.profitPerPcs))}</Serif>
              </View>
            </View>
            {sim.suggestedPrice > r.sellPrice ? (
              <T className="mt-2 text-[12px] text-muted">
                Supaya untung tetap {num(p.markupPct)}%, naikkan harga ke{' '}
                <T className="font-sans-medium text-[12px]">{rupiah(sim.suggestedPrice)}</T>.
              </T>
            ) : null}
          </Block>

          <Block icon={Scale} title="Balik modal">
            {bep ? (
              <T className="text-[13.5px] leading-5 text-ink-soft">
                Dari {num(p.yieldQty)} pcs sekali masak, cukup laku{' '}
                <T className="font-sans-semibold text-[13.5px]">{num(bep)} pcs</T> supaya modal {rupiah(r.batchTotal)} kembali.
                Sisanya untung.
              </T>
            ) : (
              <T className="text-[13.5px] text-loss">Walau semua laku, modal sekali masak belum kembali. Naikkan harga jual.</T>
            )}
          </Block>

          <Block icon={Target} title="Target untung">
            <NumberField money prefix="Rp" value={target} label="Target untung" onChange={setTarget} />
            {goal ? (
              <T className="mt-2.5 text-[13.5px] leading-5 text-ink-soft">
                Jual <T className="font-sans-semibold text-[13.5px]">{num(goal.pcs)} pcs</T> ≈ masak {num(goal.batches)}×.
                {goal.batches >= 30 ? ` Kira-kira ${num(Math.ceil(goal.batches / 30))}× masak per hari selama sebulan.` : ''}
              </T>
            ) : (
              <T className="mt-2.5 text-[13px] text-muted">Isi target untung (misal per bulan).</T>
            )}
          </Block>
        </View>
      )}
    </View>
  )
}

/** Kepala halaman (judul + hint) untuk halaman pesanan */
export function PageHeader({
  eyebrow,
  title,
  desc,
  hint,
}: {
  eyebrow: string
  title: string
  desc: string
  hint: { title: string; body: string; example?: string }
}) {
  const h = useHint()
  return (
    <View className="pt-2 pb-6">
      <View className="flex-row items-center">
        <Eyebrow className="flex-1 text-gold">{eyebrow}</Eyebrow>
        <HintButton open={h.open} onPress={h.toggle} title={hint.title} />
      </View>
      <Serif className="mt-1 text-[34px] leading-[40px] tracking-tight">{title}</Serif>
      <T className="mt-1 text-[13px] text-muted">{desc}</T>
      {h.open ? <HintBody hint={hint} /> : null}
    </View>
  )
}

/* ---------- Pilih harga tersimpan ---------- */

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
    <Sheet open={open} onClose={onClose}>
      <Eyebrow>Harga bahan</Eyebrow>
      <Serif className="mt-1 text-[24px] tracking-tight">Pilih harga tersimpan</Serif>
      <T className="mt-1 text-[12.5px] text-muted">Harganya ikut berubah kalau diubah di halaman Harga bahan.</T>
      {pantry.length === 0 ? (
        <View className="items-center py-8">
          <Icon as={Tags} color="gold" size={24} />
          <T className="mt-2 text-[13px] text-muted">Belum ada harga tersimpan.</T>
        </View>
      ) : (
        <ScrollView className="-mx-3 mt-3 max-h-[420px]">
          {pantry.map((item) => {
            const used = usedIds.has(item.id)
            return (
              <Pressable
                key={item.id}
                disabled={used}
                onPress={() => {
                  onPick(item)
                  onClose()
                }}
                className={cx('flex-row items-center gap-3 rounded-2xl px-3 py-3', used ? 'opacity-50' : 'active:bg-sunken')}
              >
                <View className="min-w-0 flex-1">
                  <T className="font-sans-medium" numberOfLines={1}>
                    {item.name || 'Tanpa nama'}
                  </T>
                  <T className="text-[12px] text-muted">
                    {rupiah(item.buyPrice)} / {num(item.buyQty)} {item.unit}
                  </T>
                </View>
                {used ? (
                  <View className="flex-row items-center gap-1">
                    <Icon as={Check} size={14} strokeWidth={2} />
                    <T className="text-[12px] text-muted">Sudah dipakai</T>
                  </View>
                ) : null}
              </Pressable>
            )
          })}
        </ScrollView>
      )}
    </Sheet>
  )
}
