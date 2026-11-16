# Persona 2 — the skeptic, baseline

Target http://localhost:3101, desktop Chrome 1280x678, 2026-10-22. Report text saved by the lead from the subagent's hand-back; screenshots are in this folder.

Read in full: home, /shop, two product pages, /about, /contact, /faq (all 8), /shipping-returns, /terms, /privacy. Footer internal links all resolve; external social/WhatsApp/Maps links not visited (localhost-only rule).
Reached first success: **No** — add to bag failed ~6 times (cart POST 403, once 503); never saw checkout form, fee or total. ~12 minutes.

| # | Finding | Severity | Screenshot |
| --- | --- | --- | --- |
| F1 | Nobody is named behind the shop: no legal name, no phone; only email hello@wearablesatelier.com at the bottom of /privacy; payment provider never named; brand varies (Wearables by Ashabi vs Wearables Atelier vs wearablesatelier.com) | major | F1-contact-no-email-phone.jpg |
| F2 | Free delivery over ₦150,000 appears only in the product-page accordion; shipping page/FAQ/home say "fees shown at checkout" with no figures | major | F2-product-free-delivery-claim.jpg |
| F3 | "Add to bag" fails every time ("Unable to update your bag"); POST /cart 403 (503 once) | blocker | F3-add-to-bag-error.jpg, F3-jewelry-add-to-bag-error.jpg |
| F4 | After a failed add the Bag badge shows "–" (label "item count unavailable"); drawer showed nothing after 5s; /checkout says bag empty | minor | F4-bag-count-dash.jpg, F4-checkout-empty-after-add.jpg |
| F5 | Product photos do not load (media bucket 503); catalogue is "Test Product"/"Jewelery test" with "Test Description" | major | F5-shop-broken-images-test-names.jpg |
| F6 | Size help says 6 (XS)–16 (XXL) and filter lists 6–16 but products offer only 6 and 8 | minor | F6-product-page-top.jpg |
| F7 | Price changes with size without "From" on product page; varying "was" prices look like a fake discount | minor | F7-size8-price-changes.jpg |
| F8 | Returns are exchange-only; refund rule deferred to "contact us before ordering"; FAQ "exchange or return?" answers only exchange; return shipping payer and which jewelry is final sale unstated | major | — |
| F9 | Legal pages dated inconsistently (privacy 12 Oct, terms/shipping 22 Oct); privacy says "when online payments are enabled"; terms lack cancellation rule | minor | — |
| F10 | FAQ shows one answer at a time; cannot compare delivery/cost/returns | minor | — |
| F11 | Slow first impression: full-screen intro ("Skip intro") then "Loading products…" | minor | — |

Console/network: no console errors on product page; failures: products API 503 once, media GETs 503, cart POST 403/503.

Worked well: policy pages plain-language, dated, and agree on 48h dispatch, 2–4 business days, 7-day size exchange, earrings final sale.

Verdict (persona voice): "I do not know who this shop is: no company name, no phone and no email on the contact page, and the payment provider is never named. Delivery cost is hidden until checkout, refunds are left to a private chat, and the catalogue is two items called Test Product and Jewelery test with no photos. Then the bag refused every item. I would not have given this shop my name, address or card."
