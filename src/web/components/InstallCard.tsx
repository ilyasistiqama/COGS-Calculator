import { useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { HINTS } from '../../core/hints'
import { useInstall } from '../install'
import { Sheet } from './Dialog'
import { useDialog } from './dialogContext'
import { eyebrow } from '../ui'

/** Ajakan memasang app ke layar utama — tombol langsung di Android, panduan di iPhone. */
export function InstallCard() {
  const { mode, dismissed, install, dismiss } = useInstall()
  const [guide, setGuide] = useState(false)
  const { toast } = useDialog()
  if (!mode || dismissed) return null

  return (
    <>
      <section className="relative mb-4 flex items-center gap-3.5 rounded-[22px] bg-panel px-4 py-3.5 text-on-panel">
        <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="" className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Pasang di HP</p>
          <p className="text-[0.75rem] text-panel-muted">Buka seperti aplikasi, jalan tanpa internet.</p>
        </div>
        <button
          className="h-9 shrink-0 rounded-full bg-panel-gold px-3.5 text-sm font-medium text-panel transition active:scale-[0.98]"
          onClick={async () => {
            if (mode === 'ios') return setGuide(true)
            if (await install()) toast('Aplikasi terpasang di layar utama')
          }}
        >
          <span className="flex items-center gap-1.5">
            <Download size={15} strokeWidth={2} /> Pasang
          </span>
        </button>
        <button
          aria-label="Tutup"
          className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-surface text-muted shadow ring-1 ring-line"
          onClick={dismiss}
        >
          <X size={14} strokeWidth={2} />
        </button>
      </section>

      <Sheet open={guide} onClose={() => setGuide(false)} labelledBy="install-title">
        <p className={eyebrow}>iPhone & iPad</p>
        <h2 id="install-title" className="mt-1 font-serif text-[1.5rem] leading-tight font-medium tracking-tight">
          Pasang di layar utama
        </h2>
        <p className="mt-1 text-[0.85rem] text-muted">{HINTS.install.body}</p>
        <ol className="mt-5 grid gap-4">
          {[
            { icon: <Share size={18} strokeWidth={1.75} />, text: <>Buka halaman ini di <b className="font-medium">Safari</b>, lalu ketuk tombol <b className="font-medium">Bagikan</b> di bawah layar.</> },
            { icon: <SquarePlus size={18} strokeWidth={1.75} />, text: <>Gulir ke bawah, pilih <b className="font-medium">“Tambahkan ke Layar Utama”</b>.</> },
            { icon: <Download size={18} strokeWidth={1.75} />, text: <>Ketuk <b className="font-medium">Tambah</b>. Ikon Kalkulator HPP muncul di layar utama.</> },
          ].map((step, k) => (
            <li key={k} className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-soft text-gold">{step.icon}</span>
              <p className="pt-2 text-sm text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </Sheet>
    </>
  )
}
