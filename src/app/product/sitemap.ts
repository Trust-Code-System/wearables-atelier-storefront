import type { MetadataRoute } from "next";
import { loadCatalog } from "@/lib/catalog-api";
import { absoluteUrl } from "@/lib/seo";

// Separate from the public pages so a catalog outage cannot break their sitemap.
// Fail with a retryable server error rather than publish an empty product list.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await loadCatalog();
  return products.map((product) => ({ url: absoluteUrl(`/product/${encodeURIComponent(product.slug)}`) }));
}
