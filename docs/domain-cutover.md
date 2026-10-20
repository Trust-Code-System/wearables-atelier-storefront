# Wearables domain cutover — 17 October 2026

## Vercel configuration

| Address | Project | Destination |
| --- | --- | --- |
| `wearablesbyashabi.store` | `wearables-atelier-storefront` | Production |
| `www.wearablesbyashabi.store` | `wearables-atelier-storefront` | 308 permanent redirect to `wearablesbyashabi.store` |
| `admin.wearablesbyashabi.store` | `wearables-atelier-admin` | Production |

Workspace: `hello-76386237s-projects`. Nameservers are `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. DNS propagated during setup. Verified with normal certificate validation on 17 October 2026: HTTPS `/` on the storefront returns 200, HTTPS `/login` on the new admin domain returns 200, and `https://www.wearablesbyashabi.store/shop?category=clothing` returns 308 to the same path and query on the root domain. These checks verify hosting and HTTPS, not successful catalog fetches or authenticated admin workflows.

The admin project's Production and Preview setting is `NEXT_PUBLIC_STOREFRONT_URL=https://wearablesbyashabi.store`. Local development still uses `http://localhost:3100` from `.env.example`.

Both projects retain `NEXT_PUBLIC_API_BASE_URL=https://api.staging.wearables.trustcodesystem.tech`. Existing Vercel and TrustCode hostnames remain assigned; no old DNS records, domains, or credentials were removed.

## Required from the Railway owner

**20 October audit correction:** merge and deploy backend PR #53 before applying the configuration below. It allows the exact cookie parent as well as its subdomains, while retaining HTTPS, exact trusted-origin checks and rejection of suffix-lookalike hosts. The existing deployed validator would reject the storefront apex. Both custom storefront/admin preflights still fail against the configured staging API. See the [verified account/API audit](account-api-audit-2026-10-20.md) and its request evidence. These hosted changes have not been applied by this audit.

The backend is `Trust-Code-System/wearables-backend`. Its checked-in `.railway/railway.ts` declares project `vigilant-connection`, staging service `wearables-staging`, and production service `wearables-backend`; confirm which deployed service currently answers the existing staging API hostname.

The current API returns catalog data, but responses to the new storefront origin do not include `Access-Control-Allow-Origin`. The backend uses Better Auth with `SameSite=Lax`, shared-domain cookies and an exact trusted-origin list. The admin checks the session cookie on its own server too. A cookie belonging to `wearables.trustcodesystem.tech` cannot authenticate `admin.wearablesbyashabi.store`; adding only a frontend DNS alias does not fix login.

1. Add `api.wearablesbyashabi.store` as a custom domain on the existing API service, using the same service port as the working API domain. Return the exact DNS records Railway requests, including any verification record, to the Vercel DNS administrator. Do not guess a CNAME target. Keep the existing API hostname during verification.
2. At the coordinated cookie-parent cutover, replace `CORS_ORIGINS` with the following exact HTTPS origins. Keep the old configuration until this step: the production validator intentionally rejects unrelated parent domains, so legacy TrustCode origins cannot remain in the new Wearables-parent configuration:

   ```dotenv
   https://wearablesbyashabi.store
   https://www.wearablesbyashabi.store
   https://admin.wearablesbyashabi.store
   ```

   This setting also controls Better Auth trusted origins. Do not use `*` for credentialed requests.
3. Once the new API hostname has valid DNS and HTTPS, coordinate the cookie cutover and frontend redeploys:

   ```dotenv
   BETTER_AUTH_URL=https://api.wearablesbyashabi.store
   COOKIE_DOMAIN=wearablesbyashabi.store
   AUTH_CALLBACK_URL=https://wearablesbyashabi.store/account/verified
   AUTH_RESET_URL=https://wearablesbyashabi.store/account/reset-password
   ORDER_ACCESS_URL=https://wearablesbyashabi.store/orders/access
   PAYSTACK_CALLBACK_URL=https://wearablesbyashabi.store/checkout/return
   ```

   Preserve secrets. Keep secure, HTTP-only cookies and CSRF/origin checks enabled. Check any configured reset-password/payment return URLs and preserve their valid route paths when changing their origins; do not enable payments or invent missing frontend routes.
4. Update deployment configuration/IaC to match so a later deployment does not restore the old domain settings. Deploy the backend, then set `NEXT_PUBLIC_API_BASE_URL=https://api.wearablesbyashabi.store` in both frontend projects and redeploy them. Do not change the frontend API URL before the new backend hostname works.
5. Validate catalog reads from the new storefront origin, sign-in and session persistence on the new admin domain, protected admin navigation, and sign-out. Users must sign in again after the cookie-domain change. Verify HTTPS and the `www` redirect with a path and query string.
6. Redirect legacy frontend addresses only after the new domains and authentication are verified. Origin-specific browser carts/wishlists do not automatically migrate to the new hostname.

Railway settings, the new API custom domain, and end-to-end authentication on the purchased domain were not changed or verified in this Vercel setup session because Railway access was unavailable.

## Prepared account integration — 20 October

Backend [PR #53](https://github.com/Trust-Code-System/wearables-backend/pull/53) contains the tested apex-origin fix; it has not been merged or deployed. Current Railway access has been verified without changing hosted settings. The existing staging API has only the legacy domain attached, target port 3000; the proposed API host currently resolves through Vercel rather than Railway. Obtain the exact CNAME/verification records from Railway when adding the alias, then apply them in Vercel DNS. No new service or database is required.

Review the connected Railway configuration plan before applying IaC changes. `.railway/railway.ts` currently hard-codes the legacy parent and must be updated in the approved rollout so a future apply cannot restore it. Do not overwrite provider/database secrets or replace database resources. Confirm the configured Paystack key mode without exposing its value before testing any payment; this work did not charge a card.

Changing the cookie parent requires users to sign in again and ends legacy-frontend authentication against this API configuration. Keep rollback values privately in the host; do not commit secrets. Both frontend API build settings must switch together after the new API domain, certificate, origin policy and server configuration work. The customer dashboard and local test evidence are described in [the integration record](account-dashboard-integration-2026-10-20.md).
