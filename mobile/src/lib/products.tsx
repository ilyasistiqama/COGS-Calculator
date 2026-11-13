// Satu sumber data produk untuk semua layar (pakai hook yang sama dengan web).
import { createContext, useContext, type ReactNode } from 'react'
import { useProducts } from '@core/useProducts'
import { nativeStorage } from './storage'

type Store = ReturnType<typeof useProducts>
const Ctx = createContext<Store | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const store = useProducts(nativeStorage)
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore harus di dalam <ProductsProvider>')
  return s
}
