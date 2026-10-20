# Customer entry and public contact destinations

Account forms now call Better Auth with credentialed, uncached requests. Signup requires 12 characters and email verification before saved profile/address writes. `/account` renders the customer's dashboard after session lookup; `/account/login` and `/account/register` retain the designed auth experience. Recovery, reset and verification result pages remain connected. Profile phone, addresses and order history/details now use session-owned backend endpoints. See [current account integration](account-dashboard-integration-2026-10-20.md).

Guest favourites remain in `wa:wishlist`. Signed-in favourites and carts are backend-owned; the existing guarded import/merge and account-switch isolation are preserved. See [wishlist synchronization](wishlist.md) and [cart integration](cart.md). No authentication credential or account profile/address/order record is persisted by the new dashboard in local storage.

Public contact destinations were verified from the footer of https://wearables-atelier.vercel.app/ on 12 October 2026:

- WhatsApp: https://wa.me/2349067292754 (original order greeting preserved in the link).
- Instagram: https://instagram.com/wearablesbyashabi
- TikTok: https://tiktok.com/@_wearablesng
- YouTube: https://youtube.com/@wearablesbyashabi
- Location: D4 Shitta Road, Surulere, Lagos (original Google Maps search link preserved).
- Email shown on original site: hello@wearablesatelier.com. Main assistance links use WhatsApp or the local `/contact` page, rather than opening an email client.

All visible selects in the customer app use Base UI and inherit the olive/bone palette, rounded popups and neutral keyboard focus. Currency, collection sorting, and any future selects share the same popup styles. Admin selects use its separate ObsidianUI palette.

Header direction is up to hide and down to reveal, with a visible header at the top of the page and while a menu, search or bag is open. Reduced motion removes the transitions.
