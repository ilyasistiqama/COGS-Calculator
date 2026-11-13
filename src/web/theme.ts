import { useCallback, useEffect, useState } from 'react'
import type { ThemeMode } from '../core/meta'

const KEY = 'kalkulator-hpp:theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

const read = (): ThemeMode => {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

function apply(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'system') delete root.dataset.theme
  else root.dataset.theme = mode
  const dark = mode === 'dark' || (mode === 'system' && media().matches)
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#11100e' : '#f5f2ec')
}

/** Tema: Otomatis (ikut HP) / Terang / Gelap. Disimpan di browser. */
export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(read)

  useEffect(() => {
    apply(mode)
    if (mode !== 'system') return
    const mq = media()
    const onChange = () => apply('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    try {
      if (m === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, m)
    } catch {
      /* abaikan */
    }
  }, [])

  return { mode, setMode }
}
