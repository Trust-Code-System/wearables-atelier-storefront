import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
const compile = (name) => ts.transpileModule(readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const dataUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const { cartRequest, cartItems, cartNaira, CartQueue } = await import(dataUrl(
  compile("cart-api").replace('"./api-config"', JSON.stringify(dataUrl(compile("api-config")))),
));
const saved = () => ({
  id: "cart-id", owner: "guest", currency: "NGN", subtotalKobo: "37000010", subtotalComplete: true, hasIssues: false,
  meta: { itemCount: 2, quantityLimit: 99 },
  data: [{ variantId: "size-eight-id", quantity: 2, product: { name: "Server name", slug: "lime", sizeLabel: "8" }, available: 3,
    unitPriceKobo: "18500005", lineTotalKobo: "37000010", issue: null }],
});
test("saved bag uses authoritative server prices and quantities, catalog only supplies presentation", () => {
  const [line] = cartItems(saved(), [{ id: "product-id", slug: "lime", category: "clothing", images: ["image"], priceNGN: 1, stock: 100 }]);
  assert.equal(line.variantId, "size-eight-id");
  assert.equal(line.productId, "product-id");
  assert.equal(line.size, 8);
  assert.equal(line.qty, 2);
  assert.equal(line.product.name, "Server name");
  assert.equal(line.product.priceNGN, 185000.05);
  assert.equal(line.product.variants[0].available, 3);
  assert.equal(line.lineTotalNGN, 370000.1);
  assert.deepEqual(line.product.images, ["image"]);
  assert.equal(cartItems(saved(), [])[0].product.name, "Server name");
});
test("unavailable lines remain removable and one-size lines retain their variant identity", () => {
  const cart = saved();
  cart.data[0] = { ...cart.data[0], product: null, unitPriceKobo: null, lineTotalKobo: null, issue: "unavailable" };
  const [line] = cartItems(cart, []);
  assert.equal(line.product, undefined);
  assert.equal(line.variantId, "size-eight-id");
  assert.equal(line.lineTotalNGN, null);
  assert.equal(line.issue, "unavailable");
  const single = saved(); single.data[0].product.sizeLabel = "One size";
  assert.equal(cartItems(single, [])[0].size, null);
  assert.equal(cartItems(single, [])[0].product.variants[0].size, null);
});
test("cart requests include credentials, strict absolute quantities and no client price or identity", async () => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return Response.json(saved()); };
  try {
    await cartRequest(); await cartRequest("POST"); await cartRequest("PUT", "/items/variant-id", 3); await cartRequest("DELETE", "/items/variant-id");
    assert.equal(calls[0].url, "https://api.example.test/api/v1/store/cart");
    for (const { options } of calls) {
      assert.equal(options.credentials, "include"); assert.equal(options.cache, "no-store");
    }
    assert.equal(calls[0].options.body, undefined);
    assert.equal(calls[1].options.body, "{}");
    assert.equal(calls[2].options.body, '{"quantity":3}');
    assert.equal(calls[3].options.body, "{}");
    globalThis.fetch = async () => Response.json({ message: "private diagnostics" }, { status: 409 });
    await assert.rejects(cartRequest("PUT", "/items/variant-id", 3), /availability changed/);
    globalThis.fetch = async () => Response.json({ ...saved(), subtotalKobo: "9007199254740992" });
    await assert.rejects(cartRequest(), /safely/);
  } finally { globalThis.fetch = original; }
});
test("queue serializes delayed writes and keeps working after a failed mutation", async () => {
  const queue = new CartQueue();
  const events = [];
  let release;
  const blocked = new Promise((resolve) => { release = resolve; });
  const first = queue.run(async () => { events.push("start"); await blocked; events.push("finish"); throw new Error("network"); });
  const caught = assert.rejects(first, /network/);
  const second = queue.run(async () => { events.push("next"); return 2; });
  await Promise.resolve(); assert.deepEqual(events, ["start"]);
  release(); await caught; assert.equal(await second, 2);
  assert.deepEqual(events, ["start", "finish", "next"]);
});
test("money conversion rejects malformed and unsafe values", () => {
  assert.equal(cartNaira("12345"), 123.45);
  for (const input of ["-1", "1.2", "oops", "9007199254740992"]) assert.throws(() => cartNaira(input));
});
