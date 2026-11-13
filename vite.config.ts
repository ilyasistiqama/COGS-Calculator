import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// BASE_PATH diisi oleh GitHub Actions (mis. "/COGS-Calculator/") untuk GitHub Pages.
const base = process.env.BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Kalkulator HPP',
        short_name: 'Kalkulator HPP',
        description: 'Hitung modal (HPP) dan harga jual makanan dengan mudah.',
        lang: 'id',
        start_url: base,
        scope: base,
        id: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f5f2ec',
        theme_color: '#f5f2ec',
        categories: ['business', 'finance', 'food'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // cache semua file app + font supaya jalan 100% offline
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // font aksara non-latin tidak perlu ikut disimpan offline
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
