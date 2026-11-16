# Launch QA, full journey — 22 October 2026

Five persona agents (impatient, skeptic, mobile/slow 3G, literal non-native reader, breaker) walked the storefront at http://localhost:3101
(dev server, same-origin proxy to the staging API). Four used the real Chrome through the Chrome extension; mobile used Playwright-driven Chrome
because resizing the shared window would have disturbed the others and the extension cannot throttle the network.
Baseline evidence: `baseline/<persona>/`. Merged ranking: `merged-baseline.md`. After-fix screenshots: `after/`.

## Status

| Step | State |
| --- | --- |
| Baseline, 5 personas | Done |
| Merge, ranked by personas hit | Done (`merged-baseline.md`) |
| Fix pass (storefront code) | Done, uncommitted |
| Automated checks | `tsc` clean, `eslint src` clean, `npm test` 33/33 (one regression test added, two assertions updated for new wording), `next build` passes |
| Visual gate | Looked at 390 px shop/product/404/home and 1440 px product screenshots in `after/`; not every changed screen was re-shot |
| Rerun of the 5 personas | **Not done.** Waiting on the staging backend allow-list (below). Without it no persona can add to bag, sign in or reach checkout, so a rerun would prove nothing about the blocker |

## The one blocker that is not a storefront bug

The staging API rejects writes (`POST /store/cart`, sign-in, sign-up) with 403 unless the Origin is allow-listed.
Verified directly: 403 for `http://localhost:3101`, `http://localhost:3100`, no Origin, `https://evil.example`; 201 for
`https://storefront.wearables.trustcodesystem.tech`. The user chose to add `http://localhost:3101` to the staging backend's allowed origins; the rerun runs after that.
Confirm with: `curl -s -o /dev/null -w "%{http_code}" -X POST https://api.staging.wearables.trustcodesystem.tech/api/v1/store/cart -H "Content-Type: application/json" -H "Origin: http://localhost:3101" -d "{}"` → expect 201.

## What changed in the fix pass (by merged rank)

1. **Bag failures (5/5):** bag errors now say what happened per status (refused/403, 5xx, offline, conflict, rate limit); failures a customer cannot fix show a "Message us" action in the toast and a WhatsApp link in the bag. After a failed add the bag is re-read; if it is confirmed, the "couldn't load your bag" error is cleared. Header badge no longer shows "…" while loading and shows "?" only if the bag truly can't be read. `src/lib/cart-api.ts`, `src/lib/store.tsx`, `src/components/cart/cart-drawer.tsx`, `site-header.tsx`.
2. **Broken product photos (5/5, cause is the media bucket):** new `SafeImage` shows a quiet "Photo coming soon" tile instead of a broken-image icon and spilled alt text, on cards, product page, bag, search and checkout. `src/components/ui/safe-image.tsx`. **The bucket itself still returns 403 / ORB for the image URLs and needs the owner to fix.**
3. **Bag drawer/badge states (5/5):** see 1; empty bag copy is now plain ("Choose a product to start your order."), one action in the same spot.
4. **Test data catalogue (4/5):** content, not code. Not changed.
5. **Slow/inert first load (3/5):** shop shows one loading line plus a skeleton grid instead of two messages; mobile intro photos hidden so products start higher; checkout loading state explains the wait. Hydration delays measured on the dev server must be re-measured on a production build.
6. **Price changes by size (3/5):** product page shows "From ₦185,000" until a size is chosen.
7. **Jargon and idioms (2/5):** "pieces" → "products"/"in stock"; "Discover the collection" → "Shop all products"; "Talk to the atelier" → "Message us on WhatsApp"; "Or, make yourself at home" → "Or shop without an account"; plain empty states; hero states what is sold; sign-up no longer shows "Resend verification email" before an account exists and the password error reads "Create a password with at least 12 characters."
8. **Delivery wording (2/5):** product page no longer promises free delivery over ₦150,000 (no other page or checkout confirms it); it now matches Shipping & returns: fee depends on destination and is shown at checkout. If free delivery is real, add it back from one source on all pages.
9. **Brand name inconsistency (2/5):** not changed (logo says Wearables by Ashabi, text says Wearables Atelier, email domain wearablesatelier.com). Owner decision.
10. **Layout jumps (2/5):** size chip animation toned down (no neighbour nudge, 1.06 scale). The accordion scroll jump was not reproduced in code and is unfixed.
11. **Sign-in blamed the password on a 403 (1/5):** a 5xx, or a bare 403 without an account error code, now says the service could not complete it; real credential failures keep the credential message. Regression test added.
12. **Bare black 404 (1/5):** branded `src/app/not-found.tsx`.
13. **Icon-only card buttons (1/5):** cards now show "Add to bag" / "Choose size" text. Badge wording is one shared map (Most loved / Just arrived).
14. **Mobile tap targets, tiny text, buried buying controls (1/5):** bag, filter and quantity controls enlarged toward 44 px; 8–10 px mobile text raised to 11 px; product page photo is square on phones and the quantity/Add to bag bar sticks to the bottom.
15. **Checkout (1/5):** stepper keeps the current step's label on phones; a single delivery method is preselected; a hint explains the disabled "Review order total"; money shows ₦8,000, not ₦8,000.00.
16. **Filters in URL (1/5):** category, sizes, price and sort are now in the address bar, so Reload, Back and shared links keep them. Back still loses chosen size/quantity on the product page (not changed).
17. **Trust gaps (1/5):** phone and email added to the footer and Contact page (from existing project data). Legal/company name, named payment provider and a refund policy are business facts the owner must supply; not invented.
18. Small: size help lists only sizes that exist; FAQ answers can be open together; search placeholder shortened.

## Not fixed, needs the owner

- Staging backend: allow-list for the test origin; media bucket returning 403 for product images.
- Real product names, photos and descriptions; one brand name; legal entity name; payment provider; refund/return terms; free-delivery rule if it exists.
- Accordion scroll jump; Back losing size/quantity.

## Rerun plan (after the allow-list change)

Same five personas, same brief, folder `rerun/<persona>/`, same fake-data and no-payment/no-registration rules. Pass criteria: every ranked finding either gone or explained as owner content; first success (product → bag → checkout form, no payment) reached by all five.
