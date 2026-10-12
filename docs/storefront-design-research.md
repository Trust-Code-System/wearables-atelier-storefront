# Wearables Atelier storefront redesign

11 October 2026. The storefront is a separate design surface from the admin, which keeps the original ObsidianUI direction selected by the user.

**Current update:** the user subsequently supplied the original site and requested its brand imagery, logo and rounded corners. The generic photographs and temporary text logo described below were replaced. See [brand asset sources and implementation](brand-assets.md) for the current state. The following research records the first design stage.

## References reviewed

| Reference | Useful direction | Applied to Wearables |
| --- | --- | --- |
| [TOTEME](https://toteme.com/) | Large fashion photography, quiet navigation, restrained framing. Visually inspected the live landing page. | Full photographic campaign hero, compact header, fewer decorative containers. |
| [COS](https://www.cos.com/en-us) | Clear category entry points and collection-led shopping. Reviewed the live page content. | Immediate clothing/jewelry navigation and direct collection links. |
| [Mejuri](https://mejuri.com/) | Jewelry as an everyday purchase, with direct product discovery. Reviewed live content. | Dedicated jewelry edit with real catalog cards. |
| [Maison Verta on Dribbble](https://dribbble.com/shots/26585191-Maison-Verta-Luxury-Fashion-eCommerce-website) | Photographic fashion composition, simple typography, image-led product grids. Visually inspected the reference. | Sharper image wells and a quieter product information hierarchy. |
| [Pinterest clothing website UI search](https://www.pinterest.com/search/pins/?q=Clothing%20website%20ui&rs=typed) | Visually reviewed the user's open search: fashion storefronts use generous campaign imagery and direct grids. [ELEVN](https://www.pinterest.com/pin/250090585555758268/) and [GAZU](https://www.pinterest.com/pin/422281212926017/) were visible references. | Responsive two-column phone grids, consistent image ratios, large collection headings. |
| [Vercel Commerce](https://github.com/vercel/commerce) | React/Next commerce implementation reference. Reviewed repository information; no source was installed or copied. | Retained the existing Next app and connected shopping state. |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | A UI reference/workflow resource rather than a brand identity to copy. Reviewed repository information. | Reviewed hierarchy, typography, responsive behavior, focus and motion. |
| [21st product card reference](https://21st.dev/@deltacomponents/components/product-card) | Reviewed free component metadata: separate image, title and product information. | Rebuilt the existing card around those responsibilities, retaining catalog/cart behavior. |

Lovable was searched, but no specific useful fashion reference was verified. No paid reference source was retrieved.

## X design feed

Read the Design tab from the user's supplied [X home](https://x.com/home), without posting or reacting. The visible references concerned brand identity and portfolio motion rather than fashion checkout patterns. Examples: [Joyanta Roy brand guidelines](https://x.com/nicalo06/status/2109272646307438791), [Vadim Carazan personal website](https://x.com/VadimCarazan/status/2109294424844878022), and [Dev Nath brand identity](https://x.com/devxnuj/status/2109301002881106284). These are research leads, not copied assets or a claim that their implementation was inspected.

## Design decisions

- Manrope for navigation, products and body copy; Bodoni Moda italic used sparingly for campaign emphasis. Inter remains the admin font.
- Bone white, ink and muted olive surfaces. Flat image wells and sharp controls replace repeated rounded cards.
- A photographic opening with an immediately visible headline, followed by real products, asymmetric category imagery, a jewelry edit and a brand story.
- Gentle image entrance, small vertical reveals, image swaps and directional link motion. Content stays visible before animation; MotionConfig and CSS respect reduced motion.
- Real collection search, keyboard shortcut, phone menu, currency switching, size selection, bag and checkout links.
- Shipping threshold and delivery fees read the admin settings. No fake newsletter subscription form.

## Assets and boundaries

Editorial stock photography is a temporary art direction, not photography of the actual products or atelier. Local images are from Unsplash: [campaign dress](https://images.unsplash.com/photo-1496747611176-843222e1e57c), [jewelry](https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f), [portrait](https://images.unsplash.com/photo-1531123897727-8f129e1688ce). Existing catalog photography remains demonstration content. The original Ada seed image incorrectly showed trousers; only the exact legacy image pair is migrated, preserving replaced images and other admin edits.

The text wordmark is temporary until the user supplies the original logo. Existing checkout payment remains simulated; this redesign does not connect Paystack or deploy the site.

## Verification

- Production build passed; final TypeScript and ESLint checks passed after the follow-up UI fixes.
- Visually inspected 375px phone, 768px tablet, and 1440px desktop presentations; observed no horizontal overflow at the tested phone/tablet widths.
- Browser-tested mobile menu, category navigation, price filtering (five jewelry products reduced to four under ₦100,000), live search (Nala returned one matching product), clothing size selection, add/remove bag, checkout validation and delivery entry using fictional local data. No payment submitted or order created; temporary bag item removed.
- Legacy-image migration assertions verified preservation of administrator edits/uploaded images, unchanged input, and idempotence.
- Admin computed styles still use Inter, dark background `#161616`, and ObsidianUI blue `#2563eb` after visiting the storefront. Temporary viewport override was reset.
- [Desktop preview](previews/storefront-desktop.jpg) and [phone preview](previews/storefront-mobile.jpg) saved from the rendered app.
