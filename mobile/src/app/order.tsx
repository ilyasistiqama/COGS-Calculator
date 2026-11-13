import { useMemo } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, ClipboardList, Minus, Plus, ShoppingBasket } from 'lucide-react-native'
import { computeOrder } from '@core/order'
import { calculate } from '@core/hpp'
import { num, rupiah } from '@core/format'
import { HINTS } from '@core/hints'
import { orderText } from '@core/share'
import { useStore } from '@/lib/products'
import { useDialog } from '@/components/dialog'
import { PageHeader, ShareActions } from '@/components/features'
import { Eyebrow, Icon, IconButton, NumberField, Serif, T, cardClass, cx } from '@/components/ui'

export default function OrderScreen() {
  const insets = useSafeAreaInsets()
  const { products, order, setOrderQty, clearOrder } = useStore()
  const { confirm } = useDialog()
  const qtyOf = (id: string) => order.find((l) => l.productId === id)?.qty ?? 0
  const result = useMemo(() => computeOrder(order, products), [order, products])
  const hasOrder = result.lines.length > 0

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-row items-center justify-between px-3" style={{ paddingTop: insets.top, height: insets.top + 56 }}>
        <IconButton icon={ArrowLeft} label="Kembali" size={20} onPress={() => router.back()} />
        {hasOrder ? (
          <Pressable
            className="h-9 justify-center rounded-full px-3 active:bg-sunken"
            onPress={async () => {
              if (await confirm({ title: 'Kosongkan pesanan?', message: 'Semua jumlah pesanan akan direset ke 0.', confirmLabel: 'Kosongkan' }))
                clearOrder()
            }}
          >
            <T className="text-[13.5px] text-muted">Kosongkan</T>
          </Pressable>
        ) : null}
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        <PageHeader
          eyebrow="Kalkulator pesanan"
          title="Hitung pesanan"
          desc="Isi jumlah pesanan, modal & belanjaan langsung keluar."
          hint={HINTS.pesanan}
        />

        <View className={cx(cardClass, 'mb-4')}>
          {products.length === 0 ? <T className="p-6 text-center text-[13px] text-muted">Belum ada produk.</T> : null}
          {products.map((p, idx) => {
            const q = qtyOf(p.id)
            return (
              <View key={p.id} className={cx('flex-row items-center gap-3 px-5 py-3.5', idx > 0 && 'border-t border-line')}>
                <View className="min-w-0 flex-1">
                  <T className={cx('font-sans-medium', !q && 'text-ink-soft')} numberOfLines={1}>
                    {p.name || 'Tanpa nama'}
                  </T>
                  <T className="text-[12px] text-muted">{rupiah(calculate(p).sellPrice)} / pcs</T>
                </View>
                <View className="flex-row items-center gap-1">
                  <Pressable
                    accessibilityLabel={`Kurangi ${p.name}`}
                    disabled={!q}
                    onPress={() => setOrderQty(p.id, Math.max(0, q - 1))}
                    className={cx('size-10 items-center justify-center rounded-full bg-sunken', !q && 'opacity-30')}
                  >
                    <Icon as={Minus} size={16} color="ink-soft" strokeWidth={1.75} />
                  </Pressable>
                  <NumberField className="w-[72px]" value={q} label={`Jumlah pesanan ${p.name}`} onChange={(n) => setOrderQty(p.id, Math.floor(n))} />
                  <Pressable
                    accessibilityLabel={`Tambah ${p.name}`}
                    onPress={() => setOrderQty(p.id, q + 1)}
                    className="size-10 items-center justify-center rounded-full bg-sunken active:bg-line"
                  >
                    <Icon as={Plus} size={16} color="ink-soft" strokeWidth={1.75} />
                  </Pressable>
                </View>
              </View>
            )
          })}
        </View>

        {!hasOrder ? (
          <View className={cx(cardClass, 'items-center px-6 py-10')}>
            <View className="size-14 items-center justify-center rounded-full bg-sunken">
              <Icon as={ClipboardList} color="gold" size={24} strokeWidth={1.5} />
            </View>
            <Serif className="mt-4 text-[20px]">Belum ada pesanan</Serif>
            <T className="mt-1 text-center text-[13px] text-muted">Tambah jumlah di atas untuk melihat modal dan daftar belanja.</T>
          </View>
        ) : (
          <>
            <View className="mb-4 rounded-[22px] bg-panel p-5">
              <T className="text-[10.5px] tracking-[1.6px] text-panel-muted uppercase">Total jual</T>
              <Serif className="mt-0.5 text-[38px] leading-[42px] tracking-tight text-panel-gold">{rupiah(result.revenue)}</Serif>
              <View className="mt-4 flex-row border-t border-white/10 pt-4">
                <View className="flex-1">
                  <T className="text-[11.5px] text-panel-muted">Modal</T>
                  <T className="text-[14px] text-on-panel">{rupiah(result.cost)}</T>
                </View>
                <View className="flex-1">
                  <T className="text-[11.5px] text-panel-muted">{result.profit < 0 ? 'Rugi' : 'Untung'}</T>
                  <T className={cx('text-[14px]', result.profit < 0 ? 'text-panel-loss' : 'text-panel-ok')}>{rupiah(Math.abs(result.profit))}</T>
                </View>
                <View className="flex-1">
                  <T className="text-[11.5px] text-panel-muted">Masak</T>
                  <T className="text-[14px] text-on-panel">{result.batches}×</T>
                </View>
              </View>
            </View>

            <View className={cx(cardClass, 'mb-4 p-5')}>
              <Eyebrow>Per produk</Eyebrow>
              <View className="mt-3">
                {result.lines.map((l, idx) => (
                  <View key={l.product.id} className={cx('flex-row items-start justify-between gap-3 py-3', idx === 0 ? 'pt-0' : 'border-t border-line')}>
                    <View className="min-w-0 flex-1">
                      <T className="font-sans-medium" numberOfLines={1}>
                        {l.product.name || 'Tanpa nama'} <T className="text-muted">× {num(l.qty)}</T>
                      </T>
                      <T className="text-[12px] text-muted">
                        Masak {l.batches}× · jadi {num(l.batches * l.product.yieldQty)} pcs
                        {l.leftover > 0 ? <T className="text-[12px] text-gold"> · sisa {num(l.leftover)} bisa dijual lagi</T> : null}
                      </T>
                    </View>
                    <View className="items-end">
                      <T className="text-[14px]">{rupiah(l.revenue)}</T>
                      <T className={cx('text-[12px]', l.profit < 0 ? 'text-loss' : 'text-ok')}>
                        {l.profit < 0 ? 'Rugi ' : '+'}
                        {rupiah(Math.abs(l.profit))}
                      </T>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {result.shopping.length > 0 || result.supplies.length > 0 ? (
              <View className={cx(cardClass, 'mb-4 p-5')}>
                <View className="flex-row items-center gap-2">
                  <Icon as={ShoppingBasket} color="gold" size={16} />
                  <Eyebrow>Daftar belanja</Eyebrow>
                </View>
                <View className="mt-3">
                  {result.shopping.map((s, idx) => (
                    <View key={s.key} className={cx('flex-row items-start justify-between gap-3 py-2.5', idx === 0 ? 'pt-0' : 'border-t border-line')}>
                      <View className="min-w-0 flex-1">
                        <View className="flex-row items-center gap-1.5">
                          <T className="font-sans-medium" numberOfLines={1}>
                            {s.name}
                          </T>
                        </View>
                        <T className="text-[12px] text-muted">
                          Butuh {num(s.need)} {s.unit}
                          {s.packs > 0 ? ` · beli ${s.packs} × ${num(s.packSize)} ${s.unit}` : ''}
                        </T>
                      </View>
                      <T className="text-[14px]">{rupiah(s.cost)}</T>
                    </View>
                  ))}
                  {result.supplies.map((s) => (
                    <View key={s.name} className="flex-row items-start justify-between gap-3 border-t border-line py-2.5">
                      <View>
                        <T className="font-sans-medium">{s.name}</T>
                        <T className="text-[12px] text-muted">{num(s.qty)} pcs</T>
                      </View>
                      <T className="text-[14px]">{rupiah(s.cost)}</T>
                    </View>
                  ))}
                </View>
                <View className="mt-3 flex-row items-baseline justify-between border-t border-line pt-3">
                  <Eyebrow>Perkiraan belanja</Eyebrow>
                  <Serif className="text-[20px]">{rupiah(result.shoppingTotal)}</Serif>
                </View>
                <T className="mt-2 text-[11.5px] text-muted">Dihitung per kemasan utuh. Sisa bahan bisa dipakai untuk masak berikutnya.</T>
              </View>
            ) : null}

            <ShareActions text={orderText(result)} label="Kirim ringkasan pesanan" />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
