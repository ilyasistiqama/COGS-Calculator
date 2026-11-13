import { useMemo, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, ChevronDown, Plus, Tags, Trash2, TriangleAlert } from 'lucide-react-native'
import type { PantryItem } from '@core/types'
import { pantryImpact } from '@core/pantry'
import { num, pct, rupiah } from '@core/format'
import { FIELD_HINTS, HINTS, UNITS } from '@core/hints'
import { useStore } from '@/lib/products'
import { Sheet, useDialog } from '@/components/dialog'
import { PageHeader } from '@/components/features'
import { Eyebrow, FieldHint, Icon, IconButton, NameInput, NumberField, PrimaryButton, Serif, T, cardClass, cx } from '@/components/ui'

export default function PantryScreen() {
  const insets = useSafeAreaInsets()
  const { pantry, products, addPantryItem, updatePantryItem, removePantryItem } = useStore()
  const { confirm, toast } = useDialog()
  const [unitFor, setUnitFor] = useState<string | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const impact = useMemo(() => pantryImpact(products), [products])
  const unitItem = pantry.find((x) => x.id === unitFor)
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
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-row items-center px-3" style={{ paddingTop: insets.top, height: insets.top + 56 }}>
        <IconButton icon={ArrowLeft} label="Kembali" size={20} onPress={() => router.back()} />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          eyebrow="Harga bahan"
          title="Harga tersimpan"
          desc="Ubah harga di sini, semua produk yang memakainya ikut terhitung ulang. Hanya daftar harga, bukan catatan stok."
          hint={HINTS.hargaBahan}
        />

        {lossCount > 0 ? (
          <View className="mb-4 flex-row items-center gap-2 rounded-2xl bg-loss-soft px-4 py-3">
            <Icon as={TriangleAlert} color="loss" size={16} strokeWidth={1.75} />
            <T className="flex-1 text-[13px] text-loss">
              {lossCount} produk sekarang rugi. Naikkan harga jualnya di halaman produk.
            </T>
          </View>
        ) : null}

        <PrimaryButton label="Tambah harga bahan" icon={Plus} className="mb-4" onPress={addPantryItem} />

        {pantry.length === 0 ? (
          <View className={cx(cardClass, 'items-center px-6 py-12')}>
            <View className="size-14 items-center justify-center rounded-full bg-sunken">
              <Icon as={Tags} color="gold" size={24} strokeWidth={1.5} />
            </View>
            <Serif className="mt-4 text-[20px]">Belum ada harga tersimpan</Serif>
            <T className="mt-1 text-center text-[13px] text-muted">
              Tambah di sini, atau tekan “Simpan harganya” di bawah bahan pada halaman produk.
            </T>
          </View>
        ) : (
          <View className={cx(cardClass, 'px-5')}>
            {pantry.map((item, idx) => {
              const used = impact.get(item.id) ?? []
              const unitPrice = item.buyQty > 0 ? item.buyPrice / item.buyQty : 0
              const hint = focus?.startsWith(`${item.id}:`) ? FIELD_HINTS[focus.split(':')[1] as 'buyPrice' | 'buyQty'] : null
              return (
                <View key={item.id} className={cx('gap-3 py-5', idx > 0 && 'border-t border-line')}>
                  <View className="flex-row items-center gap-2">
                    <NameInput
                      value={item.name}
                      autoFocus={!item.name}
                      placeholder="Nama bahan, misal Terigu"
                      accessibilityLabel="Nama bahan"
                      onChangeText={(name) => set(item, { name })}
                    />
                    <IconButton icon={Trash2} size={17} label={`Hapus ${item.name || 'harga bahan'}`} onPress={() => askRemove(item)} />
                  </View>
                  <View className="flex-row gap-2.5">
                    <View className="flex-1">
                      <T className="mb-1.5 font-sans-medium text-[12px] text-muted">Harga beli</T>
                      <NumberField
                        money
                        prefix="Rp"
                        placeholder="14.000"
                        label="Harga beli"
                        value={item.buyPrice}
                        onChange={(n) => set(item, { buyPrice: n })}
                        {...fh(`${item.id}:buyPrice`)}
                      />
                    </View>
                    <View className="flex-1">
                      <T className="mb-1.5 font-sans-medium text-[12px] text-muted">Isi kemasan</T>
                      <View className="h-11 flex-row overflow-hidden rounded-xl bg-sunken">
                        <NumberField
                          bare
                          className="flex-1"
                          placeholder="1000"
                          label="Isi kemasan"
                          value={item.buyQty}
                          onChange={(n) => set(item, { buyQty: n })}
                          {...fh(`${item.id}:buyQty`)}
                        />
                        <Pressable
                          accessibilityLabel={`Satuan: ${item.unit}`}
                          onPress={() => setUnitFor(item.id)}
                          className="w-[70px] flex-row items-center justify-center gap-1 border-l border-line active:bg-line"
                        >
                          <T className="text-[13px] text-ink-soft">{item.unit}</T>
                          <Icon as={ChevronDown} size={13} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                  <FieldHint text={hint} />

                  <View className="rounded-xl bg-sunken px-3.5 py-2.5">
                    <View className="flex-row items-baseline justify-between gap-3">
                      <T className="text-[12px] text-muted">
                        {used.length ? `Dipakai di ${used.length} produk` : 'Belum dipakai di produk'}
                      </T>
                      {unitPrice > 0 ? (
                        <Serif className="text-[14px]">
                          {unitPrice < 1 ? `Rp${num(unitPrice)}` : rupiah(unitPrice)}/{item.unit}
                        </Serif>
                      ) : null}
                    </View>
                    {used.map((u) => (
                      <Pressable
                        key={u.productId}
                        onPress={() => router.push({ pathname: '/product/[id]', params: { id: u.productId } })}
                        className="mt-1 flex-row items-center justify-between gap-3 py-0.5"
                      >
                        <T className="flex-1 text-[12.5px] text-ink-soft" numberOfLines={1}>
                          {u.name}
                        </T>
                        <T className={cx('font-sans-medium text-[12.5px]', u.isLoss ? 'text-loss' : 'text-ok')}>
                          {u.isLoss ? `Rugi ${rupiah(-u.profitPerPcs)}` : `Untung ${rupiah(u.profitPerPcs)} · ${pct(u.profitPct)}`}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      <Sheet open={!!unitItem} onClose={() => setUnitFor(null)}>
        <Eyebrow>Satuan</Eyebrow>
        <Serif className="mt-1 text-[24px] tracking-tight">{unitItem?.name || 'Pilih satuan'}</Serif>
        <View className="mt-4 flex-row flex-wrap gap-2">
          {UNITS.map((u) => {
            const on = unitItem?.unit === u
            return (
              <Pressable
                key={u}
                onPress={() => {
                  if (unitItem) set(unitItem, { unit: u })
                  setUnitFor(null)
                }}
                className={cx('h-11 min-w-[64px] items-center justify-center rounded-xl px-4', on ? 'bg-ink' : 'bg-sunken')}
              >
                <T className={cx('font-sans-medium', on ? 'text-on-ink' : 'text-ink-soft')}>{u}</T>
              </Pressable>
            )
          })}
        </View>
      </Sheet>
    </KeyboardAvoidingView>
  )
}
