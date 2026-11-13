// Helper file khusus web. Di React Native diganti expo-file-system / expo-sharing / expo-document-picker.

export function downloadText(text: string, fileName: string) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Bisa kirim file lewat menu "Bagikan" HP (WhatsApp, Drive, dll)? */
export function canShareFile(): boolean {
  try {
    const f = new File(['{}'], 'x.json', { type: 'application/json' })
    return !!navigator.canShare?.({ files: [f] })
  } catch {
    return false
  }
}

/** true = terkirim, false = dibatalkan pengguna */
export async function shareText(text: string, fileName: string): Promise<boolean> {
  const file = new File([text], fileName, { type: 'application/json' })
  try {
    await navigator.share({ files: [file], title: 'Backup Kalkulator HPP' })
    return true
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return false
    throw e
  }
}

export function pickTextFile(accept = '.json,application/json'): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      if (file.size > 5_000_000) return reject(new Error('File terlalu besar.'))
      file.text().then(resolve, reject)
    }
    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}
