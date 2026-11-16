# UI and quota attack evidence (group 2)

Scope: attacks 5–9 from the supplied checklist, on an isolated local backend checkout at `C:/Users/Admin/.codex/tmp/wearables-security-20261022`. No hosted requests or real customer accounts. The backend harness requires a loopback PostgreSQL database named exactly `wearables_test`, mocks email delivery, and disables email workers. Tests create synthetic `group2-…@example.test` users and clean up accounts and associated data after each case and at completion. Password comes from ignored local environment configuration; cookies/passwords are excluded from evidence.

Runnable HTTP coverage: `test/security-limits.e2e-spec.ts` in the backend checkout. Evidence lines are emitted as JSON with `audit: group2`, the method/path/input, response status/body, and redirect Location. Synthetic address data is safe to retain; cookies and password are masked.

| # | Attack and exact request | Execution status | Response / invariant | Protection-off control |
|---|---|---|---|---|
| 5 | Unverified A directly `POST /api/v1/store/customers/me/addresses` with a complete valid address, bypassing the disabled save control | Pending local run | Pending | Pending parent orchestration |
| 5 | Customer directly `POST /api/v1/admin/products` using a valid draft product body; repeat as persisted admin for positive control | Pending local run | Pending | Pending parent orchestration |
| 6 | Direct calls after free uses exhausted | N/A to literal attack: no free-use or credit feature found | Real server quota analogue below; does not establish absent billing behavior | N/A |
| 6 analogue | Save five addresses, then directly `POST /api/v1/store/customers/me/addresses` a sixth | Pending local run | Pending | Pending parent orchestration |
| 7 | Twenty concurrent requests with a little monetary credit left | N/A to literal attack: no credit balance feature found | Real address-slot race analogue below | N/A |
| 7 analogue | Save four addresses, then issue twenty concurrent valid address POSTs competing for the last slot | Pending local run | Pending | Pending parent orchestration |
| 8 | Address POST: overlong name/street, empty/whitespace text, null required field, unknown country, empty object; valid Unicode/quotes and special text | Pending local run | Pending | Pending parent orchestration |
| 8 | Cart `PUT /api/v1/store/cart/items/{UUID}` quantities `-1`, `0`, `1.2`, `100`, `"1"`, `null`, absent, plus unauthorized price field; 110,000-character address body | Pending local run | Pending | Pending parent orchestration |
| 9 API adjunct | Auth sign-in `callbackURL` set to `https://untrusted.example/landing`, `//untrusted.example/landing`, `@untrusted.example/landing` | Pending local run | Pending | Pending parent orchestration |
| 9 storefront | Real post-login browser navigation with those values in `?next=` | Not proven yet | Code inspection finds fixed `/account` destinations in `src/components/account/auth-experience.tsx`; API callback tests alone do not prove frontend navigation | Pending parent orchestration |

No finding is claimed proven from code inspection. A successful stored special-character address alone is not an XSS finding; browser execution is covered separately by group 3. No local protection was disabled by this recording-only subagent.
