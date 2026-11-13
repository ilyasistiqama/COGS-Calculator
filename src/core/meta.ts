// Info aplikasi.
export const APP_NAME = 'Kalkulator HPP'
export const CREDIT_LABEL = 'muis.life'
export const CREDIT_URL = 'https://muis.life'

export type ThemeMode = 'system' | 'light' | 'dark'
export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Otomatis' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
]
