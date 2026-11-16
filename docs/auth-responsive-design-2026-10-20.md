# Auth and responsive UI — 20 October 2026

## Delivered

Customer sign-in and sign-up now have a shared editorial composition using the existing Ashabi logo, original collection photography, warm ivory surfaces and deep olive controls. `/account` remains a useful guest overview and links to both new previews.

The access routes share a layout so changing modes preserves the chosen collection photo. The navigation indicator moves on a short spring; form content enters with a small fade/translation. Keyboard navigation skips the decorative transition. Reduced motion removes movement, and the scroll engine now responds when the motion preference changes while the site is open.

Forms use installed shadcn/Base UI inputs, labels, buttons and dialogs. They include password visibility, a Caps Lock hint, password-length feedback, associated field errors, first-invalid-field focus and modal focus return. The photo panel has manual controls, with no autoplay. Phones prioritise the form; tablet and laptop layouts show the collection alongside it.

## Review decisions

| Before | After | Why |
| --- | --- | --- |
| Login and registration both showed only the guest overview | Dedicated, interactive previews with a shared mode switch | Makes both requested auth designs reviewable without claiming customer authentication exists |
| Default-looking scrollbar tracks and faint/hidden admin thumbs | Olive thumbs, neutral tracks and visible admin scroll affordances | Keeps scrolling consistent with both site themes |
| Admin report filters used browser date inputs | shadcn Calendar inside a themed Popover | Consistent date controls, keyboard selection, date bounds and clear action |
| Phone bag used `100vw`, extending into scrollbar space | Width is bounded by the available containing width | Prevents its left edge from being clipped |
| Smooth scrolling checked reduced motion only at mount | Listens for preference changes and destroys/recreates the scroll engine | Respects a changed accessibility setting immediately |

The calendar and popover primitives were installed from the official shadcn registry into the sibling admin project. Its existing button primitive was preserved. The calendar day-button ref was connected so the selected day receives keyboard focus. No visible native date input remains in analytics. Existing storefront selects already use Base UI; their popup surfaces and selected states use the site palette.

## Verification

- Storefront and admin: ESLint passed, production builds and TypeScript passed.
- Existing tests passed: storefront 8/8; admin 12/12.
- `git diff --check` passed in both repositories.
- 75 layout measurements at 320, 375, 768, 1024 and 1440 CSS pixels found no horizontal page overflow. Routes: home, shop, about, contact, FAQ, shipping/returns, privacy, terms, wishlist, guest account, sign-in, sign-up, checkout, product details and populated checkout. Raw results: [responsive matrix](previews/responsive-matrix-2026-10-20.json).
- Auth: both routes, pointer/keyboard switching, preserved photo selection, password reveal/hide, blank-form errors, first-invalid focus, preview completion, password clearing, help dialog and dismissal were checked in Chrome.
- Reduced-motion emulation confirmed no auth entrance animation, keyboard switching without movement, and smooth-scroll removal after changing the preference.
- Shop: actual staging products loaded; price sorting, custom sort options, phone filter sheet, tablet navigation and the nested currency select were checked. The currency popup used ivory/ink colours and exposed no native `<select>`.
- Bag: populated line, responsive panel bounds and checkout navigation checked. The temporary QA line was removed afterward.
- Calendar: isolated UI checks verified phone fit at 320px, light/dark colours, selected-day focus, arrow keys, Enter selection, date bounds and clearing. Its temporary preview route was removed before the final production build. No authenticated data or guard was involved in that fixture.
- Clean production-build auth screenshots were captured at laptop, tablet and phone widths. The production preview was left open in Chrome at normal browser size.

## Screenshots

- [Sign in — laptop](previews/auth-sign-in-desktop.png)
- [Sign up — laptop](previews/auth-sign-up-desktop.png)
- [Sign in — tablet](previews/auth-sign-in-tablet.png)
- [Sign in — phone](previews/auth-sign-in-phone.png)
- [Sign up — phone](previews/auth-sign-up-phone.png)
- Admin isolated calendar: sibling repository `docs/previews/calendar-phone-dark.png`.

## References

- [shadcn login block](https://ui.shadcn.com/blocks/login), retrieved through the shadcn registry tools; existing project primitives were reused.
- [shadcnblocks login compositions](https://www.shadcnblocks.com/blocks/login) and [signup compositions](https://www.shadcnblocks.com/blocks/signup), reviewed as layout references. No premium source was copied.
- [React Bits micro interactions](https://reactbits.dev/c/micro), especially [Rubber Segment](https://reactbits.dev/c/micro/rubber-segment), informed the moving account-mode indicator.
- Emil Kowalski's installed `emil-design-eng` skill informed easing, short feedback timings, keyboard behaviour, focus handling and reduced motion.

## Boundaries

These are local UI changes, not a deployment. Customer authentication is still unconnected. The forms are explicitly marked as previews, transmit no values and create no accounts or sessions. They do not call the admin auth service. Password reset offers honest availability information and an existing atelier contact link.

The backend still does not allow localhost catalog requests through CORS. Shopping checks used a temporary GET-only public catalog relay. The relay was stopped and removed; `.env.local` was unchanged, and the normal development server was restored. The final auth preview runs from the production build at `http://localhost:3400/account/login`.

The separate admin's hosted authenticated screens still need a deployment retest of the local changes; session guards remain intact. This is responsive browser verification, not certification of every physical device or assistive technology.
