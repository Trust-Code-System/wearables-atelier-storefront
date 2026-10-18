import { getApiBaseUrl } from "./api-config";
import type { CartItem, Product } from "./types";

export type SavedCart = {
  id: string | null;
  owner: "guest" | "account";
  data: {
    variantId: string;
    quantity: number;
    product: { name: string; slug: string; sizeLabel: string } | null;
    available: number;
    unitPriceKobo: string | null;
    lineTotalKobo: string | null;
    issue: "unavailable" | "insufficient_stock" | null;
  }[];
  meta: { itemCount: number; quantityLimit: number };
  subtotalKobo: string;
  subtotalComplete: boolean;
  hasIssues: boolean;
};

export function cartNaira(kobo: string): number {
  if (!/^\d+$/.test(kobo) || BigInt(kobo) > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error("The bag contains a price that cannot be displayed safely.");
  return Number(kobo) / 100;
}

export async function cartRequest(method = "GET", path = "", quantity?: number): Promise<SavedCart> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/store/cart${path}`, {
    method,
    credentials: "include",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    ...(method !== "GET" ? {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quantity === undefined ? {} : { quantity }),
    } : {}),
  });
  if (!response.ok) {
    if (response.status === 409) throw new Error("Your bag or availability changed. Review your bag and try again.");
    if (response.status === 429) throw new Error("Too many bag updates. Please wait a moment and try again.");
    throw new Error("Unable to update your bag. Please try again.");
  }
  const cart = await response.json() as SavedCart;
  // Validate money before publishing a snapshot to the UI.
  cartNaira(cart.subtotalKobo);
  for (const line of cart.data) {
    if (line.unitPriceKobo !== null) cartNaira(line.unitPriceKobo);
    if (line.lineTotalKobo !== null) cartNaira(line.lineTotalKobo);
  }
  return cart;
}

/** Catalog contributes images only; saved cart prices/availability stay authoritative. */
export function cartItems(cart: SavedCart | null, catalog: Product[]): CartItem[] {
  return (cart?.data ?? []).map((line) => {
    const match = catalog.find((product) => product.slug === line.product?.slug);
    const size = line.product?.sizeLabel === "One size" ? null : Number(line.product?.sizeLabel);
    const price = line.unitPriceKobo === null ? 0 : cartNaira(line.unitPriceKobo);
    const product: Product | undefined = line.product ? {
      id: match?.id ?? line.product.slug,
      slug: line.product.slug,
      name: line.product.name,
      category: match?.category ?? "clothing",
      images: match?.images ?? [],
      description: "", details: [], createdAt: "",
      sizes: size === null ? [] : [size],
      priceNGN: price,
      stock: line.available,
      variants: [{ id: line.variantId, size, priceNGN: price, available: line.available }],
    } : undefined;
    return {
      variantId: line.variantId,
      productId: product?.id ?? line.variantId,
      size: Number.isFinite(size) ? size : null,
      qty: line.quantity,
      product,
      issue: line.issue,
      lineTotalNGN: line.lineTotalKobo === null ? null : cartNaira(line.lineTotalKobo),
    };
  });
}

/** Serialize writes (including guest creation) and refreshes within this tab. */
export class CartQueue {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(work: () => Promise<T>): Promise<T> {
    const next = this.tail.then(work);
    this.tail = next.catch(() => undefined);
    return next;
  }
}
