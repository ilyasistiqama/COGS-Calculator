// Class Tailwind yang dipakai ulang — satu sumber gaya biar tampilan konsisten.

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')

/** Kartu tanpa padding (untuk list) */
export const cardBase =
  'rounded-[22px] bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.03),0_8px_24px_-12px_rgb(0_0_0/0.08)] ring-1 ring-line/70'

/** Kartu utama */
export const card = `${cardBase} p-5`

/** Label kecil huruf kapital */
export const eyebrow = 'text-[0.68rem] font-semibold tracking-[0.14em] text-muted uppercase'

/** Label field */
export const label = 'mb-1.5 block text-xs font-medium text-muted'

/** Wadah input */
export const fieldBox =
  'flex h-11 min-w-0 items-center rounded-xl bg-sunken ring-1 ring-transparent transition ' +
  'focus-within:bg-surface focus-within:ring-gold/60'

export const textInput =
  'h-11 w-full min-w-0 flex-1 rounded-xl bg-sunken px-3.5 font-medium ring-1 ring-transparent transition outline-none ' +
  'placeholder:font-normal placeholder:text-muted/70 focus:bg-surface focus:ring-gold/60'

export const btnPrimary =
  'h-13 w-full rounded-2xl bg-ink font-medium tracking-wide text-on-ink shadow-[0_10px_30px_-10px_rgb(0_0_0/0.45)] transition active:scale-[0.99]'

export const btnAdd =
  'mt-3 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-gold transition hover:bg-gold-soft'

export const btnIcon =
  'grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sunken hover:text-ink'

export const serifNum = 'font-serif tabular-nums tracking-tight'

/** Input nama bahan/biaya — polos, tanpa kotak, garis bawah saat fokus */
export const nameInput =
  'h-10 w-full min-w-0 flex-1 border-b border-transparent bg-transparent text-[1.02rem] font-medium outline-none transition ' +
  'placeholder:font-normal placeholder:text-muted/70 focus:border-gold'
