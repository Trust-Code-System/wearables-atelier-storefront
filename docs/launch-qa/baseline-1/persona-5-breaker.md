# persona-5-breaker (THE BREAKER) — launch QA report

Desktop Chrome, ~1280x678, http://localhost:3001 (Next dev server). Tested: sign-up, sign-in, forgot/reset password, order-recovery form, search overlay, bag drawer, wishlist, deep links while signed out, junk URLs and query strings, Back/Forward, rapid clicks.

## Environment issue (reported once)
The API at localhost:4300 was unreachable for the whole session. Every API call failed with "Failed to fetch": the catalogue, cart, session, sign-up and sign-in. The shop showed "0 pieces to discover" and no product was ever visible. This blocked everything involving product, bag, checkout, add-to-bag, quantity, wishlist-heart and dashboard flows. It also means server-side validation (duplicate accounts, unicode lookalike emails, XSS reflection from server data) could not be judged. The findings below are what the UI does under that failure, plus client-side behaviour. Some may disappear when the API is up. The raw-error and misleading-message findings are still valid because real outages happen.

Screenshots are the files under `C:\Users\Admin\.claude\projects\C--Users-Admin-Desktop-Wearables-atelier\8d1c886a-d66c-4335-8f85-8bdc3fe3e296\tool-results\` (named per finding).

### F1: Raw "Failed to fetch" shown to customers on sign-up, sign-in and checkout
- Where: /account/register, /account/login, /checkout (desktop 1280)
- What I did: submitted valid test data while the API was down, and opened /checkout.
- What happened: a bare browser error, "Failed to fetch", appeared under the button. On /checkout it was the only message on the page, next to "Retry checkout". Other screens say "We couldn't connect to accounts". The wording is inconsistent, and a customer cannot tell whether their details were saved or whether to try again.
- Severity: major
- Screenshot: mcp-claude-in-chrome-blob-1792661283334-ltiazo.jpg (sign-up), mcp-claude-in-chrome-blob-1792661115236-2teu3c.jpg (checkout)
- Suggested fix: use one friendly message such as "We couldn't reach the store just now. Nothing was submitted. Please try again." on every network failure.

### F2: Reset-password, forgot-password and order-recovery pages look unfinished and are hard to use
- Where: /account/reset-password, /account/forgot-password, /checkout/return and /account/orders/999 (desktop)
- What I did: opened each page and tried to type.
- What happened: these pages use a different, unstyled form look from the polished sign-in and sign-up pages. On reset-password and forgot-password the inputs have no visible box, only a label with a dot or caret, so I did not know where to click. The label, field and button sit on one line. Validation falls back to the browser's native orange tooltip ("Please lengthen this text to 12 characters...") instead of the inline red messages used on sign-up.
- Severity: major
- Screenshot: mcp-claude-in-chrome-blob-1792661327122-3rmy9u.jpg, mcp-claude-in-chrome-blob-1792661347301-fp6984.jpg, mcp-claude-in-chrome-blob-1792661551517-9x8ijc.jpg
- Suggested fix: reuse the sign-in input component, with visible borders, stacked labels and inline error text.

### F3: A long email breaks the forgot-password layout
- Where: /account/forgot-password (desktop)
- What I did: pasted a ~215-character email and clicked "Send reset link".
- What happened: the text ran under the "Send reset link" button, and the label and input visually collided ("Email addressaaaaaa..." running into the button). The field is not width-constrained.
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661563631-8j6bbi.jpg
- Suggested fix: make the field a fixed-width block that scrolls its own text, and put the button on its own row.

### F4: Signed-out visit to /account says "We couldn't check your account" instead of sending me to sign in
- Where: /account (signed out, desktop)
- What I did: deep-linked to /account without being signed in.
- What happened: the page showed "We couldn't check your account. Please try again." with "Try again" and "Back to sign in". It reads like a fault, not "please sign in". This may be caused by the API outage, but the signed-out path should redirect or say so plainly.
- Severity: major
- Screenshot: mcp-claude-in-chrome-blob-1792661147386-mgfhue.jpg
- Suggested fix: when no session exists, go straight to sign-in with a "Sign in to see your account" note. Show the error only on a real failure.

### F5: Misleading "before making another payment" copy on order screens for someone who never paid
- Where: /account/orders/999 and /checkout/return?...&order=-1 (desktop)
- What I did: opened an order URL for a nonexistent order, and a return URL with junk parameters.
- What happened: "We couldn't connect to checkout. Please try again. Check your order status before making another payment." This is alarming when no payment has happened. The page also offers "Back to your account" to a signed-out user. A fake order number does not give a clear "order not found".
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661525857-rr3obm.jpg, mcp-claude-in-chrome-blob-1792661492911-kpc6ld.jpg
- Suggested fix: distinguish "can't reach the server" from "no such order", and drop the payment warning unless a payment is actually pending.

### F6: Wishlist for a guest shows only an error and no empty state
- Where: /wishlist (desktop)
- What I did: opened the wishlist as a brand-new guest.
- What happened: the intro says guest favourites stay in this browser, but below it there is only "We couldn't connect to accounts. Retry". A guest should not need an account service just to view a local list.
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661551516-c190qm.jpg
- Suggested fix: show the local list or "Nothing saved yet" for guests, and treat the sync error as secondary.

### F7: Catalogue, bag and shop errors duplicate each other and leave an empty-looking shop
- Where: /, /shop, bag drawer (desktop)
- What I did: loaded the shop and opened the bag while the API was down.
- What happened: the shop shows "0 pieces to discover" together with full filters, and the same "collection temporarily unavailable" text appears three times (banner, body, "Retry collection"). The bag drawer shows "We couldn't connect to your bag" at the top and "We couldn't load your bag" below it. The count "0 pieces" reads like an empty store, not an outage.
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661010164-4t7vfn.jpg, mcp-claude-in-chrome-blob-1792661637408-t370mo.jpg
- Suggested fix: when loading fails, hide the "0 pieces" count and the filters, and show one message with one retry.

### F8: Unknown URLs (/nope, /product/does-not-exist) give a bare black default 404 with no way forward
- Where: /nope and /product/does-not-exist (desktop)
- What I did: visited nonexistent URLs.
- What happened: /nope is a plain black page with "404 | This page could not be found." and nothing else: no header, no link back to the shop. /product/does-not-exist goes blank for a long time on the dev server (about 30 seconds before anything painted, probably dev compile). It then shows the same bare 404 under the site header, and the leftover "collection unavailable" banner sits above it, with no "back to shop" link.
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792660959188-3qsqki.jpg, mcp-claude-in-chrome-blob-1792661772668-uigfo6.jpg
- Suggested fix: add a branded 404 with the header, "This piece or page isn't here", and links to Shop all and Home.

### F9: The order-recovery form accepts "a@b" and its first-submit error is misleading
- Where: /checkout/return (desktop)
- What I did: entered "-1 <b>x</b> '; DROP TABLE orders;--" as the order number and "a@b" as the email.
- What happened: the form submitted with no inline validation message, unlike sign-up which says "Enter a valid email address". The empty submit uses native browser tooltips. No injected markup rendered (see "Worked well").
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661508734-wqz97c.jpg
- Suggested fix: apply the same inline email rule as sign-up before sending.

### F10: Layout shifts under the cursor on the sign-up form
- Where: /account/register (desktop)
- What I did: filled the form, then double-clicked "Create an account".
- What happened: the error line appears below the button and pushes "Resend verification email" up under the cursor. The second click selected that link's text instead of being swallowed. Cosmetic, but a rapid-clicking user sees text highlight and the button move.
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661283334-ltiazo.jpg
- Suggested fix: reserve space for the status line so the button does not move.

## Worked well (one line each)
- Sign-up validation is clear and inline. Empty, "a@b", 1-char password, whitespace-only name and a 12-character rule each give a specific red message.
- `<script>`, `<img onerror>`, `<b>` and SQL junk in the name, search box, order number and URL parameters never executed or injected markup. Search echoed it as plain text.
- Rapid clicks produced a single sign-up POST and a single sign-in POST. No duplicate submissions were seen.
- A reset link with a garbage token and mismatched passwords gave "Your passwords do not match" and then "This reset link is missing, invalid or expired. Please request a new one." The token was stripped from the URL.
- Junk shop filters (`category=<script>`, `size=-5`) fell back safely to Shop all.
- Browser Back/Forward preserved state. There were no console errors beyond HMR logs.
- Tab switching and the shared browser meant the currency toggled to USD once in my tab. This is not a bug, since another tester shared the same profile. Currency and bag persistence across tabs is shared via browser storage.

## Not tested because of the environment
Add-to-bag double-clicks, quantity +/-, negative/decimal/huge quantities, duplicate bag lines, bag count versus contents, wishlist heart rapid-click, checkout shipping form (long names, RTL, emoji, phone with letters), checkout reload and Back, two-tab bag desync, dashboard, and server-side rejection of lookalike or duplicate emails.

## Reached first success?
No. Neither route. Shopping: blocked at the first step, because no product could be found (API down). Account: blocked at sign-up submit ("Failed to fetch"). Steps taken before stopping: about 6 (home, shop, retry, register, fill, submit).

## Verdict (as the Breaker)
I threw everything at the forms and the front end took it well. Scripts, SQL, emoji, RTL text and button mashing never made the page run my code or double-submit, and sign-up validation is a pleasure. What cracked it was the back end being gone. Then the site fell back to a raw "Failed to fetch", an account page that says it "couldn't check" instead of "please sign in", a pile of "couldn't connect to accounts" lines, and a payment warning for an order I never paid for. The password-reset and order-recovery pages look like another site's unfinished forms, with fields I could not even see. If the API is up for real customers, polish those pages, the long-input overflow and the bare 404. The error copy should be one friendly, consistent sentence everywhere. As it stands, a customer on a bad connection gets stuck with no clue what to do next.
