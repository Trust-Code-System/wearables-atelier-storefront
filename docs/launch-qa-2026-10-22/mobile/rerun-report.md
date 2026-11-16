# Mobile first-time customer — rerun

Real installed Chrome, 375×812 CSS pixels, touch enabled; CDP 400 ms latency and 500 kbit/s upload/download. Application http://127.0.0.1:3001 with its configured staging API. No mocks, app edits, purchase or outgoing message.

**First success remains blocked by the live API.** Followed landing → Discover the collection → Shop → Retry, then opened Bag to inspect the failure recovery. No real product could be selected; add-to-bag and checkout cannot be proven.

Verified fixes:

- Collection unavailable notice and recovery controls are now before the Shop title and imagery. At 375×812, notice bounds are x20,y142,w335,h135, completely inside the first viewport. Evidence: `rerun-shop-first-viewport.png`.
- “0 pieces to discover” is replaced with “Product availability could not be checked” during the failure. Pending state says “Checking available products…”.
- Retry produces visible “Loading the collection…” feedback and removes the Retry button while pending. Evidence: `rerun-retry-pending.png`, `rerun-feedback-checks.json`.
- Bag failure displays “We couldn’t connect to your bag. Please try again.” and explains that item count, prices and availability could not be confirmed. It offers Try again and Close. No saved-item claim appears. Header uses “—” with accessible label “Open shopping bag, item count unavailable” after the request fails. Evidence: `rerun-bag-error.png`.
- No horizontal overflow in inspected states (documentWidth=innerWidth=375).

Remaining blocker:

- Requests to `https://api.staging.wearables.trustcodesystem.tech` fail in the real browser with CORS messages reporting the local origin lacks `Access-Control-Allow-Origin`. Product, cart and session cannot load. Retrying does not recover. Full failures are recorded in `rerun-report.json`.

Development diagnostic timings: landing DOM-content-loaded plus 3-second settle 7.974 seconds; Shop navigation plus 6-second settle 29.964 seconds. These include local development behavior and are not production performance measurements. On direct Shop load, a supplementary capture at 10 seconds still showed a loading collection and a pre-hydration Bag click produced no visible action; the same click worked after the error state appeared. Do not infer a persistent interactive failure from the early click.

Evidence commands:

- `node docs/launch-qa-2026-10-22/mobile/qa.cjs rerun`
- `node docs/launch-qa-2026-10-22/mobile/rerun-feedback.cjs`
