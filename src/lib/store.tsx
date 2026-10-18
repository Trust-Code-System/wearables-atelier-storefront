"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Currency, Order, Product } from "@/lib/types";
import { usePathname } from "next/navigation";
import { loadCatalog } from "@/lib/catalog-api";
import { cartItems, cartNaira, cartRequest, CartQueue, type SavedCart } from "@/lib/cart-api";
import { toast } from "sonner";

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
/*  Live public catalog                                               */
/* ------------------------------------------------------------------ */

const CatalogContext = createContext<{
  products: Product[];
  loading: boolean;
  error: string;
  getProduct: (slug: string) => Product | undefined;
} | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let request = 0;
    const refresh = async () => {
      const current = ++request;
      try {
        const loaded = await loadCatalog(controller.signal);
        if (controller.signal.aborted || current !== request) return;
        setProducts(loaded);
        setError("");
      } catch {
        if (controller.signal.aborted || current !== request) return;
        setProducts([]);
        setError("The collection is temporarily unavailable. Please try again.");
      } finally {
        if (!controller.signal.aborted && current === request) setLoading(false);
      }
    };
    void refresh();
    const onFocus = () => { void refresh(); };
    // Signed image URLs expire after 15 minutes; renew them before expiry.
    const timer = window.setInterval(onFocus, 5 * 60 * 1000);
    window.addEventListener("focus", onFocus);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname, retry]);
  const getProduct = useCallback(
    (slug: string) => products.find((product) => product.slug === slug),
    [products],
  );
  const value = useMemo(() => ({ products, getProduct, loading, error }), [products, getProduct, loading, error]);
  return <CatalogContext.Provider value={value}>
    {error && <div role="alert" className="border-b bg-muted p-4 text-center text-sm">
      {error} <button type="button" className="underline" onClick={() => setRetry((value) => value + 1)}>Retry</button>
    </div>}
    {children}
  </CatalogContext.Provider>;
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
  addItem: (productId: string, size: number | null, qty?: number) => Promise<boolean>;
  removeItem: (productId: string, size: number | null) => Promise<boolean>;
  setQty: (productId: string, size: number | null, qty: number) => Promise<boolean>;
  clear: () => Promise<boolean>;
  refresh: () => Promise<boolean>;
  loading: boolean;
  busy: boolean;
  error: string;
  subtotal: number;
  hasIssues: boolean;
  count: number;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [cart, setCart] = useState<SavedCart | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");
  const queue = useRef(new CartQueue());
  const items = useMemo(() => cartItems(cart, products), [cart, products]);

  const run = useCallback((work: () => Promise<SavedCart>, notify = true): Promise<boolean> => {
    return queue.current.run(async () => {
      setPending((count) => count + 1);
      try {
        const saved = await work();
        setCart(saved);
        setError("");
        return true;
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Unable to load your bag. Please try again.";
        setError(message);
        if (notify) toast.error(message);
        // A response may have been lost after a committed mutation. Reconcile,
        // but never retry an additive action automatically.
        try { setCart(await cartRequest()); } catch { /* Keep error and last confirmed snapshot. */ }
        return false;
      } finally {
        setLoading(false);
        setPending((count) => count - 1);
      }
    });
  }, []);
  const refresh = useCallback(() => run(() => cartRequest(), false), [run]);
  useEffect(() => {
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const addItem = useCallback((productId: string, size: number | null, qty = 1) => run(async () => {
    const variant = products.find((product) => product.id === productId)?.variants?.find((value) => value.size === size);
    if (!variant || !Number.isInteger(qty) || qty < 1) throw new Error("Choose an available size and quantity.");
    let current = await cartRequest();
    if (!current.id) current = await cartRequest("POST");
    const quantity = (current.data.find((line) => line.variantId === variant.id)?.quantity ?? 0) + qty;
    if (quantity > current.meta.quantityLimit) throw new Error("The maximum quantity per size is 99.");
    return cartRequest("PUT", `/items/${encodeURIComponent(variant.id)}`, quantity);
  }), [products, run]);

  const change = useCallback((productId: string, size: number | null, quantity: number) => {
    const item = items.find((line) => line.productId === productId && line.size === size);
    return run(async () => {
      if (!item?.variantId || !Number.isInteger(quantity)) throw new Error("Refresh your bag and try again.");
      return quantity <= 0
        ? cartRequest("DELETE", `/items/${encodeURIComponent(item.variantId)}`)
        : cartRequest("PUT", `/items/${encodeURIComponent(item.variantId)}`, quantity);
    });
  }, [items, run]);
  const removeItem = useCallback((id: string, size: number | null) => change(id, size, 0), [change]);
  const clear = useCallback(() => run(() => cartRequest("DELETE")), [run]);
  const count = cart?.meta.itemCount ?? 0;
  const subtotal = cart ? cartNaira(cart.subtotalKobo) : 0;
  const hasIssues = cart?.hasIssues ?? false;
  const busy = pending > 0;
  const value = useMemo(() => ({ items, isOpen, setOpen, addItem, removeItem, setQty: change, clear, refresh,
    loading, busy, error, subtotal, hasIssues, count }),
    [items, isOpen, addItem, removeItem, change, clear, refresh, loading, busy, error, subtotal, hasIssues, count]);
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
