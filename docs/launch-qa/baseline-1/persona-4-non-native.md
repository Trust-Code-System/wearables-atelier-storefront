# Launch QA: persona-4-non-native (first-time desktop visitor, basic English)

Viewport for all findings: desktop 1280x678, http://localhost:3001.
Test data used: name "QA Tester", email `qa-persona-4-non-native-1792661200@example.com`, the shared throwaway test password.
Screenshot folder (all paths below share this prefix, shortened as `<S>`):
`C:\Users\Admin\.claude\projects\C--Users-Admin-Desktop-Wearables-atelier\8d1c886a-d66c-4335-8f85-8bdc3fe3e296\tool-results\mcp-claude-in-chrome-blob-`

## Environment issue (noted once)
The API at `http://localhost:4300` answered every request with HTTP 503 during the whole session
(`/api/auth/get-session`, `/api/v1/store/products`, `/api/v1/store/cart`). The frontend on :3001 also
dropped for about 30 seconds (Chrome error page on `/checkout`) and then came back. Because of this I could
not see a single product, could not add anything to the bag, and could not finish sign-up. The
findings below are therefore mostly about words and error handling, which is exactly what a
non-native reader meets when something goes wrong. Findings F1 to F4 are caused by the environment, but the
way the UI talks about the failure is still a real problem.

---

### F1: Raw English error "Failed to fetch" shown to customers
- Where: http://localhost:3001/account/register (after "Create an account"), the Bag panel, http://localhost:3001/checkout, http://localhost:3001/checkout/return; 1280x678
- What I did: Filled in Full name, Email address, Password and pressed "Create an account". Later opened "Bag" and went to checkout.
- What happened / why I felt confused, stuck or annoyed: The only message was `Failed to fetch`. This is a technical browser phrase, not a sentence for a customer. I do not know what "fetch" means, what failed, whether my data was saved, or what to do next. On the sign-up page it is plain small text under the button, not red like the other errors, so I almost did not notice it. Other places say "We couldn't check your account. Please try again." which I can understand. The same problem has different words in different places.
- Severity: major (blocker for me: I would not know if my account was created)
- Screenshot: `<S>1792661289845-0tmy1a.jpg` (sign-up), `<S>1792661400194-xcr8qc.jpg` (checkout)
- Suggested fix: Replace raw errors with one plain sentence such as "We could not reach the shop. Nothing was saved. Please try again in a minute," in the same red style as form errors.

### F2: Bag panel contradicts itself: "(0 items)", "Failed to fetch", "Your bag is safely saved."
- Where: Bag panel on any page, e.g. http://localhost:3001/account/register; 1280x678
- What I did: Clicked the "Bag 0" button in the top bar.
- What happened / why I felt confused, stuck or annoyed: The panel title says `Your Bag (0 items)`. Under it: `Failed to fetch` and `Retry`. In the middle: `Your bag is safely saved.` and `We couldn't check prices and availability. Try again to continue.` and a second button `Try again`. I have 0 items, so what is "safely saved"? Two retry buttons ("Retry" and "Try again") do the same thing, so I do not know which one to press. "Check prices and availability" for an empty bag makes no sense.
- Severity: major
- Screenshot: `<S>1792661326789-m8ufnb.jpg`
- Suggested fix: When the bag is empty or the server is down, show one message and one button. Say "Your bag is empty" if it is empty.

### F3: Shop page shows "0 pieces" and "collection unavailable", and the first load text is an unfinished "… pieces to discover"
- Where: http://localhost:3001/shop; 1280x678
- What I did: Clicked "Shop all", scrolled, pressed "Retry" twice, reloaded.
- What happened / why I felt confused, stuck or annoyed: First the counter says `… pieces to discover` (three dots instead of a number), then `0 pieces to discover` together with `The collection is temporarily unavailable. Please try again. Retry`. "Collection" and "pieces" are not words I connect with "products" or "clothes". Retry did nothing visible (no spinner, no change), so I felt the page was broken. The filters (Category, Size, Price) stay on screen even though there is nothing to filter. On the home page the same problem appears as a banner: `The collection is temporarily unavailable. Please try again.` / `Retry collection`.
- Severity: blocker (I could not find any product)
- Screenshot: `<S>1792661000921-w9ccou.jpg`, `<S>1792661388487-hze6ua.jpg`
- Suggested fix: Say "Products could not load" in plain words, show a spinner or "Trying again..." after Retry, and hide the counter and filters until products load. Use "products" instead of "pieces" and "collection".

