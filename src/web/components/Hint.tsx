import { useId, useState, type ReactNode } from 'react'
import { Info, TriangleAlert, X } from 'lucide-react'
import { cx } from '../ui'

interface HintContent {
  title: string
  body: string
  example?: string
}

/** Ikon "i" — ketuk untuk buka/tutup penjelasan (ramah layar sentuh, tanpa hover). */
export function HintToggle({ hint, children }: { hint: HintContent; children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <>
      <button
        type="button"
        className={cx(
          'grid size-9 shrink-0 place-items-center rounded-full transition',
          open ? 'bg-gold-soft text-gold' : 'text-muted hover:bg-sunken hover:text-ink',
        )}
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? 'Tutup penjelasan' : `Penjelasan: ${hint.title}`}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={17} strokeWidth={1.75} /> : <Info size={18} strokeWidth={1.6} />}
      </button>
      {open && (
        <div
          id={id}
          role="note"
          className="mt-2 basis-full animate-fade rounded-2xl border-l-2 border-gold bg-gold-soft/60 px-4 py-3.5 text-sm leading-relaxed text-ink-soft"
        >
          <p className="font-serif text-base text-ink">{hint.title}</p>
          <p className="mt-1">{hint.body}</p>
          {hint.example && <p className="mt-2 text-muted italic">{hint.example}</p>}
          {children}
        </div>
      )}
    </>
  )
}

/** Catatan kecil yang selalu tampil. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex gap-2 text-[0.8rem] leading-relaxed text-muted">
      <Info size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

/** Peringatan isian yang kurang. */
export function Warnings({ items }: { items: { text: string }[] }) {
  if (!items.length) return null
  return (
    <div className="grid gap-1">
      {items.map((w) => (
        <p key={w.text} className="flex items-start gap-1.5 text-[0.8rem] text-loss">
          <TriangleAlert size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          {w.text}
        </p>
      ))}
    </div>
  )
}

/** Penjelasan singkat untuk kolom yang sedang diisi. */
export function FieldHint({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <p role="note" className="flex animate-fade gap-2 rounded-xl bg-gold-soft/60 px-3 py-2 text-[0.78rem] leading-relaxed text-ink-soft">
      <Info size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold" />
      <span>{text}</span>
    </p>
  )
}
