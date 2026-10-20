## Wearables Atelier storefront

Customer shopping site for Wearables by Ashabi: clothing, jewellery, product details, styled NGN/USD display, account dashboard, wishlist, shopping bag and hosted checkout integration. The admin application is a separate project and repository; there are no admin pages or admin links in this app.

![Customer storefront](docs/previews/storefront-separated.jpg)

Source: [wearables-atelier-storefront](https://github.com/Trust-Code-System/wearables-atelier-storefront). Admin source: [wearables-atelier-admin](https://github.com/Trust-Code-System/wearables-atelier-admin).

Storefront domain: [wearablesbyashabi.store](https://wearablesbyashabi.store). Connected to Production with HTTPS verified on 17 October 2026. `www` permanently redirects to the root domain. Backend CORS and the API/cookie domain cutover still require the Railway owner before full operation; see [domain cutover](docs/domain-cutover.md). The [previous storefront address](https://storefront.wearables.trustcodesystem.tech) remains assigned during the transition.

## Getting Started

Install and run with Node.js 22 LTS or newer:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open [localhost:3100](http://localhost:3100). The separate admin app runs at [localhost:3200/admin](http://localhost:3200/admin).

Verify with `npm run lint` and `npm run build`. Run the production build locally with `npm run start -- --port 3100`.

### Backend configuration

Both apps use the same public backend setting:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://api.staging.wearables.trustcodesystem.tech
```

Keep `.env.local` at the project root and out of Git. `.env.example` records the current staging address for new checkouts. Catalog API code imports `getApiBaseUrl` from `@/lib/api-config` and append the backend's confirmed endpoint path. The helper validates the setting and removes trailing slashes; it makes no network requests. Public catalog reads use `/api/v1/store/products` and `/api/v1/store/products/:slug` without authentication.

Set the same key in each Vercel project's **Production**, **Preview** and **Development** environments for now. `NEXT_PUBLIC_` values are public and inlined at build time, so restart local development after changes and rebuild/redeploy hosted apps when this value changes. Replace the Production value when the production backend is available. Never store tokens or API keys in this setting.

Configured in both projects under the `hello-76386237s-projects` Vercel workspace on 14 October 2026, for all three environments. Existing deployments need a new build to receive the setting.

Catalog reads are connected. Include the storefront origin in backend CORS. Local development can use `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000` with the backend running and `http://localhost:3100` in its CORS allow-list.

### Structure and dependencies

- `src/app/(store)` — home, shop, product, wishlist, contact and checkout routes.
- `src/app/(auth)` — signed-in account dashboard, branded sign-in/sign-up and email recovery routes.
- `src/components/layout` — customer header and footer.
- `src/components/cart` and `src/components/shop` — shopping interactions.
- `src/lib/store.tsx` — live public catalog, public display settings and server-backed bag/wishlist providers.
- `src/lib/api-config.ts` — validated public API base URL.
- `public/brand` and `public/collection` — supplied brand logo and photography.

Next.js 16.4, React 19, Tailwind 4, Base UI, Motion and Lenis. Dependencies and lockfile are local to this repository; no sibling folders, symlinks or shared workspaces are required. Google fonts are fetched during a clean production build. Brand assets are local; source attribution is in `docs/brand-assets.md` and `docs/storefront-design-research.md`.

### Current data boundary

Catalog data comes from the shared backend. Published admin products appear in the shop, home recommendations, search and wishlist; drafts and archived products stay hidden. Product URLs return 404 for missing/unpublished products. The shared catalog provider traverses API pagination for the bag, search and recommendations and ignores the old `wa:catalog` sample data. The shop independently requests server-filtered pages of 12 products. It refreshes on navigation, window focus and every five minutes to renew signed image URLs. API failures show a retry message instead of sample products.

Size selection uses each variant's NGN price and available quantity (on-hand minus reserved). The bag uses the selected size's price and limit. Product cards show the lowest variant price with “From” when prices differ. Signed images are rendered directly so Next's optimizer does not cache expired signatures.

Account login/signup, recovery, verification, cart and wishlist use the shared backend with HttpOnly cookie sessions. The redesigned auth forms keep passwords in memory only and require the backend's 12-character signup minimum. `/account` is a separate signed-in dashboard with Overview, Orders, Addresses, Measurements, Avatar, Password and Email tabs. Profile phone, saved-address CRUD/default selection, paginated order history and authorized order details use backend APIs. Measurements and photo uploads remain explicitly unavailable; password management links to native email recovery, and changing an email is disabled by backend policy.

Cart and account wishlists are server-backed, with guest merge/retry and account-switch isolation preserved from upstream. Checkout uses authoritative shipping options, reservation/order creation and hosted Paystack initialization from upstream main. Return/access routes verify server status and never treat a redirect or slider as payment success. No card fields or invented free/express delivery promises are used in the bag/checkout flow. The USD option remains display-only; checkout operates in NGN kobo.

Custom-domain API access still needs the coordinated backend/domain cutover in `docs/domain-cutover.md`. A local successful build or fixture test is not evidence of live email, provider payment or cross-domain cookie acceptance. Details and verification are in `docs/account-dashboard-integration-2026-10-20.md`.

Contact buttons use the original brand's WhatsApp destination; Instagram, TikTok, YouTube and maps links were copied from its public footer.

Existing browser data is not deleted. Old sample catalog entries are ignored; old cart lines whose product IDs are no longer available can be removed from the bag. Settings still expose only public values. Catalog-management actions belong to the separate admin app.

See `docs/project-separation.md` for the backend and migration boundary.

### Separate deployment

Import **this repository** as one Next.js project on Vercel or another Next.js/Node.js host. Use repository root `.` as the project directory, `npm ci` to install and `npm run build` to build. The admin repository must be imported as a second project with its own environment settings and address. GitHub Pages is unsuitable for this app's dynamic routes.

The source repositories are public at the owner's request. The storefront is deployed as its own Vercel project under Trustcode System, with Git integration on `main`. Server-side order/payment validation and checkout inventory orchestration remain necessary before accepting real orders.

### Shop filtering and sorting

The existing category, numbered size and price controls query the public catalog API.
Size filters match any selected size with positive available stock; archived variants
are excluded. Price bands use the lowest active variant price: below ₦100,000,
₦100,000 through ₦200,000 inclusive, or above ₦200,000. Prices are compared as
integer kobo in PostgreSQL. Sorting supports featured (bestsellers first), newest,
and price ascending/descending, with deterministic ties. Previous/Next controls
paginate the matching results; changing filters/sort resets to page 1. Signed image
URLs refresh on focus and every five minutes. API errors offer a retry.

Deploy the matching backend filtering endpoints before this frontend change.
