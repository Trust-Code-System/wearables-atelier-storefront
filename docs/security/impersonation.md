# Impersonation and account boundary audit (attacks 1–4)

Audit date: 22 October 2026. Backend source: `Trust-Code-System/wearables-backend`, baseline `4a84029`, dedicated local clone `C:/Users/Admin/.codex/tmp/wearables-security-20261022`. These are audit probes; no application fixes are included.

## Execution boundary

No hosted API or database requests were authorized for this run: staging/production isolation was unverified. Only synthetic `group1-*` accounts and records may be used with the dedicated loopback PostgreSQL database. The test additionally checks the loopback database host and reuses the repository's exact test-database name guard. Database suites and cleanup must run serially. Email delivery is mocked by the repository harness; no email, payment, storage or dashboard operation is required by these probes.

Runnable source: `test/security-impersonation.e2e-spec.ts` in the backend clone. Set `SECURITY_IMPERSONATION_EVIDENCE_PATH` to an ignored local artifact path to capture every HTTP request method/path, fixture identity, scrubbed body and response status/body. Passwords, tokens, cookies, email addresses and phone numbers are removed before evidence is written. Successful controls and failure responses are both recorded. HTTP responses are obtained from the real Nest/Express application with the real Better Auth adapter and PostgreSQL, rather than controller mocks.

## Applicability and code inspection

| Attack | Applicability and tested contract | Execution status |
| --- | --- | --- |
| 1. Anonymous database/public-key access | The reviewed application uses NestJS + Prisma + PostgreSQL and Better Auth. Tracked frontend/backend source contains no Supabase/PostgREST client, anonymous key or database REST URL. `NEXT_PUBLIC_API_BASE_URL` is the browser-visible HTTP base. Direct Supabase RLS/public-key testing is **not applicable to this architecture**. Private API probes use anonymous requests and a deliberately fake public-key/Bearer header; draft products and known private orders are targeted alongside private customer/admin routes. Guessed `/rest/v1/*` and `/graphql/v1` paths are also probed. Public published-product reads provide a positive control. | Awaiting isolated local HTTP execution; hosted database network exposure untested. |
| 2. A/B object swapping | A and B obtain separate genuine sessions. A uses B's saved address UUID for GET/PATCH/default/DELETE, alongside a nonexistent UUID. B's data is read afterward and A's own edit/delete succeeds as a control. Order detail, payment status, history and injected ownership query fields are checked; order edit/delete routes are absent. Cart product/variant IDs and wishlist account headers/body fields cannot retarget a write to B. | Awaiting isolated local HTTP execution. |
| 3. Role escalation | Signup submits `role: owner`, `emailVerified: true` and `isAdmin: true` before checking persisted defaults. Customer profile and native `/api/auth/update-user` mutations attempt `admin`, `owner` and `staff`, verification and B's account ID. The test checks persisted accounts and forbidden admin access, not just HTTP rejection. A deliberately seeded local admin provides an allowed-operation control, fails the owner-only directory route, then is demoted to check stale-session denial. The restricted admin auth router is also probed for update-user. | Awaiting isolated local HTTP execution. |
| 4. Reset token replay | A reset is used once, then replayed with another replacement password; stored credential equality is checked without exposing its hash. Old storefront and admin sessions must be revoked, B must remain signed in, and the first replacement credential must work. Two simultaneous requests race for one reset token. Expired and malformed proofs must leave the existing credential/session unchanged. | Awaiting isolated local HTTP execution. |

Relevant implementation boundaries observed in code:

- `src/modules/auth/auth.options.ts` declares the extra `role` field with `input: false`, defaults it to `customer`, enables required email verification and session revocation on reset, and sets reset-token lifetime to 900 seconds.
- `CustomersController` derives the account ID from `req.authSession.user.id`; `AddressesService` filters by both address ID and the persisted owning customer. Strict application DTO validation rejects unrecognized ownership/role fields.
- `AuthGuard` selects the dedicated admin portal cookie and asks `AdminAccessService` for current persisted privileges. A client role field is not an administrative grant.
- The installed Better Auth 1.7.7 reset route calls `internalAdapter.consumeVerificationValue` before password hashing; the installed Prisma adapter implements a single-row consume. This supports the intended replay protection, but the HTTP race probe must run before calling the behavior proven.

## Limitations and interpretation

An HTTP 200 from native Better Auth `update-user` is not by itself an escalation: unknown protected fields may be ignored while an allowed display name is updated. The evidence and persisted-row checks must establish the resulting role, verification flag and target account. Application profile DTOs instead reject unknown fields with 400.

Published product IDs and variant IDs are public identifiers. Deleting an item by its product/variant ID should affect only the authenticated caller's cart/wishlist; possession of B's ID must not select B's saved record. B's persistence after A's request is the security assertion.

Order buyer detail/status support explicit guest capabilities as well as account ownership; a missing anonymous session can correctly yield 404 rather than 401. The recorded private-order ID is synthetic and does not itself prove ownership. Raw database transport exposure, hosted policies, actual inbox delivery, browser reset-page leakage, cross-process races and deployed cookie/domain behavior remain outside these local probes.

## Verification log

- Repository/nested rules and identity/session ADRs read before authoring; backend work is on `test/security-audit-20261022`.
- Test file formatted with the installed Prettier.
- Initial TypeScript verification could not establish correctness because the fresh clone's Prisma client had not yet been generated (`src/generated/prisma/client.js` missing). This was a missing setup prerequisite, not a demonstrated application security finding.
- No database suite has run at the time of this draft. No attacks are marked passed on source inspection alone.
