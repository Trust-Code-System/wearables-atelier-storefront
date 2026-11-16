# Launch QA: persona-2-skeptic (the Skeptic)

Desktop Chrome, 1280x678, http://localhost:3001, 2026-10-22.
Screenshot folder (all paths below are `<D>\mcp-claude-in-chrome-blob-<id>.jpg`):
`D = C:\Users\Admin\.claude\projects\C--Users-Admin-Desktop-Wearables-atelier\8d1c886a-d66c-4335-8f85-8bdc3fe3e296\tool-results`

## Environment issue (noted once)
During my whole session `http://localhost:4300/api/auth/get-session` returned 503, and the product catalogue
never loaded ("The collection is temporarily unavailable"). I retried over roughly 10 minutes (Retry button,
reloads, waiting up to 30s, other categories). Other testers were hitting the same app at the same time, so this
may be load or a down backend. Everything below that depends on products, bag, checkout or account creation is
therefore blocked by it. The policy-page findings are unaffected.

I read in full: home, shipping-returns, terms, privacy, FAQ (all 8 answers expanded), about, contact, footer links.
I could not read any product page, price, delivery fee, tax line or order total (see F1).

## Findings

### F1: Could not see a single product or price, so I cannot judge cost at all
- Where: http://localhost:3001/shop and /shop?category=jewelry, desktop
- What I did: Opened Shop all, retried, reloaded, tried Jewelry, waited about 10 minutes in total.
- What happened / why I felt confused, stuck or annoyed: "Loading the collection..." for roughly 20s, then "The collection is temporarily unavailable. Please try again." The filters still show (sizes 6-16, price bands) with no items, and the page reads "0 pieces to discover" before it errors. A skeptical visitor who cannot see one price leaves.
- Severity: blocker (environment-dependent, but a customer would quit here)
- Screenshot: D\mcp-claude-in-chrome-blob-1792661647044-4edwza.jpg (also ...1792661414772-wfu9b0.jpg)
- Suggested fix: Make the catalogue resilient (cache or static fallback), and if it fails show a clear "we will be back shortly, order via WhatsApp" message rather than an empty filtered shop.

### F2: Account sign-up fails with a vague error and no clear next step
- Where: http://localhost:3001/account/register, desktop
- What I did: Clicked "Retry account connection", filled name, email and password (13 chars), pressed Enter.
- What happened: Page shows two overlapping messages: a banner "We couldn't check your account..." at the top and, under the button after submit, "We couldn't connect to accounts. Please try again." The error under the button is easy to miss; nothing says whether my details were saved or whether it is my connection or the shop. No contact route is offered next to the error.
- Severity: blocker (environment-dependent)
- Screenshot: D\mcp-claude-in-chrome-blob-1792661552952-uzpis5.jpg
- Suggested fix: Single clear error near the button saying the service is down, that nothing was submitted, and giving the WhatsApp/email contact.

### F3: Checkout with an empty bag shows an "accounts" error instead of "your bag is empty"
- Where: http://localhost:3001/checkout, desktop
- What I did: Opened checkout directly to see what it asks before I would add anything.
- What happened: Only "We couldn't connect to accounts. Please try again. Retry checkout / Recover order access". I could not learn what checkout asks for (guest or account, which fields, payment provider). The tab title is also the generic home title.
- Severity: major
- Screenshot: D\mcp-claude-in-chrome-blob-1792661570620-615363.jpg
- Suggested fix: Show an empty-bag state with a link back to the shop, and do not make checkout depend on an account service for guests.

### F4: FAQ and home page contradict each other about the free-delivery threshold
- Where: /faq (item 4), home page, top announcement bar
- What I did: Read FAQ "Is delivery complimentary?" then looked at the announcement bar.
- What happened: FAQ says free delivery applies "when your order reaches the threshold shown in the announcement bar and at checkout". The announcement bar says only "Delivery options at checkout", with no amount. The only place the amount appears is the home page footer strip ("Complimentary standard delivery over ₦150,000"). Shipping & returns says "the order threshold displayed on the site". I had to hunt for the number, and I never saw the fee for smaller orders anywhere.
- Severity: major
- Screenshot: D\mcp-claude-in-chrome-blob-1792661182299-ehm1sa.jpg (FAQ), D\mcp-claude-in-chrome-blob-1792660973026-w2l3t0.jpg (home strip)
- Suggested fix: State "Free standard delivery over ₦150,000; otherwise ₦X" in the announcement bar, FAQ and Shipping & returns, from one source.

