# Persona 1: The Impatient One (desktop, 1280x678, Chrome)

Environment note (once): every call that needs the local API failed ("collection unavailable", "couldn't check your account", "Failed to fetch"). This looks like the backend/API being unreachable from the browser (or still compiling in dev mode), not a front-end bug. The findings below are what a real visitor would see in that state. The console showed no errors and the network tool captured no requests. A Next.js dev "Compiling" badge and then a red "1 Issue" badge were visible bottom-left (dev build only).

Screenshot dir: `C:\Users\Admin\.claude\projects\C--Users-Admin-Desktop-Wearables-atelier\8d1c886a-d66c-4335-8f85-8bdc3fe3e296\tool-results\`

### F1: Shop shows "0 pieces to discover" and "collection temporarily unavailable"
- Where: http://localhost:3001/shop, desktop 1280x678
- What I did: Clicked the big "Discover the collection" button on the hero. Waited, scrolled, clicked Retry once, then clicked the Clothing filter once.
- What happened / why I felt confused, stuck or annoyed: The page loaded a pretty banner, then "0 pieces to discover", with the filters beside an empty area that says "The collection is temporarily unavailable. Please try again. Retry". Retry and Clothing both did nothing. The count says "0" before the error is explained, so for a second it reads as "this shop is empty". The error is a small line of text in a huge blank area. I would have left here.
- Severity: blocker
- Screenshot: mcp-claude-in-chrome-blob-1792660986753-ww8igs.jpg (error state); mcp-claude-in-chrome-blob-1792661013477-b1vnul.jpg (still failing after Retry and Clothing filter)
- Suggested fix: Show an obvious error with a working retry, hide "0 pieces" and the filters while loading or failed, and make the failure state look like a deliberate card, not blank space.

### F2: Homepage has no products at all, so there is nowhere else to start
- Where: http://localhost:3001/, desktop
- What I did: Went back to the homepage and scrolled the whole page looking for something to click and buy.
- What happened / why I felt confused, stuck or annoyed: There are only big editorial banners ("Life, well dressed.", "All in the details.", "Explore jewelry"). Not one product card, price or "Add to bag" appears. The only way to a product is via /shop, which was broken (F1). A top banner, "The collection is temporarily unavailable. Please try again. Retry collection", appeared once the page had hydrated, which is confusing on a landing page.
- Severity: major
- Screenshot: mcp-claude-in-chrome-blob-1792661091160-8a3fi2.jpg (error banner on homepage)
- Suggested fix: Put 4 to 8 featured products with prices and quick add on the homepage so a visitor can buy without going through the shop page.

### F3: "The Jewelry Edit" panel is a big empty block on the right
- Where: http://localhost:3001/, scrolled about 11 ticks down, desktop
- What I did: Scrolled past the Jewelry Edit section.
- What happened / why I felt confused, stuck or annoyed: The panel is a huge grey block with text on the left and nothing on the right, about 600px of blank space. It looks like a missing image or a failed load. The other sections have photos.
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661065633-m5s6h8.jpg
- Suggested fix: Show a jewelry photo or product images there, or shrink the panel if no image is available.

### F4: Account icon (logged out) lands on an error page, not sign-in
- Where: http://localhost:3001/account, desktop
- What I did: Clicked the person icon in the header as a brand-new visitor.
- What happened / why I felt confused, stuck or annoyed: I got a bare page with "We couldn't check your account. Please try again." plus "Try again" and "Back to sign in". For someone who has no account, that wording is scary and wrong; I just wanted to sign up. I had to click "Back to sign in" to reach the sign-in page. The icon tooltip says "Your account", which also assumes I have one.
- Severity: major
- Screenshot: mcp-claude-in-chrome-blob-1792661102616-3hmefp.jpg
- Suggested fix: When the session check fails or there is no session, send the visitor straight to sign in / create an account, and keep the error wording for real failures only.

### F5: Create account fails with the raw browser message "Failed to fetch"
- Where: http://localhost:3001/account/register, desktop
- What I did: Clicked "Create an account", filled in name, email and a 13-character password (the "At least 12 characters" tick turned green), and pressed the dark Create an account button. Pressed it a second time.
- What happened / why I felt confused, stuck or annoyed: Both times the only feedback was grey text "Failed to fetch" under the button. That is a developer message, not a human one. It does not say whether my account was created, whether to retry, or whether the problem is mine or theirs. There is no Retry button. I quit here.
- Severity: blocker
- Screenshot: mcp-claude-in-chrome-blob-1792661183672-gpkcsq.jpg
- Suggested fix: Replace the raw message with "We couldn't reach the atelier. Check your connection and try again", with the button staying clickable and the form filled in.

### F6: "Resend verification email" is shown on the sign-up form for a brand-new user
- Where: http://localhost:3001/account/register, desktop
- What I did: Scrolled the sign-up form.
- What happened / why I felt confused, stuck or annoyed: Directly under the Create an account button sits an underlined "Resend verification email" link, before I have even signed up. It makes me ask what I should be verifying, and whether I have to do something extra. It adds a decision to a form where I was already about to click the button.
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661160741-6ymv2k.jpg
- Suggested fix: Show "Resend verification email" only after sign-up, on the "check your inbox" screen.

### F7: Bag drawer says "Failed to fetch" even when the bag is empty
- Where: drawer opened from the header Bag button on /account/register, desktop
- What I did: Clicked "Bag 0" to see whether I could reach checkout.
- What happened / why I felt confused, stuck or annoyed: The drawer says "Your Bag (0 items)" and then "Failed to fetch  Retry", with a second message below: "Your bag is safely saved. We couldn't check prices and availability. Try again to continue." The same problem is shown twice in two different wordings, and "Failed to fetch" is again a raw error. For an empty bag the error makes no sense, and I'd expect "Your bag is empty, start shopping".
- Severity: major
- Screenshot: mcp-claude-in-chrome-blob-1792661232296-mhrw5w.jpg
- Suggested fix: For an empty bag, skip the price check and show "Your bag is empty" with a Shop all button. Use one friendly error message.

### F8: Sign-in / sign-up page is wrapped in storefront chrome and a heart button
- Where: http://localhost:3001/account/login and /account/register, desktop
- What I did: Landed on sign-in (reached after the F4 error page).
- What happened / why I felt confused, stuck or annoyed: There is a "Back to the collection" link and a heart (wishlist) button on the photo, which makes no sense on a sign-in screen. The two tabs "Sign in / Create an account" are clear, and the page itself looks good. A minor distraction. When scrolling, the sticky header turns see-through and overlaps the form's heading text for a moment.
- Severity: minor
- Screenshot: mcp-claude-in-chrome-blob-1792661118182-px5wnv.jpg (sign-in); mcp-claude-in-chrome-blob-1792661162797-5zz35e.jpg (sticky header over form)
- Suggested fix: Remove the heart from auth pages and give the sticky header a solid background.

### F9 (positive): The first screen is attractive and the main navigation is clear
- Where: http://localhost:3001/, desktop
- What happened: The hero ("Wear it your way.") and the nav pills (Shop all / Clothing / Jewelry) are easy to read, the first button ("Discover the collection") is obvious, and the sign-up form validates the 12-character rule live. Those parts worked and cost me no time. Also, the first screen's page title ("Wearables Atelier") differs from the logo ("Wearables by Ashabi"); small brand inconsistency.
- Severity: minor (title/brand mismatch only)
- Screenshot: mcp-claude-in-chrome-blob-1792660950619-ofmbbk.jpg
- Suggested fix: Use one brand name in the tab title and header.

---

Reached first success? NO. Route A (add to bag and reach checkout): no, blocked at step 2 (the shop shows no products, 0 items could be added; about 5 steps tried: hero button, wait, Retry, Clothing filter, homepage scan). Route B (sign up and reach the account dashboard): no, blocked at the final step (about 5 steps: account icon, Back to sign in, Create an account tab, fill 3 fields, submit twice; result "Failed to fetch").

Verdict (in persona's voice): "I came, I clicked the big button, and the shop told me it had zero pieces. I hit Retry once, nothing. I tried making an account instead, filled in the form, and all I got was 'Failed to fetch', which means nothing to me. I do not know if the shop is broken or if I did something wrong, and I have no patience to find out. The first page looked lovely, and that is the only reason I tried twice. If a real shopper met this, they would be gone within a minute, and the product list and the sign-up button are the two places that must never show an error with nothing to do next." (Caveat: the failures look like the backend/API being down in this local environment; the front-end should still handle that more gracefully.)
