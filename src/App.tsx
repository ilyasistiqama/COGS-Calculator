import { useEffect, useState } from 'react'
import { useProducts } from './core/useProducts'
import { webStorage } from './web/webStorage'
import { ProductList } from './web/components/ProductList'
import { ProductEditor } from './web/components/ProductEditor'
import { OrderPage } from './web/components/OrderPage'
import { PantryPage } from './web/components/PantryPage'
import { BackupSheet } from './web/components/BackupSheet'
import { PriceListSheet } from './web/components/PriceListSheet'
import { DialogProvider } from './web/components/Dialog'
import { ThemeSheet } from './web/components/ThemeSheet'
import { useTheme } from './web/theme'

// Navigasi pakai hash supaya tombol "back" di HP bekerja & cocok untuk GitHub Pages.
//   #/p/<id>   halaman produk
//   #/pesanan  kalkulator pesanan
type Route = { name: 'list' } | { name: 'product'; id: string } | { name: 'pantry' } | { name: 'order' }

function readRoute(): Route {
  const h = window.location.hash
  const m = h.match(/^#\/p\/(.+)$/)
  if (m) return { name: 'product', id: m[1] }
  if (h === '#/harga-bahan') return { name: 'pantry' }
  if (h === '#/pesanan') return { name: 'order' }
  return { name: 'list' }
}

// true kalau halaman dibuka dari daftar → "kembali" cukup history.back()
let cameFromList = false

export default function App() {
  return (
    <DialogProvider>
      <Screens />
    </DialogProvider>
  )
}

function Screens() {
  const store = useProducts(webStorage)
  const { products, loaded, add, update, remove } = store
  const [route, setRoute] = useState<Route>(readRoute)
  const [sheet, setSheet] = useState<'backup' | 'theme' | 'prices' | null>(null)
  const theme = useTheme()

  useEffect(() => {
    const onHash = () => {
      const r = readRoute()
      if (r.name === 'list') cameFromList = false
      setRoute(r)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // naik ke atas setiap pindah halaman
  const routeKey = route.name === 'product' ? route.id : route.name
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [routeKey])

  const go = (hash: string) => {
    cameFromList = true
    window.location.hash = hash
  }
  const back = () => {
    if (cameFromList) {
      cameFromList = false
      window.history.back()
    } else {
      window.location.hash = ''
    }
  }

  if (!loaded) return null

  if (route.name === 'pantry') return <PantryPage store={store} onBack={back} onOpenProduct={(id) => go(`/p/${id}`)} />
  if (route.name === 'order') return <OrderPage store={store} onBack={back} />

  const current = route.name === 'product' ? products.find((p) => p.id === route.id) : undefined
  if (current) {
    return (
      <ProductEditor
        key={current.id}
        product={current}
        pantry={store.pantry}
        onChange={update}
        onSaveToPantry={(ingredientId) => {
          store.saveIngredientToPantry(current.id, ingredientId)
        }}
        onBack={back}
        onDelete={() => {
          remove(current.id)
          back()
        }}
      />
    )
  }

  const close = () => setSheet(null)
  return (
    <>
      <ProductList
        products={products}
        onOpen={(id) => go(`/p/${id}`)}
        onAdd={() => go(`/p/${add()}`)}
        onBackup={() => setSheet('backup')}
        lastBackupAt={store.lastBackupAt}
        onTheme={() => setSheet('theme')}
        themeMode={theme.mode}
        onPantry={() => go('/harga-bahan')}
        onOrder={() => go('/pesanan')}
        onSharePrices={() => setSheet('prices')}
        pantryCount={store.pantry.length}
        orderCount={store.order.length}
      />
      <ThemeSheet open={sheet === 'theme'} onClose={close} mode={theme.mode} onChange={theme.setMode} />
      <PriceListSheet open={sheet === 'prices'} onClose={close} products={products} />
      <BackupSheet
        open={sheet === 'backup'}
        onClose={close}
        productCount={products.length}
        lastBackupAt={store.lastBackupAt}
        exportBackup={store.exportBackup}
        markBackedUp={store.markBackedUp}
        importBackup={store.importBackup}
      />
    </>
  )
}
