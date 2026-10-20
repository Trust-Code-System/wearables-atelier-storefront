# Customer account integration — 20 October 2026

The storefront now contains a distinct signed-in account dashboard based on the supplied reference, while preserving the redesigned auth experience and the latest backend integrations.

## Implemented

- `/account`: session loading/error/guest states; customer name/email and branded hero; accessible Overview, Orders, Addresses, Measurements, Avatar, Password and Email tabs.
- Overview reads the session-owned customer profile and saves/clears the contact phone. Addresses lists, creates, edits, removes and selects the default Nigerian address. Writes require email verification; the UI respects the five-address limit. Mutation dialogs stay open during saving and requests are cancelled when their component leaves the page.
- Orders reads ten records per page with cursor navigation. `/account/orders/[id]` uses the existing authorized buyer order/status component. Guest recovery stays separate; matching email never links guest orders to an account.
- Login/signup use Better Auth, preserve password visibility/custom validation, enforce a 12-character signup password and redirect successful sign-in to `/account`. Signup without a session explains email verification; resend verification and password recovery remain available.
- Session changes clear the dashboard and remount account-specific resources. Aborted/delayed responses cannot update an unmounted account workspace. A 401 resource response triggers a session refresh; credentials, profile/address/order records and passwords are not persisted by this dashboard in browser storage.
- Measurements and customer photo uploads are explicitly unavailable. Avatar shows initials. Password settings use existing email reset; email settings display identity/verification and do not claim to support the disabled email-change API.
- Address and checkout selects use the themed Base UI/shadcn primitives. Dashboard tab scrolling uses the existing branded scrollbar styles. Keyboard tabs, focus indicators, 44px controls and reduced-motion loading styles are included.

## Preserved upstream work

Local design work was backed up in the task's temporary backup and a retained Git stash, then the working branch fast-forwarded to upstream `6c76f02`. Merge overlaps were resolved around the real auth, cart, wishlist and public-checkout contracts. The retired simulated checkout was superseded by the newer shipping/hosted-payment/return/access integration. Wishlist guest import/retry/account isolation and cart merge behavior were retained.

The bag and header no longer advertise a prototype free-delivery threshold. Authoritative delivery options and charges belong to backend shipping/checkout. Domain/cookie settings remain unchanged locally and on the hosts.

## Verification and evidence

- ESLint, all 30 storefront tests, production build and TypeScript passed. New tests cover session-owned credentialed/uncached customer transport, 204 deletion, cursor encoding, the canonical 37 states/FCT, session expiry and safe API errors.
- Chrome: all seven tabs at 320, 375, 768, 1024 and 1440px, with no page-width overflow; End-key tab navigation selects Email.
- Exercised address creation, edit, default change and confirmed removal; authorized order list/detail; sign-out clearing private content; and the redesigned sign-in redirecting into the dashboard.
- At 375px, address dialog stays within the viewport and scrolls vertically; the state dropdown fits and uses the ivory brand palette.
- Browser tests used an isolated in-memory API fixture on loopback with fictional `preview@example.test` records. No hosted customer data, email, real credentials, order reservations or payments were used. The fixture was stopped, and the final build uses the unchanged `.env.local` API configuration. These tests establish UI/transport behavior, not live email/payment acceptance.
- [Responsive checks](previews/account-dashboard-responsive.json), [desktop screenshot](previews/account-dashboard-desktop.png), [phone screenshot](previews/account-dashboard-phone.png). Screenshots show fixture data.

## Hosted rollout still required

Backend [PR #53](https://github.com/Trust-Code-System/wearables-backend/pull/53) fixes the production validator to accept the exact cookie parent as well as HTTPS subdomains. Twelve targeted tests, backend build, source/test type checks, full lint/ADR check and formatting passed; production dependency audit found no known vulnerabilities. No schema changes or database E2E were needed for this configuration-only patch. Formatting was checked with LF in the temporary checkout to avoid Windows checkout line-ending differences.

The live custom storefront/admin origins are still absent from Railway's trusted list, and cookies still belong to the legacy TrustCode parent. Complete the coordinated [domain cutover](domain-cutover.md), including API alias/DNS/certificate, exact origins, cookie and callback settings, IaC consistency and both frontend API build settings. Users must sign in again. Production/hosted rollout and merges have not been performed. Backend rules require explicit user instruction before merging.

## Design review

| Before | After | Why |
| --- | --- | --- |
| Signed-in login composition with only a wishlist link | Named customer hero and seven account tabs | Separates authentication from account management. |
| Preview-only redesigned auth forms | Real Better Auth requests and dashboard redirect | Keeps the visual work while restoring upstream functionality. |
| No profile/address/order frontend | Session-owned API reads and supported writes | Makes existing backend features usable without inventing ownership. |
| New checkout native selects and prototype delivery claims | Themed selectors and server-confirmed delivery wording | Keeps the visual system consistent with the actual shipping contract. |

Reference: supplied dashboard screenshot; existing shadcn/Base UI primitives; Emil design engineering guidance on restrained motion and immediate feedback.
