import { useState } from 'react'
import type { Ingredient } from '../../core/types'
import { HINTS, UNITS } from '../../core/hints'
import { Sheet } from './Dialog'
import { cx, eyebrow, textInput } from '../ui'

/** Pengganti <select> bawaan browser: pilih satuan lewat panel yang rapi. */
export function UnitSheet({
  ingredient,
  onClose,
  onPick,
}: {
  ingredient: Ingredient | null
  onClose: () => void
  onPick: (id: string, unit: string) => void
}) {
  return (
    <Sheet open={!!ingredient} onClose={onClose} labelledBy="unit-title">
      {ingredient && <Body key={ingredient.id} ingredient={ingredient} onClose={onClose} onPick={onPick} />}
    </Sheet>
  )
}

function Body({
  ingredient: i,
  onClose,
  onPick,
}: {
  ingredient: Ingredient
  onClose: () => void
  onPick: (id: string, unit: string) => void
}) {
  const isCustom = !!i.unit && !UNITS.includes(i.unit)
  const [custom, setCustom] = useState(isCustom ? i.unit : '')
  const pick = (u: string) => {
    onPick(i.id, u)
    onClose()
  }

  return (
    <>
      <p className={eyebrow}>Satuan</p>
      <h2 id="unit-title" className="mt-1 font-serif text-[1.5rem] leading-tight font-medium tracking-tight">
        {i.name || 'Pilih satuan'}
      </h2>

      <div role="radiogroup" aria-label="Satuan" className="mt-4 grid grid-cols-4 gap-2">
        {UNITS.map((u) => {
          const on = i.unit === u
          return (
            <button
              key={u}
              role="radio"
              aria-checked={on}
              onClick={() => pick(u)}
              className={cx(
                'h-11 rounded-xl text-sm font-medium transition',
                on ? 'bg-ink text-on-ink' : 'bg-sunken text-ink-soft hover:bg-line',
              )}
            >
              {u}
            </button>
          )
        })}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const v = custom.trim()
          if (v) pick(v.slice(0, 12))
        }}
      >
        <input
          className={cx(textInput, isCustom && 'ring-gold/60')}
          placeholder="Satuan lain, misal: papan"
          aria-label="Satuan lain"
          value={custom}
          maxLength={12}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          type="submit"
          disabled={!custom.trim()}
          className="h-11 shrink-0 rounded-xl bg-ink px-4 text-sm font-medium text-on-ink transition disabled:opacity-30"
        >
          Pakai
        </button>
      </form>

      <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">{HINTS.satuan.body}</p>
    </>
  )
}
