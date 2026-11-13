import { useEffect, useState } from 'react'
import { Linking, Pressable, ScrollView, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  ClipboardList,
  CookingPot,
  DatabaseBackup,
  Monitor,
  Moon,
  Plus,
  Share2,
  ShieldCheck,
  Sun,
  Tags,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react-native'
import { calculate } from '@core/hpp'
import { needsBackup, rupiah, timeAgo } from '@core/format'
import { HINTS, ONBOARDING_STEPS } from '@core/hints'
import { BackupError, parseBackup } from '@core/backup'
import { DEFAULT_PRICE_LIST, priceListText } from '@core/share'
import { CREDIT_LABEL, CREDIT_URL, THEME_OPTIONS, type ThemeMode } from '@core/meta'
import { useStore } from '@/lib/products'
import { prefs } from '@/lib/storage'
import { useThemeMode } from '@/lib/theme'
import { pickBackupText, shareBackup } from '@/lib/backupNative'
import { Sheet, useDialog } from '@/components/dialog'
import { ShareActions } from '@/components/features'
import { Eyebrow, Icon, IconButton, PrimaryButton, Serif, T, cardClass, cx } from '@/components/ui'

const THEME_ICON: Record<ThemeMode, LucideIcon> = { system: Monitor, light: Sun, dark: Moon }

export default function ProductListScreen() {
  const insets = useSafeAreaInsets()
  const store = useStore()
  const { products } = store
  const theme = useThemeMode()
  const [introHidden, setIntroHidden] = useState(true)
  const [themeOpen, setThemeOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [pricesOpen, setPricesOpen] = useState(false)

  useEffect(() => {
    prefs.get('intro-hidden').then((v) => setIntroHidden(v === '1'))
  }, [])
  const toggleIntro = (hidden: boolean) => {
    setIntroHidden(hidden)
    prefs.set('intro-hidden', hidden ? '1' : '0')
  }

  const open = (id: string) => router.push({ pathname: '/product/[id]', params: { id } })

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }} className="px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Eyebrow className="text-gold">Kalkulator HPP</Eyebrow>
          <View className="-my-2 -mr-2 flex-row">
            <IconButton icon={THEME_ICON[theme.mode]} label="Ganti tema" onPress={() => setThemeOpen(true)} />
            <IconButton icon={DatabaseBackup} label="Backup & pulihkan data" size={20} onPress={() => setBackupOpen(true)} />
          </View>
        </View>
        <Serif className="mt-2 text-[34px] leading-[40px] tracking-tight">Produk saya</Serif>
        <T className="mt-1 text-[13px] text-muted">
          {products.length ? `${products.length} produk tersimpan` : 'Hitung modal & harga jual dengan tenang'}
        </T>

        {/* Cara pakai */}
        {!introHidden ? (
          <View className="mt-6 mb-6 rounded-[22px] bg-gold-soft px-5 pt-5 pb-4">
            <View className="flex-row items-center justify-between">
              <Eyebrow>Cara pakai</Eyebrow>
              <IconButton icon={X} label="Tutup cara pakai" size={18} className="-my-2 -mr-2" onPress={() => toggleIntro(true)} />
            </View>
            <View className="mt-3 gap-3">
              {ONBOARDING_STEPS.map((s, i) => (
                <View key={s.title} className="flex-row gap-3.5">
                  <Serif className="w-6 text-[18px] text-gold">0{i + 1}</Serif>
                  <View className="flex-1">
                    <T className="font-sans-medium">{s.title}</T>
                    <T className="text-[13px] text-muted">{s.body}</T>
                  </View>
                </View>
              ))}
            </View>
            <View className="mt-4 border-t border-gold/20 pt-3">
              <T className="text-[12.5px] leading-5 text-ink-soft">
                <T className="font-sans-medium text-[12.5px]">{HINTS.hpp.title}</T> {HINTS.hpp.body}
              </T>
            </View>
          </View>
        ) : (
          <Pressable className="mt-5 mb-4 self-start py-1" onPress={() => toggleIntro(false)}>
            <T className="font-sans-medium text-[14px] text-gold">Lihat cara pakai</T>
          </Pressable>
        )}

        {/* Menu cepat */}
        <View className="mb-4 flex-row gap-2.5">
          {(
            [
              { icon: Tags, label: 'Harga bahan', sub: store.pantry.length ? `${store.pantry.length} tersimpan` : 'Ubah sekali', onPress: () => router.push('/pantry') },
              { icon: ClipboardList, label: 'Pesanan', sub: store.order.length ? `${store.order.length} produk` : 'Hitung & belanja', onPress: () => router.push('/order') },
              { icon: Share2, label: 'Bagikan', sub: 'Daftar harga', onPress: () => setPricesOpen(true) },
            ] as const
          ).map((a) => (
            <Pressable key={a.label} onPress={a.onPress} className={cx(cardClass, 'flex-1 gap-2.5 p-3.5 active:border-gold/50')}>
              <View className="size-9 items-center justify-center rounded-full bg-gold-soft">
                <Icon as={a.icon} color="gold" size={17} />
              </View>
              <View>
                <T className="font-sans-medium text-[13.5px] leading-[17px]">{a.label}</T>
                <T className="text-[11.5px] text-muted">{a.sub}</T>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Pengingat backup */}
        {products.length > 0 && needsBackup(store.lastBackupAt) ? (
          <Pressable
            onPress={() => setBackupOpen(true)}
            className="mb-4 flex-row items-center gap-3 rounded-2xl border border-line px-4 py-3 active:bg-surface"
          >
            <Icon as={DatabaseBackup} color="gold" size={18} strokeWidth={1.5} />
            <T className="flex-1 text-[12.5px] text-ink-soft">
              Backup terakhir <T className="font-sans-medium text-[12.5px]">{timeAgo(store.lastBackupAt)}</T>. Amankan
              datamu sekarang.
            </T>
            <Icon as={ChevronRight} size={16} strokeWidth={1.5} />
          </Pressable>
        ) : null}

        {/* Daftar produk */}
        {products.length === 0 ? (
          <View className={cx(cardClass, 'items-center px-6 py-12')}>
            <View className="size-14 items-center justify-center rounded-full bg-sunken">
              <Icon as={CookingPot} color="gold" size={24} strokeWidth={1.5} />
            </View>
            <Serif className="mt-4 text-[20px]">Belum ada produk</Serif>
            <T className="mt-1 max-w-60 text-center text-[13px] text-muted">
              Tambahkan produk pertamamu untuk mulai menghitung.
            </T>
          </View>
        ) : (
          <View className={cx(cardClass, 'overflow-hidden')}>
            {products.map((p, i) => {
              const r = calculate(p)
              return (
                <Pressable
                  key={p.id}
                  onPress={() => open(p.id)}
                  className={cx('flex-row items-center gap-4 px-5 py-4 active:bg-sunken', i > 0 && 'border-t border-line')}
                >
                  <View className="min-w-0 flex-1">
                    <T className="font-sans-medium" numberOfLines={1}>
                      {p.name || 'Tanpa nama'}
                    </T>
                    <T className="mt-0.5 text-[12.5px] text-muted">Modal {rupiah(r.hppPerPcs)}</T>
                  </View>
                  <View className="items-end">
                    <Serif className="text-[20px] tracking-tight">{rupiah(r.sellPrice)}</Serif>
                    <T className={cx('mt-0.5 font-sans-medium text-[12px]', r.isLoss ? 'text-loss' : 'text-ok')}>
                      {r.isLoss ? `Rugi ${rupiah(-r.profitPerPcs)}` : `Untung ${rupiah(r.profitPerPcs)}`}
                    </T>
                  </View>
                  <Icon as={ChevronRight} size={18} strokeWidth={1.5} />
                </Pressable>
              )
            })}
          </View>
        )}

        {/* Credit */}
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(CREDIT_URL)}
          className="mt-10 flex-row items-center justify-center gap-1 self-center py-2"
        >
          <T className="text-[12px] text-muted">Created by</T>
          <T className="font-sans-medium text-[12px] text-ink-soft underline">{CREDIT_LABEL}</T>
          <Icon as={ArrowUpRight} size={12} color="ink-soft" strokeWidth={2} />
        </Pressable>
      </ScrollView>

      {/* Tombol tambah */}
      <View className="absolute inset-x-0 bottom-0 bg-bg/90 px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <PrimaryButton label="Tambah produk" icon={Plus} onPress={() => open(store.add())} />
      </View>

      <ThemeSheet open={themeOpen} onClose={() => setThemeOpen(false)} mode={theme.mode} onChange={theme.setMode} />
      <BackupSheet open={backupOpen} onClose={() => setBackupOpen(false)} />
      <PriceListSheet open={pricesOpen} onClose={() => setPricesOpen(false)} />
    </View>
  )
}

