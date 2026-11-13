# Kalkulator HPP

Hitung modal (HPP) dan harga jual makanan. Tersedia sebagai **web/PWA** dan **aplikasi HP (React Native / Expo)**, dengan logika yang sama.

Created by [muis.life](https://muis.life)

## Fitur

- **HPP & harga jual** — bahan, biaya sekali masak / per pcs, jumlah hasil, untung %, pilihan harga bulat
- **Harga bahan tersimpan** — opsional per bahan; ubah sekali, produk yang memakainya ikut terhitung ulang & kelihatan mana yang jadi rugi. Ubah harga di dalam produk = harga sendiri khusus produk itu
- **Hitung pesanan** — total modal/untung, berapa kali masak, daftar belanja per kemasan
- **Simulasi** — kalau bahan naik, balik modal, target untung
- **Bagikan** — daftar harga & ringkasan pesanan ke WhatsApp
- **Backup & pulihkan** (file JSON, bisa pindah web ↔ Android), tema terang/gelap, PWA offline

## Struktur

```
src/core/      ← logika bersama (dipakai web DAN mobile)
  types.ts       tipe data
  hpp.ts         rumus HPP + peringatan isian
  format.ts      format Rupiah, angka Indonesia, tanggal relatif
  factory.ts     produk/bahan baru + contoh
  backup.ts      export / import / validasi / gabung backup
  storage.ts     interface penyimpanan (async)
  order.ts       kalkulator pesanan + daftar belanja
  simulate.ts    simulasi harga bahan naik, balik modal, target untung
  share.ts       teks daftar harga & ringkasan pesanan (WhatsApp)
  pantry.ts      harga bahan tersimpan (opsional per bahan) + dampak ke produk
  useProducts.ts hook state + simpan otomatis
  hints.ts       semua teks bantuan
  meta.ts        nama app, credit, pilihan tema
src/web/       ← tampilan web (React DOM + Tailwind v4)
mobile/        ← aplikasi HP (Expo Router + Uniwind / Tailwind v4)
  src/app/       layar (index = daftar, product/[id] = edit)
  src/components komponen UI native
  src/lib/       AsyncStorage, backup (file + share), tema
```

Mobile memakai `src/core` langsung lewat alias `@core/*` (lihat `mobile/metro.config.js` dan `mobile/tsconfig.json`) — **jangan di-copy**, cukup edit di satu tempat.

## Deploy otomatis (GitHub Actions)

| Workflow | Kapan jalan | Hasil |
| --- | --- | --- |
| `.github/workflows/web.yml` | push ke `main` | Web/PWA di **https://ilyasistiqama.github.io/COGS-Calculator/** |
| `.github/workflows/android.yml` | push ke `main` yang mengubah `mobile/` atau `src/core/`, atau tag `v*` | File **APK** (tab Actions → run → Artifacts; atau di Releases untuk tag) |

Sekali saja di GitHub: **Settings → Pages → Source: GitHub Actions**.

Rilis APK baru:

```bash
git tag v1.0.0 && git push origin v1.0.0   # APK muncul di halaman Releases
```

> APK ditandatangani dengan *debug key* bawaan template — cukup untuk dipasang langsung di HP
> (izinkan "Instal dari sumber tidak dikenal"). Untuk Play Store perlu keystore sendiri.

## Web / PWA

```bash
npm install
npm run dev -- --host   # buka dari HP lewat IP laptop (satu WiFi)
npm run build           # hasil di dist/ — deploy ke hosting statis (Vercel, Netlify, dll)
```

PWA (bisa di-install & jalan offline) aktif di hasil build. Install dari HP: buka situsnya → menu browser → **Tambahkan ke layar utama**. Service worker butuh HTTPS (atau localhost).

## Mobile (Expo)

```bash
cd mobile
npm install
npx expo start          # scan QR pakai Expo Go, atau tekan "a" untuk emulator Android
npm run typecheck
npm run lint
```

Build APK di komputer sendiri (perlu Android SDK + JDK 17):

```bash
cd mobile
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# hasil: mobile/android/app/build/outputs/apk/release/app-release.apk
```

Atau cukup push ke GitHub — workflow `android.yml` yang membangunkan APK-nya.

## Data

- Web: `localStorage` browser. Mobile: `AsyncStorage`.
- Data hanya ada di perangkat itu — gunakan **Backup & pulihkan** (ikon di kanan atas daftar produk).
- File backup (`backup-hpp-YYYY-MM-DD.json`) bisa dipulihkan di web maupun aplikasi HP.
# COGS-Calculator
