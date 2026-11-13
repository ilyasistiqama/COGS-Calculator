// Semua teks bantuan di satu tempat — gampang diedit.

export const HINTS = {
  hpp: {
    title: 'Apa itu HPP?',
    body: 'HPP (Harga Pokok Produksi) adalah modal untuk membuat 1 pcs. Kalau harga jualmu di bawah HPP, artinya kamu rugi walaupun laku banyak.',
  },
  bahan: {
    title: 'Cara isi bahan',
    body: 'Tulis harga waktu kamu beli dan isi kemasannya. Lalu tulis berapa yang kamu pakai untuk SATU kali masak. Biayanya dihitung otomatis.',
    example: 'Beli terigu Rp14.000 isi 1000 g, dipakai 250 g → biayanya Rp3.500.',
  },
  satuan: {
    title: 'Satuan harus sama',
    body: 'Satuan beli dan satuan pakai harus sama. Kalau kamu beli 1 kg tapi pakainya dalam gram, tulis isi kemasan 1000 g, jangan 1 kg.',
    example: 'Telur 1 kg isi ±16 butir → tulis isi 16, satuan "butir".',
  },
  biaya: {
    title: 'Sekali masak vs per pcs',
    body: '"Sekali masak" = biaya yang keluar satu kali untuk seluruh adonan, lalu dibagi rata ke semua pcs. Contoh: gas, listrik oven, minyak goreng. "Per pcs" = biaya yang keluar untuk SETIAP 1 pcs. Contoh: mika, plastik, stiker.',
    example: 'Gas Rp3.000 sekali masak, hasil 10 pcs → Rp300 per pcs. Mika Rp1.000 per pcs → tetap Rp1.000 per pcs.',
  },
  hasil: {
    title: 'Jumlah hasil',
    body: 'Berapa pcs/porsi/bungkus yang jadi dari satu kali masak. Hitung yang benar-benar bisa kamu jual — yang gosong atau dicicipi jangan dihitung.',
  },
  untung: {
    title: 'Untung %',
    body: 'Persen dari modalmu (HPP). Modal Rp10.000 + untung 40% = jual Rp14.000. Harga dibulatkan ke atas ke Rp500 terdekat biar gampang kembalian.',
  },
  hargaManual: {
    title: 'Sudah punya patokan harga?',
    body: 'Ketik saja harga jualmu (misal ikut harga pasaran). Nanti kelihatan untungmu berapa, atau malah rugi.',
  },
  pesanan: {
    title: 'Hitung pesanan',
    body: 'Masukkan jumlah pesanan tiap produk. Kamu langsung tahu total modal, untung, berapa kali masak, dan bahan apa saja yang perlu dibeli.',
    example: 'Modal dihitung per kali masak penuh. Kalau satu adonan jadi 10 pcs dan pesanan 25, kamu masak 3× dan sisa 5 pcs.',
  },
  simulasi: {
    title: 'Simulasi',
    body: 'Coba hitung "kalau…": kalau harga bahan naik, untungmu tinggal berapa? Harus laku berapa supaya balik modal? Mau untung sekian, harus jual berapa?',
  },
  hargaBahan: {
    title: 'Harga bahan tersimpan',
    body: 'Simpan harga bahan yang sering dipakai. Produk boleh memakainya atau pakai harga sendiri. Kalau harga di sini diubah, semua produk yang memakainya ikut terhitung ulang — dan langsung kelihatan mana yang jadi rugi.',
    example: 'Mengubah harga di dalam produk tidak mengubah daftar ini; bahan itu jadi harga sendiri khusus produk tersebut.',
  },
  install: {
    title: 'Pasang di HP',
    body: 'Pasang Kalkulator HPP di layar utama HP supaya bisa dibuka seperti aplikasi biasa — tanpa buka browser, dan tetap jalan tanpa internet.',
  },
  pembulatan: {
    title: 'Pilihan harga bulat',
    body: 'Harga dibulatkan ke kelipatan Rp500 supaya gampang kembalian. Pilih yang di bawah kalau mau lebih murah, atau yang di atas kalau mau untung lebih.',
  },
  bagikan: {
    title: 'Bagikan daftar harga',
    body: 'Kirim daftar harga produkmu ke WhatsApp, status, atau grup. Yang dikirim hanya nama & harga jual — modal dan untung tidak ikut.',
  },
} as const

/** Bantuan singkat yang muncul saat sebuah kolom sedang diisi */
export const FIELD_HINTS = {
  buyPrice: 'Harga 1 bungkus/kemasan waktu kamu beli. Contoh: terigu 1 kg Rp14.000 → tulis 14.000.',
  buyQty: 'Isi 1 kemasan itu. Terigu 1 kg → tulis 1000 lalu pilih satuan g. Telur 1 kg ±16 butir → tulis 16, satuan butir.',
  useQty: 'Berapa yang dipakai untuk SEKALI masak. Satuannya otomatis sama dengan isi kemasan.',
  cost: 'Perkiraan saja tidak apa-apa. Contoh: gas 3 kg Rp22.000 cukup ±7 kali masak → ±Rp3.000.',
  yieldQty: 'Hitung yang bisa dijual. Yang gosong, pecah, atau dicicipi jangan dihitung.',
  markup: 'Untung dihitung dari modal. 40% artinya modal Rp1.000 dijual Rp1.400.',
  customPrice: 'Ketik harga yang mau kamu pakai. Untung/rugi langsung kelihatan di bawah.',
  orderQty: 'Ketik jumlah pcs yang dipesan, atau tekan + dan −.',
} as const

export type FieldHintKey = keyof typeof FIELD_HINTS

export const EDITOR_TIPS = [
  'Isi bahan untuk SATU kali masak, bukan per pcs.',
  'Ketuk kolom mana saja — penjelasannya muncul di bawahnya.',
  'Angka di bawah layar berubah otomatis. Tidak perlu tekan simpan.',
]

export const MARKUP_GUIDE = [
  { label: 'Masakan rumahan / nasi box', range: '30–50%' },
  { label: 'Kue basah / jajanan pasar', range: '40–70%' },
  { label: 'Kue kering / hampers / pesanan', range: '70–150%' },
]

export const UNITS = ['g', 'kg', 'ml', 'liter', 'butir', 'sdm', 'sdt', 'pcs', 'bungkus', 'ikat', 'lembar']

export const ONBOARDING_STEPS = [
  { title: 'Isi bahan', body: 'Harga beli & berapa yang kamu pakai' },
  { title: 'Isi biaya lain', body: 'Gas, minyak, kemasan, dan lainnya' },
  { title: 'Tentukan untung', body: 'Harga jual keluar otomatis' },
]
