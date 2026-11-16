# Impatient customer — baseline

Browser: installed Google Chrome via Playwright, 1440 × 1000, fresh session. Local app: http://127.0.0.1:3001. No API mocking.

First-success result: BLOCKED. No products render, so choosing a product, adding it to bag and reaching checkout cannot be tested.

## Ranked findings

1. P0 — The collection cannot load. On opening the landing page, a prominent message says “The collection is temporarily unavailable. Please try again.” The impatient customer quits here. Clicking “Retry collection” once leaves the same error. Clicking “Discover the collection” reaches `/shop`; its product area says “0 pieces to discover” and the same error. One retry fails again. Screenshots: `baseline/01-landing-collection-error.png`, `baseline/02-retry-collection.png`, `baseline/04-shop-retry.png`. Browser requests to `http://localhost:4300/api/v1/store/products`, `/api/v1/store/cart`, and `/api/auth/get-session` fail with `net::ERR_CONNECTION_REFUSED`.

2. P2 — The shop reports “0 pieces to discover” while the catalog request has failed. This suggests the collection is empty, adding confusion to the actual availability error. Same screenshot `baseline/04-shop-retry.png`.

The first CTA transition briefly displayed only header/footer while the route settled; not reported as a confirmed separate defect because development compilation may account for it.

## Rerun

Run `node docs/launch-qa-2026-10-22/impatient/journey.cjs rerun` after fixing availability. JSON contains visible UI text, browser console errors and failed network requests. Extend product/add-to-bag path against the UI once products are available.

## Post-fix rerun

Repeated in fresh installed Chrome on http://127.0.0.1:3001, with live staging API and no mocks. Evidence in `rerun/`, including `report.json` and `additional-report.json`.

- FIXED: shop no longer reports a false zero during an outage. It says “Product availability could not be checked.” Screenshot `12-shop-settled.png`.
- VERIFIED: error is above the shop hero with Retry and Contact us for help.
- VERIFIED: clicking Retry immediately replaces the error with “Loading the collection…” and “Checking available products…”. Recorded in `additional-report.json` step `retry-immediate`, and screenshot `13-retry-pending.png`. The real request subsequently fails again.
- VERIFIED: Bag count displays an em dash after failure; opening it says “We couldn’t connect to your bag. Please try again.” and explains that count, prices and availability could not be confirmed. It offers Try again. Screenshot `15-bag.png`.
- VERIFIED: direct checkout displays “We couldn’t connect to accounts. Please try again.” with Retry checkout and Recover order access. Screenshot `16-checkout.png`.
- EXTERNALLY BLOCKED: browser explicitly reports staging API calls rejected by CORS because the local origin has no Access-Control-Allow-Origin response header. Landing -> collection -> product -> bag -> checkout first success remains impossible; no product, account, order or payment success is claimed.

No legacy-host comparison was needed for these local verification claims. The first run of `rerun-extra.cjs` used a case-sensitive Bag locator and timed out; that QA selector was corrected to `/bag/i` and the complete additional rerun then passed its available UI steps. This was a script issue, not an app defect.
