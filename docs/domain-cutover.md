# Wearables domain cutover — 17 October 2026

## Vercel configuration

| Address | Project | Destination |
| --- | --- | --- |
| `wearablesbyashabi.store` | `wearables-atelier-storefront` | Production |
| `www.wearablesbyashabi.store` | `wearables-atelier-storefront` | 308 permanent redirect to `wearablesbyashabi.store` |
| `admin.wearablesbyashabi.store` | `wearables-atelier-admin` | Production |

Workspace: `hello-76386237s-projects`. Vercel reports pending nameserver propagation at setup time. An assigned hostname is not yet proof that DNS and HTTPS are ready.

The admin project's Production and Preview setting is `NEXT_PUBLIC_STOREFRONT_URL=https://wearablesbyashabi.store`. Local development still uses `http://localhost:3100` from `.env.example`.

Both projects retain `NEXT_PUBLIC_API_BASE_URL=https://api.staging.wearables.trustcodesystem.tech`. Existing Vercel and TrustCode hostnames remain assigned; no old DNS records, domains, or credentials were removed.

## Required from the Railway owner

The backend is `Trust-Code-System/wearables-backend`. Its checked-in `.railway/railway.ts` declares project `vigilant-connection`, staging service `wearables-staging`, and production service `wearables-backend`; confirm which deployed service currently answers the existing staging API hostname.

The current API returns catalog data, but responses to the new storefront origin do not include `Access-Control-Allow-Origin`. The backend uses Better Auth with `SameSite=Lax`, shared-domain cookies and an exact trusted-origin list. The admin checks the session cookie on its own server too. A cookie belonging to `wearables.trustcodesystem.tech` cannot authenticate `admin.wearablesbyashabi.store`; adding only a frontend DNS alias does not fix login.

1. Add `api.wearablesbyashabi.store` as a custom domain on the existing API service, using the same service port as the working API domain. Return the exact DNS records Railway requests, including any verification record, to the Vercel DNS administrator. Do not guess a CNAME target. Keep the existing API hostname during verification.
2. Add these exact HTTPS origins to the existing `CORS_ORIGINS` list, preserving current entries during the transition:

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
   AUTH_CALLBACK_URL=https://wearablesbyashabi.store
   ```

   Preserve secrets. Keep secure, HTTP-only cookies and CSRF/origin checks enabled. Check any configured reset-password/payment return URLs and preserve their valid route paths when changing their origins; do not enable payments or invent missing frontend routes.
4. Update deployment configuration/IaC to match so a later deployment does not restore the old domain settings. Deploy the backend, then set `NEXT_PUBLIC_API_BASE_URL=https://api.wearablesbyashabi.store` in both frontend projects and redeploy them. Do not change the frontend API URL before the new backend hostname works.
5. Validate catalog reads from the new storefront origin, sign-in and session persistence on the new admin domain, protected admin navigation, and sign-out. Users must sign in again after the cookie-domain change. Verify HTTPS and the `www` redirect with a path and query string.
6. Redirect legacy frontend addresses only after the new domains and authentication are verified. Origin-specific browser carts/wishlists do not automatically migrate to the new hostname.

Railway settings, the new API custom domain, and end-to-end authentication on the purchased domain were not changed or verified in this Vercel setup session because Railway access was unavailable.
