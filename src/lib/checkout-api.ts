import { getApiBaseUrl } from "./api-config";
import { cartNaira } from "./cart-api";
export type CheckoutSelection = {
  shippingMethodId: string;
  expectedShippingVersion: number;
  feeKobo: string;
  estimate: string;
  delivery?: {
    line1: string;
    city: string;
    state: string;
    lga?: string;
    country: "NG";
  };
};
export type BuyerOrder = {
  id: string;
  number: string;
  totalKobo: string;
  subtotalKobo: string;
  shippingKobo: string;
  taxKobo: string;
  contact: { name: string; email: string; phone: string };
  delivery: {
    method: string;
    estimate: string;
    line1: string;
    line2: string | null;
  };
  lines: {
    id: string;
    productName: string;
    sizeLabel: string;
    quantity: number;
    totalKobo: string;
  }[];
  payment: {
    status: string;
    retryAction: string;
    lastCheckedAt: string | null;
  };
};
export type BuyerCheckout = {
  checkoutId: string;
  orderId: string;
  expiresAt: string;
  order: BuyerOrder;
};
export type PaymentLink = {
  checkoutId: string;
  orderId: string;
  expiresAt: string;
  initializationStatus: string;
  authorizationUrl?: string;
};
export class StoreRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function storeRequest<T>(
  path: string,
  method = "GET",
  body?: object,
  account?: string,
  key?: string,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/store/${path}`, {
    method,
    credentials: "include",
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
    headers: {
      ...(method === "GET" ? {} : { "Content-Type": "application/json" }),
      ...(account ? { "X-Checkout-Account": account } : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    ...(method === "GET" ? {} : { body: JSON.stringify(body ?? {}) }),
  });
  if (!response.ok) {
    if (response.status === 409)
      throw new StoreRequestError(
        response.status,
        "Your account, bag or delivery options changed. Refresh and review checkout before retrying.",
      );
    if (response.status === 403)
      throw new StoreRequestError(
        response.status,
        "Please verify your email and sign in again before checking out with an account.",
      );
    if (response.status === 404)
      throw new StoreRequestError(
        response.status,
        "This checkout is unavailable in the current browser/account. Use your order access email to recover it.",
      );
    if (response.status === 422)
      throw new StoreRequestError(
        response.status,
        "Delivery is unavailable for this destination. Contact the store for a quote or choose pickup.",
      );
    if (response.status === 429)
      throw new StoreRequestError(
        response.status,
        "Please wait a moment before trying again.",
      );
    if (response.status === 503)
      throw new StoreRequestError(
        response.status,
        "Payment is temporarily unavailable. Your bag or existing checkout has been saved.",
      );
    throw new StoreRequestError(
      response.status,
      "Unable to complete checkout. Please retry; an existing checkout will reuse its original payment attempt.",
    );
  }
  return (await response.json()) as T;
}
export function validateCheckout(value: BuyerCheckout) {
  for (const key of [
    "totalKobo",
    "subtotalKobo",
    "shippingKobo",
    "taxKobo",
  ] as const)
    cartNaira(value.order[key]);
  for (const line of value.order.lines) cartNaira(line.totalKobo);
  return value;
}
export function paymentDestination(value: PaymentLink): string | null {
  if (!value.authorizationUrl) return null;
  const url = new URL(value.authorizationUrl);
  if (
    url.origin !== "https://checkout.paystack.com" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/[A-Za-z0-9]+$/.test(url.pathname)
  )
    throw new Error("Payment link is invalid. Please contact the store.");
  return url.href;
}
export const CHECKOUT_RECOVERY = "wa:checkout:v1";
// IDs and account precondition only. Cookies authorize access; never persist proof,
// contact, password, provider reference, authorization URL or payment status.
export type CheckoutRecovery = {
  key: string;
  checkoutId?: string;
  orderId?: string;
  account: string;
};
export function readCheckoutRecovery(): CheckoutRecovery | null {
  const raw = sessionStorage.getItem(CHECKOUT_RECOVERY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as CheckoutRecovery;
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const valid =
      typeof value.key === "string" &&
      uuid.test(value.key) &&
      (value.checkoutId === undefined ||
        (typeof value.checkoutId === "string" &&
          uuid.test(value.checkoutId))) &&
      (value.orderId === undefined ||
        (typeof value.orderId === "string" && uuid.test(value.orderId))) &&
      typeof value.account === "string" &&
      (value.account === "guest" || uuid.test(value.account));
    return valid
      ? {
          key: value.key,
          account: value.account,
          ...(value.checkoutId ? { checkoutId: value.checkoutId } : {}),
          ...(value.orderId ? { orderId: value.orderId } : {}),
        }
      : null;
  } catch {
    return null;
  }
}
