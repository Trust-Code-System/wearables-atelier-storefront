import type { Currency } from "@/lib/types";

/** Display conversion rate. The backend will replace this with a live rate. */
export const NGN_PER_USD = 1600;

export function convertFromNGN(amountNGN: number, currency: Currency): number {
  return currency === "USD" ? amountNGN / NGN_PER_USD : amountNGN;
}

export function formatPrice(amountNGN: number, currency: Currency): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amountNGN / NGN_PER_USD);
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountNGN);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function generateReference(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `WA-${rand}`;
}
