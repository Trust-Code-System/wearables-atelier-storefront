import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const compile = (name) => ts.transpileModule(readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const seo = await import(dataUrl(compile("seo").replace('"./brand-contact"', JSON.stringify(dataUrl(compile("brand-contact"))))));

test("canonical URLs and social cards use the public Wearables domain", () => {
  const metadata = seo.pageMetadata("Clothing", "Nigerian occasionwear", "/shop?category=clothing");
  assert.equal(metadata.alternates.canonical, "https://wearablesbyashabi.store/shop?category=clothing");
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.twitter.card, "summary_large_image");
});

test("catalog text cannot close a structured-data script", () => {
  const payload = { description: '</script><script>alert("xss")</script>' };
  const serialized = seo.serializeJsonLd(payload);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), payload);
});

test("product markup preserves real variant prices and sold-out availability", () => {
  const product = { id: "p1", slug: "iro-and-buba", name: "Iro & Buba", description: "Lagos occasionwear", category: "clothing", images: ["https://example.test/image.png"], stock: 0, priceNGN: 150000, variants: [{ priceNGN: 150000 }, { priceNGN: 180000 }] };
  const graph = seo.productSchema(product)["@graph"];
  assert.equal(graph[0].offers.lowPrice, "150000.00");
  assert.equal(graph[0].offers.highPrice, "180000.00");
  assert.equal(graph[0].offers.priceCurrency, "NGN");
  assert.equal(graph[0].offers.availability, "https://schema.org/OutOfStock");
  assert.equal(graph[1].itemListElement[2].item, graph[0].url);
  assert.equal(graph[0].aggregateRating, undefined);
  product.stock = 2;
  assert.equal(seo.productSchema(product)["@graph"][0].offers.availability, "https://schema.org/InStock");
});
