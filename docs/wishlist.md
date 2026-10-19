# Guest/account wishlist

Guest product UUIDs remain in `wa:wishlist`; account lists live only in the backend.
The existing signup/login forms now call Better Auth email endpoints with cookies.
Signup needs a 12-character password. Account access displays the signed-in user
and provides sign out. Verification/password recovery business rules remain owned
by the existing backend auth flow.

WishlistSync reads the session before selecting guest/database storage. It imports
an exact browser snapshot under a persisted UUID key, acknowledges it only after
server success and preserves unrelated later additions. Retry reuses that snapshot
and key. Account data is never copied into guest storage. Unknown deleted products
are explicitly reported after import; archived products remain removable.

The same account on a different device loads its database list. Visible tabs also
refresh on focus, visibility, auth changes and every 30 seconds. This is eventual
sync, not a websocket feed. A session/account precondition on requests plus client
response fencing prevents stale work crossing account switches. The existing
backend cart merge runs after successful account changes, and private bag snapshots
are cleared before reloading; merging errors do not pretend to be auth failures.

Deploy the backend wishlist migration/API before this storefront version. Keep the
configured API and storefront on same-site domains for session cookies. No tokens,
passwords or account wishlists are written to local storage. Browser storage only
holds guest IDs and unacknowledged guest-import receipts; clearing it before a
failed import recovers loses those guest-only items.

`npm test` includes wishlist transport and state-machine regressions for guest
persistence, union/acknowledgement, lost responses, preservation of another tab's
additions, two devices, logout/account isolation and delayed private reads.
