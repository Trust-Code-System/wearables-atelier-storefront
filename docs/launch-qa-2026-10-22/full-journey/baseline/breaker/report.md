# Persona 5 — the breaker, baseline

Target http://localhost:3101, desktop Chrome, own tab only. No payment, no valid sign-up submitted. Report text saved by the lead from the subagent's hand-back; screenshots are in this folder.

Environment: every proxied write was rejected — `POST /api-proxy/api/v1/store/cart` 403 (503 a few times) and `POST /api-proxy/api/auth/sign-in/email` 403. Reads (cart, get-session, products) 200. Lead diagnosis: staging backend origin allow-list rejects localhost on writes. Dev-mode "Compiling…" badge and extension hydration warning (`fdprocessedid`) are noise.

Reached first success: **No** (~15 min, ~10 add-to-bag attempts). Not tested because of the 403: remove-in-flight, stock-limit edits in the bag, cross-tab bag edits, back/reload mid-checkout, junk in checkout fields. Bag stayed empty and consistent; no duplicates or orders created.

| # | Finding | Severity | Screenshot |
| --- | --- | --- | --- |
| F1 | Add to bag always fails with generic toast "Unable to update your bag"; header count shows "..." or "–" after failure | blocker | F1-add-to-bag-error-toast.jpg |
| F2 | Bag drawer says "We couldn't load your bag" after a failed add though bag is empty; "Try again" button is replaced in the same spot by "Browse the collection" so a second click leaves the page | major | F2-bag-drawer-could-not-load.jpg |
| F3 | Sign-in blames password ("Check your email and password, and verify your email first…") when the server returned 403 | major | F3-signin-misleading-error.jpg |
| F4 | Product images broken everywhere (external media host fails); editorial images fine | major | F4-broken-product-images.jpg |
| F5 | Unknown routes show bare black default 404 with no header or way back; product 404 differs and flashes blank white ~1s | minor | F5-bare-black-404.jpg, F6-product-404-blank-flash.jpg |
| F6 | Shop filters not in URL (reload/back loses them, not shareable); `/shop?category=junk` silently shows all; nav keeps "Shop all" highlighted when filtering Jewelry | minor | F7-filter-empty-state-nav-highlight.jpg |
| F7 | Back button loses chosen size and quantity on product page | minor | — |
| F8 | Stock wording confusing ("22 pieces available" vs per-size stock) | minor | — |

Held up: search overlay (Ctrl+K) with XSS/SQL/RTL/zero-width/emoji/spaces — no crash or reflection; empty checkout shows "Your bag is empty" (ok-empty-checkout.jpg); sign-in/sign-up validation with junk incl. 560-char name — inline messages, no crash (ok-register-validation.jpg); wishlist rapid-clicks consistent; quantity stepper stopped at stock after 40 rapid clicks; double-click on Sign in sent one request; currency switch works; no raw stack traces.

Verdict (persona voice): "The front end was hard to crack: junk in search, sign-in, sign-up and filters is handled calmly. What broke was underneath: nothing I tried would go into the bag, and the messages around it blame the wrong thing, so I would have left within a minute."
