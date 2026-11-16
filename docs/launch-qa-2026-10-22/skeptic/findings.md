# Skeptic baseline — 22 October 2026

Chrome, 1440×1000, real local app at http://127.0.0.1:3001. Live responses only; no API mocking. No credentials, real signup, payment or external message submitted.

## Findings

1. **P1 — Catalog unavailable after one retry.** Landing displays collection unavailable; Retry collection repeats failure. Shop all shows “0 pieces to discover” plus collection unavailable, so I cannot see product prices or choose a piece. Evidence: `baseline/01-landing-unavailable.png`, `baseline/06-shop-unavailable.png`.
2. **Withdrawn — account recovery loop.** Original capture occurred before navigation settled. Explicit wait for `/account/login` and the visible Email address field confirms Back to sign in works. Evidence: `baseline/11-signin-recovery-settled.png`. No fix needed.
3. **P2 — Refund eligibility unclear.** Shipping & returns explains 7-day size exchanges, excluded items, and delivery charges, but leaves general standard-clothing return/refund eligibility and refund timing unstated. This is a merchant-policy decision: do not invent a promise. Evidence: `baseline/02-shipping-returns.png`.

Privacy and Terms are present, readable, linked in the footer, and identify relevant data/payment behavior. Shipping timing is described, but actual paid-delivery fees can only be assessed at checkout, which was blocked by the catalog outage.

**Outcome:** first success not reached. No product selection, cart or checkout could be tested without fabricating catalog data. Browser text and network errors recorded in `baseline/results.json`; baseline/rerun harness is `run.cjs` (run with phase argument). `account.cjs` records the recovery loop separately.