/* ---------- Tema ---------- */

function ThemeSheet({
  open,
  onClose,
  mode,
  onChange,
}: {
  open: boolean
  onClose: () => void
  mode: ThemeMode
  onChange: (m: ThemeMode) => void
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <Eyebrow>Tampilan</Eyebrow>
      <Serif className="mt-1 text-[26px] tracking-tight">Tema</Serif>
      <View accessibilityRole="radiogroup" className="mt-5 flex-row gap-2.5">
        {THEME_OPTIONS.map((o) => {
          const on = mode === o.value
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => onChange(o.value)}
              className={cx('flex-1 rounded-2xl p-2', on ? 'border-2 border-gold bg-gold-soft' : 'border border-line')}
            >
              <View className="h-20 flex-row overflow-hidden rounded-xl border border-line">
                {o.value !== 'dark' ? <MiniPreview dark={false} /> : null}
                {o.value !== 'light' ? <MiniPreview dark /> : null}
              </View>
              <View className="mt-2 flex-row items-center gap-1.5 px-1 pb-0.5">
                <Icon as={THEME_ICON[o.value]} size={15} color={on ? 'gold' : 'muted'} />
                <T className="font-sans-medium text-[13.5px]">{o.label}</T>
              </View>
              {on ? (
                <View className="absolute top-3.5 right-3.5 size-5 items-center justify-center rounded-full bg-gold">
                  <Icon as={Check} size={12} strokeWidth={3} color="surface" />
                </View>
              ) : null}
            </Pressable>
          )
        })}
      </View>
      <T className="mt-4 text-[12.5px] text-muted">“Otomatis” mengikuti pengaturan terang/gelap di HP-mu.</T>
    </Sheet>
  )
}

