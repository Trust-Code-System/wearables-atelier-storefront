import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
const compile = (name) => ts.transpileModule(readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const data = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const { accountAction } = await import(data(compile("account-api").replace('"./api-config"', JSON.stringify(data(compile("api-config"))))));
test("recovery requests use native auth endpoints, cookie credentials and no provider error details", async () => {
  const originalFetch = globalThis.fetch, originalWindow = globalThis.window;
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  globalThis.window = new EventTarget();
  let calls = [], events = 0;
  window.addEventListener("wearables:account-changed", () => events++);
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return Response.json({ status: true }); };
  try {
    await accountAction("request-password-reset", { email: "buyer@example.test" });
    await accountAction("send-verification-email", { email: "buyer@example.test" });
    assert.equal(events, 0);
    await accountAction("reset-password", { token: "dummy-proof", newPassword: "new-test-password-123" });
    assert.equal(events, 1);
    assert.deepEqual(calls.map(call => new URL(call.url).pathname), ["/api/auth/request-password-reset", "/api/auth/send-verification-email", "/api/auth/reset-password"]);
    for (const { options } of calls) { assert.equal(options.credentials, "include"); assert.equal(options.cache, "no-store"); assert.equal(options.method, "POST"); }
    globalThis.fetch = async () => Response.json({ message: "private provider diagnostics" }, { status: 400 });
    await assert.rejects(accountAction("reset-password", {}), /invalid or expired/);
    assert.equal(events, 1);
  } finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow; }
});
