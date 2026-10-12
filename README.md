## Wearables Atelier storefront

Customer shopping site for Wearables by Ashabi: clothing, jewellery, product details, styled NGN/USD display, wishlist, shopping bag and demo checkout. The admin application is a separate project and repository; there are no admin pages or admin links in this app.

![Customer storefront](docs/previews/storefront-separated.jpg)

Source: [wearables-atelier-storefront](https://github.com/Trust-Code-System/wearables-atelier-storefront). Admin source: [wearables-atelier-admin](https://github.com/Trust-Code-System/wearables-atelier-admin).

Live storefront: [wearables-atelier-storefront.vercel.app](https://wearables-atelier-storefront.vercel.app).

## Getting Started

Install and run with Node.js 22 LTS or newer:

```bash
npm ci
npm run dev
```

Open [localhost:3100](http://localhost:3100). The separate admin app runs at [localhost:3200/admin](http://localhost:3200/admin).

Verify with `npm run lint` and `npm run build`. Run the production build locally with `npm run start -- --port 3100`.

### Structure and dependencies

- `src/app/(store)` — home, shop, product, wishlist, contact, account and checkout routes.
- `src/components/layout` — customer header and footer.
- `src/components/cart` and `src/components/shop` — shopping interactions.
- `src/lib/store.tsx` — read-only demo catalog/settings and browser-owned cart/checkout state.
- `public/brand` and `public/collection` — supplied brand logo and photography.

Next.js 16.4, React 19, Tailwind 4, Base UI, Motion and Lenis. Dependencies and lockfile are local to this repository; no sibling folders, symlinks or shared workspaces are required. Google fonts are fetched during a clean production build. Brand assets are local; source attribution is in `docs/brand-assets.md` and `docs/storefront-design-research.md`.

### Current data boundary

This is a browser-storage prototype. The owner explicitly chose to split the apps first and add a shared backend later. Admin changes and customer orders **do not sync across the two sites**. Checkout payment remains simulated.

Wishlist hearts on cards and product pages save product IDs in this browser. Account, login and registration pages are prepared for the next authentication phase: they clearly indicate that online accounts are not yet available. They do not transmit or store passwords, create accounts, or simulate an authenticated session. Contact buttons use the original brand's WhatsApp destination; Instagram, TikTok, YouTube and maps links were copied from its public footer.

Existing browser data stays on its original origin; this split does not clear it. Read-only catalog/settings hydration preserves existing custom catalog data and exposes only public settings. Seeded admin order history and catalog-management actions are absent from this app. The new admin origin starts with its own demo data.

See `docs/project-separation.md` for the backend and migration boundary.

### Separate deployment

Import **this repository** as one Next.js project on Vercel or another Next.js/Node.js host. Use repository root `.` as the project directory, `npm ci` to install and `npm run build` to build. The admin repository must be imported as a second project with its own environment settings and address. GitHub Pages is unsuitable for this app's dynamic routes.

The source repositories are public at the owner's request. The storefront is deployed as its own Vercel project under Trustcode System, with Git integration on `main`. Before using the two sites for real commerce, connect the shared backend, server-side order/payment validation and admin authentication.
