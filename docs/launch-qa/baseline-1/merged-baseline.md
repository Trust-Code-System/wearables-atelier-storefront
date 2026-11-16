# Launch QA — merged baseline (4 of 5 personas; mobile not yet run)

Personas: P1 impatient, P2 skeptic, P4 non-native speaker, P5 breaker. Per-persona reports sit beside this file.
Caveat: the 3001 dev server these four ran against was pointed at a dead `localhost:4300` backend (503 on every call),
and the staging API sends no CORS headers for localhost origins. No persona saw a product, bag or successful sign-up.
Findings below are what a visitor sees when the backend is unreachable, plus the static-page findings that are unaffected.

## Ranked by users hit

| # | Finding | Hit by | Count |
|---|---------|--------|-------|
| 1 | Backend unreachable: nobody reaches first success (environment, but shows there is no graceful path) | P1 P2 P4 P5 | 4/4 |
| 2 | Shop says "0 pieces to discover" / "temporarily unavailable"; Retry gives no feedback | P1 P2 P4 P5 | 4/4 |
| 3 | Raw "Failed to fetch" or vague "couldn't connect to accounts" on sign-up, sign-in, bag, checkout | P1 P2 P4 P5 | 4/4 |
| 4 | Sign-up/sign-in shows "Resend verification email" / "Continue as a guest" with no explanation; layout jumps on error | P1 P2 P4 P5 | 4/4 |
| 5 | Signed-out `/account` says "We couldn't check your account" instead of sending to sign-in | P1 P4 P5 | 3/4 |
| 6 | Bag drawer contradicts itself: "(0 items)" + "Failed to fetch" + "safely saved" + two retry buttons | P1 P4 P5 | 3/4 |
| 7 | Checkout with an empty bag shows an accounts error, not "your bag is empty"; recovery links unexplained | P2 P4 P5 | 3/4 |
| 8 | Currency unclear: unlabeled NGN/USD selector, price filter stays in ₦, terms silent on charged currency | P2 P4 | 2/4 |
| 9 | Size help: no size chart or system (UK/US/EU) | P2 P4 | 2/4 |
| 10 | Brand jargon with no plain statement of what is sold ("atelier", "edit", "pieces"); mixed wishlist/favourites; Jewelry vs jewellery; tab title differs from logo | P1 P4 | 2/4 |
| 11 | Delivery/returns/identity gaps: free-delivery threshold missing from announcement bar, no fees or couriers, exchange-only vs "return", no legal name or email/phone, thin privacy | P2 | 1/4 |
| 12 | Forgot/reset/order-recovery pages look unfinished (invisible inputs); long email breaks layout; `a@b` accepted | P5 | 1/4 |
| 13 | Bare black default 404 with no way forward | P5 | 1/4 |
| 14 | Order screens say "before making another payment" to someone who never paid; guest wishlist shows only an error | P5 | 1/4 |
| 15 | Third-party watermark on contact photo; "Our point of view" footer link is only an anchor | P2 | 1/4 |

Worked well: password rule shown up front with live tick; specific inline sign-up errors; no XSS found; double-click produced one POST;
garbage reset token handled gracefully; all footer links resolve.
