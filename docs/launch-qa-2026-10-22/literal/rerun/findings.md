# Literal-reader rerun

The misleading copy states are fixed. Shop says **Product availability could not be checked**, instead of zero pieces. Bag uses plain connection failure language and makes no saved/empty claim. The final header uses an em dash for unknown count (supersedes the zero shown in the earlier `05-bag.png`).

Home product/jewelry sections now explain their load failure. Collection retry shows **Retrying…**; account retry shows **Checking your account…**. Sign-in clearly explains account connection failure and offers Retry account connection plus Continue as a guest. The guest action reaches `/shop`.

**First shopping success remains blocked.** Chrome reports staging API CORS rejection for the local origin. No products are available to select, so product, add-to-bag and checkout success remain unverified. This is recorded in `checks.json` with browser console evidence. No mocked data, signup or payment was used.

Evidence: `10-home-explicit-outage.png`, `11-home-retry-pending.png`, `12-account-connection.png`, `13-account-retry-pending.png`, `14-guest-shop-outage.png`, and `15-final-bag-header.png`.
