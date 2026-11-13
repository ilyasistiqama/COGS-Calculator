import { Uniwind, useUniwind } from 'uniwind'
import type { ThemeMode } from '@core/meta'
import { prefs } from './storage'

/** Pulihkan pilihan tema yang tersimpan (panggil sekali saat app mulai). */
export async function restoreTheme() {
  const saved = await prefs.get('theme')
  if (saved === 'light' || saved === 'dark') Uniwind.setTheme(saved)
}

/** Tema: Otomatis (ikut HP) / Terang / Gelap. */
export function useThemeMode() {
  const { theme, hasAdaptiveThemes } = useUniwind()
  const mode: ThemeMode = hasAdaptiveThemes ? 'system' : theme === 'dark' ? 'dark' : 'light'

  const setMode = (m: ThemeMode) => {
    Uniwind.setTheme(m)
    prefs.set('theme', m === 'system' ? null : m)
  }
  return { mode, setMode }
}
