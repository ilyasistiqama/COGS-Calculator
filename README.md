# COGS Calculator (Kalkulator HPP)

A cost-of-goods-sold and pricing calculator for home-based food businesses. It runs entirely in the browser and can be installed on Android and iOS as a Progressive Web App. No account or server is required.

The user interface is in Indonesian.

**Live app:** https://ilyasistiqama.github.io/COGS-Calculator/

## Features

- **Cost per unit and selling price.** Calculates cost from ingredients, per-batch overhead (gas, electricity), per-unit costs (packaging), and batch yield. Suggests a selling price from a target margin, with options rounded to Rp500.
- **Saved ingredient prices.** Ingredients can optionally be linked to a shared price list. Updating a price recalculates every linked product and shows which ones become unprofitable. Editing an ingredient inside a product switches it to a product-specific price.
- **Order calculator.** Shows total cost and profit for an order, the number of batches needed, and a shopping list rounded to purchase packs.
- **Scenarios.** Models the effect of ingredient price increases, computes the break-even quantity, and estimates the quantity needed to reach a profit target.
- **Sharing.** Generates a price list and order summary that can be sent through WhatsApp.
- **Backup and restore.** Exports and imports data as JSON. Also includes light and dark themes and offline support.

## Tech stack

- [React 19](https://react.dev/) with TypeScript
- [Vite](https://vite.dev/) and [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/) icons, plus Inter and Fraunces typefaces

## Getting started

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev        # start the development server
npm run lint       # run oxlint
npm run build      # production build in dist/
npm run preview    # serve the production build locally
```

To test on a phone on the same network, run `npm run dev -- --host` and open the printed network URL. Installation and offline support require HTTPS or `localhost`, so use a production build for those.

## Project structure

```
src/
├── core/                 Framework-agnostic business logic
│   ├── hpp.ts              Cost and pricing formulas, input warnings
│   ├── pantry.ts           Saved ingredient prices and product impact
│   ├── order.ts            Order totals and shopping list
│   ├── simulate.ts         Price scenarios, break-even, profit targets
│   ├── backup.ts           Backup export, validation, and merge
│   ├── share.ts            Price list and order summary text
│   ├── format.ts           Indonesian number and currency formatting
│   ├── storage.ts          Async key-value storage interface
│   ├── useProducts.ts      State management with autosave
│   ├── hints.ts            In-app help text
│   └── types.ts, factory.ts, meta.ts
└── web/                  Browser UI (components, theme, PWA install)
```

The modules in `src/core` are pure TypeScript with no DOM dependencies, so they can be reused on other platforms.

## Deployment

On every push to `main`, the `.github/workflows/web.yml` workflow lints the app, builds it, and deploys it to GitHub Pages.

One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**.

The build reads its base path from the `BASE_PATH` environment variable, which defaults to `/`. To deploy to any other static host such as Netlify, Vercel, or Cloudflare Pages, run `npm run build` and serve the `dist/` folder.

## Installing on a phone

- **Android (Chrome):** open the app, then tap **⋮ → Add to Home screen**. A prompt may also appear inside the app.
- **iPhone (Safari):** open the app, then tap **Share → Add to Home Screen**.

## Data and privacy

All data is stored locally in the browser using `localStorage` and is never sent to a server. Because the data stays on one device, use **Backup & restore** regularly. Backup files are named `backup-hpp-YYYY-MM-DD.json` and can be restored on another browser or device.

---

Created by [muis.life](https://muis.life)