### F4: Account page: "Opening your atelier…" then "We couldn't check your account" and "Back to sign in" when I never signed in
- Where: http://localhost:3001/account; 1280x678
- What I did: Clicked the person icon in the top bar (it has no text label, only the tooltip name "Your account").
- What happened / why I felt confused, stuck or annoyed: The page said `Opening your atelier…`. I do not know "atelier" (the words on the page never explain it). After about 10 seconds: `We couldn't check your account. Please try again.` with `Try again` and `Back to sign in`. I have no account yet, so "Back to sign in" is wrong: I was never "in", and there is no "Create an account" link on this error screen. I had to find sign-up myself.
- Severity: major
- Screenshot: `<S>1792661107374-xequ4j.jpg`
- Suggested fix: Show "Loading your account..." instead of "Opening your atelier...". On error, offer both "Sign in" and "Create an account".

### F5: Brand words I cannot understand: "atelier", "edit", "pieces", "Iro & Buba", "drop-like" headings
- Where: http://localhost:3001/ (hero, footer, sections), http://localhost:3001/shop, http://localhost:3001/account/login; 1280x678
- What I did: Read the home page top to bottom with get_page_text to find what is sold and how to buy.
- What happened / why I felt confused, stuck or annoyed: Exact words that did not tell me anything: `THE ASHABI EDIT`, `Wear it your way.`, `Made for your moment.`, `Life, well dressed.`, `A LITTLE SOMETHING, EVERY DAY`, `All in the details.`, `Small details. Big feeling.`, `FIND YOUR NEXT FAVOURITE`, `Talk to the atelier`, `YOUR PERSONAL ATELIER`, `The atelier / Account`, `Wearables Atelier`, `Iro & Buba, occasionwear and statement jewellery`, `Style is personal. Keep it that way.`, `We'll bring the style.` The page never says in one plain sentence "We sell women's clothes and jewellery from Nigeria." "Edit" here is a noun I do not know. "Atelier" is used for the shop, the account, and the support team. "Iro & Buba" and "occasionwear" are not explained. The first screen has only one button: `Discover the collection`. "Discover" and "collection" do not say "Shop" or "Buy".
- Severity: major (I would hesitate before clicking anything)
- Screenshot: `<S>1792660962900-qj7or0.jpg`
- Suggested fix: Add one plain line under the hero ("Women's clothes and jewellery made in Nigeria. Free delivery over ₦150,000.") and make the main button say "Shop clothes and jewellery".

### F6: Top bar has icon-only buttons (heart, person) with no visible text
- Where: header on every page; 1280x678
- What I did: Looked for how to sign in and how to see saved items.
- What happened / why I felt confused, stuck or annoyed: Heart icon and person icon have no words next to them (Search and Bag do). The accessibility names are `Wishlist` and `Your account`, but a sighted user only sees icons. The page uses "Wishlist", "favourites", "Your account", "Sign in", "Create an account" and "Your personal atelier" for related ideas. A heart also floats on the photo of the sign-in page with no label. The three main nav links (`Shop all`, `Clothing`, `Jewelry`) also have no accessible name in the page structure, only visible text. Spelling is mixed: nav says `Jewelry`, body says `jewellery`.
- Severity: minor
- Screenshot: `<S>1792660962900-qj7or0.jpg`, `<S>1792661148962-oxvwn4.jpg`
- Suggested fix: Add text under or next to the icons ("Saved", "Account"), use one word for the saved list, and one spelling of jewelry/jewellery.

### F7: Sign-in and sign-up screens show "Resend verification email" and "Continue as a guest" without explanation
- Where: http://localhost:3001/account/login and http://localhost:3001/account/register; 1280x678
- What I did: Scrolled the form to find the next step.
- What happened / why I felt confused, stuck or annoyed: Under the button there is an underlined link `Resend verification email`. I have not made an account yet, so I do not know what must be "verified" or why I would need to resend. The page does not say "After sign-up we send you an email. Open it to confirm." Below that: `Or, make yourself at home` and `Continue as a guest`. "Make yourself at home" is an idiom; "guest" of what? It does not say "you can buy without an account". The page text also contains the stray text `Checking your account…` that appears when the page is read, which might flash on screen.
- Severity: major
- Screenshot: `<S>1792661155267-ruudmc.jpg`, `<S>1792661178185-a659bk.jpg`
- Suggested fix: Show "Resend verification email" only after sign-up, with one sentence "We sent a link to your email. Click it to finish." Rename the guest link "Buy without an account".

### F8: "Tell us your name, using at least 2 characters." and form layout jumps when errors disappear
- Where: http://localhost:3001/account/register; 1280x678
- What I did: Pressed "Create an account" with the empty form. Then typed into "Full name".
- What happened / why I felt confused, stuck or annoyed: Good: the three errors were clear and red (`Tell us your name, using at least 2 characters.`, `Enter a valid email address.`, `Enter your password.`). Good: `At least 12 characters` was shown before I typed, and it got a tick when my password was long enough. Problems: (1) The first sentence is long and uses the idiom "Tell us"; "Enter your name (at least 2 letters)" is easier. (2) When I typed my name, its error line vanished and the Email field moved up about 27 px, so my next click landed in the wrong place and my email was not typed. I had to look again. (3) When the Password error showed, the helper text `At least 12 characters` was replaced by `Enter your password.` so the rule disappeared exactly when I needed it. (4) "Full name" does not say first and last, or what name goes on a parcel.
- Severity: minor
- Screenshot: `<S>1792661187823-x187e1.jpg`
- Suggested fix: Reserve space for error lines so fields do not move, keep the password rule visible next to the error, and shorten the name error.

