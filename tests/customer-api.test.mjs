import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const {
  customerRequest,
  customerOrders,
  customerProfile,
  customerAddresses,
  NIGERIAN_STATES,
} = await import(
  data(
    compile("customer-api").replace('"./api-config"', JSON.stringify(config)),
  )
);
const { accountSession } = await import(
  data(compile("account-api").replace('"./api-config"', JSON.stringify(config)))
);

test("customer reads and writes are credentialed, uncached and scoped to the session-owned me endpoints", async () => {
  const original = globalThis.fetch;
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return options.method === "DELETE"
      ? new Response(null, { status: 204 })
      : Response.json({ data: [] });
  };
  try {
    await customerProfile();
    await customerAddresses();
    await customerOrders("opaque+/cursor=");
    await customerRequest("customers/me", {
      method: "PATCH",
      body: { phone: null },
    });
    await customerRequest("customers/me/addresses/address-id", {
      method: "DELETE",
      body: {},
    });
    assert.equal(
      calls[0].url,
      "https://api.example.test/api/v1/store/customers/me",
    );
    assert.equal(
      new URL(calls[2].url).searchParams.get("cursor"),
      "opaque+/cursor=",
    );
    assert.deepEqual(JSON.parse(calls[3].options.body), { phone: null });
    for (const { options } of calls) {
      assert.equal(options.credentials, "include");
      assert.equal(options.cache, "no-store");
      assert.ok(options.signal);
    }
    assert.equal(NIGERIAN_STATES.length, 37);
    assert.equal(new Set(NIGERIAN_STATES).size, 37);
  } finally {
    globalThis.fetch = original;
  }
});

test("account expiry clears the customer identity and API errors do not expose backend details", async () => {
  const originalFetch = globalThis.fetch,
    originalWindow = globalThis.window;
  globalThis.window = new EventTarget();
  let changes = 0;
  window.addEventListener("wearables:account-changed", () => changes++);
  try {
    globalThis.fetch = async () =>
      Response.json({ message: "private database details" }, { status: 401 });
    assert.equal(await accountSession(), null);
    await assert.rejects(customerProfile(), /session has ended/);
    assert.equal(changes, 1);
    globalThis.fetch = async () =>
      Response.json({ message: "private database details" }, { status: 403 });
    await assert.rejects(
      customerRequest("customers/me", {
        method: "PATCH",
        body: { phone: null },
      }),
      /Verify your email/,
    );
    globalThis.fetch = async () =>
      Response.json({ user: { id: "another-user", name: null } });
    await assert.rejects(accountSession(), /check your account/);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});
