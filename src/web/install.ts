import { useEffect, useState } from 'react'

// Event "beforeinstallprompt" (Chrome/Edge/Samsung Internet di Android & desktop)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

const DISMISS_KEY = 'kalkulator-hpp:install-dismissed'

/** Status pemasangan PWA: bisa dipasang langsung (Android), perlu panduan (iPhone), atau sudah terpasang. */
export function useInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const mode: 'prompt' | 'ios' | null = installed ? null : deferred ? 'prompt' : isIOS() ? 'ios' : null

  return {
    mode,
    dismissed,
    install: async () => {
      if (!deferred) return false
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      setDeferred(null)
      return outcome === 'accepted'
    },
    dismiss: () => {
      setDismissed(true)
      try {
        localStorage.setItem(DISMISS_KEY, '1')
      } catch {
        /* abaikan */
      }
    },
  }
}
