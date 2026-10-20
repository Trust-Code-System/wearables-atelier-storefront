import { getApiBaseUrl } from "./api-config";

export type CustomerProfile = {
  id: string;
  contactName: string | null;
  contactEmail: string | null;
  phone: string | null;
};
export type SavedAddress = {
  id: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  lga: string | null;
  country: "NG";
  isDefault: boolean;
};
export type AddressInput = Omit<SavedAddress, "id" | "country" | "isDefault">;
export type CustomerOrder = {
  id: string;
  number: string;
  totalKobo: string;
  currency: "NGN";
  paymentStatus: string;
  fulfilmentStatus: string;
  createdAt: string;
};
export type OrderPage = {
  data: CustomerOrder[];
  meta: { nextCursor: string | null; limit: number };
};

export class CustomerApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Ownership always comes from the HttpOnly session, never an editable customer ID. */
export async function customerRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: object;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/store/${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    cache: "no-store",
    signal: options.signal
      ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)])
      : AbortSignal.timeout(15000),
    ...(options.body !== undefined
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options.body),
        }
      : {}),
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined")
      window.dispatchEvent(new Event("wearables:account-changed"));
    const messages: Record<number, string> = {
      400: "Check your details. Use a Nigerian mobile number and select a valid state.",
      401: "Your session has ended. Please sign in again.",
      403: "Verify your email before saving your details or addresses.",
      404: "This item is unavailable or no longer belongs to this account. Refresh and try again.",
      409: "Your saved details changed, or you have reached the address limit. Refresh and try again.",
      429: "Please wait a moment before trying again.",
    };
    throw new CustomerApiError(
      response.status,
      messages[response.status] ??
        "We couldn’t reach your atelier. Please try again.",
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const customerProfile = (signal?: AbortSignal) =>
  customerRequest<CustomerProfile>("customers/me", { signal });
export const customerAddresses = (signal?: AbortSignal) =>
  customerRequest<{
    data: SavedAddress[];
    meta: { total: number; limit: number };
  }>("customers/me/addresses", { signal });
export const customerOrders = (cursor?: string, signal?: AbortSignal) =>
  customerRequest<OrderPage>(
    `orders?limit=10${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
    { signal },
  );

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;
