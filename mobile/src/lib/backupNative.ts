// Backup versi HP: tulis file → menu "Bagikan" (WhatsApp, Drive, Simpan ke File); pulihkan via pemilih file.
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { backupFileName } from '@core/backup'

export async function shareBackup(json: string): Promise<void> {
  const file = new File(Paths.cache, backupFileName())
  if (file.exists) file.delete()
  file.create()
  await file.write(json)
  if (!(await Sharing.isAvailableAsync())) throw new Error('Fitur bagikan tidak tersedia di perangkat ini.')
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Simpan atau kirim backup',
  })
}

/** null = dibatalkan */
export async function pickBackupText(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true })
  if (res.canceled) return null
  const asset = res.assets[0]
  if (asset.size && asset.size > 5_000_000) throw new Error('File terlalu besar.')
  return new File(asset.uri).text()
}
