# Wearables launch QA — 22 October 2026

Five separate subagents tested as the impatient, skeptical, mobile, literal-English and breaker personas. Real installed Google Chrome was used through bundled Playwright. The Chrome MCP could not attach to the user's existing profile because its extension was missing; the lead opened a separate visible Chrome window. Subagents used isolated headless Chrome sessions. Three agents ran at once, with five total in batches.

Target: http://127.0.0.1:3001. Mobile: 375 × 812, touch, 400 ms latency, 500 kbps upload/download. First shopping success means a selected product added to the bag and arrival at checkout, with no payment submitted. All baseline requests were unmocked. Loading timings from the development server are diagnostic, not production performance benchmarks.

## Merged baseline, ranked by personas affected

| Rank | Finding | Observed personas | Count | Disposition |
| --- | --- | --- | --- | --- |
| 1 | Products, bag and account unavailable; no customer can reach shopping success | All five | 5/5 | Stale local dev runtime pointed at disconnected localhost:4300. Restarted against configured staging API. Staging CORS still rejects local and new production storefront origins; deployment blocker remains. |
| 2 | Failed product request looks like zero inventory: “0 pieces to discover” | All five shop screenshots/text records | 5/5 | Replaced with unknown-availability copy; no count shown on failure. |
| 3 | Retry leaves stale error visible without a loading transition | Impatient, mobile, literal, breaker | 4/5 | Retry now changes the request identity and shows loading until it settles. |
| 4 | Bag claims “safely saved” and zero items alongside raw “Failed to fetch” | Literal, breaker | 2/5 | Removed unconfirmed count/saved claim; actionable message, one retry control, pending feedback. |
| 5 | Checkout exposes raw network error | Breaker | 1/5 | Network/timeout failures now have checkout recovery instructions. |
| 6 | At 375 px the shop error appears below the introductory imagery | Mobile | 1/5 | Moved availability/retry above the intro with a contact link. |
| 7 | Shipping promise contradicts checkout's destination-specific quotes; FAQ points at a missing announcement threshold | Skeptic/lead validation | 1/5 | Removed unsupported free-delivery promise and explained quotes before payment; clarified USD browsing versus NGN payment. |
| 8 | Refund eligibility/window/processing time for ordinary clothing are missing | Skeptic | 1/5 | Added a direct instruction to confirm with the store before ordering; definitive merchant policy still required. |

Additional fix: homepage product sections show loading/unavailable/empty explanations rather than blank grids; account access now surfaces a failed session check and offers a retry alongside guest navigation.

Withdrawn: skeptic initially reported an account recovery loop, but an explicit wait for navigation showed the sign-in form. No code change was made to “fix” that false positive. Junk search, double navigation and browser Back did not produce an observed crash. Signup, email verification, payment completion and order creation were not claimed.

## Evidence

- `impatient/baseline/`: landing and shop failures, retry, console/request details.
- `skeptic/baseline/`: policies, pricing blocker, settled account recovery screenshot.
- `mobile/baseline-*.png`: 375 px landing/shop/retry; `baseline-report.json` contains throttling and timing.
- `literal/baseline/`: collection, retry and contradictory bag state.
- `breaker/baseline/`: junk search, Back, double click, cart and checkout failures.
- `lead/`: visible-Chrome checks and cross-origin diagnostics.

## Verification

Pending final five-persona reruns, automated checks and current cross-origin evidence. No screenshots or user reports from before this audit were changed or removed. Fixes remain local and uncommitted in the current branch.
