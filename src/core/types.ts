// Tipe data murni.

export interface Ingredient {
  id: string
  name: string
  /** Harga beli satu kemasan, misal Rp14.000 */
  buyPrice: number
  /** Isi satu kemasan, misal 1000 (gram) */
  buyQty: number
  /** Satuan bebas: g, ml, butir, sdm, pcs ... */
  unit: string
  /** Takaran yang dipakai untuk satu adonan/batch */
  useQty: number
  /** Kalau diisi: nama, harga & isi kemasan ikut "Harga bahan" tersimpan. Kosong = harga sendiri. */
  pantryId?: string | null
}

/** Harga bahan tersimpan — dipakai produk yang memilihnya. Hanya daftar harga, bukan stok. */
export interface PantryItem {
  id: string
  name: string
  buyPrice: number
  buyQty: number
  unit: string
  updatedAt: number
}

/** Satu baris pesanan: produk apa, berapa pcs */
export interface OrderLine {
  productId: string
  qty: number
}

export interface OtherCost {
  id: string
  name: string
  amount: number
  /** true = dihitung per pcs (kemasan, stiker); false = sekali masak, dibagi ke semua pcs (gas, listrik, minyak) */
  perPcs: boolean
}

export interface Product {
  id: string
  name: string
  ingredients: Ingredient[]
  costs: OtherCost[]
  /** Jumlah pcs/porsi yang dihasilkan dari satu adonan */
  yieldQty: number
  /** Untung % dihitung dari HPP (markup) */
  markupPct: number
  /** Kalau diisi, harga jual ditentukan manual dan untung % dihitung balik */
  customPrice: number | null
  updatedAt: number
}
