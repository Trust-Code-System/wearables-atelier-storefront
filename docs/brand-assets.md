# Wearables by Ashabi assets

Recovered on 11 October 2026 from the user-supplied [original Wearables Atelier website](https://wearables-atelier.vercel.app/).

| Local file | Original source | Use |
| --- | --- | --- |
| `public/brand/wearables-by-ashabi.png` | [Original transparent logo](https://wearables-atelier.vercel.app/logo-transparent.png) | Store header, footer, admin identity and browser icons |
| `public/collection/look-01.png` | [Collection photograph 01](https://wearables-atelier.vercel.app/images/collection/look-01.png) | Lime Iro & Buba and clothing editorial |
| `public/collection/look-02.png` | [Collection photograph 02](https://wearables-atelier.vercel.app/images/collection/look-02.png) | Gold/brown occasionwear, gold gele and sash, campaign hero |
| `public/collection/look-03.png` | [Collection photograph 03](https://wearables-atelier.vercel.app/images/collection/look-03.png) | Teal gele and styled gold-tone accessories |
| `public/collection/look-04.png` | [Collection photograph 04](https://wearables-atelier.vercel.app/images/collection/look-04.png) | Olive occasionwear |
| `public/collection/look-05.png` | [Collection photograph 05](https://wearables-atelier.vercel.app/images/collection/look-05.png) | Lime gele and styled crystal accessories |
| `public/collection/look-06.png` | [Collection photograph 06](https://wearables-atelier.vercel.app/images/collection/look-06.png) | Rust/teal occasionwear |
| `public/collection/look-07.png` | [Collection photograph 07](https://wearables-atelier.vercel.app/images/collection/look-07.png) | Alternate lime outfit view and styled bracelets |
| `public/collection/look-10.png` | [Collection photograph 10](https://wearables-atelier.vercel.app/images/collection/look-10.png) | Alternate rust/teal view and brand story |

All files were visually inspected. Photographer markings remain intact. No image assets from unrelated fashion sellers were used. Search also surfaced Wearables by Ashabi references, but the supplied website provided the usable logo and photo set.

Browser icons use a compact signature adapted from the original logo on a square olive background (`#30372b`). The first full-wordmark favicon lost detail at tab sizes; the compact version removes tiny lettering and long flourishes, enlarges the signature, strengthens strokes and uses a brighter gold (`#d6b44e`) for contrast. The header/footer source logo remains unchanged. `public/brand/favicon-mark.png` is the 1024px flat-colour master, adapted with the built-in image editor and normalized to clean gold/olive shapes. `src/app/favicon.ico` contains native 16, 32, 48 and 64px entries; `src/app/icon.png` is 512px and `src/app/apple-icon.png` is 180px. Next.js's file conventions emit the icon metadata automatically. Regenerate with `node scripts/generate-brand-icons.mjs` (uses Sharp, installed with Next.js). `public/brand/favicon-preview.png` is the review preview.

The original site's product labels do not consistently describe the photographs. The updated demo titles describe the photographed colours/styles; product copy distinguishes accessories from the full styled outfit and avoids unsupported material specifications. These are demonstration listings rather than a verified live inventory import. Existing demo prices and stock are retained.

The user explicitly selected matching demo names/details to these images. Migration changes only matching original demo records, preserves their IDs, prices and stock, preserves custom records/descriptions/uploaded images, and supports previous product slugs. Orders keep their recorded history.

Rounded-edge direction: 12px controls, 20px image/panel corners, 28px desktop campaign and 22px phone campaign. Portal search, menus and the bag use matching corners. The original ObsidianUI admin design remains in place with its brand logo replaced.

Build and lint passed. Migration assertions verified preservation, idempotence and local file availability for all 12 demo listings. Browser review confirmed the previous Ada URL resolves to Lime Iro & Buba, all rendered storefront photos use local brand assets, and product image corners are 20px.
