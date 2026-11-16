"use client";

import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { useCart, useCurrency } from "@/lib/store";
import { brandContact } from "@/lib/brand-contact";
import { formatPrice } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EASE_OUT } from "@/components/motion";
import { SwipeRow } from "@/components/micro/swipe-row";
import { canAddStock, variantStock, variantPrice, stockLabel } from "@/lib/stock";

export function CartDrawer() {
  const { items, isOpen, setOpen, setQty, removeItem, count, subtotal, hasIssues, busy, loading, error, refresh } = useCart();
  const { currency } = useCurrency();

  const lines = items.flatMap((item) => {
    const product = item.product;
    return product ? [{ ...item, product }] : [];
  });

  const stockIssues = hasIssues;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="store-cart-panel w-full gap-0 p-0 sm:max-w-md"
        overlayClassName="store-sheet-backdrop"
        aria-label="Shopping bag"
        data-lenis-prevent
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-display text-lg">
            Your Bag{" "}
            {!loading && !error && <span className="text-sm font-normal text-muted-foreground tabular-nums">
              ({count} {count === 1 ? "item" : "items"})
            </span>}
          </SheetTitle>
        </SheetHeader>

        {(loading || error) && <div className="border-b px-5 py-3 text-sm" role={error ? "alert" : "status"}>
          <p>{loading || busy ? "Checking your bag…" : error}</p>
        </div>}
        {!loading && !error && items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-muted">
              <ShoppingBagIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-display text-lg">Your bag is empty</p>
              <p className="text-sm text-muted-foreground">
                Choose a product to start your order.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              render={<Link href="/shop" />}
            >
              Shop all products
            </Button>
          </div>
        ) : loading || error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center" role="status">
            <ShoppingBagIcon className="size-8 text-muted-foreground" aria-hidden />
            <h2 className="font-display text-lg">{loading || busy ? "Checking your bag…" : "We couldn’t load your bag."}</h2>
            <p className="text-sm text-muted-foreground">{loading || busy ? "We’re confirming current prices and availability." : "We could not check your items, prices or stock. Try again, or message us if this keeps happening."}</p>
            {error && <Button variant="outline" disabled={loading || busy} onClick={() => { void refresh(); }}>{busy ? "Retrying…" : "Try again"}</Button>}
            {error && <a className="text-sm underline underline-offset-4" href={brandContact.whatsapp} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>}
          </div>
        ) : (
          <>
            <p className="border-b px-5 py-3 text-xs text-muted-foreground">Delivery options and charges are confirmed at checkout.</p>

            <div className="flex-1 overflow-y-auto px-5">
              {items.filter((item) => !item.product).map((item) => <div key={`${item.productId}-${item.size}`} className="border-b py-4 text-sm"><p>This item is no longer available.</p><button type="button" className="underline" disabled={busy} onClick={() => removeItem(item.productId, item.size)}>Remove this item</button></div>)}
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.div
                    key={`${line.productId}-${line.size ?? "os"}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                    transition={{ duration: 0.35, ease: [...EASE_OUT] }}
                    className="border-b last:border-0"
                  >
                    <SwipeRow onRemove={() => removeItem(line.productId, line.size)} removeLabel="Remove">
                      <div className="flex gap-4 py-4">
                    <Link
                      href={`/product/${line.product.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                    >
                      {line.product.images[0] && <Image
                        src={line.product.images[0]}
                        unoptimized
                        alt={line.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${line.product.slug}`}
                            onClick={() => setOpen(false)}
                            className="truncate text-sm font-medium hover:underline underline-offset-4"
                          >
                            {line.product.name}
                          </Link>
                          <p className="mt-0.5 text-[0.75rem] text-muted-foreground">
                            {line.size !== null ? `Size ${line.size}` : "One size"}
                          </p>
                          <p className="product-stock mt-1" data-unavailable={variantStock(line.product, line.size) === 0 || undefined}>{stockLabel({ stock: variantStock(line.product, line.size) })}</p>
                          {line.qty > variantStock(line.product, line.size) && variantStock(line.product, line.size) > 0 && <p className="text-xs text-muted-foreground">Reduce the quantity to match available stock.</p>}
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          aria-label={`Remove ${line.product.name}`}
                          onClick={() => removeItem(line.productId, line.size)}
                          className="-m-2 grid size-11 place-items-center text-muted-foreground transition-all duration-150 ease-out hover:text-destructive active:scale-90"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-md border">
                          <button
                            type="button"
                            disabled={busy}
                            aria-label="Decrease quantity"
                            onClick={() => setQty(line.productId, line.size, line.qty - 1)}
                            className="grid size-11 place-items-center sm:size-8 transition-all duration-150 ease-out hover:bg-muted active:scale-90"
                          >
                            <MinusIcon className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={busy || !canAddStock(items, line.product, 1, line.size)}
                            onClick={() => setQty(line.productId, line.size, line.qty + 1)}
                            className="grid size-11 place-items-center sm:size-8 transition-all duration-150 ease-out hover:bg-muted active:scale-90"
                          >
                            <PlusIcon className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-medium tabular-nums">
                          {formatPrice(line.lineTotalNGN ?? variantPrice(line.product, line.size) * line.qty, currency)}
                        </p>
                      </div>
                    </div>
                      </div>
                    </SwipeRow>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <SheetFooter className="border-t px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg tabular-nums">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <p className="text-[0.75rem] text-muted-foreground">
                Delivery calculated at checkout. Taxes included.
              </p>
              {stockIssues || loading || busy || error ? <><p role="status" className="text-sm text-muted-foreground">{error ? "Refresh your bag before continuing." : loading || busy ? "Updating your bag…" : "Remove unavailable items or change quantities before checkout."}</p><Button size="lg" disabled className="w-full">Update your bag to continue</Button></> : <Button
                size="lg"
                className="min-h-11 w-full transition-transform duration-150 ease-out active:scale-[0.98]"
                onClick={() => setOpen(false)}
                render={<Link href="/checkout" />}
              >
                Checkout — {formatPrice(subtotal, currency)}
              </Button>}
              <Separator className="my-1" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="link-underline mx-auto min-h-11 w-fit text-[0.8125rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                Continue shopping
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
