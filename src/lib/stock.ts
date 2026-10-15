import type { CartItem, Product } from "./types";

/** Total available stock; live products also provide a per-size allocation. */
export function stockCount(product: Pick<Product, "stock">): number {
  return Number.isFinite(product.stock) ? Math.max(0, Math.floor(product.stock)) : 0;
}

export function stockLabel(product: Pick<Product, "stock">): string {
  const count = stockCount(product);
  return count === 0 ? "Unavailable at the moment" : `${count} ${count === 1 ? "piece" : "pieces"} available`;
}

export function cartProductQty(items: CartItem[], productId: string): number {
  return items.filter((item) => item.productId === productId).reduce((sum, item) => sum + item.qty, 0);
}

export function variantStock(product: Product, size: number | null): number {
  return product.variants ? product.variants.find((variant) => variant.size === size)?.available ?? 0 : stockCount(product);
}

export function variantPrice(product: Product, size: number | null): number {
  return product.variants?.find((variant) => variant.size === size)?.priceNGN ?? product.priceNGN;
}

export function remainingStock(items: CartItem[], product: Product, size: number | null): number {
  const used = product.variants
    ? items.filter((item) => item.productId === product.id && item.size === size).reduce((sum, item) => sum + item.qty, 0)
    : cartProductQty(items, product.id);
  return Math.max(0, variantStock(product, size) - used);
}

export function canAddStock(items: CartItem[], product: Product, qty = 1, size: number | null = null): boolean {
  return Number.isInteger(qty) && qty > 0 && qty <= remainingStock(items, product, size);
}

export function addStockItem(items: CartItem[], product: Product | undefined, size: number | null, qty: number): CartItem[] {
  if (!product || !canAddStock(items, product, qty, size)) return items;
  if (product.sizes.length ? size === null || !product.sizes.includes(size) : size !== null) return items;
  const existing = items.find((item) => item.productId === product.id && item.size === size);
  return existing
    ? items.map((item) => item === existing ? { ...item, qty: item.qty + qty } : item)
    : [...items, { productId: product.id, size, qty }];
}

export function setStockQuantity(items: CartItem[], product: Product | undefined, productId: string, size: number | null, qty: number): CartItem[] {
  if (!Number.isInteger(qty)) return items;
  const line = items.find((item) => item.productId === productId && item.size === size);
  if (!line) return items;
  if (qty <= 0) return items.filter((item) => item !== line);
  // Always let customers reduce an old bag that now exceeds available stock.
  if (qty > line.qty && (!product || qty - line.qty > remainingStock(items, product, size))) return items;
  return items.map((item) => item === line ? { ...item, qty } : item);
}

export function cartHasStockIssues(items: CartItem[], products: Product[]): boolean {
  return items.some((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    const quantity = product?.variants
      ? items.filter((line) => line.productId === item.productId && line.size === item.size).reduce((sum, line) => sum + line.qty, 0)
      : cartProductQty(items, item.productId);
    return !product || !Number.isInteger(item.qty) || item.qty <= 0 || quantity > variantStock(product, item.size)
      || (product.sizes.length ? item.size === null || !product.sizes.includes(item.size) : item.size !== null);
  });
}
