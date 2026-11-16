import { Suspense } from "react";
import { ShopClient } from "./shop-client";
import type { Metadata } from "next";
import { loadCatalogPage } from "@/lib/catalog-api";
import { pageMetadata } from "@/lib/seo";
import { CLOTHING_SIZES } from "@/lib/products";

type Props = PageProps<"/shop">;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category;
  const title = category === "clothing" ? "Nigerian Occasionwear & Iro and Buba" : category === "jewelry" ? "Statement Jewellery, Necklaces & Earrings" : "Shop Nigerian Clothing & Statement Jewellery";
  const description = category === "clothing" ? "Explore Nigerian occasionwear, Iro & Buba and coordinated headwraps from Wearables by Ashabi in Lagos." : category === "jewelry" ? "Discover statement necklaces, earrings and bracelets from Wearables by Ashabi. Find the finishing touch for your occasionwear." : "Shop Nigerian occasionwear, Iro & Buba, necklaces, earrings and bracelets from Wearables by Ashabi, Lagos.";
  const path = category === "clothing" || category === "jewelry" ? `/shop?category=${category}` : "/shop";
  return pageMetadata(title, description, path);
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category === "clothing" || params.category === "jewelry" ? params.category : "all";
  const sort = typeof params.sort === "string" && ["newest", "price-asc", "price-desc"].includes(params.sort) ? params.sort : "featured";
  const sizes = typeof params.sizes === "string" ? params.sizes.split(",").map(Number).filter((size) => (CLOTHING_SIZES as readonly number[]).includes(size)) : [];
  const priceRange = typeof params.price === "string" ? params.price : "all";
  // A failed API keeps the existing retry UI; never invent catalog entries.
  const initialPage = await loadCatalogPage({ category, sort, sizes, priceRange, page: 1 }).catch(() => null);
  return (
    <Suspense>
      <ShopClient initialPage={initialPage} />
    </Suspense>
  );
}
