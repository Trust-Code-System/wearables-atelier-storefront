# Mobile first-time customer — baseline

Environment: real installed Chrome, headless, 375×812 CSS pixels, touch enabled; CDP throttling at 400 ms latency and 500 kbit/s upload/download. Unmocked application at http://127.0.0.1:3001. No app source inspected or changed.

## Result

**Blocked before first success.** Landing → Discover the collection → Shop → Retry. No product was available to select, so adding to bag and reaching checkout could not be exercised.

## Findings

1. **P0 — collection service unavailable; retry does not recover.** Shop displays “0 pieces to discover” and “The collection is temporarily unavailable. Please try again. Retry”. Tapping Retry reproduces the same screen. Product, bag and session requests to `http://localhost:4300` fail with `net::ERR_CONNECTION_REFUSED`. This prevents the purchase journey. Evidence: `baseline-shop.png`, `baseline-shop-retry.png`, `baseline-report.json`.
2. **P2 — Shop spends the first mobile screen on an introduction while the error is below the fold.** At 375×812, the collection title, descriptive copy and two decorative photos fill the viewport before products or the unavailable state. The shopper must scroll to discover the collection is unavailable. Evidence: `baseline-shop.png`. Recommend compacting the mobile introduction and placing loading/error feedback before it, or displaying feedback near the collection count.

## Measurements and limits

- First inspection: landing reached network idle after 29.7 seconds; a later independent run reached DOM content loaded + a 3-second settle in 8.7 seconds. These are different milestones and not a benchmark comparison.
- Shop CTA to captured state: 27.4 seconds, including a 6-second settle and route navigation waiting under the throttled network.
- Document width equals viewport width (375 px) on landing, Shop, and Shop retry; no horizontal overflow observed.
- Initial visible header controls meet 24×24 minimum measured targets. A visually hidden 1×1 select was excluded from findings because it is not a user-visible target. The below-fold inline Retry appears visually small in the screenshot; exact target size has not yet been measured.
- No purchase, outgoing message, account registration or mocked server response was performed.

Reusable command: `node docs/launch-qa-2026-10-22/mobile/qa.cjs rerun` (the script preserves baseline evidence and creates separate rerun files). Product-flow continuation will be added if real products become available.