### F9: Checkout error page offers "Recover order access" and "Send secure access link" with no explanation
- Where: http://localhost:3001/checkout and http://localhost:3001/checkout/return; 1280x678
- What I did: Went to checkout with an empty bag; the page said `Failed to fetch` with buttons `Retry checkout` and `Recover order access`. I clicked "Recover order access".
- What happened / why I felt confused, stuck or annoyed: I did not want to recover anything; I just wanted to pay. The next page, titled `Check your order`, repeats `Failed to fetch`, a button `Refresh order status`, and a form `Recover access to an order` with `Order number`, `Email used for this order`, `Send secure access link`. I have no order, so I do not know if I did something wrong. "Access" and "secure access link" are abstract. The title says "Order status" in the tab but I see "Check your order" on the page.
- Severity: major
- Screenshot: `<S>1792661400194-xcr8qc.jpg`, `<S>1792661410396-hhy3tk.jpg`
- Suggested fix: When the bag is empty, say "Your bag is empty. Add something to buy it." with a "Shop" button. Rename to "Find my order" and explain "We will email you a link to see your order."

### F10: Search panel title "Find your next favourite." does not say "Search"
- Where: Search button in header, any page; 1280x678
- What I did: Clicked "Search" and typed `dress`.
- What happened / why I felt confused, stuck or annoyed: The window title is `Find your next favourite.`, then `COLLECTION UNAVAILABLE` and `We couldn't load the collection. Please try again.` with `Try again`. No word "Search" and no hint what to type (no example). Because the API was down I could not see results. The all-capitals label "COLLECTION UNAVAILABLE" looks like a product category, not an error.
- Severity: minor
- Screenshot: `<S>1792661418200-78fcpc.jpg`
- Suggested fix: Title it "Search products" with placeholder "For example: dress, necklace".

### F11: Sizes and delivery information is thin before I can reach a product
- Where: http://localhost:3001/shop (filters), header banner; 1280x678
- What I did: Read the filters while waiting for products.
- What happened / why I felt confused, stuck or annoyed: `SIZE (NUMBERED)` with `6 8 10 12 14 16` and `Applies to clothing. Jewelry is one size.` I do not know if these are UK, US or EU sizes, or what size I am in my country. The top banner `Delivery options at checkout` does not tell me where they deliver or the cost; the home page says `Complimentary standard delivery over ₦150,000` ("complimentary" is a hard word; "free" is simpler). The currency selector is shown as `NGN ₦` with no label and I cannot tell whether it changes prices (the page structure calls it "Display currency", the screen shows only the code). Price filter labels are clear (`Under ₦100,000`).
- Severity: minor
- Screenshot: `<S>1792661000921-w9ccou.jpg`
- Suggested fix: Add "UK sizes" (or the right system) and a "Size guide" link; say "Free delivery over ₦150,000"; label the currency "Currency: NGN".

---

## What worked well (one line each)
- The empty-form errors on sign-up are red, specific, and next to each field.
- The password rule `At least 12 characters` is visible before typing and gets a tick live.
- Price filter labels with the ₦ sign and numbers are easy to read.

## Reached first success?
No. Route A (find product, add to bag, checkout): not possible, the product list never loaded (API 503). Route B (create account and reach dashboard): not possible, "Create an account" ended in `Failed to fetch`. Steps tried: about 14 (home, shop, retry x2, account, sign-in, sign-up with empty form, sign-up filled in, bag, checkout, order recovery, search).

## Verdict (in the persona's voice)
"I came to buy a dress. The first page has big beautiful photos but the words are strange for me: 'edit', 'atelier', 'your moment'. I did not find a plain sentence that says what the shop sells. When I pressed 'Discover the collection' and 'Shop all', I saw a message 'The collection is temporarily unavailable' and a Retry that did nothing. I tried to make an account and the answer was 'Failed to fetch', which I do not understand, and I did not know if my email was saved. The bag said '0 items' and also 'safely saved'. At checkout I was offered to 'Recover order access', which I did not want. If this were my first visit and I was alone, I would close the tab after the shop page. The sign-up form itself was good: clear errors and a clear password rule. If the shop said plainly what it sells, used 'Shop', 'Search', 'Sign in' and 'Create an account' in simple words, and showed plain-English errors, I could probably finish."
