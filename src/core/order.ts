// Kalkulator pesanan: total modal/untung, berapa kali masak, dan daftar belanja.
import type { OrderLine, Product } from './types'
import { calculate } from './hpp'

export interface OrderLineResult {
  product: Product
  qty: number
  /** berapa kali masak (dibulatkan ke atas) */
  batches: number
  /** sisa pcs dari masakan terakhir */
  leftover: number
  cost: number
  revenue: number
  profit: number
}

export interface ShoppingItem {
  key: string
  name: string
  unit: string
  /** total yang dipakai */
  need: number
  /** isi per kemasan */
  packSize: number
  /** jumlah kemasan yang perlu dibeli */
  packs: number
  /** perkiraan biaya belanja */
  cost: number
}

export interface SupplyItem {
  name: string
  qty: number
  cost: number
}

export interface OrderResult {
  lines: OrderLineResult[]
  cost: number
  revenue: number
  profit: number
  batches: number
  shopping: ShoppingItem[]
  supplies: SupplyItem[]
  shoppingTotal: number
}

export function computeOrder(order: OrderLine[], products: Product[]): OrderResult {
  const byId = new Map(products.map((p) => [p.id, p]))
  const lines: OrderLineResult[] = []
  const shop = new Map<string, ShoppingItem>()
  const supplies = new Map<string, SupplyItem>()

  for (const line of order) {
    const p = byId.get(line.productId)
    if (!p || line.qty <= 0) continue
    const r = calculate(p)
    const yieldQty = p.yieldQty > 0 ? p.yieldQty : 1
    const batches = Math.ceil(line.qty / yieldQty)
    // modal nyata: masak penuh sekian kali + biaya per pcs sesuai pesanan
    const cost = batches * (r.ingredientsTotal + r.batchCostsTotal) + r.perPcsCostsTotal * line.qty
    const revenue = r.sellPrice * line.qty
    lines.push({
      product: p,
      qty: line.qty,
      batches,
      leftover: batches * yieldQty - line.qty,
      cost,
      revenue,
      profit: revenue - cost,
    })

    for (const i of p.ingredients) {
      if (!i.useQty) continue
      const name = i.name.trim() || 'Bahan tanpa nama'
      const key = `${name.toLowerCase()}|${i.unit}|${i.buyQty}`
      const cur = shop.get(key) ?? {
        key,
        name,
        unit: i.unit,
        need: 0,
        packSize: i.buyQty,
        packs: 0,
        cost: 0,
      }
      cur.need += i.useQty * batches
      cur.packs = cur.packSize > 0 ? Math.ceil(cur.need / cur.packSize - 1e-9) : 0
      cur.cost = cur.packs * i.buyPrice
      shop.set(key, cur)
    }

    for (const c of p.costs) {
      if (!c.perPcs || !c.amount) continue
      const name = c.name.trim() || 'Biaya per pcs'
      const cur = supplies.get(name.toLowerCase()) ?? { name, qty: 0, cost: 0 }
      cur.qty += line.qty
      cur.cost += c.amount * line.qty
      supplies.set(name.toLowerCase(), cur)
    }
  }

  const shopping = [...shop.values()].sort((a, b) => b.cost - a.cost)
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  return {
    lines,
    cost: sum(lines.map((l) => l.cost)),
    revenue: sum(lines.map((l) => l.revenue)),
    profit: sum(lines.map((l) => l.profit)),
    batches: sum(lines.map((l) => l.batches)),
    shopping,
    supplies: [...supplies.values()],
    shoppingTotal: sum(shopping.map((s) => s.cost)) + sum([...supplies.values()].map((s) => s.cost)),
  }
}
