import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/shop", "/shop?category=clothing", "/shop?category=jewelry", "/about", "/contact", "/faq", "/shipping-returns", "/privacy", "/terms"].map((path) => ({ url: absoluteUrl(path) }));
}
