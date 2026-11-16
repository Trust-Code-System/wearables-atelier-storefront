# Frontend and UI verification — 19 October 2026

## Outcome

Fixed customer account navigation, misleading unavailable sign-in forms, narrow-screen overflow, product size messaging, catalog failure states, checkout preview messaging, and several admin usability issues. Changes are local in the storefront and sibling admin repositories; no deployment or backend changes were made.

## Changes

- Customer account routes now provide a guest overview with the store header/footer, wishlist and bag access, collection navigation, and order assistance. They clearly state that customer authentication is unavailable and no longer request credentials that cannot be used.
- Account photography stays inside its grid on phones. Product purchase controls stack on narrow screens, long button labels wrap, and thumbnail galleries scroll within their container.
- Products prompt customers to choose a size before adding to the bag, instead of incorrectly saying all available stock is already in the bag. Size radios support arrow keys, Home and End with a single keyboard tab stop.
- Search distinguishes an unavailable catalog from an empty search. Wishlist, bag and checkout wait for catalog data and offer retries; a failed request no longer implies saved products have disappeared. Catalog notices are placed within relevant store pages.
- Checkout validates on form submission, focuses the first invalid field, disables future steps, and does not preselect newsletter consent. Its sample card fields are read-only. The preview no longer claims a successful payment, a real order or an emailed receipt, and includes an atelier contact action.
- Admin sign-in has clearer branding, readable form spacing, larger controls, password visibility, associated error feedback, busy state and a storefront exit.
- Admin category filters have an explicit empty state with a reset action. Header controls can wrap, status badges yield space on small phones, and touch controls and inputs have larger targets.

## Verification

| Check | Result |
| --- | --- |
| Storefront ESLint | Passed |
| Storefront existing test suite | 8/8 passed |
| Storefront production build, including TypeScript | Passed |
| Admin ESLint | Passed |
| Admin existing test suite | 12/12 passed |
| Admin production build, including TypeScript | Passed |
| Both repositories: `git diff --check` | Passed |
| Account horizontal overflow at 320, 375, 768, 1024 and 1440 CSS px | None after fixes |
| Product page at 320 and 768 CSS px | No page overflow; usable size and purchase controls |
| Mobile navigation | Open, navigate and close verified |
| Search | Matching and empty queries, Escape and focus return verified |
| Filters | Category and price selection, empty results and reset verified |
| Sort and currency | Ascending price order and NGN/USD switching verified; restored NGN |
| Wishlist | Save, navigate, render saved product and remove verified |
| Product sizes | Variant availability and arrow-key selection verified |
| Shopping bag | Add, quantity change, price/subtotal updates, remove and checkout navigation verified |
| Checkout preview | Required-field errors, fictional contact details, delivery, read-only sample payment fields and keyboard confirmation verified |
| Catalog outage/recovery | Saved wishlist and bag remained saved during outage; retry recovered products; temporary shopping selections removed |
| Admin sign-in | Responsive appearance and password reveal/hide verified; no credentials submitted |

Production account screenshots: [desktop](previews/account-qa-desktop.png), [mobile](previews/account-qa-mobile.png).

## Test environment and remaining limits

The staging catalog API returned HTTP 200 to a request with origin `http://localhost:3100`, but supplied no `Access-Control-Allow-Origin` response header. Local shopping checks therefore used a temporary GET-only relay for `/api/v1/store/products` and product details, forwarding actual staging data. The relay was stopped after testing; `.env.local` was unchanged and the normal development server was restored. Fix the backend CORS allow-list for direct local and deployed-origin testing.

Customer sign-in, registration and an authenticated customer account dashboard are not implemented in this storefront. An after-login customer screen cannot be verified until that integration exists. The guest overview is explicitly labelled accordingly.

At the initial 19 October review, no authenticated admin session or test credentials were available. This limitation was resolved on 20 October: the newly supplied seeded account signed in successfully. Authenticated catalog, inventory, orders, customers, analytics, settings, mobile navigation, command search, blank-product validation, session reload and sign-out checks were completed. Authentication guards were preserved. See the sibling admin repository's `docs/admin-ui-qa-2026-10-20.md` for findings, fixes, screenshots and the remaining deployment verification limits.

Follow-up: the user subsequently supplied two candidate test accounts and clarified that the final full stop was punctuation. Both accounts still failed on `https://admin.wearables.trustcodesystem.tech` with the corrected password. A diagnostic retry confirmed HTTP 401 from `https://api.staging.wearables.trustcodesystem.tech/api/auth/sign-in/email` itself, after a successful HTTP 204 CORS preflight. This observed rejection occurs before session confirmation or dashboard navigation. No further password variations were attempted. Credentials were cleared from the form and were not copied into this report. [Sign-in error with fields cleared](previews/admin-test-login-rejected.png). Authenticated admin checks require a working test login or a user-authenticated session.

Checkout is a browser-only preview. Real payment, order creation, receipts, shipping rates and delivery promises require backend integration and business confirmation. The preview used fictional details and did not contact a payment provider or create a backend order. The existing prototype records a local simulated checkout entry.

A third candidate test account was subsequently supplied and tried once with the clarified password. It also failed. These historical candidate-account failures were superseded by the successful seeded-account login on 20 October; dashboard access is now verified on the legacy admin origin.

The Chrome MetaMask extension raised unrelated connection errors during development browsing; the development overlay identified its source as the extension. Clean production account screenshots do not include the development overlay.

This pass verifies the routes and states listed above. It does not certify every authenticated state, device, assistive technology or backend operation.
