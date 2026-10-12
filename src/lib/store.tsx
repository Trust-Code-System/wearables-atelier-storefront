"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Currency, Order, Product } from "@/lib/types";
import { seedProducts, migrateBrandCatalog, legacyProductSlugIds } from "@/lib/products";

/* ------------------------------------------------------------------ */
/*  Public storefront settings                                       */
/* ------------------------------------------------------------------ */

export interface StoreSettings {
  storeName: string;
  email: string;
  phone: string;
  address: string;
  defaultCurrency: Currency;
  paystackPublicKey: string;
  paystackTestMode: boolean;
  freeShippingThresholdNGN: number;
  standardFeeNGN: number;
  expressFeeNGN: number;
}

export const defaultSettings: StoreSettings = {
  storeName: "Wearables Atelier",
  email: "hello@wearablesatelier.com",
  phone: "+234 906 729 2754",
  address: "D4 Shitta Road, Surulere, Lagos",
  defaultCurrency: "NGN",
  paystackPublicKey: "",
  paystackTestMode: true,
  freeShippingThresholdNGN: 150_000,
  standardFeeNGN: 3_500,
  expressFeeNGN: 7_500,
};

const SettingsContext = createContext<{
  settings: StoreSettings;
} | null>(null);

function publicSettings(value: StoreSettings): StoreSettings {
  const stored = value && typeof value === "object" ? value as unknown as Record<string, unknown> : {};
  return Object.fromEntries(Object.entries(defaultSettings).map(([key, fallback]) =>
    [key, typeof stored[key] === typeof fallback ? stored[key] : fallback],
  )) as unknown as StoreSettings;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings] = usePersistentState<StoreSettings>(
    "wa:settings",
    defaultSettings,
    publicSettings,
    false,
  );
  const value = useMemo(() => ({ settings }), [settings]);
  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Shared localStorage helper — SSR safe, hydrates after mount        */
/* ------------------------------------------------------------------ */

function usePersistentState<T>(key: string, seed: T, migrate?: (value: T) => T, persist = true) {
  const [value, setValue] = useState<T>(seed);
  // `hydrated` is state (not a ref) so the persist effect cannot race the
  // hydration effect and clobber storage with the seed on mount.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // Hydrating from an external system (localStorage) after mount is the
      // intended pattern here — server renders the seed, client upgrades.
      if (raw !== null) {
        const stored = JSON.parse(raw) as T;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(migrate ? migrate(stored) : stored);
      }
    } catch {
      /* corrupted storage — fall back to seed */
    }
    setHydrated(true);
  }, [key, migrate]);

  useEffect(() => {
    if (!hydrated || !persist) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [key, value, hydrated, persist]);

  return [value, setValue] as const;
}

/* ------------------------------------------------------------------ */
/*  Currency                                                           */
/* ------------------------------------------------------------------ */

const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
} | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = usePersistentState<Currency>(
    "wa:currency",
    "NGN",
  );
  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Read-only demo catalog (retains existing browser edits)            */
/* ------------------------------------------------------------------ */

const CatalogContext = createContext<{
  products: Product[];
  getProduct: (slug: string) => Product | undefined;
} | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products] = usePersistentState<Product[]>(
    "wa:catalog",
    seedProducts,
    migrateBrandCatalog,
    false,
  );
  const getProduct = useCallback(
    (slug: string) => products.find((p) => p.slug === slug) ?? products.find((p) => p.id === legacyProductSlugIds[slug]),
    [products],
  );

  const value = useMemo(
    () => ({
      products,
      getProduct,
    }),
    [products, getProduct],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Cart                                                               */
/* ------------------------------------------------------------------ */

function validWishlist(value: string[]): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === "string"))] : [];
}

const WishlistContext = createContext<{
  ids: string[];
  toggle: (id: string) => void;
} | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = usePersistentState<string[]>("wa:wishlist", [], validWishlist);
  const toggle = useCallback((id: string) => {
    setIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, [setIds]);
  const value = useMemo(() => ({ ids, toggle }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) throw new Error("useWishlist must be used within WishlistProvider");
  return value;
}

const CartContext = createContext<{
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (productId: string, size: number | null, qty?: number) => void;
  removeItem: (productId: string, size: number | null) => void;
  setQty: (productId: string, size: number | null, qty: number) => void;
  clear: () => void;
  count: number;
} | null>(null);

const sameLine = (a: CartItem, productId: string, size: number | null) =>
  a.productId === productId && a.size === size;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = usePersistentState<CartItem[]>("wa:cart", []);
  const [isOpen, setOpen] = useState(false);

  const addItem = useCallback(
    (productId: string, size: number | null, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => sameLine(i, productId, size));
        if (existing) {
          return prev.map((i) =>
            sameLine(i, productId, size) ? { ...i, qty: i.qty + qty } : i,
          );
        }
        return [...prev, { productId, size, qty }];
      });
    },
    [setItems],
  );

  const removeItem = useCallback(
    (productId: string, size: number | null) =>
      setItems((prev) => prev.filter((i) => !sameLine(i, productId, size))),
    [setItems],
  );

  const setQty = useCallback(
    (productId: string, size: number | null, qty: number) => {
      if (qty <= 0) {
        removeItem(productId, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) => (sameLine(i, productId, size) ? { ...i, qty } : i)),
      );
    },
    [setItems, removeItem],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, isOpen, setOpen, addItem, removeItem, setQty, clear, count }),
    [items, isOpen, addItem, removeItem, setQty, clear, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Orders                                                             */
/* ------------------------------------------------------------------ */

const OrdersContext = createContext<{
  addOrder: (o: Order) => void;
} | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [, setOrders] = usePersistentState<Order[]>("wa:orders", []);

  const addOrder = useCallback(
    (o: Order) => setOrders((prev) => [o, ...prev]),
    [setOrders],
  );
  const value = useMemo(
    () => ({ addOrder }),
    [addOrder],
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
