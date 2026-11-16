# Persona 1: The Impatient One - launch QA report

Target http://localhost:3101, desktop Chrome (viewport 1280x678), own tab. Started ~11:13:50 local, quit about 73 seconds later.

Path: landing -> clicked "Discover the collection" (hero CTA, the first forward-looking button I saw) -> /shop -> scrolled 6 ticks -> clicked the "+" quick-add on "Jewelery test" -> red error toast "Unable to update your bag. Please try again." -> QUIT.

First click on landing: the hero button "Discover the collection". That was the right thing: it went to /shop (product listing) and is clearly the main call to action. But it sat half cut off at the bottom of the first screen (y~660 of 678), so a skimmer on a normal laptop barely sees it; "Shop all" in the nav is the other obvious route.

Clicks to quit: 3 (hero CTA, scroll counted as a gesture but not a click, quick-add). Seconds to first success: never reached; quit at ~73 s.

### F1: Bag shows "..." on first paint
- Where: http://localhost:3101/ desktop 1280
- What I did: opened the landing page.
- What happened: the Bag button showed a "..." bubble instead of a count for a moment, then settled to 0. Harmless and short, but it reads as "something is loading/broken" in the first second.
- Severity: minor
- Screenshot: docs/launch-qa-2026-10-22/full-journey/baseline/impatient/F1-landing-bag-badge-loading.jpg
- Suggested fix: show nothing (or 0) until the bag count is known.

### F2: Clicking the hero CTA gives no feedback for ~3-5 seconds
- Where: / -> /shop, desktop
- What I did: clicked "Discover the collection".
- What happened: the page stayed on the landing page, button only got an outline, a "Compiling..." badge appeared bottom-left; /shop appeared after roughly 3-5 s. An impatient person would click again. (Part of this is the dev server compiling on demand; the console is full of "[Fast Refresh] rebuilding" lines, so this is likely not representative of production. Re-test against a production build.)
- Severity: minor (possible environment artefact)
- Screenshot: docs/launch-qa-2026-10-22/full-journey/baseline/impatient/F2-click-no-feedback-compiling.jpg
- Suggested fix: instant press/loading state on CTAs and a route progress bar.

### F3: Both product images are broken
- Where: http://localhost:3101/shop desktop
- What I did: scrolled to the products.
- What happened: the two products ("Jewelery test", "Test Product") show grey boxes with broken-image alt text ("Jewelery test", "Test Product") in the corner instead of pictures. For a clothing/jewellery shop with no product photo I would not trust the shop or want to buy. Also the catalogue is only 2 items, both with test-like names ("Jewelery test", "Test Product", typo "Jewelery"), which looks unfinished (staging data, but worth saying).
- Severity: major
- Screenshot: docs/launch-qa-2026-10-22/full-journey/baseline/impatient/F3-broken-product-images.jpg
- Suggested fix: make sure product image URLs load through the proxy; show a styled placeholder instead of a broken-image icon.

### F4: Quick-add "+" fails with "Unable to update your bag. Please try again." (BLOCKER)
- Where: http://localhost:3101/shop desktop
- What I did: clicked the "+" quick-add on "Jewelery test" (a single-size jewellery item, no options to choose). Retried once for diagnostics - same result.
- What happened: red toast "Unable to update your bag. Please try again." No item added; Bag stays 0. Network: GET /api-proxy/api/v1/store/cart 200, then POST /api-proxy/api/v1/store/cart returned 403 (both times), followed by GET cart 200. No console errors. "Please try again" is pointless advice because retrying fails identically. I quit here: I could not even put the simplest product in the bag.
- Severity: blocker
- Screenshot: docs/launch-qa-2026-10-22/full-journey/baseline/impatient/F4-bag-error-toast.jpg
- Suggested fix: fix whatever makes the cart-create POST return 403 through the proxy (CSRF/origin/cookie check on a new anonymous cart?); and if it ever fails, say what to do next (e.g. "try the product page" or offer contact).

### F5: Environment note - constant Fast Refresh rebuilding
- Where: /shop console
- What happened: ~35 "[Fast Refresh] rebuilding/done" lines within about 75 s, i.e. this is a dev server under active editing. Compile delays like F2 and possibly stale builds are expected here. No real JS errors in the console. Not a product defect.
- Severity: minor (environment)

## Not tested (because I quit at F4)
Product detail page, bag drawer, checkout, shipping form, sign-up. I did not open the product page route ("Test Product" arrow button), so I cannot say whether adding from a product page works; a patient tester should check whether the 403 is quick-add only.

## Worked well
Landing page loads fast and looks premium; hero CTA lands on the shop; /shop shows clear prices, stock ("18 pieces available") and filters; no console errors.

## Reached first success?
No. 3 clicks, ~73 seconds, stopped at the first error (F4).

## Verdict (in my voice)
"I came to buy something. I clicked the big button, waited a few seconds, scrolled past a big banner, saw two products with no pictures and hit the plus button. It told me it could not update my bag and to try again. I tried again. Same thing. I am gone. What would have kept me: the plus button just working, real photos, and an error that tells me what to do instead of 'try again'."
