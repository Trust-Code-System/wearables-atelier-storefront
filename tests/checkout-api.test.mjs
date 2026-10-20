import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import test from "node:test";
import ts from "typescript";
const compile = (name) =>
  ts.transpileModule(
    readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
const data = (code) =>
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const config = data(compile("api-config"));
const cart = data(
  compile("cart-api").replace('"./api-config"', JSON.stringify(config)),
);
const api = await import(
  data(
    compile("checkout-api")
      .replace('"./api-config"', JSON.stringify(config))
      .replace('"./cart-api"', JSON.stringify(cart))
      .replace("'./api-config'", JSON.stringify(config))
      .replace("'./cart-api'", JSON.stringify(cart)),
  )
);
test("checkout transport binds cookie identity, request key and current account without accepting provider diagnostics", async () => {
  const old = globalThis.fetch;
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  let capture;
  globalThis.fetch = async (url, options) => {
    capture = { url, options };
    return Response.json({ checkoutId: randomUUID() });
  };
  try {
    const key = randomUUID(),
      account = randomUUID();
    await api.storeRequest(
      "checkout",
      "POST",
      { contact: { name: "Buyer" } },
      account,
      key,
    );
    assert.equal(capture.url, "https://api.example.test/api/v1/store/checkout");
    assert.equal(capture.options.credentials, "include");
    assert.equal(capture.options.cache, "no-store");
    assert.equal(capture.options.headers["X-Checkout-Account"], account);
    assert.equal(capture.options.headers["Idempotency-Key"], key);
    await api.storeRequest("checkout/recover", "POST", {}, "guest", key);
    assert.equal(capture.options.headers["X-Checkout-Account"], "guest");
    assert.equal(capture.options.body, "{}");
    globalThis.fetch = async () =>
      Response.json(
        { message: "private provider diagnostics" },
        { status: 404 },
      );
    await assert.rejects(
      api.storeRequest("checkout/absent", "GET", undefined, account),
      (error) =>
        error instanceof api.StoreRequestError &&
        error.status === 404 &&
        !error.message.includes("private provider"),
    );
  } finally {
    globalThis.fetch = old;
  }
});
test("hosted payment links accept only the exact Paystack origin and never infer payment success", () => {
  const base = {
    checkoutId: randomUUID(),
    orderId: randomUUID(),
    initializationStatus: "uncertain",
    expiresAt: new Date().toISOString(),
  };
  assert.equal(api.paymentDestination(base), null);
  assert.equal(
    api.paymentDestination({
      ...base,
      authorizationUrl: "https://checkout.paystack.com/Ab123",
    }),
    "https://checkout.paystack.com/Ab123",
  );
  for (const authorizationUrl of [
    "http://checkout.paystack.com/Ab123",
    "https://checkout.paystack.com.evil.test/Ab123",
    "https://evil@checkout.paystack.com/Ab123",
    "https://checkout.paystack.com/Ab123?paid=true",
    "javascript:alert(1)",
  ])
    assert.throws(() => api.paymentDestination({ ...base, authorizationUrl }));
});
test("checkout recovery persists only scoped request identifiers and rejects malformed browser storage", () => {
  const original = globalThis.sessionStorage;
  let raw = null;
  globalThis.sessionStorage = { getItem: () => raw };
  try {
    const value = { key: randomUUID(), account: "guest" };
    raw = JSON.stringify(value);
    assert.deepEqual(api.readCheckoutRecovery(), value);
    raw = JSON.stringify({
      ...value,
      token: "do-not-retain",
      contact: { email: "do-not-retain" },
    });
    assert.deepEqual(api.readCheckoutRecovery(), value);
    raw = JSON.stringify({
      ...value,
      checkoutId: randomUUID(),
      orderId: randomUUID(),
    });
    assert.equal(api.readCheckoutRecovery().account, "guest");
    for (const invalid of [
      "broken",
      "null",
      JSON.stringify({ ...value, key: "invalid" }),
      JSON.stringify({ ...value, account: ["guest"] }),
      JSON.stringify({ ...value, orderId: "provider-reference" }),
    ]) {
      raw = invalid;
      assert.equal(api.readCheckoutRecovery(), null);
    }
  } finally {
    globalThis.sessionStorage = original;
  }
});
test("displayed checkout money must be safe integer kobo from the order snapshot", () => {
  const value = {
    order: {
      subtotalKobo: "10750",
      totalKobo: "11000",
      shippingKobo: "250",
      taxKobo: "750",
      lines: [{ totalKobo: "10750" }],
    },
  };
  assert.equal(api.validateCheckout(value), value);
  assert.throws(() =>
    api.validateCheckout({ order: { ...value.order, totalKobo: "1.50" } }),
  );
  assert.throws(() =>
    api.validateCheckout({
      order: { ...value.order, totalKobo: "9223372036854775807" },
    }),
  );
});
