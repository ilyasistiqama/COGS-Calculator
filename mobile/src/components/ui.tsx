// Komponen dasar versi React Native — kelas Tailwind sama dengan versi web.
import { useState, type ComponentProps, type ReactNode } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { Info, TriangleAlert, X, type LucideIcon } from 'lucide-react-native'
import { editableQty, num, parseMoney, parseQty } from '@core/format'

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')

/** Ambil warna token untuk prop `color` (ikon, dll). */
export function useColor(name: string): string {
  const v = useCSSVariable(`--color-${name}`)
  return typeof v === 'string' ? v : '#888'
}

/* ---------- Teks ---------- */

export function T({ className, ...rest }: ComponentProps<typeof Text>) {
  return <Text className={cx('font-sans text-[15px] text-ink', className)} {...rest} />
}

export function Serif({ className, ...rest }: ComponentProps<typeof Text>) {
  return <Text className={cx('font-serif text-ink', className)} {...rest} />
}

export function Eyebrow({ className, ...rest }: ComponentProps<typeof Text>) {
  return (
    <Text
      className={cx('font-sans-semibold text-[10.5px] tracking-[1.6px] text-muted uppercase', className)}
      {...rest}
    />
  )
}

/* ---------- Ikon ---------- */

export function Icon({
  as: As,
  size = 18,
  color = 'muted',
  strokeWidth = 1.6,
}: {
  as: LucideIcon
  size?: number
  color?: string
  strokeWidth?: number
}) {
  const c = useColor(color)
  return <As size={size} color={c} strokeWidth={strokeWidth} />
}

export function IconButton({
  icon,
  label,
  onPress,
  color = 'muted',
  size = 19,
  className,
}: {
  icon: LucideIcon
  label: string
  onPress: () => void
  color?: string
  size?: number
  className?: string
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      className={cx('size-10 items-center justify-center rounded-full active:bg-sunken', className)}
    >
      <Icon as={icon} size={size} color={color} />
    </Pressable>
  )
}

/* ---------- Kartu & section ---------- */

export const cardClass = 'rounded-[22px] border border-line bg-surface'

export function Section({
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
    <View className={cx(cardClass, 'mb-4 p-5')}>
      <View className="flex-row items-center gap-3">
        <Serif className="text-[13px] text-gold">{no}</Serif>
        <Serif className="flex-1 text-[22px] tracking-tight">{title}</Serif>
        {hint}
      </View>
      {desc ? typeof desc === 'string' ? <T className="mt-1 text-[13px] text-muted">{desc}</T> : desc : null}
      <View className="mt-4">{children}</View>
    </View>
  )
}

/* ---------- Input angka ---------- */

const display = (n: number, money?: boolean) =>
  !n ? '' : money ? new Intl.NumberFormat('id-ID').format(n) : num(n)

export function NumberField({
  value,
  onChange,
  money,
  placeholder,
  label,
  prefix,
  suffix,
  className,
  bare,
  onFocus,
  onBlur,
}: {
  value: number
  onChange: (n: number) => void
  money?: boolean
  placeholder?: string
  label?: string
  prefix?: string
  suffix?: string
  className?: string
  bare?: boolean
  onFocus?: () => void
  onBlur?: () => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? display(value, money)
  const focused = draft != null

  return (
    <View
      className={cx(
        'h-11 min-w-0 flex-row items-center px-3',
        !bare && 'rounded-xl border',
        !bare && (focused ? 'border-gold/60 bg-surface' : 'border-transparent bg-sunken'),
        className,
      )}
    >
      {prefix ? <T className="pr-1.5 text-[13px] text-muted">{prefix}</T> : null}
      <TextInput
        className="h-11 min-w-0 flex-1 p-0 text-right font-sans-medium text-[15px] text-ink"
        placeholderTextColorClassName="accent-muted/60"
        selectionColorClassName="accent-gold/40"
        cursorColorClassName="accent-gold"
        accessibilityLabel={label}
        keyboardType={money ? 'number-pad' : 'decimal-pad'}
        value={text}
        placeholder={placeholder ?? '0'}
        selectTextOnFocus
        onFocus={() => {
          setDraft(money ? display(value, true) : editableQty(value))
          onFocus?.()
        }}
        onBlur={() => {
          setDraft(null)
          onBlur?.()
        }}
        onChangeText={(raw) => {
          if (money) {
            const n = parseMoney(raw)
            setDraft(n ? new Intl.NumberFormat('id-ID').format(n) : '')
            onChange(n)
          } else {
            setDraft(raw.replace(/[^\d.,]/g, ''))
            onChange(parseQty(raw))
          }
        }}
      />
      {suffix ? <T className="pl-1.5 text-[13px] text-muted">{suffix}</T> : null}
    </View>
  )
}

export function NameInput(props: ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false)
  return (
    <TextInput
      {...props}
      className={cx(
        'h-10 min-w-0 flex-1 border-b p-0 font-sans-medium text-[16px] text-ink',
        focused ? 'border-gold' : 'border-transparent',
      )}
      placeholderTextColorClassName="accent-muted/70"
      cursorColorClassName="accent-gold"
      onFocus={(e) => {
        setFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        props.onBlur?.(e)
      }}
    />
  )
}

