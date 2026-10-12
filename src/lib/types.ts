export type Category = "clothing" | "jewelry";

export type Badge = "new" | "bestseller" | "limited";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  /** Base price in Nigerian Naira — the store's canonical currency */
  priceNGN: number;
  compareAtNGN?: number;
  description: string;
  details: string[];
  images: string[];
  /** Numbered sizes (e.g. 6–16). Empty array = one size (jewelry) */
  sizes: number[];
  stock: number;
  badge?: Badge;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  /** null for one-size items */
  size: number | null;
  qty: number;
}

export type Currency = "NGN" | "USD";

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  size: number | null;
  qty: number;
  priceNGN: number;
}

export interface Order {
  id: string;
  reference: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    line1: string;
    city: string;
    state: string;
  };
  delivery: "standard" | "express";
  items: OrderItem[];
  totalNGN: number;
  status: OrderStatus;
  createdAt: string;
}
