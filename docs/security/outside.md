# Outside attacks — local evidence, 22 October 2026

Scope: storefront in this repository plus backend clone at `C:/Users/Admin/.codex/tmp/wearables-security-20261022`. No hosted attack requests. Staging/production database separation was not verified, so all active testing is restricted to loopback services and a guarded disposable test database. Each browser uses an independent context, synthetic group 3 accounts, and blocks browser requests to external hosts. Providers are disabled/mocked by the backend fixture.

## Results

The localhost SSRF probe ran against the real local Next development server. Database/browser execution is pending the serial database test slot. The table distinguishes inspected scope from executed evidence; it is not an overall passing report.

| # | Attack and request | Response/proof | Status |
| --- | --- | --- | --- |
| 10 | Store `<img src=x onerror=alert(1)>` as A's account name and saved-address recipient; render `/account` in Chromium. | Runnable HTTP and browser harness prepared; execution pending. | Not proven |
| 11 | `GET /_next/image?url=http%3A%2F%2Flocalhost%3A<ephemeral-port>%2Fssrf-probe.png&w=64&q=75` on local Next port 3001. | HTTP **400**, body `"url" parameter is not allowed`; sentinel observed **0** requests. A preceding direct fetch reached the same sentinel once, proving it was observable. Metadata-IP request withheld because server egress isolation is unavailable. No custom URL import/preview feature was found. | Localhost leg refused (executed); metadata leg not proven |
| 12 | Warm identical `/account`, profile, addresses and session URLs as A; request as independent B and anonymous contexts. | Runnable real HTTP/browser harness prepared. Source lacks `Cache-Control: no-store` on private customer profile/address routes; response evidence pending. | Not proven |
| 13 | Open a hosting preview URL without platform authentication. | No verified preview deployment URL or isolated preview database context supplied. Historical production addresses in deployment docs are not preview evidence. No hosted requests made. | Not proven |
| 14 | Upload a document containing instructions for an AI feature to read B's data or invoke tools. | No AI model, document ingestion or AI tool execution feature exists in the inspected storefront/backend routes or dependencies. | N/A — feature absent; no attack executed |

## Runnable artifacts

- Backend: `test/security-outside.e2e-spec.ts`, included automatically by its E2E Jest configuration. It creates a real loopback HTTP listener on `127.0.0.1:4300`, uses HTTP to create and persist attack data, and cleans the test database/account fixtures in `afterAll`. Run serially with every other database suite.
- Storefront: `tests/security/outside-browser.mjs`, invoked while backend fixtures are alive. Launch a separate Next process bound locally at `http://localhost:3001` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4300`.
- Independently runnable SSRF probe: set `SECURITY_STOREFRONT_URL=http://localhost:3001`, then `node tests/security/outside-image-proxy.mjs`. This ran successfully on 22 October 2026; it uses a disposable loopback listener and requires no accounts/database.
- Required backend environment: `SECURITY_TEST_PASSWORD`, loaded from an ignored `.env` file. Never commit it. Browser environment: `SECURITY_STOREFRONT_URL`, `SECURITY_BROWSER_SCRIPT`, `SECURITY_PLAYWRIGHT_MODULE`, optional `SECURITY_CHROMIUM_PATH` and `SECURITY_SCREENSHOT_DIR`.
- Browser cookies are passed only in the child process environment and never written to evidence. Summary output contains statuses, cache policy, sentinel counts and dialog counts, with no credentials.

The browser harness has a positive control: it deliberately interprets the payload in a separate throwaway local document and must observe one dialog. This demonstrates alert detection; it does **not** claim that an application protection was disabled. No production/dashboard/database security settings are changed.

## Inspection boundaries

The storefront's account dashboard renders user names, address recipient names and address lines as React text (`src/components/account/account-dashboard.tsx`). Runtime browser rendering, not that source inspection alone, decides the XSS result. `src/lib/account-api.ts` and `src/lib/customer-api.ts` use `cache: "no-store"`; the backend customer controller has no equivalent response storage prohibition at inspection time.

User-controlled URL search covered `fetch`, HTTP clients, URL DTOs, import/preview routes and media handling. Backend outgoing application HTTP calls use fixed Resend/Paystack bases; object storage uses deployment configuration and object keys, not arbitrary user URLs. The built-in Next image optimizer is still a URL fetch surface and is tested separately with a loopback observer. No request is sent to an instance metadata service.

The absence of an AI feature is based on the route/module/dependency inventory, including the backend `AppModule`, media uploads and storefront API clients. This N/A does not claim prompt injection was refused by an AI system.
