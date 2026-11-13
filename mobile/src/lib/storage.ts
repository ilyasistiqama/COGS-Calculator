import AsyncStorage from '@react-native-async-storage/async-storage'
import type { KeyValueStorage } from '@core/storage'

// Versi React Native dari storage (web memakai localStorage).
export const nativeStorage: KeyValueStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
}

/** Preferensi kecil (tema, intro) */
export const prefs = {
  async get(key: string) {
    try {
      return await AsyncStorage.getItem(`kalkulator-hpp:${key}`)
    } catch {
      return null
    }
  },
  async set(key: string, value: string | null) {
    try {
      if (value == null) await AsyncStorage.removeItem(`kalkulator-hpp:${key}`)
      else await AsyncStorage.setItem(`kalkulator-hpp:${key}`, value)
    } catch {
      /* abaikan */
    }
  },
}
