# Breaker — baseline

Real installed Google Chrome, launched with Playwright in an isolated context at 1365 × 900. Unmocked app: http://127.0.0.1:3001. No account, purchase, order, or contact submission.

## Findings

1. **P0: Cannot reach first success.** Landing → double-click “Discover the collection” → shop has no products and “The collection is temporarily unavailable.” Requests to localhost:4300 fail with `ERR_CONNECTION_REFUSED`. Retrying twice leaves the same state. Evidence: `baseline/01-landing.png`, `02-shop-double-primary.png`, `03-retry-loop.png`; exact requests in `baseline/observations.json`.
2. **P2: Unavailable inventory is described as zero inventory.** Shop says “0 pieces to discover” while its collection request has failed. A first-time visitor can reasonably conclude the store has no stock. Evidence: `baseline/02-shop-double-primary.png` and `06-double-filter.png`.
3. **P2: Bag failure copy asserts saved state with no supporting cart data.** Open “Bag 0” while the cart request has failed. Drawer reads “Your Bag (0 items)”, raw “Failed to fetch”, and “Your bag is safely saved.” This fresh user cannot establish any saved bag. Evidence: `baseline/07-bag.png`.
4. **P2: Checkout recovery exposes a technical error.** Navigate to checkout → raw “Failed to fetch”, “Retry checkout”, and “Recover order access”, without clear shopper-facing explanation of the failed step. Evidence: `baseline/11-checkout.png`.

## Robustness observations

- Junk search `<script>alert(1)</script> 🧨 \\ ../../ null @@@` remains text. No script execution, app crash or runtime page errors observed. Search correctly displays “COLLECTION UNAVAILABLE”; retry still fails because the backend is unavailable (`04-junk-search.png`, `05-search-retry.png`).
- Double-click landing CTA and jewelry filter caused no duplicate visible navigation or crash. Browser Back after shop returned to the landing page; after checkout it returned to account (`08-back-midflow.png`, `12-back-checkout.png`).
- Account route gives “We couldn’t check your account. Please try again.” Double retry recovers neither session nor sign-in access on that route (`09-account.png`, `10-account-double-retry.png`). Direct `/account/login` was independently inspected and does expose email/password fields. Do not claim forms are globally unreachable.
- Invalid login/register/forgot-password probe was prepared in `forms.cjs`, but the local server went down for the parent’s fix pass before that probe ran. No baseline form-validation conclusion is supported.

## Repeat

`node docs/launch-qa-2026-10-22/breaker/run.cjs rerun`

`node docs/launch-qa-2026-10-22/breaker/forms.cjs rerun`

The core script writes screenshots and full visible text per stop. It will require adaptation to progress from products into bag if the API is restored; the baseline path deliberately captures the blocked state without fake data.
