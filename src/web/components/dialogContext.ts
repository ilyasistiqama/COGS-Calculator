import { createContext, useContext, type ReactNode } from 'react'

export type Tone = 'default' | 'danger'

export interface ConfirmOptions {
  title: string
  message?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: Tone
}

export type ToastTone = 'success' | 'error' | 'info'
export interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

export interface DialogApi {
  confirm: (o: ConfirmOptions) => Promise<boolean>
  toast: (message: string, tone?: ToastTone) => void
}

export const Ctx = createContext<DialogApi | null>(null)

export function useDialog() {
  const api = useContext(Ctx)
  if (!api) throw new Error('useDialog harus di dalam <DialogProvider>')
  return api
}

