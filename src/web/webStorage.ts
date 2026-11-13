import type { KeyValueStorage } from '../core/storage'

// Versi web dari storage. Di React Native ganti dengan AsyncStorage.
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
