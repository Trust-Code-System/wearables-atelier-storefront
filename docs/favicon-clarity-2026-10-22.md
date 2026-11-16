# Clearer Wearables favicon

Released in [PR #10](https://github.com/Trust-Code-System/wearables-atelier-storefront/pull/10), merge `6b0333e353a2159da3797ea9a71ad976e77ca9ff`. Vercel production deployment succeeded. All three live icon endpoints returned 200 and their SHA-256 hashes matched the committed assets. The full header/footer logo was not changed.

The previous full wordmark lost legibility when reduced to browser-tab dimensions. The new compact signature fills more of the square, omits tiny text and long flourishes, and uses stronger strokes and contrast. The 16px and 32px outputs were visually inspected; 16/32/48/64px ICO entries decode at their declared dimensions. Focused ESLint and Vercel's production preview build passed. No application runtime, dependency or domain settings changed.

## Image edit provenance

Tool: built-in image editor, using `public/brand/wearables-by-ashabi.png` as the edit reference. The generated variant was normalized into a flat two-colour master (`#d6b44e` gold and `#30372b` olive), then exported by `scripts/generate-brand-icons.mjs` at native icon sizes.

Final prompt:

> Edit the supplied Wearables by Ashabi logo into a sharper, more legible square favicon asset. This is an adaptation of the existing brand, not a new logo. Preserve the recognisable intertwined handwritten Wa signature shape from the centre of the supplied image. Remove the small WEARABLES BY ASHABI lettering entirely and shorten/remove the long horizontal decorative swashes at the sides; those details are unreadable at favicon size. Enlarge the central signature to occupy about 82% of a square canvas with even margins. Strengthen the gold strokes modestly so the signature is legible at 16 and 32 pixels; smooth crisp vector-like edges, perfectly flat colour fill, no photographic texture. Signature in the original warm gold approximately #b79526 on a solid flat deep olive background #30372b. No blur, glow, shadow, gradient, bevel, extra letters, borders, mockup or rounded corners. Output a single clean production icon at high resolution, no comparison panels. Keep the brand identity, make the compact mark visibly clearer.

Saved master: `public/brand/favicon-mark.png` (1024px). Review preview: `public/brand/favicon-preview.png` (256px). Published icons: `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png`.
