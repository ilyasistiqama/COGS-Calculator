// Penyimpanan dibuat async supaya di React Native tinggal ganti ke AsyncStorage:
//   import AsyncStorage from '@react-native-async-storage/async-storage'
//   export const storage: KeyValueStorage = AsyncStorage
import type { OrderLine, PantryItem, Product } from './types'

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
}

const KEY = 'kalkulator-hpp:products:v1'

export async function loadProducts(storage: KeyValueStorage): Promise<Product[] | null> {
  try {
    const raw = await storage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

export async function saveProducts(storage: KeyValueStorage, products: Product[]) {
  try {
    await storage.setItem(KEY, JSON.stringify(products))
  } catch {
    // penyimpanan penuh / diblokir — data tetap ada selama halaman terbuka
  }
}

const LAST_BACKUP_KEY = 'kalkulator-hpp:last-backup:v1'

export async function loadLastBackup(storage: KeyValueStorage): Promise<number | null> {
  try {
    const v = Number(await storage.getItem(LAST_BACKUP_KEY))
    return Number.isFinite(v) && v > 0 ? v : null
  } catch {
    return null
  }
}

export async function saveLastBackup(storage: KeyValueStorage, time: number) {
  try {
    await storage.setItem(LAST_BACKUP_KEY, String(time))
  } catch {
    /* abaikan */
  }
}

/* ---------- Data lain: harga bahan & draf pesanan ---------- */

async function loadJson<T>(storage: KeyValueStorage, key: string): Promise<T | null> {
  try {
    const raw = await storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

async function saveJson(storage: KeyValueStorage, key: string, value: unknown) {
  try {
    await storage.setItem(key, JSON.stringify(value))
  } catch {
    /* abaikan */
  }
}

const PANTRY_KEY = 'kalkulator-hpp:pantry:v1'
const ORDER_KEY = 'kalkulator-hpp:order:v1'

export const loadPantry = async (s: KeyValueStorage) => {
  const d = await loadJson<PantryItem[]>(s, PANTRY_KEY)
  return Array.isArray(d) ? d : []
}
export const savePantry = (s: KeyValueStorage, v: PantryItem[]) => saveJson(s, PANTRY_KEY, v)

export const loadOrder = async (s: KeyValueStorage) => {
  const d = await loadJson<OrderLine[]>(s, ORDER_KEY)
  return Array.isArray(d) ? d : []
}
export const saveOrder = (s: KeyValueStorage, v: OrderLine[]) => saveJson(s, ORDER_KEY, v)
