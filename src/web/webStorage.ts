import type { KeyValueStorage } from '../core/storage'

// Versi web dari storage (localStorage).
export const webStorage: KeyValueStorage = {
  async getItem(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  async setItem(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* diblokir / penuh */
    }
  },
}