### F5: Shipping & returns gives no actual delivery prices and the delivery area is vague
- Where: /shipping-returns, /faq (item 3)
- What I did: Read the full page looking for fees, couriers, areas, international shipping.
- What happened: "All other available delivery fees are shown at checkout before payment." No fee table, no courier names, no Lagos same-day cut-off time, no statement of whether it ships outside Nigeria (FAQ only says "within Lagos and across Nigeria"), yet the site offers a USD display currency, which suggests international buyers. A skeptic reads "shown at checkout" as "you will find out late".
- Severity: major
- Screenshot: D\mcp-claude-in-chrome-blob-1792661018998-9spo6u.jpg
- Suggested fix: Add a small table (Lagos, rest of Nigeria, international yes/no, fee, time) and the cut-off time.

### F6: Returns policy is exchange-only, but the FAQ and navigation say "exchange or return"; refunds are never explained
- Where: /faq item 5, /shipping-returns section 04-05, /terms section 04
- What I did: Compared the three pages.
- What happened: FAQ title "Can I exchange or return an item?" answers only about size exchanges within 7 days. Shipping & returns title says "Returns and exceptions" but never says whether a change-of-mind refund exists, how long a refund takes, or who pays return postage. The FAQ also omits two exceptions the policy page has (bespoke/altered pieces are non-returnable, delivery charges non-refundable). A 7-day window starting from delivery with unworn/unwashed/tagged conditions is tight and not highlighted before purchase.
- Severity: major
- Screenshot: D\mcp-claude-in-chrome-blob-1792661203889-9niofw.jpg
- Suggested fix: Say plainly "No refunds for change of mind; size exchange within 7 days" (or the real rule), add the refund timeline and return-postage rule, and make the FAQ match the policy page.

### F7: No business identity anywhere: no legal name, registration number, email or phone on the contact page
- Where: /contact, /about, /terms, footer
- What I did: Looked for who runs the shop and how to reach them other than chat.
- What happened: Contact page has only a WhatsApp button, a street address (D4 Shitta Road, Surulere, Lagos) and three social links. No phone number, email, opening hours, or response time. No registered company name or CAC number on Terms, About or footer. About page names no person or founder (the brand is "Wearables by Ashabi" but nobody is introduced). The only email on the whole site is hidden in the Privacy page (hello@wearablesatelier.com), which also differs from the brand name "Wearables by Ashabi" and from the social handles (@wearablesbyashabi, @_wearablesng), so I cannot tell whether the domain is the official one. I cannot verify any of it without leaving the site.
- Severity: major
- Screenshot: D\mcp-claude-in-chrome-blob-1792661274594-d92rvz.jpg (contact), D\mcp-claude-in-chrome-blob-1792661072026-3dtd8c.jpg
- Suggested fix: Add trading name, registration number, email, phone, hours and a founder line on Contact/About, and use one consistent brand name and email domain.

### F8: Privacy notice is thin: no data controller, no retention, no rights process, "when online payments are enabled"
- Where: /privacy
- What I did: Read the whole notice to see what is collected and why.
- What happened: It lists name, email, phone, address and order details and says marketing is sent "only where you have chosen". But it names no responsible company, gives no retention period, does not name analytics or cookies (only "browser storage"), does not mention Nigerian data-protection law, and has no way to exercise rights beyond an email. "When online payments are enabled" makes me wonder whether payments are live. Sign-up has no consent checkbox or marketing opt-in/opt-out choice, and the privacy/terms links sit in small print under the "Continue as a guest" button.
- Severity: minor
- Screenshot: D\mcp-claude-in-chrome-blob-1792661552952-uzpis5.jpg (sign-up small print)
- Suggested fix: Name the controller, state retention and cookies/analytics, add a visible "I agree to the Terms and Privacy Policy" line and a separate unticked marketing option at sign-up, and drop "when online payments are enabled".

