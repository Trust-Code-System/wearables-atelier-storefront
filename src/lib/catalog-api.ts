import { getApiBaseUrl } from "./api-config";
import type { Product, ProductVariant } from "./types";

type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  category: "CLOTHING" | "JEWELRY";
  description: string;
  careDetails: string[];
  badge: "BESTSELLER" | "NEW" | "LIMITED" | null;
  images: { url: string; position: number }[];
  variants: {
    id: string;
    sizeLabel: string;
    priceKobo: string;
    compareAtPriceKobo: string | null;
    available: number;
  }[];
};

function naira(kobo: string): number {
  if (!/^\d+$/.test(kobo) || BigInt(kobo) > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error("Invalid catalog price");
  return Number(kobo) / 100;
}

export function mapProduct(value: PublicProduct): Product {
  if (
    !["CLOTHING", "JEWELRY"].includes(value.category) ||
    !value.variants.length
  )
    throw new Error("Invalid catalog product");
  const variants: ProductVariant[] = value.variants
    .map((variant) => {
      const size =
        variant.sizeLabel === "One size" ? null : Number(variant.sizeLabel);
      if (
        (size !== null && (!Number.isInteger(size) || size <= 0)) ||
        !Number.isSafeInteger(variant.available) ||
        variant.available < 0
      )
        throw new Error("Invalid catalog variant");
      return {
        id: variant.id,
        size,
        available: variant.available,
        priceNGN: naira(variant.priceKobo),
        compareAtNGN:
          variant.compareAtPriceKobo === null
            ? undefined
            : naira(variant.compareAtPriceKobo),
      };
    })
    .sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
  const lowest = variants.reduce((a, b) => (b.priceNGN < a.priceNGN ? b : a));
  const badges = {
    BESTSELLER: "bestseller",
    NEW: "new",
    LIMITED: "limited",
  } as const;
  return {
    id: value.id,
    slug: value.slug,
    name: value.name,
    category: value.category === "CLOTHING" ? "clothing" : "jewelry",
    description: value.description,
    details: value.careDetails,
    images: [...value.images]
      .sort((a, b) => a.position - b.position)
      .map((image) => image.url),
    sizes: variants.flatMap((variant) =>
      variant.size === null ? [] : [variant.size],
    ),
    priceNGN: lowest.priceNGN,
    compareAtNGN: lowest.compareAtNGN,
    stock: variants.reduce((sum, variant) => sum + variant.available, 0),
    badge: value.badge ? badges[value.badge] : undefined,
    // The public list already arrives newest first; stable sorting retains it.
    createdAt: "",
    variants,
  };
}

async function publicFetch(path: string, signal?: AbortSignal) {
  return fetch(`${getApiBaseUrl()}/api/v1/store/products${path}`, {
    cache: "no-store",
    credentials: "omit",
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(10000)])
      : AbortSignal.timeout(10000),
  });
}

export async function loadCatalog(signal?: AbortSignal): Promise<Product[]> {
  const products: Product[] = [];
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const response = await publicFetch(`?page=${page}&limit=100`, signal);
    if (!response.ok)
      throw new Error(
        "The collection is temporarily unavailable. Please try again.",
      );
    const body = (await response.json()) as {
      data: PublicProduct[];
      meta: { totalPages: number };
    };
    if (
      !Array.isArray(body.data) ||
      !Number.isSafeInteger(body.meta?.totalPages) ||
      body.meta.totalPages < 0 ||
      body.meta.totalPages > 1000
    )
      throw new Error("Invalid catalog response");
    pages = body.meta.totalPages;
    products.push(...body.data.map(mapProduct));
  }
  return [
    ...new Map(products.map((product) => [product.id, product])).values(),
  ];
}

export async function loadProduct(slug: string): Promise<Product | null> {
  const response = await publicFetch(`/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(
      "The collection is temporarily unavailable. Please try again.",
    );
  return mapProduct((await response.json()) as PublicProduct);
}

export type CatalogQuery = {
  category?: string;
  sizes?: number[];
  priceRange?: string;
  sort?: string;
  page?: number;
  limit?: number;
};
export async function loadCatalogPage(
  query: CatalogQuery,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 12),
  });
  if (query.category && query.category !== "all")
    params.set("category", query.category);
  if (query.sizes?.length) params.set("sizes", query.sizes.join(","));
  if (query.priceRange) params.set("priceRange", query.priceRange);
  if (query.sort) params.set("sort", query.sort);
  const response = await publicFetch(`?${params}`, signal);
  if (!response.ok)
    throw new Error(
      "The collection is temporarily unavailable. Please try again.",
    );
  const body = (await response.json()) as {
    data: PublicProduct[];
    meta: { total: number; totalPages: number; page: number };
  };
  return { data: body.data.map(mapProduct), meta: body.meta };
}
