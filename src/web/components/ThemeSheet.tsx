import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { THEME_OPTIONS, type ThemeMode } from '../../core/meta'
import { Sheet } from './Dialog'
import { cx, eyebrow } from '../ui'

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const

/** Contoh mini tampilan tiap tema */
function Preview({ mode }: { mode: ThemeMode }) {
  const light = (
    <div className="flex h-full flex-col gap-1 bg-[#f5f2ec] p-2">
      <div className="h-1.5 w-8 rounded-full bg-[#1b1915]/70" />
      <div className="h-5 rounded-md bg-white ring-1 ring-[#e6e0d5]" />
      <div className="mt-auto h-3 rounded-md bg-[#1b1915]" />
    </div>
  )
  const dark = (
    <div className="flex h-full flex-col gap-1 bg-[#11100e] p-2">
      <div className="h-1.5 w-8 rounded-full bg-[#f2ede4]/70" />
      <div className="h-5 rounded-md bg-[#1a1916] ring-1 ring-[#2b2925]" />
      <div className="mt-auto h-3 rounded-md bg-[#d4b483]/80" />
    </div>
  )
  return (
    <div className="h-20 overflow-hidden rounded-xl ring-1 ring-line">
      {mode === 'light' ? light : mode === 'dark' ? dark : (
        <div className="grid h-full grid-cols-2">
          {light}
          {dark}
        </div>
      )}
    </div>
  )
}

export function ThemeSheet({
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
    <Sheet open={open} onClose={onClose} labelledBy="theme-title">
      <p className={eyebrow}>Tampilan</p>
      <h2 id="theme-title" className="mt-1 font-serif text-[1.6rem] leading-tight font-medium tracking-tight">
        Tema
      </h2>
      <div role="radiogroup" aria-label="Tema" className="mt-5 grid grid-cols-3 gap-2.5">
        {THEME_OPTIONS.map((o) => {
          const Icon = ICONS[o.value]
          const on = mode === o.value
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={cx(
                'relative rounded-2xl p-2 text-left ring-1 transition',
                on ? 'bg-gold-soft ring-2 ring-gold' : 'ring-line hover:bg-sunken',
              )}
            >
              <Preview mode={o.value} />
              <span className="mt-2 flex items-center gap-1.5 px-1 pb-0.5 text-sm font-medium">
                <Icon size={15} strokeWidth={1.6} className={on ? 'text-gold' : 'text-muted'} />
                {o.label}
              </span>
              {on && (
                <span className="absolute top-3.5 right-3.5 grid size-5 place-items-center rounded-full bg-gold text-surface">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-[0.8rem] text-muted">“Otomatis” mengikuti pengaturan terang/gelap di HP-mu.</p>
    </Sheet>
  )
}