### F9: Terms leave currency charged ambiguous
- Where: /terms section 03, currency selector in the header
- What I did: Read the pricing clause and used the NGN / USD selector.
- What happened: Terms say "Prices are shown in the selected display currency" and that my "payment provider may apply its own currency conversion or bank fees". It never says which currency I am actually charged in, so USD may be only a display estimate. Switching to USD on /shop left the price filter bands in naira (Under ₦100,000 etc.). I also could not confirm any taxes (VAT) statement: none is mentioned anywhere. Selecting USD also persists across tabs, which affects other testers using the same browser profile (I switched it back to NGN).
- Severity: major
- Screenshot: D\mcp-claude-in-chrome-blob-1792661481260-km8c2q.jpg
- Suggested fix: State "You are charged in NGN; USD is an estimate at today's rate" next to the selector and in Terms, state whether prices include VAT, and show filter bands in the chosen currency.

### F10: "Continue as a guest" just goes to the shop, so I do not know if guest checkout exists
- Where: /account/register and /account/login, desktop
- What I did: Hovered the link to check where it goes; it is a link to /shop.
- What happened: The sign-up page offers "Or, make yourself at home: Continue as a guest", which reads like a guest-checkout promise, but it merely returns to the catalogue. The FAQ never says whether an account is required to order. Also a "Resend verification email" link is shown on the Create-an-account form before I have created anything, which makes me think verification is mandatory and uncertain.
- Severity: minor
- Screenshot: D\mcp-claude-in-chrome-blob-1792661552952-uzpis5.jpg
- Suggested fix: Say on the page and in the FAQ "Guest checkout available" (if true), and hide "Resend verification email" until a sign-up has been made.

### F11: Footer "Our point of view" is not a page and key info cannot be found from the footer
- Where: footer, desktop
- What I did: Checked every footer link target.
- What happened: "Our point of view" links to /#craft (an anchor on the home page), not a page; "Delivery options at checkout" top bar and the footer have no link to Shipping from the header. The footer copyright line is covered by the Next.js dev badge in my screenshot (dev build only). Social links and the WhatsApp number (+234 906 729 2754) are pre-filled with "I'd like to place an order" even on the Contact page, where I would be asking a question.
- Severity: minor
- Screenshot: D\mcp-claude-in-chrome-blob-1792660973026-w2l3t0.jpg
- Suggested fix: Rename the link to what it is or give it a page, and use a neutral pre-filled WhatsApp message on Contact.

### F12: Size guidance is one line, no measurements; images carry a third-party watermark
- Where: /faq item 2, /contact hero image
- What I did: Looked for a size chart before buying.
- What happened: "Clothing is listed in numbered sizes on each product page... message the atelier". No size chart or body measurements are mentioned. With a 7-day exchange-only policy, I want to size correctly the first time. A small third-party studio watermark is visible in the bottom-right of the contact photo, which makes me question image rights.
- Severity: minor
- Screenshot: D\mcp-claude-in-chrome-blob-1792661274594-d92rvz.jpg
- Suggested fix: Link a size chart from the FAQ and every product page; remove the watermark or credit the photographer.

## What worked
- Policy pages (Shipping & returns, Terms, Privacy) load fast, are readable, are dated "Last updated 12 October 2026", and are linked from the footer; the tone is clear and non-pushy.
- All footer links I tested resolve to real pages; the Lagos address, social links and WhatsApp are present; no dark patterns (no countdowns, fake scarcity, pre-ticked boxes) seen.
- Password rule ("At least 12 characters") is shown up front and ticks as I type.

## Outcome
Reached first success? No. Neither route: no product could be loaded (F1), account sign-up returned a connection error (F2), checkout was unreachable (F3). Steps taken: about 25 page reads/actions across 12 pages before giving up; no payment page was reached and nothing was entered on any site other than http://localhost:3001.

## Verdict (in the Skeptic's voice)
"I read every policy page before trusting this shop and I still could not tell you what a dress costs to receive. Free delivery starts somewhere, but the site argues with itself about where; the fee below that is 'shown at checkout', which is exactly where I expect nasty surprises. Returns are really size exchanges within seven days, refunds are never mentioned, and nobody says who the company is, what its registration number is, or how to reach it except through WhatsApp. When I tried to join, the shop told me it couldn't connect to accounts, and the catalogue never loaded at all. It looks beautiful and it sounds sincere, but I would not hand over my details or my card to a business I cannot identify and cannot browse. Fix the missing prices, name the company, and put the real delivery, refund and currency rules in plain numbers, and I would reconsider."
