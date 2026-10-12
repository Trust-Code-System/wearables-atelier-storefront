# Customer entry and public contact destinations

The owner chose to prepare account pages now and add authentication with the backend next. Routes `/account`, `/account/login` and `/account/register` provide the designed forms, validation, password visibility and navigation. Submit shows an honest unavailable message and clears the fields; no authentication endpoint, password persistence, customer profile or fake login session exists.

Wishlist saves IDs under `wa:wishlist` on the current browser origin. A heart on each card and product detail toggles membership; `/wishlist` shows the saved catalog pieces, with an empty state and links back to shopping. Unavailable product IDs are retained in storage but hidden from the view. Wishlist is not synced across devices or linked to an account yet.

Public contact destinations were verified from the footer of https://wearables-atelier.vercel.app/ on 12 October 2026:

- WhatsApp: https://wa.me/2349067292754 (original order greeting preserved in the link).
- Instagram: https://instagram.com/wearablesbyashabi
- TikTok: https://tiktok.com/@_wearablesng
- YouTube: https://youtube.com/@wearablesbyashabi
- Location: D4 Shitta Road, Surulere, Lagos (original Google Maps search link preserved).
- Email shown on original site: hello@wearablesatelier.com. Main assistance links use WhatsApp or the local `/contact` page, rather than opening an email client.

All visible selects in the customer app use Base UI and inherit the olive/bone palette, rounded popups and neutral keyboard focus. Currency, collection sorting, and any future selects share the same popup styles. Admin selects use its separate ObsidianUI palette.

Header direction is up to hide and down to reveal, with a visible header at the top of the page and while a menu, search or bag is open. Reduced motion removes the transitions.
