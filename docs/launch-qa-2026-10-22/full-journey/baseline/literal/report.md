# Persona 4 — non-native English speaker (literal reader), baseline

Target http://localhost:3101, desktop Chrome 1280x678. Screenshots F01–F18 are in this folder. Report text saved by the lead from the subagent's hand-back (the subagent could not write the file).

Environment: cart POST `/api-proxy/api/v1/store/cart` returned 403 four times (product page x2, jewelry page, shop quick-add) and 503 once; cart GETs 200. Lead diagnosis: the staging backend only accepts writes from allow-listed origins, localhost is not one. Only console error: hydration warning from browser-extension attributes (noise).

Reached first success: **No** (stuck at "Add to bag", ~22 actions, ~15 minutes).

| # | Finding | Severity |
| --- | --- | --- |
| F1 | "Add to bag" fails; message "Unable to update your bag. Please try again." gives no reason or next step; bag opens with "We couldn't load your bag" then "empty" | blocker |
| F2 | Bag badge shows "–" or "..." with no words | minor |
| F3 | Product pictures do not load; only alt text (may be staging data) | major |
| F4 | Price changes on size choice (₦185,000 → ₦195,000), product page does not say "From" | major |
| F5 | Icon-only "+" and "↗" buttons on product cards; accessible names invisible | major |
| F6 | Wishlist heart and selected size shown by colour only | minor |
| F7 | "pieces" used for items; "22 pieces available" unclear | minor |
| F8 | Marketing words: "atelier", "edit", "collection", "Talk to the atelier"; shop name differs (Wearables by Ashabi vs Wearables Atelier) | major |
| F9 | Idioms where instructions belong: "Beautiful things are waiting on the other side." (empty bag), "Or, make yourself at home" above "Continue as a guest" | major |
| F10 | Same product, different badge words (Most loved vs Bestseller; Just arrived vs New) | minor |
| F11 | "Available in the collection." is not a stock message; description repeats title / "Test Description" | minor |
| F12 | Delivery wording hard ("dispatched", "nationwide", "complimentary"); free-delivery rule on product page missing from policy page; "Display currency" unclear | major |
| F13 | Opening the "Shipping & delivery" accordion makes the page jump ~60px | minor |
| F14 | Size-first message is clear but pale/short-lived | minor |
| F15 | Sign-up: password error says "Enter your password" before one exists; "Resend verification email" shown before sign-up; "never saved in browser storage" is technical | minor |
| F16 | Unlabelled heart on photo on account pages; "Back to the collection" means back to shop | minor |

Worked well: ₦ always clear; size help "Numbered sizing — 6 (XS) through 16 (XXL)"; shop filters plain; "Continue as a guest" clear; empty checkout says "Your bag is empty" with a button; sign-up field errors name the field.

Suggested fixes (from the persona): "Add to bag"/"Choose size" visible text on cards; "From ₦185,000" then "Price for size 8: ₦195,000"; "in stock" instead of "pieces"; "Shop all", "Contact us on WhatsApp", "Back to the shop"; one shop name; delivery in plain words ("We send your order in 2 days. Lagos: same or next day. Other places: 2 to 4 working days. Free delivery over ₦150,000.") identical on product and policy pages; one badge label per status; no scroll jump on accordion; label the heart "Wishlist".

Verdict (persona voice): "I like the pictures on the front page, but the product pictures do not open, so I do not know what I buy. Many words are too hard for me: atelier, edit, pieces, complimentary, dispatched, make yourself at home. I tried to put the item in my bag four times and the shop only said 'Unable to update your bag.' I did not know what to do next, so I would close the page."
