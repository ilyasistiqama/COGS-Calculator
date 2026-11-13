// Sheet, dialog konfirmasi, dan toast — pengganti Alert bawaan, senada dengan desain app.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Animated, Easing, Modal, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react-native'
import { Icon, PrimaryButton, Serif, T, cx } from './ui'

/* ---------- Sheet (panel dari bawah) ---------- */

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const [y] = useState(() => new Animated.Value(40))

  useEffect(() => {
    if (!open) return
    y.setValue(40)
    Animated.timing(y, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [open, y])

  return (
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable accessibilityLabel="Tutup" className="absolute inset-0 bg-black/45" onPress={onClose} />
        <Animated.View style={{ transform: [{ translateY: y }] }}>
          <View className="rounded-t-[28px] bg-surface px-6 pt-3" style={{ paddingBottom: insets.bottom + 24 }}>
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-line" />
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

/* ---------- Konfirmasi & toast ---------- */

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
}
type ToastTone = 'success' | 'error' | 'info'

interface DialogApi {
  confirm: (o: ConfirmOptions) => Promise<boolean>
  toast: (message: string, tone?: ToastTone) => void
}

const Ctx = createContext<DialogApi | null>(null)

export function useDialog() {
  const api = useContext(Ctx)
  if (!api) throw new Error('useDialog harus di dalam <DialogProvider>')
  return api
}

function Toast({ message, tone }: { message: string; tone: ToastTone }) {
  const insets = useSafeAreaInsets()
  const [a] = useState(() => new Animated.Value(0))
  useEffect(() => {
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(a, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start()
  }, [a])
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        top: insets.top + 12,
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
      }}
    >
      <View className="flex-row items-center gap-2.5 self-center rounded-2xl bg-panel px-4 py-3 shadow-xl">
        <Icon
          as={tone === 'error' ? CircleAlert : CircleCheck}
          color={tone === 'error' ? 'panel-loss' : tone === 'success' ? 'panel-ok' : 'panel-gold'}
          size={18}
          strokeWidth={1.75}
        />
        <T className="shrink text-[13.5px] text-on-panel">{message}</T>
      </View>
    </Animated.View>
  )
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null)
  const [toastItem, setToastItem] = useState<{ id: number; message: string; tone: ToastTone } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const confirm = useCallback(
    (o: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...o, resolve })),
    [],
  )
  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    if (timer.current) clearTimeout(timer.current)
    setToastItem({ id: Date.now(), message, tone })
    timer.current = setTimeout(() => setToastItem(null), 3200)
  }, [])

  const close = (v: boolean) => {
    state?.resolve(v)
    setState(null)
  }
  const danger = state?.tone === 'danger'

  return (
    <Ctx.Provider value={{ confirm, toast }}>
      {children}
      <Sheet open={!!state} onClose={() => close(false)}>
        {state ? (
          <View>
            {danger ? (
              <View className="mb-4 size-12 items-center justify-center rounded-full bg-loss-soft">
                <Icon as={TriangleAlert} color="loss" size={22} />
              </View>
            ) : null}
            <Serif className="text-[24px] leading-tight tracking-tight">{state.title}</Serif>
            {state.message ? <T className="mt-2 text-[14px] leading-[21px] text-muted">{state.message}</T> : null}
            <View className="mt-6 flex-row gap-2.5">
              <PrimaryButton tone="soft" className="flex-1" label={state.cancelLabel ?? 'Batal'} onPress={() => close(false)} />
              <PrimaryButton
                tone={danger ? 'danger' : 'ink'}
                className={cx('flex-1')}
                label={state.confirmLabel ?? 'Lanjutkan'}
                onPress={() => close(true)}
              />
            </View>
          </View>
        ) : null}
      </Sheet>
      {toastItem ? <Toast key={toastItem.id} message={toastItem.message} tone={toastItem.tone} /> : null}
    </Ctx.Provider>
  )
}
