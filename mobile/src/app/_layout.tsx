import '../global.css'
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import * as SystemUI from 'expo-system-ui'
import { useFonts } from 'expo-font'
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter'
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ProductsProvider, useStore } from '@/lib/products'
import { DialogProvider } from '@/components/dialog'
import { useColor } from '@/components/ui'
import { restoreTheme } from '@/lib/theme'

SplashScreen.preventAutoHideAsync()

function Root() {
  const { loaded } = useStore()
  const bg = useColor('bg')
  const [themeReady, setThemeReady] = useState(false)
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Fraunces_500Medium })

  useEffect(() => {
    restoreTheme().finally(() => setThemeReady(true))
  }, [])

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(bg)
  }, [bg])

  const ready = loaded && fontsLoaded && themeReady
  useEffect(() => {
    if (ready) SplashScreen.hideAsync()
  }, [ready])

  if (!ready) return null

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bg }, animation: 'slide_from_right' }} />
    </>
  )
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ProductsProvider>
        <DialogProvider>
          <Root />
        </DialogProvider>
      </ProductsProvider>
    </SafeAreaProvider>
  )
}
