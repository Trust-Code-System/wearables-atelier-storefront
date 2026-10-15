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
const dataUrl = (code) =>
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const config = dataUrl(compile("api-config"));
const { mapProduct, loadCatalog, loadProduct, loadCatalogPage } = await import(
  dataUrl(
    compile("catalog-api").replace('"./api-config"', JSON.stringify(config)),
  )
);
const product = {
  id: "p",
  name: "Lime Set",
  slug: "lime-set",
  category: "CLOTHING",
  description: "Lime",
  careDetails: ["Dry clean"],
  badge: "NEW",
  images: [
    { url: "https://images.example.test/b", position: 1 },
    { url: "https://images.example.test/a", position: 0 },
  ],
  variants: [
    {
      id: "v10",
      sizeLabel: "10",
      priceKobo: "21000000",
      compareAtPriceKobo: null,
      available: 0,
    },
    {
      id: "v8",
      sizeLabel: "8",
      priceKobo: "18500005",
      compareAtPriceKobo: "22000000",
      available: 2,
    },
  ],
};
test("public mapping preserves size prices, reserved-adjusted availability and image order", () => {
  const mapped = mapProduct(product);
  assert.equal(mapped.priceNGN, 185000.05);
  assert.equal(mapped.compareAtNGN, 220000);
  assert.deepEqual(mapped.sizes, [8, 10]);
  assert.equal(mapped.stock, 2);
  assert.equal(mapped.variants[1].available, 0);
  assert.equal(mapped.images[0], "https://images.example.test/a");
  assert.equal(mapped.badge, "new");
  const jewelry = mapProduct({
    ...product,
    category: "JEWELRY",
    variants: [{ ...product.variants[0], sizeLabel: "One size", available: 3 }],
  });
  assert.deepEqual(jewelry.sizes, []);
  assert.equal(jewelry.variants[0].size, null);
  assert.throws(() =>
    mapProduct({
      ...product,
      variants: [{ ...product.variants[0], priceKobo: "9007199254740992" }],
    }),
  );
});
test("catalog fetch traverses pagination, distinguishes empty results/errors and handles detail 404", async () => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
  try {
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push(url);
      assert.equal(options.credentials, "omit");
      assert.equal(options.cache, "no-store");
      return Response.json({
        data: [{ ...product, id: String(calls.length) }],
        meta: { totalPages: 2 },
      });
    };
    assert.equal((await loadCatalog()).length, 2);
    assert.match(calls[1], /page=2&limit=100/);
    globalThis.fetch = async () =>
      Response.json({ data: [], meta: { totalPages: 0 } });
    assert.deepEqual(await loadCatalog(), []);
    globalThis.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(loadCatalog(), /temporarily unavailable/);
    await assert.rejects(loadProduct("lime-set"), /temporarily unavailable/);
    globalThis.fetch = async () => new Response(null, { status: 404 });
    assert.equal(await loadProduct("missing"), null);
    globalThis.fetch = async (url) => {
      const params = new URL(url).searchParams;
      assert.equal(params.get("category"), "clothing");
      assert.equal(params.get("sizes"), "8,10");
      assert.equal(params.get("priceRange"), "100-200");
      assert.equal(params.get("sort"), "price-desc");
      assert.equal(params.get("page"), "2");
      return Response.json({
        data: [product],
        meta: { page: 2, total: 13, totalPages: 2 },
      });
    };
    assert.equal(
      (
        await loadCatalogPage({
          category: "clothing",
          sizes: [8, 10],
          priceRange: "100-200",
          sort: "price-desc",
          page: 2,
        })
      ).meta.total,
      13,
    );
    globalThis.fetch = async () => Response.json(product);
    assert.equal((await loadProduct("lime-set")).id, "p");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = originalBase;
  }
});