/* ---------- Segmented control ---------- */

export function Segmented<V extends string | number | boolean>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: V | null
  options: { value: V; label: string }[]
  onChange: (v: V) => void
  label: string
  className?: string
}) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} className={cx('flex-row rounded-xl bg-sunken p-1', className)}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o.value)}
            className={cx('h-9 flex-1 items-center justify-center rounded-[9px] px-2.5', on && 'bg-surface shadow-sm')}
          >
            <T className={cx('text-[12.5px]', on ? 'font-sans-semibold text-ink' : 'text-muted')} numberOfLines={1}>
              {o.label}
            </T>
          </Pressable>
        )
      })}
    </View>
  )
}

/* ---------- Tombol ---------- */

export function PrimaryButton({
  label,
  icon,
  onPress,
  tone = 'ink',
  className,
}: {
  label: string
  icon?: LucideIcon
  onPress: () => void
  tone?: 'ink' | 'danger' | 'soft'
  className?: string
}) {
  const bg = tone === 'danger' ? 'bg-loss' : tone === 'soft' ? 'bg-sunken' : 'bg-ink'
  const fg = tone === 'danger' ? 'text-surface' : tone === 'soft' ? 'text-ink-soft' : 'text-on-ink'
  const iconColor = tone === 'danger' ? 'surface' : tone === 'soft' ? 'ink-soft' : 'on-ink'
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cx('h-[52px] flex-row items-center justify-center gap-2 rounded-2xl active:opacity-85', bg, className)}
    >
      {icon ? <Icon as={icon} color={iconColor} size={18} strokeWidth={1.75} /> : null}
      <T className={cx('font-sans-medium text-[15px] tracking-[0.3px]', fg)}>{label}</T>
    </Pressable>
  )
}

export function AddButton({ label, onPress, icon }: { label: string; onPress: () => void; icon: LucideIcon }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mt-3 h-10 flex-row items-center gap-1.5 self-start rounded-full px-3 active:bg-gold-soft"
    >
      <Icon as={icon} color="gold" size={16} strokeWidth={1.75} />
      <T className="font-sans-medium text-[14px] text-gold">{label}</T>
    </Pressable>
  )
}

/* ---------- Hint ---------- */

interface HintContent {
  title: string
  body: string
  example?: string
}

/** Tombol "i" + isi penjelasan. Isi dirender lewat `renderBody` supaya bisa diletakkan di bawah judul. */
export function useHint() {
  const [open, setOpen] = useState(false)
  return { open, toggle: () => setOpen((o) => !o) }
}

export function HintButton({ open, onPress, title }: { open: boolean; onPress: () => void; title: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={open ? 'Tutup penjelasan' : `Penjelasan: ${title}`}
      accessibilityState={{ expanded: open }}
      hitSlop={6}
      onPress={onPress}
      className={cx('size-9 items-center justify-center rounded-full', open ? 'bg-gold-soft' : 'active:bg-sunken')}
    >
      <Icon as={open ? X : Info} color={open ? 'gold' : 'muted'} size={open ? 17 : 18} />
    </Pressable>
  )
}

export function HintBody({ hint, children }: { hint: HintContent; children?: ReactNode }) {
  return (
    <View className="mt-3 rounded-2xl border-l-2 border-gold bg-gold-soft px-4 py-3.5">
      <Serif className="text-[16px]">{hint.title}</Serif>
      <T className="mt-1 text-[13.5px] leading-5 text-ink-soft">{hint.body}</T>
      {hint.example ? <T className="mt-2 text-[13px] leading-5 text-muted italic">{hint.example}</T> : null}
      {children}
    </View>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <View className="mt-4 flex-row gap-2">
      <View className="pt-0.5">
        <Icon as={Info} size={14} strokeWidth={1.75} />
      </View>
      <T className="flex-1 text-[12.5px] leading-5 text-muted">{children}</T>
    </View>
  )
}

export function Warnings({ items }: { items: { text: string }[] }) {
  if (!items.length) return null
  return (
    <View className="gap-1">
      {items.map((w) => (
        <View key={w.text} className="flex-row items-start gap-1.5">
          <View className="pt-0.5">
            <Icon as={TriangleAlert} color="loss" size={14} strokeWidth={1.75} />
          </View>
          <T className="flex-1 text-[12.5px] text-loss">{w.text}</T>
        </View>
      ))}
    </View>
  )
}

/** Penjelasan singkat untuk kolom yang sedang diisi. */
export function FieldHint({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <View accessibilityRole="text" className="flex-row gap-2 rounded-xl bg-gold-soft px-3 py-2">
      <View className="pt-0.5">
        <Icon as={Info} color="gold" size={14} strokeWidth={1.75} />
      </View>
      <T className="flex-1 text-[12.5px] leading-5 text-ink-soft">{text}</T>
    </View>
  )
}
