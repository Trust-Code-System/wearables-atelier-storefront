# Account release verification — 20 October 2026

- Storefront PR #7 merged as `987978c7178d4f5cc4e45303589be25f8f3fa06f`; Vercel production deployment reported success. Verified on the existing development storefront, `https://storefront.wearables.trustcodesystem.tech/account`.
- Backend PR #53 merged as `2883843c31bd5dd7a4c56d1a6920756aad5afd27`. Railway staging deployment `251b3703-d664-4bbb-a63a-8c06990b146a` succeeded. HTTPS `/health/ready` returned 200 with that exact `x-release-sha`.
- Existing test session loaded all seven account tabs without retry panels. Live address dialog fits 320, 375, 414, 580, 768, 1024 and 1440px with a 44px close target. At 375 × 812px it scrolls internally. Keyboard opening of State exposes the themed ivory dropdown within the viewport; closed the form without saving. No hosted profile/address/order mutations were performed.
- The existing admin domain opened `/admin` and rendered Overview without a session error. This is a session smoke check; the separate local admin UI changes were not included in PR #7 or deployed by this release.
- Local verification: 30/30 storefront tests, ESLint and production build/TypeScript passed. Production output contains the legacy staging API URL and no loopback fixture URL. The fictional API fixture was stopped and removed. Reduced-motion popup/backdrop animations both computed to `none` after fresh CSS compilation.
- The user explicitly instructed **merge code; defer domain cutover**. No frontend build variable, cookie parent, trusted-origin list or callback setting was changed. The preparatory Railway alias was removed before DNS changes. Existing legacy API domains remain attached. No DNS record was submitted, and the temporary IaC change was reverted before merging.
- Chrome viewport/media overrides used by these checks were cleared. The development storefront and admin tabs remain open for review.

Evidence: [live phone dialog](previews/account-address-dialog-live-phone.png), [live viewport checks](previews/account-dialog-live-responsive.json), [local UI integration and checks](account-dashboard-integration-2026-10-20.md).
