// Harga bahan tersimpan: satu harga yang BOLEH dipakai beberapa produk.
// - Produk memilih per bahan: pakai harga tersimpan, atau harga sendiri.
// - Ubah harga di halaman Harga bahan → semua produk yang memakainya ikut berubah.
// - Ubah harga di dalam produk → bahan itu jadi harga sendiri (produk lain tidak tersentuh).
// Fungsi murni — web & React Native.
import type { Ingredient, PantryItem, Product } from './types'
import { uid } from './factory'
import { calculate } from './hpp'

export type PantryMap = Map<string, PantryItem>

export const pantryMap = (pantry: PantryItem[]): PantryMap => new Map(pantry.map((x) => [x.id, x]))

/** Isi nama/harga/isi/satuan bahan dari harga tersimpan kalau dipakai. */
export function resolveIngredient(i: Ingredient, map: PantryMap): Ingredient {
  const item = i.pantryId ? map.get(i.pantryId) : undefined
  if (!item) return i.pantryId ? { ...i, pantryId: null } : i
  return { ...i, name: item.name, buyPrice: item.buyPrice, buyQty: item.buyQty, unit: item.unit }
}

export function resolveProduct(p: Product, map: PantryMap): Product {
  return { ...p, ingredients: p.ingredients.map((i) => resolveIngredient(i, map)) }
}

/** Apakah isian bahan berbeda dari harga tersimpannya (berarti pengguna memakai harga sendiri) */
export function differsFromPantry(i: Ingredient, item: PantryItem): boolean {
  return i.name !== item.name || i.buyPrice !== item.buyPrice || i.buyQty !== item.buyQty || i.unit !== item.unit
}

/**
 * Bahan yang diubah langsung di produk tidak lagi memakai harga tersimpan.
 * Mengembalikan produk baru + nama bahan yang barusan dilepas (untuk notifikasi).
 */
export function detachEdited(p: Product, map: PantryMap): { product: Product; detached: string[] } {
  const detached: string[] = []
  const ingredients = p.ingredients.map((i) => {
    const item = i.pantryId ? map.get(i.pantryId) : undefined
    if (!item || !differsFromPantry(i, item)) return i
    detached.push(item.name || i.name)
    return { ...i, pantryId: null }
  })
  return { product: detached.length ? { ...p, ingredients } : p, detached }
}

export function pantryFromIngredient(i: Ingredient): PantryItem {
  return { id: uid(), name: i.name.trim(), buyPrice: i.buyPrice, buyQty: i.buyQty, unit: i.unit, updatedAt: Date.now() }
}

export const newPantryItem = (): PantryItem => ({
  id: uid(),
  name: '',
  buyPrice: 0,
  buyQty: 0,
  unit: 'g',
  updatedAt: Date.now(),
})

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')

/** Cari harga tersimpan dengan nama yang sama (tanpa beda huruf besar/kecil). */
export function findPantryByName(pantry: PantryItem[], name: string): PantryItem | undefined {
  const n = norm(name)
  return n ? pantry.find((x) => norm(x.name) === n) : undefined
}

export interface PantryImpact {
  productId: string
  name: string
  hppPerPcs: number
  sellPrice: number
  profitPerPcs: number
  profitPct: number
  isLoss: boolean
}

/** Produk yang memakai tiap harga tersimpan + untung/rugi terkininya. `products` sudah di-resolve. */
export function pantryImpact(products: Product[]): Map<string, PantryImpact[]> {
  const out = new Map<string, PantryImpact[]>()
  for (const p of products) {
    const ids = new Set(p.ingredients.map((i) => i.pantryId).filter((x): x is string => !!x))
    if (!ids.size) continue
    const r = calculate(p)
    const row: PantryImpact = {
      productId: p.id,
      name: p.name || 'Tanpa nama',
      hppPerPcs: r.hppPerPcs,
      sellPrice: r.sellPrice,
      profitPerPcs: r.profitPerPcs,
      profitPct: r.profitPct,
      isLoss: r.isLoss,
    }
    for (const id of ids) out.set(id, [...(out.get(id) ?? []), row])
  }
  return out
}

/** Hapus harga tersimpan: produk yang memakainya tetap punya bahannya (nilainya disalin jadi harga sendiri). */
export function detachPantryItem(products: Product[], item: PantryItem): Product[] {
  return products.map((p) =>
    p.ingredients.some((i) => i.pantryId === item.id)
      ? {
          ...p,
          ingredients: p.ingredients.map((i) =>
            i.pantryId === item.id
              ? { ...i, pantryId: null, name: item.name, buyPrice: item.buyPrice, buyQty: item.buyQty, unit: item.unit }
              : i,
          ),
        }
      : p,
  )
}
