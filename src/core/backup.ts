// Export / import backup. Fungsi murni — dipakai web & React Native.
import type { Ingredient, OtherCost, PantryItem, Product } from './types'
import { uid } from './factory'

export const BACKUP_APP = 'kalkulator-hpp'
/** v1: produk saja · v2: + harga bahan tersimpan */
export const BACKUP_VERSION = 2

export interface BackupFile {
  app: typeof BACKUP_APP
  version: number
  exportedAt: string
  products: Product[]
  pantry: PantryItem[]
}

export interface BackupData {
  products: Product[]
  pantry: PantryItem[]
}

export function createBackup(products: Product[], pantry: PantryItem[] = []): string {
  const data: BackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    products,
    pantry,
  }
  return JSON.stringify(data, null, 2)
}

/** Nama file, misal: backup-hpp-2026-11-13.json */
export function backupFileName(date = new Date()): string {
  const d = date.toISOString().slice(0, 10)
  return `backup-hpp-${d}.json`
}

export class BackupError extends Error {}

const n = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback)
const s = (v: unknown, fallback = '') => (typeof v === 'string' ? v.slice(0, 200) : fallback)
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})

function cleanIngredient(raw: unknown): Ingredient {
  const r = obj(raw)
  return {
    id: s(r.id) || uid(),
    name: s(r.name),
    buyPrice: n(r.buyPrice),
    buyQty: n(r.buyQty),
    unit: s(r.unit, 'g') || 'g',
    useQty: n(r.useQty),
    pantryId: s(r.pantryId) || null,
  }
}

function cleanPantryItem(raw: unknown): PantryItem {
  const r = obj(raw)
  return {
    id: s(r.id) || uid(),
    name: s(r.name),
    buyPrice: n(r.buyPrice),
    buyQty: n(r.buyQty),
    unit: s(r.unit, 'g') || 'g',
    updatedAt: n(r.updatedAt, Date.now()),
  }
}

function cleanCost(raw: unknown): OtherCost {
  const r = obj(raw)
  return { id: s(r.id) || uid(), name: s(r.name), amount: n(r.amount), perPcs: r.perPcs === true }
}

function cleanProduct(raw: unknown): Product {
  const r = obj(raw)
  const custom = n(r.customPrice, 0)
  return {
    id: s(r.id) || uid(),
    name: s(r.name),
    ingredients: Array.isArray(r.ingredients) ? r.ingredients.map(cleanIngredient) : [],
    costs: Array.isArray(r.costs) ? r.costs.map(cleanCost) : [],
    yieldQty: n(r.yieldQty, 1),
    markupPct: n(r.markupPct, 40),
    customPrice: custom > 0 ? custom : null,
    updatedAt: n(r.updatedAt, Date.now()),
  }
}

/** Baca & validasi isi file backup. Melempar BackupError dengan pesan yang ramah. */
export function parseBackup(text: string): BackupData {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new BackupError('File ini bukan file backup yang valid.')
  }
  const d = obj(data)
  if (d.app !== BACKUP_APP || !Array.isArray(d.products)) {
    throw new BackupError('File ini bukan backup dari Kalkulator HPP.')
  }
  if (n(d.version) > BACKUP_VERSION) {
    throw new BackupError('Backup ini dari versi aplikasi yang lebih baru. Perbarui aplikasimu dulu.')
  }
  return {
    products: d.products.map(cleanProduct),
    pantry: Array.isArray(d.pantry) ? d.pantry.map(cleanPantryItem) : [],
  }
}

/**
 * Gabungkan backup ke data sekarang. Produk dengan id sama diganti versi backup,
 * produk lain tetap ada — jadi tidak ada data yang hilang.
 */
export function mergeProducts(current: Product[], incoming: Product[]) {
  const { merged, added, replaced } = mergeById(current, incoming)
  return { merged, added, replaced }
}

export function mergeById<T extends { id: string; updatedAt: number }>(current: T[], incoming: T[]) {
  const byId = new Map(current.map((p) => [p.id, p]))
  let added = 0
  let replaced = 0
  for (const p of incoming) {
    if (byId.has(p.id)) replaced++
    else added++
    byId.set(p.id, p)
  }
  const merged = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt)
  return { merged, added, replaced }
}
