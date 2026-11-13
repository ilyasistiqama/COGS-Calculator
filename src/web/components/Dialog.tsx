// Pengganti alert()/confirm() bawaan browser: dialog konfirmasi + toast, senada dengan desain app.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react'
import { cx } from '../ui'
import { Ctx, type ConfirmOptions, type ToastItem, type ToastTone } from './dialogContext'

/* ---------- Sheet: panel bawah di HP, kotak tengah di layar lebar ---------- */

export function Sheet({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean
  onClose: () => void
  labelledBy?: string
  children: ReactNode
}) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-[overlay_0.2s_ease-out] bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="relative w-full max-w-md animate-[sheet_0.25s_cubic-bezier(0.2,0.9,0.3,1)] rounded-t-[28px] bg-surface px-6 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:rounded-[28px] sm:pt-6"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
        {children}
      </div>
    </div>
  )
}

/* ---------- Provider ---------- */

export function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const confirm = useCallback(
    (o: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ ...o, resolve })),
    [],
  )

  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current++
    setToasts((ts) => [...ts, { id, message, tone }])
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3200)
  }, [])

  const close = useCallback(
    (v: boolean) => {
      confirmState?.resolve(v)
      setConfirmState(null)
    },
    [confirmState],
  )
  const cancel = useCallback(() => close(false), [close])

  const danger = confirmState?.tone === 'danger'

  return (
    <Ctx.Provider value={{ confirm, toast }}>
      {children}

      <Sheet open={!!confirmState} onClose={cancel} labelledBy="confirm-title">
        {confirmState && (
          <>
            {danger && (
              <span className="mb-4 grid size-12 place-items-center rounded-full bg-loss-soft text-loss">
                <TriangleAlert size={22} strokeWidth={1.6} />
              </span>
            )}
            <h2 id="confirm-title" className="font-serif text-[1.5rem] leading-tight font-medium tracking-tight">
              {confirmState.title}
            </h2>
            {confirmState.message && (
              <div className="mt-2 text-[0.92rem] leading-relaxed text-muted">{confirmState.message}</div>
            )}
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                className="h-12 rounded-2xl bg-sunken font-medium text-ink-soft transition hover:bg-line"
                onClick={cancel}
              >
                {confirmState.cancelLabel ?? 'Batal'}
              </button>
              <button
                autoFocus
                className={cx(
                  'h-12 rounded-2xl font-medium transition active:scale-[0.99]',
                  danger ? 'bg-loss text-surface' : 'bg-ink text-on-ink',
                )}
                onClick={() => close(true)}
              >
                {confirmState.confirmLabel ?? 'Lanjutkan'}
              </button>
            </div>
          </>
        )}
      </Sheet>

      {/* Toast */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-5 pt-[calc(12px+env(safe-area-inset-top))]"
      >
        {toasts.map((t) => {
          const Icon = t.tone === 'error' ? CircleAlert : CircleCheck
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="flex max-w-md animate-[toast_0.25s_ease-out] items-center gap-2.5 rounded-2xl bg-panel px-4 py-3 text-sm text-on-panel shadow-xl"
            >
              <Icon
                size={18}
                strokeWidth={1.75}
                className={cx('shrink-0', t.tone === 'error' ? 'text-panel-loss' : t.tone === 'success' ? 'text-panel-ok' : 'text-panel-gold')}
              />
              {t.message}
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}
