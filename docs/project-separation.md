# Independent storefront and admin projects

Separated on 12 October 2026 at the owner's request. The owner selected “Split projects now; shared backend next.”

| App | Local folder | GitHub repository | Development address |
| --- | --- | --- | --- |
| Customer storefront | `Wearables atelier` | `Trust-Code-System/wearables-atelier-storefront` | `http://localhost:3100` |
| Admin console | `Wearables atelier admin` | `Trust-Code-System/wearables-atelier-admin` | `http://localhost:3200/admin` |

Both folders are independent Git repositories and Next.js projects, with their own source, package manifest, lockfile, assets and configuration. Neither builds against the sibling folder. Admin routes and dashboard source are absent from the customer repository. The customer footer no longer advertises an admin portal. The admin root redirects to `/admin`; old console paths remain valid on the admin address.

## Data and migration

Current catalog, settings and orders are browser-storage prototypes. Each address has separate localStorage. The split does not clear or overwrite existing catalog/settings data on the old storefront origin. Custom products stored there remain readable. The admin app on its new origin uses its own seeds; previous origin data is not automatically imported. Preserve the old browser profile/origin until backend migration.

The customer catalog is read-only, settings are limited to public fields, and demo admin orders are not seeded into the customer bundle. Payment stays simulated. No actual database, payment processing, authentication or cross-origin synchronization was introduced in this step.

The next phase needs one shared database/API: public catalog/settings reads for the storefront; authenticated catalog/order/settings management for the admin; server-created orders and payment verification; migration of existing custom catalog/settings/orders from the original browser; server-only secrets. Do not use browser localStorage as a cross-site synchronization mechanism.

## Deployment

Import each GitHub repository as a separate Next.js hosting project using its own repository root. In the admin project's build environment, set `NEXT_PUBLIC_STOREFRONT_URL` to the customer's deployed HTTPS address. This public setting is inlined during the build, so rebuild the admin after changing it. The local fallback is `http://localhost:3100`.

The two source repositories are private. No live deployments or domains were created by this split. Admin authentication and the shared backend remain the next phase before real commerce or unrestricted production admin access.
