import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Regression: launch QA — network failures reached bag/checkout as "Failed to fetch".
// Found by the five-persona launch QA on 2026-10-22.
// Report: docs/launch-qa-2026-10-22/report.md
const urls = new Map();
function moduleUrl(name) {
  if (urls.has(name)) return urls.get(name);
  const compiled = ts.transpileModule(
    readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
  ).outputText.replace(/"\.\/(api-config|cart-api)"/g, (_, dependency) => JSON.stringify(moduleUrl(dependency)));
  const url = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
  urls.set(name, url);
  return url;
}
const { accountSession, accountAction } = await import(moduleUrl("account-api"));
const { cartRequest } = await import(moduleUrl("cart-api"));
const { storeRequest, StoreRequestError } = await import(moduleUrl("checkout-api"));

test("disconnected and timed-out requests give actionable messages without claiming success", async () => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  try {
    for (const failure of [new TypeError("Failed to fetch"), new DOMException("signal timed out", "TimeoutError")]) {
      globalThis.fetch = async () => { throw failure; };
      await assert.rejects(accountSession(), /couldn’t connect to accounts.*try again/);
      await assert.rejects(accountAction("sign-in/email", {}), /couldn’t connect to accounts/);
      await assert.rejects(accountAction("sign-up/email", {}), /couldn’t connect to accounts/);
      await assert.rejects(cartRequest(), /couldn’t reach the shop.*internet connection.*try again/);
      await assert.rejects(storeRequest("checkout", "POST", {}, "guest", "existing-key"), error => {
        assert.ok(error instanceof StoreRequestError);
        assert.equal(error.status, 0);
        assert.match(error.message, /connect to checkout/);
        assert.match(error.message, /Check your order status before making another payment/);
        return true;
      });
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = originalBase;
  }
});

test("HTTP conflict and rate-limit responses keep their specific recovery advice", async () => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  try {
    globalThis.fetch = async () => new Response(null, { status: 409 });
    await assert.rejects(cartRequest("PUT", "/items/variant", 2), /bag or availability changed/);
    await assert.rejects(storeRequest("checkout", "POST", {}), error => error.status === 409);
    globalThis.fetch = async () => new Response(null, { status: 429 });
    await assert.rejects(accountAction("sign-in/email", {}), /wait a moment/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = originalBase;
  }
});

// Regression: full-journey launch QA (2026-10-22) — a refused or failing service was reported as the
// customer's fault (sign-in) or as a generic bag error with no way forward.
test("a refused or failing service is not blamed on the customer, and bag failures offer a human fallback", async () => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  try {
    globalThis.fetch = async () => Response.json({ statusCode: 403, message: "Forbidden" }, { status: 403 });
    await assert.rejects(accountAction("sign-in/email", {}), error => !/password/i.test(error.message) && /check your account before trying again/i.test(error.message));
    await assert.rejects(cartRequest("POST"), error => error.contact === true && /refresh the page/i.test(error.message));
    globalThis.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(cartRequest("POST"), error => error.contact === true && /review your bag before trying again/i.test(error.message));
    await assert.rejects(accountAction("sign-up/email", {}), /could not confirm.*check your account before trying again/i);
    globalThis.fetch = async () => Response.json({ code: "INVALID_EMAIL_OR_PASSWORD" }, { status: 401 });
    await assert.rejects(accountAction("sign-in/email", {}), /Check your email and password/);
    globalThis.fetch = async () => new Response(null, { status: 409 });
    await assert.rejects(cartRequest("PUT", "/items/variant", 2), error => error.contact === false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = originalBase;
  }
});
