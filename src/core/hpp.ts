// Semua rumus HPP. Fungsi murni.
import type { Ingredient, OtherCost, Product } from './types'

export const ROUND_TO = 500
export const MARKUP_PRESETS = [30, 40, 50, 100]

export function ingredientCost(i: Ingredient): number {
  if (!i.buyQty || i.buyQty <= 0) return 0
  return (i.buyPrice / i.buyQty) * i.useQty
}

export function roundUp(value: number, step = ROUND_TO): number {
  if (value <= 0) return 0
  return Math.ceil(value / step) * step
}

export interface HppResult {
  ingredientsTotal: number
  batchCostsTotal: number
  perPcsCostsTotal: number
  batchTotal: number
  hppPerPcs: number
  suggestedPrice: number
  sellPrice: number
  profitPerPcs: number
  profitPct: number
  profitPerBatch: number
  isLoss: boolean
  isCustomPrice: boolean
}

export interface Warning {
  /** id bahan/biaya terkait, atau 'yield' / 'general' */
  target: string
  text: string
}

/** Cek isian yang kemungkinan salah, supaya pengguna langsung tahu apa yang kurang. */
export function getWarnings(p: Product): Warning[] {
  const w: Warning[] = []
  for (const i of p.ingredients) {
    const name = i.name.trim() || 'Bahan ini'
    const touched = i.buyPrice || i.buyQty || i.useQty
    if (!touched) continue
    if (!i.buyPrice) w.push({ target: i.id, text: `${name}: harga beli belum diisi` })
    if (!i.buyQty) w.push({ target: i.id, text: `${name}: isi kemasan belum diisi` })
    if (!i.useQty) w.push({ target: i.id, text: `${name}: jumlah dipakai belum diisi` })
    if (i.buyQty && i.useQty > i.buyQty * 5)
      w.push({
        target: i.id,
        text: `${name}: dipakai jauh lebih banyak dari isi kemasan — satuannya sudah sama?`,
      })
  }
  if (!p.yieldQty || p.yieldQty <= 0)
    w.push({ target: 'yield', text: 'Isi dulu satu adonan jadi berapa pcs' })
  if (!p.ingredients.some(ingredientCost))
    w.push({ target: 'general', text: 'Belum ada bahan yang lengkap terisi' })
  return w
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const costsWhere = (costs: OtherCost[], perPcs: boolean) =>
  sum(costs.filter((c) => c.perPcs === perPcs).map((c) => c.amount || 0))

export function calculate(p: Product): HppResult {
  const ingredientsTotal = sum(p.ingredients.map(ingredientCost))
  const batchCostsTotal = costsWhere(p.costs, false)
  const perPcsCostsTotal = costsWhere(p.costs, true)
  const yieldQty = p.yieldQty > 0 ? p.yieldQty : 0

  const hppPerPcs =
    yieldQty > 0 ? (ingredientsTotal + batchCostsTotal) / yieldQty + perPcsCostsTotal : 0
  const batchTotal = ingredientsTotal + batchCostsTotal + perPcsCostsTotal * yieldQty

  const suggestedPrice = roundUp(hppPerPcs * (1 + (p.markupPct || 0) / 100))
  const isCustomPrice = p.customPrice != null && p.customPrice > 0
  const sellPrice = isCustomPrice ? (p.customPrice as number) : suggestedPrice

  const profitPerPcs = sellPrice - hppPerPcs
  const profitPct = hppPerPcs > 0 ? (profitPerPcs / hppPerPcs) * 100 : 0

  return {
    ingredientsTotal,
    batchCostsTotal,
    perPcsCostsTotal,
    batchTotal,
    hppPerPcs,
    suggestedPrice,
    sellPrice,
    profitPerPcs,
    profitPct,
    profitPerBatch: profitPerPcs * yieldQty,
    isLoss: hppPerPcs > 0 && profitPerPcs < 0,
    isCustomPrice,
  }
}

export interface PriceOption {
  price: number
  /** untung % dari HPP pada harga ini */
  pct: number
}

/**
 * Harga bulat terdekat di bawah & di atas target (kelipatan Rp500), yang masih untung.
 * Berguna untuk jajanan murah: modal Rp1.430 + 40% = Rp2.002 → pilih Rp2.000 (40%) atau Rp2.500 (75%).
 */
export function roundedPriceOptions(hppPerPcs: number, markupPct: number, step = ROUND_TO): PriceOption[] {
  if (hppPerPcs <= 0) return []
  const target = hppPerPcs * (1 + markupPct / 100)
  const prices = [Math.floor(target / step) * step, Math.ceil(target / step) * step]
  return [...new Set(prices)]
    .filter((x) => x > hppPerPcs)
    .map((price) => ({ price, pct: ((price - hppPerPcs) / hppPerPcs) * 100 }))
}
