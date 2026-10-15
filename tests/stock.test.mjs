import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/stock.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { stockLabel, addStockItem, setStockQuantity, cartHasStockIssues, variantPrice } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const product = { id: "test-piece", stock: 8, sizes: [8, 10] };
const line = (size, qty) => ({ productId: product.id, size, qty });

test("live size prices and stock stay independent across bag lines", () => {
  const live = { ...product, stock: 6, variants: [
    { id: "v8", size: 8, priceNGN: 185000.05, available: 2 },
    { id: "v10", size: 10, priceNGN: 210000, available: 4 },
  ] };
  assert.equal(variantPrice(live, 8), 185000.05);
  assert.equal(variantPrice(live, 10), 210000);
  const items = addStockItem([], live, 8, 2);
  assert.deepEqual(addStockItem(items, live, 8, 1), items);
  const both = addStockItem(items, live, 10, 4);
  assert.equal(both.length, 2);
  assert.equal(cartHasStockIssues(both, [live]), false);
  assert.deepEqual(setStockQuantity(both, live, live.id, 8, 3), both);
  assert.equal(cartHasStockIssues(both, [{ ...live, variants: [ { ...live.variants[0], available: 1 }, live.variants[1] ] }]), true);
  assert.equal(cartHasStockIssues([line(8, 1), line(8, 2)], [live]), true);
});

test("availability uses the recorded total and singular/plural labels", () => {
  assert.equal(stockLabel(product), "8 pieces available");
  assert.equal(stockLabel({ stock: 1 }), "1 piece available");
  for (const stock of [0, -1, NaN]) assert.equal(stockLabel({ stock }), "Unavailable at the moment");
});

test("zero stock cannot be added and existing bag lines are preserved", () => {
  const items = [line(8, 1)];
  assert.deepEqual(addStockItem(items, { ...product, stock: 0 }, 10, 1), items);
  assert.equal(cartHasStockIssues(items, [{ ...product, stock: 0 }]), true);
});

test("stock limit is shared by sizes, including repeat additions", () => {
  const items = [line(8, 5)];
  const filled = addStockItem(items, product, 10, 3);
  assert.deepEqual(filled, [line(8, 5), line(10, 3)]);
  assert.deepEqual(addStockItem(filled, product, 8, 1), filled);
  assert.deepEqual(setStockQuantity(filled, product, product.id, 10, 4), filled);
  assert.equal(cartHasStockIssues(filled, [product]), false);
});

test("old bags over stock can be reduced or removed without deleting other sizes", () => {
  const items = [line(8, 7), line(10, 4)];
  assert.equal(cartHasStockIssues(items, [product]), true);
  const reduced = setStockQuantity(items, product, product.id, 8, 4);
  assert.equal(cartHasStockIssues(reduced, [product]), false);
  assert.deepEqual(setStockQuantity(reduced, product, product.id, 10, 0), [line(8, 4)]);
});

test("invalid quantities, removed products and invalid sizes block purchasing", () => {
  for (const qty of [0, -1, 1.5, NaN]) assert.deepEqual(addStockItem([], product, 8, qty), []);
  assert.deepEqual(addStockItem([], product, 12, 1), []);
  assert.equal(cartHasStockIssues([line(8, 1)], []), true);
  assert.equal(cartHasStockIssues([line(12, 1)], [product]), true);
  assert.equal(cartHasStockIssues([line(8, 1.5)], [product]), true);
});
