# Saved storefront bag

CartProvider uses the backend `/api/v1/store/cart` API with credentialed, uncached
requests. The browser stores the backend's HttpOnly guest cookie; it never reads,
writes or exposes a cart capability in JavaScript/local storage. Browser mutations
send JSON and rely on the browser Origin header plus the backend origin guard.
Use the configured custom storefront/API domains under the same parent domain;
cross-site preview domains may block SameSite guest cookies.

Product size choices resolve to catalog variant IDs. First add reads the authorized
cart, creates it only when absent, then sends an absolute variant quantity. A
per-provider queue serializes creation, mutations and refreshes in the tab. Reads
on mount/window focus reconcile server state. Concurrent tabs still follow the
backend's last committed absolute quantity; this is not cross-tab additive locking.

The backend response owns item counts, prices, totals and stock issues. Catalog
metadata supplies current gallery images. Unavailable lines remain removable even
when they no longer appear in the catalog. Requests fail visibly; a lost write
response triggers a read, never an automatic additive retry. Success feedback waits
for confirmation. Old prototype `wa:cart` local-storage contents are not imported.

Wishlist remains guest-friendly local storage (`wa:wishlist`), including refresh
persistence. No account/cross-device synchronization is claimed or implemented.

Checkout shipping/payment integration is pending. The existing checkout layout is
retained, but its prototype handler cannot fabricate a paid order or clear the saved
bag. Orders must eventually come from the real checkout and verified settlement.

`npm test` covers cart transport, safe money conversion, saved-line mapping,
unavailable/one-size variants and queued mutation recovery. Type checks, lint and
`npm run build -- --webpack` also verify the integration. A local test run exercised
the actual frontend API client against the Nest backend and guarded PostgreSQL test
database for creation, cookie persistence/reload, quantity changes, stock rejection,
removal and trusted-origin/CORS checks. Browser interaction verification remains
pending when a Chromium runtime with its system libraries is available.