function MiniPreview({ dark }: { dark: boolean }) {
  return (
    <View className="flex-1 gap-1 p-2" style={{ backgroundColor: dark ? '#11100e' : '#f5f2ec' }}>
      <View className="h-1.5 w-8 rounded-full" style={{ backgroundColor: dark ? '#f2ede4b3' : '#1b1915b3' }} />
      <View className="h-5 rounded-md" style={{ backgroundColor: dark ? '#1a1916' : '#ffffff' }} />
      <View className="mt-auto h-3 rounded-md" style={{ backgroundColor: dark ? '#d4b483cc' : '#1b1915' }} />
    </View>
  )
}

/* ---------- Backup ---------- */

function BackupOption({ icon, title, desc, onPress }: { icon: LucideIcon; title: string; desc: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-4 rounded-2xl px-3 py-3 active:bg-sunken">
      <View className="size-11 items-center justify-center rounded-full bg-gold-soft">
        <Icon as={icon} color="gold" size={19} />
      </View>
      <View className="min-w-0 flex-1">
        <T className="font-sans-medium">{title}</T>
        <T className="text-[12.5px] text-muted">{desc}</T>
      </View>
      <Icon as={ChevronRight} size={18} strokeWidth={1.5} />
    </Pressable>
  )
}

function BackupSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore()
  const { confirm, toast } = useDialog()

  const doShare = async () => {
    try {
      await shareBackup(store.exportBackup())
      store.markBackedUp()
      onClose()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal membuat backup.', 'error')
    }
  }

  const doImport = async () => {
    let text: string | null
    try {
      text = await pickBackupText()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'File tidak bisa dibaca.', 'error')
      return
    }
    if (text == null) return

    let count: number
    try {
      count = parseBackup(text).products.length
    } catch (e) {
      toast(e instanceof BackupError ? e.message : 'File tidak bisa dibaca.', 'error')
      return
    }

    onClose()
    const ok = await confirm({
      title: `Pulihkan ${count} produk?`,
      message:
        'Produk dari backup akan ditambahkan ke daftarmu. Produk yang sama akan diganti dengan versi dari backup. Produk lain tetap aman.',
      confirmLabel: 'Pulihkan',
    })
    if (!ok) return
    const { added, replaced, pantryAdded } = store.importBackup(text)
    const parts = [
      added && `${added} produk baru`,
      replaced && `${replaced} diperbarui`,
      pantryAdded && `${pantryAdded} harga bahan`,
    ].filter(Boolean)
    toast(`Berhasil dipulihkan${parts.length ? `: ${parts.join(', ')}` : ''}`)
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <Eyebrow>Cadangan data</Eyebrow>
      <Serif className="mt-1 text-[26px] tracking-tight">Backup & pulihkan</Serif>
      <T className="mt-2 text-[13.5px] leading-5 text-muted">
        Datamu hanya tersimpan di HP ini. Simpan backup secara rutin supaya tidak hilang saat ganti HP atau aplikasi
        terhapus.
      </T>
      <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-sunken px-3.5 py-2.5">
        <Icon as={ShieldCheck} color="gold" size={16} />
        <T className="text-[12.5px] text-ink-soft">
          {store.products.length} produk · backup terakhir{' '}
          <T className="font-sans-medium text-[12.5px]">{timeAgo(store.lastBackupAt)}</T>
        </T>
      </View>
      <View className="-mx-3 mt-3">
        <BackupOption
          icon={Share2}
          title="Simpan / kirim backup"
          desc="Ke WhatsApp, Google Drive, atau folder di HP"
          onPress={doShare}
        />
        <BackupOption icon={Upload} title="Pulihkan dari file" desc="Pilih file backup yang pernah disimpan" onPress={doImport} />
      </View>
    </Sheet>
  )
}

