# Verification — 12 October 2026

- Both independent apps passed ESLint and production builds. Customer routes are home, shop, product, checkout, contact, wishlist and account/login/register; admin routes exist only in the admin project.
- Publication audit found zero issues in both folders. Its single warning per folder is a Windows/MSYS path-format mismatch: each folder is its own Git root, not a nested checkout.
- Production previews run independently on ports 3100 and 3200. The former storefront `/admin` path returns 404; the admin root redirects to `/admin`. Admin navigation points to the configured storefront URL.
- Currency selection switches USD/NGN through a custom Base UI popup; product sorting uses the same store palette. No handwritten native select/option remains in either app.
- A wishlist piece was added, persisted through reload, then removed; the empty state returned. Test additions were restored. Account form validation and login/register navigation work; submitting a valid preview displays the unavailable notice and clears the fields. No authentication session or credential persistence is provided.
- Header was observed visible after a downward wheel movement at y1394, then hidden after an upward movement at y1258. Downward wheel movement then reached the page's full scroll limit at the footer, beyond the previously stuck collection section.
- Phone account/contact layouts were checked at 390 × 844 with no horizontal document overflow. Mobile menu includes wishlist/account links. Admin product filtering returns its five jewellery pieces and its compact layout was checked at the same width.
- Original footer social, WhatsApp and location hrefs were read from the live brand website. Assistance now uses those destinations or the local contact page; no admin link is exposed to customers.

Preview captures are in `docs/previews`. These checks concern the browser prototype; shared catalog/order sync, real payments and authentication remain the next backend phase.
