// Simulasi "kalau..." untuk satu produk.
import type { Product } from './types'
import { calculate } from './hpp'

export interface Simulation {
  /** HPP per pcs setelah harga bahan berubah */
  hppPerPcs: number
  /** untung per pcs kalau harga jual tetap */
  profitPerPcs: number
  profitPct: number
  isLoss: boolean
  /** harga jual baru yang disarankan dengan untung % yang sama */
  suggestedPrice: number
}

/** Harga semua bahan naik/turun sekian persen. Harga jual tetap. */
export function simulateIngredientChange(p: Product, changePct: number): Simulation {
  const factor = 1 + changePct / 100
  const changed: Product = {
    ...p,
    ingredients: p.ingredients.map((i) => ({ ...i, buyPrice: i.buyPrice * factor })),
  }
  const before = calculate(p)
  const after = calculate({ ...changed, customPrice: null })
  const profitPerPcs = before.sellPrice - after.hppPerPcs
  return {
    hppPerPcs: after.hppPerPcs,
    profitPerPcs,
    profitPct: after.hppPerPcs > 0 ? (profitPerPcs / after.hppPerPcs) * 100 : 0,
    isLoss: after.hppPerPcs > 0 && profitPerPcs < 0,
    suggestedPrice: after.suggestedPrice,
  }
}

/** Dari satu kali masak, harus laku berapa pcs supaya modalnya kembali. null kalau tidak mungkin. */
export function breakEvenPcs(p: Product): number | null {
  const r = calculate(p)
  if (r.sellPrice <= 0 || r.batchTotal <= 0) return null
  const pcs = Math.ceil(r.batchTotal / r.sellPrice - 1e-9)
  return pcs > p.yieldQty ? null : pcs
}

/** Untuk dapat untung `target`, harus jual berapa pcs & berapa kali masak. null kalau rugi. */
export function pcsForTarget(p: Product, target: number): { pcs: number; batches: number } | null {
  const r = calculate(p)
  if (r.profitPerPcs <= 0 || target <= 0) return null
  const pcs = Math.ceil(target / r.profitPerPcs - 1e-9)
  return { pcs, batches: p.yieldQty > 0 ? Math.ceil(pcs / p.yieldQty) : pcs }
}
