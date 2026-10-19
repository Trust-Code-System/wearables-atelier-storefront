import { getApiBaseUrl } from "./api-config";
export type SavedWishlist = {
  data: { productId: string; available: boolean; createdAt: string }[];
  meta: { total: number; limit: number };
};
export type ImportedWishlist = SavedWishlist & {
  acceptedProductIds: string[];
  skippedProductIds: string[];
};
export async function wishlistRequest(
  accountId: string,
  method = "GET",
  path = "",
  body: object = {},
  key?: string,
): Promise<ImportedWishlist> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/store/wishlist${path}`,
    {
      method,
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        "X-Wishlist-Account": accountId,
        ...(method !== "GET" ? { "Content-Type": "application/json" } : {}),
        ...(key ? { "Idempotency-Key": key } : {}),
      },
      ...(method !== "GET" ? { body: JSON.stringify(body) } : {}),
    },
  );
  if (!response.ok) {
    if (response.status === 401)
      throw new Error("Please sign in again to sync your wishlist.");
    if (response.status === 409)
      throw new Error(
        "Your account or wishlist changed. Refresh and check the 200-item limit.",
      );
    if (response.status === 429)
      throw new Error("Please wait a moment before syncing again.");
    throw new Error(
      "Unable to sync your wishlist. Your saved items have been kept; please retry.",
    );
  }
  return response.json() as Promise<ImportedWishlist>;
}
