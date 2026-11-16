# Search visibility — 16 November 2026

The canonical public storefront is https://wearablesbyashabi.store. Public page titles, descriptions, canonical URLs and Open Graph/Twitter cards identify the brand as Wearables by Ashabi. English content is available to search engines worldwide; this does not make a claim about international delivery or translated pages.

`/robots.txt` allows public crawling and advertises `/sitemap.xml` (ten public page/category URLs) and `/product/sitemap.xml` (published products from the public API). Product sitemap requests are uncached, and fail with a server error on a backend outage rather than returning an empty successful sitemap. The static public sitemap remains available independently. Actual modification timestamps are unavailable, so no fabricated `lastmod` dates are emitted.

Product pages render their name, description and shopping content in the initial HTML using the server-loaded product. The client refresh still uses the live catalog; removed products and API failures retain existing unavailable/retry behavior. Shop pages seed their first page from the server while preserving client filters, pagination and five-minute refresh. Product JSON-LD includes current NGN variant price ranges, availability and breadcrumbs. Organization/WebSite markup identifies the brand, canonical website, logo, existing public address, telephone and social profiles. No ratings, delivery territories or invented shipping policies are added. JSON-LD escapes `<` in catalog text.

Account/auth, checkout, order-access and wishlist pages use `noindex`. They remain crawlable so bots can read that directive. Robots exclusions apply only to API/proxy endpoints and are not security controls.

## Google ownership

The domain property `sc-domain:wearablesbyashabi.store` was verified in Google Search Console using `hellotrustcodesystem@gmail.com` through the signed-in Chrome session. An additive apex TXT verification record was saved in the existing Vercel DNS zone. Keep this record to retain verification; no existing DNS or nameserver settings were replaced.

## Production catalog blocker

On 16 November, the live homepage returned 200 but the configured public backend `https://api.staging.wearables.trustcodesystem.tech/api/v1/store/products?limit=1` returned Railway's 404 “Application not found”. The storefront's Vercel setting was confirmed to use that same host. Product pages and the product sitemap depend on restoring the backend. No substitute catalog data or unverified backend URL was deployed. The static sitemap can be submitted immediately; submit the product sitemap after the API is healthy.

## Validation

- `npm run lint`, `npm run build`, and all 33 `npm test` cases passed.
- A local production server returned the expected canonical URLs on ten public pages/category views, `noindex` on six private/transaction pages, and valid robots and static sitemap responses.
- With a temporary local fixture API, the production server rendered product names/descriptions and shop product links without browser JavaScript, emitted the expected real-price Product schema and product sitemap URL, and returned 404 for an unpublished/missing product. This fixture check is not evidence that the production backend is healthy.

Google controls crawl scheduling and indexing; verification, sitemap submission and requesting indexing do not guarantee rankings or immediate inclusion.
