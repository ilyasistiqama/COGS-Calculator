import type { ReactNode } from 'react'
import { ChevronRight, Download, Share2, ShieldCheck, Upload } from 'lucide-react'
import { BackupError, backupFileName, parseBackup } from '../../core/backup'
import { timeAgo } from '../../core/format'
import type { ImportResult } from '../../core/useProducts'
import { canShareFile, downloadText, pickTextFile, shareText } from '../backupWeb'
import { Sheet } from './Dialog'
import { useDialog } from './dialogContext'
import { eyebrow } from '../ui'

interface Props {
  open: boolean
  onClose: () => void
  productCount: number
  lastBackupAt: number | null
  exportBackup: () => string
  markBackedUp: () => void
  importBackup: (text: string) => ImportResult
}

function Option({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: ReactNode
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition hover:bg-sunken"
      onClick={onClick}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-soft text-gold">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="block text-[0.8rem] text-muted">{desc}</span>
      </span>
      <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-muted" />
    </button>
  )
}

export function BackupSheet({
  open,
  onClose,
  productCount,
  lastBackupAt,
  exportBackup,
  markBackedUp,
  importBackup,
}: Props) {
  const { confirm, toast } = useDialog()
  const shareable = canShareFile()

  const doDownload = () => {
    downloadText(exportBackup(), backupFileName())
    markBackedUp()
    onClose()
    toast('Backup tersimpan di folder Download')
  }

  const doShare = async () => {
    try {
      const sent = await shareText(exportBackup(), backupFileName())
      if (sent) {
        markBackedUp()
        onClose()
        toast('Backup berhasil dikirim')
      }
    } catch {
      toast('Gagal membagikan. Coba "Simpan ke HP" saja.', 'error')
    }
  }

  const doImport = async () => {
    let text: string | null
    try {
      text = await pickTextFile()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'File tidak bisa dibaca.', 'error')
      return
    }
    if (text == null) return

    let count: number
    try {
      count = parseBackup(text).products.length
    } catch (e) {
      toast(e instanceof BackupError ? e.message : 'File tidak bisa dibaca.', 'error')
      return
    }

    onClose()
    const ok = await confirm({
      title: `Pulihkan ${count} produk?`,
      message: (
        <>
          Produk dari backup akan <b className="text-ink-soft">ditambahkan</b> ke daftarmu. Produk yang sama akan
          diganti dengan versi dari backup. Produk lain tetap aman.
        </>
      ),
      confirmLabel: 'Pulihkan',
    })
    if (!ok) return

    const { added, replaced, pantryAdded } = importBackup(text)
    const parts = [
      added && `${added} produk baru`,
      replaced && `${replaced} diperbarui`,
      pantryAdded && `${pantryAdded} harga bahan`,
    ].filter(Boolean)
    toast(`Berhasil dipulihkan${parts.length ? `: ${parts.join(', ')}` : ''}`)
  }

  return (
    <Sheet open={open} onClose={onClose} labelledBy="backup-title">
      <p className={eyebrow}>Cadangan data</p>
      <h2 id="backup-title" className="mt-1 font-serif text-[1.6rem] leading-tight font-medium tracking-tight">
        Backup & pulihkan
      </h2>
      <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
        Datamu hanya tersimpan di HP ini. Simpan backup secara rutin supaya tidak hilang saat ganti HP atau data
        browser terhapus.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-sunken px-3.5 py-2.5 text-[0.82rem] text-ink-soft">
        <ShieldCheck size={16} strokeWidth={1.6} className="shrink-0 text-gold" />
        {productCount} produk · backup terakhir <b className="font-medium">{timeAgo(lastBackupAt)}</b>
      </div>

      <div className="-mx-3 mt-3 grid">
        {shareable && (
          <Option
            icon={<Share2 size={19} strokeWidth={1.6} />}
            title="Kirim backup"
            desc="Ke WhatsApp, Google Drive, atau email"
            onClick={doShare}
          />
        )}
        <Option
          icon={<Download size={19} strokeWidth={1.6} />}
          title="Simpan ke HP"
          desc="Unduh file backup (.json)"
          onClick={doDownload}
        />
        <Option
          icon={<Upload size={19} strokeWidth={1.6} />}
          title="Pulihkan dari file"
          desc="Pilih file backup yang pernah disimpan"
          onClick={doImport}
        />
      </div>
    </Sheet>
  )
}