/* ---------- Bagikan daftar harga ---------- */

function PriceListSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products } = useStore()
  const [title, setTitle] = useState(DEFAULT_PRICE_LIST.title)
  const [note, setNote] = useState(DEFAULT_PRICE_LIST.note)
  const text = priceListText(products, { title, note })
  const input = 'h-11 rounded-xl bg-sunken px-3.5 font-sans-medium text-[15px] text-ink'
  return (
    <Sheet open={open} onClose={onClose}>
      <Eyebrow>Bagikan</Eyebrow>
      <Serif className="mt-1 text-[24px] tracking-tight">Daftar harga</Serif>
      <T className="mt-1 text-[12.5px] leading-5 text-muted">{HINTS.bagikan.body}</T>
      <View className="mt-4 gap-2">
        <TextInput className={input} value={title} onChangeText={setTitle} placeholder="Judul" placeholderTextColorClassName="accent-muted" />
        <TextInput className={input} value={note} onChangeText={setNote} placeholder="Catatan (opsional)" placeholderTextColorClassName="accent-muted" />
      </View>
      <ScrollView className="mt-3 max-h-40 rounded-2xl bg-sunken px-4 py-3">
        <T className="text-[12.5px] leading-5 text-ink-soft">{text}</T>
      </ScrollView>
      <View className="mt-4">
        <ShareActions text={text} />
      </View>
    </Sheet>
  )
}
