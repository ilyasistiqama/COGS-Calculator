import type { Ingredient, OtherCost, Product } from './types'

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export const newIngredient = (): Ingredient => ({
  id: uid(),
  name: '',
  buyPrice: 0,
  buyQty: 0,
  unit: 'g',
  useQty: 0,
})

export const newCost = (perPcs = false): OtherCost => ({
  id: uid(),
  name: '',
  amount: 0,
  perPcs,
})

export const newProduct = (): Product => ({
  id: uid(),
  name: '',
  ingredients: [newIngredient()],
  costs: [
    { id: uid(), name: 'Gas / listrik', amount: 0, perPcs: false },
    { id: uid(), name: 'Kemasan / mika', amount: 0, perPcs: true },
  ],
  yieldQty: 10,
  markupPct: 40,
  customPrice: null,
  updatedAt: Date.now(),
})

/** Contoh biar pengguna baru langsung lihat cara pakainya */
export const sampleProduct = (): Product => ({
  id: uid(),
  name: 'Bolu Pandan (contoh)',
  ingredients: [
    { id: uid(), name: 'Terigu', buyPrice: 14000, buyQty: 1000, unit: 'g', useQty: 250 },
    { id: uid(), name: 'Telur', buyPrice: 28000, buyQty: 16, unit: 'butir', useQty: 4 },
    { id: uid(), name: 'Gula pasir', buyPrice: 16000, buyQty: 1000, unit: 'g', useQty: 200 },
    { id: uid(), name: 'Mentega', buyPrice: 9000, buyQty: 200, unit: 'g', useQty: 100 },
  ],
  costs: [
    { id: uid(), name: 'Gas / listrik', amount: 3000, perPcs: false },
    { id: uid(), name: 'Kemasan / mika', amount: 1000, perPcs: true },
  ],
  yieldQty: 10,
  markupPct: 40,
  customPrice: null,
  updatedAt: Date.now(),
})
