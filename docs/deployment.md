# Vercel deployment — 12 October 2026

The owner requested public source repositories and separate Vercel deployments through the signed-in Chrome session.

| App | Production address | GitHub source | Initial deployed code |
| --- | --- | --- | --- |
| Storefront | https://wearables-atelier-storefront.vercel.app | https://github.com/Trust-Code-System/wearables-atelier-storefront | `29c0637` |
| Admin | https://wearables-atelier-admin.vercel.app/admin | https://github.com/Trust-Code-System/wearables-atelier-admin | `3123a86` |

Both projects belong to the Vercel **Trustcode System** scope (`hello-76386237s-projects`), use the Next.js preset, repository root `./`, and `main` as their production Git branch. Both repositories are public. The original Wearables Atelier deployment was left in place.

The admin's Production and Preview environments set the public build variable `NEXT_PUBLIC_STOREFRONT_URL` to `https://wearables-atelier-storefront.vercel.app`. No secrets or backend credentials were added.

Vercel reported successful production deployment for both apps. Browser verification confirmed the storefront renders with its logo/photos, wishlist add/reload/remove works, the admin root redirects to `/admin`, its catalog/filter controls render, and its storefront links point to the deployed customer address.

These are the browser-only prototype deployments. Authentication, shared product/order storage and real payment processing remain deferred. Admin edits do not sync to the separate customer origin.
