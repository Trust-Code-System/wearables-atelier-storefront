# Literal-reader persona baseline

The first shopping success was blocked: landing → Discover the collection → Retry still has no products. I could not reach product, add-to-bag or checkout. Evidence is browser output and screenshots, not source inspection.

1. **P0: Collection unavailable after retry.** `baseline/02-collection-retry.png`, `baseline/04-shop-retry.png`.
2. **P1: Unavailable catalog claims zero inventory.** The shop says “0 pieces to discover” above “The collection is temporarily unavailable.” I read zero literally as nothing available to buy. `baseline/04-shop-retry.png`.
3. **P1: Bag status is unclear.** “Your Bag (0 items)”, “Failed to fetchRetry”, and “Your bag is safely saved” conflict. I do not know what fetch means or whether there is an empty, saved or unavailable bag. `baseline/05-bag.png`.

Your account retry/back-to-sign-in recovery worked as labelled; sign in and Create an account navigation worked. Registration clearly labels full name, email and password, including the 12-character guidance. No signup submitted. Decorative editorial headings did not cause a measurable navigation error, so none is invented.

Reusable browser scripts: `run.cjs` (main flow), `auth.cjs` (literal account form check). `QA_PHASE` selects output folder, default `baseline`. `baseline/journey.json` contains exact screen text and URLs.
