// Hook data utama: produk, harga bahan tersimpan, draf pesanan. Tidak menyentuh DOM — dipakai web & React Native.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { OrderLine, PantryItem, Product } from './types'
import { newProduct, sampleProduct } from './factory'
import { createBackup, mergeById, parseBackup } from './backup'
import { detachEdited, detachPantryItem, newPantryItem, pantryFromIngredient, pantryMap, resolveProduct } from './pantry'
import {
  loadLastBackup,
  loadOrder,
  loadPantry,
  loadProducts,
  saveLastBackup,
  saveOrder,
  savePantry,
  saveProducts,
  type KeyValueStorage,
} from './storage'

export interface ImportResult {
  added: number
  replaced: number
  pantryAdded: number
}

/** Simpan otomatis dengan jeda supaya tidak menulis tiap ketikan */
function useAutosave<T>(value: T, enabled: boolean, save: (v: T) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!enabled) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => save(value), 300)
  }, [value, enabled, save])
}

export function useProducts(storage: KeyValueStorage) {
  const [rawProducts, setProducts] = useState<Product[]>([])
  const [pantry, setPantry] = useState<PantryItem[]>([])
  const [order, setOrder] = useState<OrderLine[]>([])
  const [loaded, setLoaded] = useState(false)
  const [lastBackupAt, setLastBackupAt] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([loadProducts(storage), loadPantry(storage), loadOrder(storage), loadLastBackup(storage)]).then(
      ([data, pan, ord, last]) => {
        setProducts(data ?? [sampleProduct()])
        setPantry(pan)
        setOrder(ord)
        setLastBackupAt(last)
        setLoaded(true)
      },
    )
  }, [storage])

  const saveP = useCallback((v: Product[]) => saveProducts(storage, v), [storage])
  const savePan = useCallback((v: PantryItem[]) => savePantry(storage, v), [storage])
  const saveOrd = useCallback((v: OrderLine[]) => saveOrder(storage, v), [storage])
  useAutosave(rawProducts, loaded, saveP)
  useAutosave(pantry, loaded, savePan)
  useAutosave(order, loaded, saveOrd)

  const map = useMemo(() => pantryMap(pantry), [pantry])

  /** Produk dengan harga bahan tersimpan sudah diterapkan — pakai ini untuk tampilan & perhitungan */
  const products = useMemo(() => rawProducts.map((p) => resolveProduct(p, map)), [rawProducts, map])

  /* ---------- Produk ---------- */

  const add = useCallback(() => {
    const p = newProduct()
    setProducts((ps) => [p, ...ps])
    return p.id
  }, [])

  /**
   * Simpan perubahan produk. Bahan yang memakai harga tersimpan tapi angkanya diubah di sini
   * otomatis jadi "harga sendiri" — produk lain tidak ikut berubah.
   * Mengembalikan nama bahan yang barusan dilepas (untuk notifikasi).
   */
  const update = useCallback(
    (p: Product): string[] => {
      const { product, detached } = detachEdited(p, map)
      setProducts((ps) => ps.map((x) => (x.id === product.id ? { ...product, updatedAt: Date.now() } : x)))
      return detached
    },
    [map],
  )

  const remove = useCallback((id: string) => {
    setProducts((ps) => ps.filter((x) => x.id !== id))
    setOrder((o) => o.filter((l) => l.productId !== id))
  }, [])

  /* ---------- Harga bahan tersimpan ---------- */

  const addPantryItem = useCallback(() => {
    const item = newPantryItem()
    setPantry((pan) => [item, ...pan])
    return item.id
  }, [])

  /** Ubah harga tersimpan — semua produk yang memakainya ikut terhitung ulang. */
  const updatePantryItem = useCallback((item: PantryItem) => {
    setPantry((pan) => pan.map((x) => (x.id === item.id ? { ...item, updatedAt: Date.now() } : x)))
  }, [])

  /** Hapus harga tersimpan — produk yang memakainya tetap punya bahannya (jadi harga sendiri). */
  const removePantryItem = useCallback(
    (id: string) => {
      const item = pantry.find((x) => x.id === id)
      if (!item) return
      setProducts((ps) => detachPantryItem(ps, item))
      setPantry((pan) => pan.filter((x) => x.id !== id))
    },
    [pantry],
  )

  /** Simpan harga bahan di sebuah produk sebagai harga tersimpan & pakai di produk itu. */
  const saveIngredientToPantry = useCallback(
    (productId: string, ingredientId: string) => {
      const ing = products.find((x) => x.id === productId)?.ingredients.find((i) => i.id === ingredientId)
      if (!ing) return
      const item = pantryFromIngredient(ing)
      setPantry((pan) => [item, ...pan])
      setProducts((ps) =>
        ps.map((x) =>
          x.id === productId
            ? { ...x, ingredients: x.ingredients.map((i) => (i.id === ingredientId ? { ...i, pantryId: item.id } : i)) }
            : x,
        ),
      )
    },
    [products],
  )

  /* ---------- Pesanan ---------- */

  const setOrderQty = useCallback((productId: string, qty: number) => {
    setOrder((o) => {
      if (qty <= 0) return o.filter((l) => l.productId !== productId)
      return o.some((l) => l.productId === productId)
        ? o.map((l) => (l.productId === productId ? { ...l, qty } : l))
        : [...o, { productId, qty }]
    })
  }, [])

  const clearOrder = useCallback(() => setOrder([]), [])

  /* ---------- Backup ---------- */

  /** Isi file backup (JSON). Panggil markBackedUp() setelah file benar-benar tersimpan/terkirim. */
  const exportBackup = useCallback(() => createBackup(rawProducts, pantry), [rawProducts, pantry])

  const markBackedUp = useCallback(() => {
    const now = Date.now()
    setLastBackupAt(now)
    saveLastBackup(storage, now)
  }, [storage])

  /** Melempar BackupError kalau file tidak valid. */
  const importBackup = useCallback(
    (text: string): ImportResult => {
      const data = parseBackup(text)
      const prod = mergeById(rawProducts, data.products)
      const pan = mergeById(pantry, data.pantry)
      setProducts(prod.merged)
      setPantry(pan.merged)
      return { added: prod.added, replaced: prod.replaced, pantryAdded: pan.added }
    },
    [rawProducts, pantry],
  )

  return {
    products,
    pantry,
    order,
    loaded,
    lastBackupAt,
    add,
    update,
    remove,
    addPantryItem,
    updatePantryItem,
    removePantryItem,
    saveIngredientToPantry,
    setOrderQty,
    clearOrder,
    exportBackup,
    markBackedUp,
    importBackup,
  }
}

export type ProductStore = ReturnType<typeof useProducts>
