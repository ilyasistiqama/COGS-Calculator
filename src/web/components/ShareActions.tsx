import { Copy, MessageCircle, Share2 } from 'lucide-react'
import { whatsappUrl } from '../../core/share'
import { useDialog } from './dialogContext'
import { cx } from '../ui'

const canShareText = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'

/** Tombol kirim ke WhatsApp / bagikan / salin untuk sebuah teks. */
export function ShareActions({ text, label, className }: { text: string; label?: string; className?: string }) {
  const { toast } = useDialog()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Teks disalin')
    } catch {
      toast('Gagal menyalin. Coba tombol Bagikan.', 'error')
    }
  }

  const share = async () => {
    try {
      await navigator.share({ text })
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) toast('Gagal membagikan.', 'error')
    }
  }

  const secondary =
    'flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-sunken text-sm font-medium text-ink-soft transition hover:bg-line'

  return (
    <div className={cx('grid gap-2.5', className)}>
      {label && <p className="text-center text-[0.75rem] text-muted">{label}</p>}
      <a
        href={whatsappUrl(text)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-ink font-medium text-on-ink transition active:scale-[0.99]"
      >
        <MessageCircle size={18} strokeWidth={1.75} /> Kirim ke WhatsApp
      </a>
      <div className="flex gap-2.5">
        {canShareText() && (
          <button className={secondary} onClick={share}>
            <Share2 size={16} strokeWidth={1.75} /> Bagikan
          </button>
        )}
        <button className={secondary} onClick={copy}>
          <Copy size={16} strokeWidth={1.75} /> Salin teks
        </button>
      </div>
    </div>
  )
}
