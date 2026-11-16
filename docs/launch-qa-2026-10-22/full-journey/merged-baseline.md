# Launch QA, full journey — merged baseline (5 personas, real Chrome + throttled Chrome)

Personas: P1 impatient, P2 skeptic, P3 mobile/slow 3G, P4 literal non-native reader, P5 breaker. Reports and screenshots are in `baseline/<persona>/`.
Target http://localhost:3101 (dev server, same-origin proxy to the staging API).

**Environment finding that shaped everything:** the staging backend only accepts writes (cart create, sign-in, sign-up) from allow-listed origins.
Direct probes: `POST /api/v1/store/cart` → 403 with Origin `http://localhost:3101`, `http://localhost:3100`, no Origin or `https://evil.example`;
→ 201 with `https://storefront.wearables.trustcodesystem.tech`. So from localhost no persona could add to bag, sign in, or reach checkout
(P3 reached the checkout form only with a Playwright-stubbed cart). Reads (products, cart GET, session) work. The first-success journey is therefore
unverified end to end; it needs either the backend allow-list to include the test origin or a test against an allow-listed origin.

## Ranked by personas hit

| Rank | Finding | Personas | Count | Class | Plan |
| --- | --- | --- | --- | --- | --- |
| 1 | Add to bag fails with a generic "Unable to update your bag", no cause, no retry control, no fallback contact | P1 P2 P3 P4 P5 | 5/5 | Env (403) + UX | Fix UX: specific message per status (403 vs 5xx vs offline), retry + WhatsApp fallback. Backend allow-list = needs owner |
| 2 | Product photos broken (media bucket returns 403 / ORB), alt text spills over grey boxes | P1 P2 P3 P4 P5 | 5/5 | Backend/infra + UX | Fix UX: branded placeholder on image error. Bucket access = needs owner |
| 3 | Bag count and drawer after a failed action: badge "–"/"…" with no words; drawer says "We couldn't load your bag" for an empty bag; button swaps place | P1 P2 P3 P4 P5 | 5/5 | UX | Fix |
| 4 | Catalogue is test data ("Test Product", "Jewelery test", "Test Description", "testing") | P1 P2 P3 P4 | 4/5 | Content | Not code; flag to owner |
| 5 | Dead/slow first impression: header buttons inert ~37 s on slow 3G until hydration, no pressed state; shop shows two loading messages and no products for ~45 s; hero button gives no feedback; intro screen | P1 P2 P3 | 3/5 | Perf/UX (dev server inflates) | Fix feedback + single skeleton + shorter intro on phones; re-measure on prod build |
| 6 | Price changes when a size is chosen with no "From" on the product page; varying "was" prices | P2 P4 P5 | 3/5 | UX | Fix |
| 7 | Jargon and idioms where instructions belong: "atelier", "edit", "pieces", "collection", "make yourself at home", poetic empty states; "Resend verification email" and "Enter your password" on sign-up before an account exists | P4 P5 | 2/5 | Copy | Fix |
| 8 | Delivery promise inconsistent: free over ₦150,000 on product page/home only, shipping page and FAQ say "fees at checkout", no fee table | P2 P4 | 2/5 | Content/business | Align wording; fee table needs owner |
| 9 | Brand name inconsistent (Wearables by Ashabi / Wearables Atelier / wearablesatelier.com) | P2 P4 | 2/5 | Content | Flag to owner |
| 10 | Layout jumps: accordion open scrolls ~60 px, size chips grow/shift | P3 P4 | 2/5 | UI | Fix |
| 11 | Sign-in blames the password when the server returned 403 | P5 | 1/5 | UX | Fix |
| 12 | Bare black default 404 with no header; product 404 differs and flashes blank | P5 | 1/5 | UX | Fix |
| 13 | Icon-only "+" / "↗" buttons on product cards; heart and selected size shown by colour only | P4 | 1/5 | A11y/UX | Fix |
| 14 | Mobile: tap targets under 44 px, 8–9 px text, PDP price/Add to bag far below fold with no sticky bar | P3 | 1/5 | UI | Fix |
| 15 | Checkout: stepper has no labels, delivery method not preselected / "Review" greyed without hint, blank "Checking your checkout…", "₦8,000.00" vs "₦185,000" | P3 | 1/5 | UX | Fix |
| 16 | Filters not in URL; Back loses size/qty; unknown `category` silently shows all | P5 | 1/5 | UX | Fix filters-in-URL; selection restore if cheap |
| 17 | Trust gaps: no legal name, phone or named payment provider; refunds deferred to "contact us"; inconsistent legal dates | P2 | 1/5 | Business | Owner decision; not invented by us |
| 18 | Size help says 6–16 but only 6 and 8 exist; inconsistent badge words (Most loved vs Bestseller); FAQ one-at-a-time; search placeholder cut off | P2 P4 P3 | 1–2/5 | Mixed | Fix cheap ones |

Worked well (several personas): junk input handled calmly (no XSS/crash/duplicate requests), empty checkout state, size-first validation, phone-appropriate
checkout inputs, no horizontal scroll at 375 px, plain-language policy pages that agree with each other on dispatch and exchange.
