import { useState } from 'react'
import { editableQty, num, parseMoney, parseQty } from '../../core/format'
import { cx, fieldBox } from '../ui'

interface Props {
  value: number
  onChange: (n: number) => void
  money?: boolean
  placeholder?: string
  ariaLabel?: string
  prefix?: string
  suffix?: string
  className?: string
  /** tanpa latar/ring (dipakai di dalam grup input) */
  bare?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

const display = (n: number, money?: boolean) =>
  !n ? '' : money ? new Intl.NumberFormat('id-ID').format(n) : num(n)

/** Input angka ramah HP: keyboard angka, titik ribuan otomatis untuk uang, koma desimal untuk takaran. */
export function NumberField({
  value,
  onChange,
  money,
  placeholder,
  ariaLabel,
  prefix,
  suffix,
  className,
  bare,
  onFocus,
  onBlur,
}: Props) {
  // teks mentah hanya dipakai saat sedang diketik; selain itu tampilkan nilai terformat
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? display(value, money)

  return (
    <label className={cx(bare ? 'flex h-11 min-w-0 items-center' : fieldBox, 'px-3', className)}>
      {prefix && <span className="pr-1.5 text-sm text-muted">{prefix}</span>}
      <input
        className="w-full min-w-0 flex-1 bg-transparent text-right font-medium tabular-nums outline-none placeholder:font-normal placeholder:text-muted/60"
        inputMode={money ? 'numeric' : 'decimal'}
        value={text}
        placeholder={placeholder ?? '0'}
        aria-label={ariaLabel}
        onFocus={(e) => {
          setDraft(money ? display(value, true) : editableQty(value))
          e.target.select()
          onFocus?.()
        }}
        onBlur={() => {
          setDraft(null)
          onBlur?.()
        }}
        onChange={(e) => {
          const raw = e.target.value
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
      {suffix && <span className="pl-1.5 text-sm whitespace-nowrap text-muted">{suffix}</span>}
    </label>
  )
}
