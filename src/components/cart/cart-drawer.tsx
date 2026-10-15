"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { useCart, useCatalog, useCurrency, useSettings } from "@/lib/store";
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
import { canAddStock, cartHasStockIssues, variantStock, variantPrice, stockLabel } from "@/lib/stock";

export function CartDrawer() {
  const { items, isOpen, setOpen, setQty, removeItem, count } = useCart();
  const { products } = useCatalog();
  const { currency } = useCurrency();
  const { settings } = useSettings();
  const freeShippingThreshold = settings.freeShippingThresholdNGN;

  const lines = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });

  const subtotal = lines.reduce((sum, l) => sum + variantPrice(l.product, l.size) * l.qty, 0);
  const toFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progress = freeShippingThreshold > 0 ? Math.min(1, subtotal / freeShippingThreshold) : 1;
  const stockIssues = cartHasStockIssues(items, products);

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
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              ({count} {count === 1 ? "item" : "items"})
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-muted">
              <ShoppingBagIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-display text-lg">Your bag is empty</p>
              <p className="text-sm text-muted-foreground">
                Beautiful things are waiting on the other side.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              render={<Link href="/shop" />}
            >
              Browse the collection
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b px-5 py-3">
              <p className="mb-2 text-[0.75rem] text-muted-foreground">
                {toFreeShipping > 0 ? (
                  <>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatPrice(toFreeShipping, currency)}
                    </span>{" "}
                    away from complimentary delivery
                  </>
                ) : (
                  "You've unlocked complimentary delivery"
                )}
              </p>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-bronze"
                  initial={false}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.6, ease: [...EASE_OUT] }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {items.filter((item) => !products.some((product) => product.id === item.productId)).map((item) => <div key={`${item.productId}-${item.size}`} className="border-b py-4 text-sm"><p>This piece is no longer in the collection.</p><button type="button" className="underline" onClick={() => removeItem(item.productId, item.size)}>Remove unavailable piece</button></div>)}
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
                      <Image
                        src={line.product.images[0]}
                        unoptimized
                        alt={line.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
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
                          aria-label={`Remove ${line.product.name}`}
                          onClick={() => removeItem(line.productId, line.size)}
                          className="text-muted-foreground transition-all duration-150 ease-out hover:text-destructive active:scale-90"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-md border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQty(line.productId, line.size, line.qty - 1)}
                            className="grid size-7 place-items-center transition-all duration-150 ease-out hover:bg-muted active:scale-90"
                          >
                            <MinusIcon className="size-3.5" />
                          </button>
                          <span className="w-7 text-center text-[0.8125rem] tabular-nums">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={!canAddStock(items, line.product, 1, line.size)}
                            onClick={() => setQty(line.productId, line.size, line.qty + 1)}
                            className="grid size-7 place-items-center transition-all duration-150 ease-out hover:bg-muted active:scale-90"
                          >
                            <PlusIcon className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-medium tabular-nums">
                          {formatPrice(variantPrice(line.product, line.size) * line.qty, currency)}
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
              {stockIssues ? <><p role="status" className="text-sm text-muted-foreground">Remove unavailable pieces or adjust quantities before checkout.</p><Button size="lg" disabled className="w-full">Update your bag to continue</Button></> : <Button
                size="lg"
                className="w-full transition-transform duration-150 ease-out active:scale-[0.98]"
                onClick={() => setOpen(false)}
                render={<Link href="/checkout" />}
              >
                Checkout — {formatPrice(subtotal, currency)}
              </Button>}
              <Separator className="my-1" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="link-underline mx-auto w-fit text-[0.8125rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
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
