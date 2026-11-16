# Persona 3 — mobile, slow 3G, baseline

Playwright-driven installed Chrome (not the Chrome extension, to avoid resizing the shared window). 375x812, DPR 2, touch, Android UA, slow 3G (400 ms latency, 50,000 B/s), 4x CPU throttle, cold cache. Report text saved by the lead from the subagent's hand-back; 60+ screenshots `NN-*.png` and scripts are in this folder.

Caveats: server on :3101 is a Next DEV server (JS bytes and hydration times inflated, re-measure on `next build && next start`). Everything after the bag drawer used a Playwright-stubbed cart (`mock.cjs`) because real add-to-bag returns 403; states, LGAs and delivery prices were real staging data. "Unavailable at the moment" on the mocked drawer row is an artifact. Never tapped "Review order total".

Reached first success: **No** (blocked at Add to bag). ~10 taps + 5 typed fields would be needed.

## Measurements (dev server)
Landing: first byte 0.6 s, hero CTA visible ~6 s, JS hydrated 38–44 s, 1.65 MB / 39 requests (script 1.25 MB, font 239 KB, image 204 KB). Shop: 1.6 MB / 40 requests, first product 44–47 s (API called only after hydration). Hero tap→/shop 5.0 s; product tap→PDP 9.7 s; cold PDP→size chips tappable 50–73 s. Mocked: Add to bag→drawer 3.5 s; Checkout→URL 4.8 s then "Checking your checkout…" until ~12.8 s.

## Findings
| # | Finding | Severity | Screenshot |
| --- | --- | --- | --- |
| F1 | Add to bag 403 on every product (also on desktop); toast has no retry/fallback | blocker | 06-after-add-t4000.png, 07-quickadd-result.png |
| F2 | Menu, search, bag, filters buttons dead ~37 s (until JS hydrates) with no pressed/loading state; bag badge "…" | major | 01-landing-t3s.png, 02-menu-t1500.png |
| F3 | Every product photo broken: `net::ERR_BLOCKED_BY_ORB` on signed `wearables-dev-media…storageapi.dev` URLs; PDP shows 420 px grey box | major | 05-pdp-top.png, 04-a4-shop-grid.png, 16-search.png |
| F4 | Shop shows two loading messages and no products for ~45 s (products fetched only after JS); intro takes two screens so products start ~1,500 px down | major | 03-shop-idle.png, 03-shop-products.png |
| F5 | PDP first screen is only the photo; price at y≈1000, size chips y≈1079, Add to bag y≈1237; no sticky Add to bag bar | minor | 05-pdp-immediate.png, 06-pdp-scrolled-2.png |
| F6 | Tap targets under 44 px: qty −/+ 40x16, breadcrumbs ~22x12, Size guide 77x18, accordion headers 38 high, Filters 82x32, filter chips 36x36, filter close 28x28, drawer Checkout button 334x36, footer Privacy/Terms ~28–33x24 | minor | 06-pdp-size-selected.png, 08-mock-bag.png |
| F7 | Text 8–9 px (uppercase labels, top bar "Delivery options at checkout") | minor | 01-landing-idle.png |
| F8 | Checkout step 2 "Review order total" greyed with no explanation; single delivery method not preselected; State list 37 / Area 63 with no search; radio 13 px | minor | 12-ready-to-review.png, 13-delivery-selected.png |
| F9 | Checkout stepper is bare circles 1, 2, 3 without labels | minor | 09-checkout-top.png |
| F10 | Checkout opens as blank "Checking your checkout…" for 8–13 s with the big footer showing | minor | 09-checkout-immediate.png |
| F11 | Bag badge "…" during load; stays "item count unavailable" after failed add until reload | minor | 01-landing-t3s.png |
| F12 | Selecting a size makes chips jump (selected grows to ~50x50, first chip shifts ~8 px) | minor | 06-pdp-size-selected.png |
| F13 | Inconsistent money format: "₦8,000.00" vs "₦185,000" | minor | 13-delivery-selected.png |
| F14 | Search placeholder cut off ("…a favourite piec"); dialog centred so keyboard covers results | minor | 16-search.png |
| F15 | Dev-only black "N" badge covers currency selector / Filters (environment) | minor | 02-menu-t1500.png |

Console/network: only the 403 and image ORB blocks; two aborted duplicate `/store/products` (limit=100 and limit=12). No horizontal scroll at 375 on landing, shop, PDP or checkout.

Worked: hero CTA works before JS; menu sheet and bag drawer readable; empty bag friendly; "Choose a size first" highlight clear; checkout inputs phone-appropriate (type=email/tel, autocomplete, 16 px text, 44 px fields, per-field errors); no fixed bar covered focused field with a 300 px keyboard; Lagos areas load and total updates.

Verdict (persona voice): "The hero button works, so I start. Then the menu does nothing for half a minute, the shop says it is loading for 45 seconds, and when the clothes appear every photo is a broken icon. I press Add to bag and get 'Unable to update your bag'. That is where I would message them on WhatsApp. The checkout form itself is good on a phone."
