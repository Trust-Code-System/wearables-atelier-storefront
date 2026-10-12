"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, MinusIcon, PlusIcon, RulerIcon, ShoppingBagIcon } from "lucide-react";
import { toast } from "sonner";
import { useCart, useCatalog } from "@/lib/store";
import { EASE_OUT } from "@/components/motion";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/shop/product-card";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function ProductClient({ slug }: { slug: string }) {
  const { products, getProduct } = useCatalog();
  const { addItem, setOpen } = useCart();

  const product = getProduct(slug);
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<number | null>(null);
  const [qty, setQtyLocal] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-32 text-center">
        <p className="font-display text-2xl">We couldn&apos;t find that piece</p>
        <p className="text-sm text-muted-foreground">
          It may have sold out or moved. The collection is always changing.
        </p>
        <Button render={<Link href="/shop" />}>Back to the collection</Button>
      </div>
    );
  }

  const oneSize = product.sizes.length === 0;
  const soldOut = product.stock <= 0;

  const handleAdd = () => {
    if (!oneSize && size === null) {
      setSizeError(true);
      toast.error("Choose a size first", {
        description: "This piece comes in numbered sizes — pick yours above.",
      });
      return;
    }
    addItem(product.id, oneSize ? null : size, qty);
    setAdded(true);
    setOpen(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="store-product-page">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[0.75rem] text-muted-foreground">
        <Link href="/" className="transition-colors duration-150 hover:text-foreground">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop" className="transition-colors duration-150 hover:text-foreground">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/shop?category=${product.category}`}
          className="capitalize transition-colors duration-150 hover:text-foreground"
        >
          {product.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="product-detail-gallery flex flex-col gap-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={imageIndex}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [...EASE_OUT] }}
              >
                <Image
                  src={product.images[imageIndex]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {product.badge ? (
              <Badge variant="secondary" className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm capitalize">
                {product.badge}
              </Badge>
            ) : null}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={imageIndex === i}
                  className={cn(
                    "relative aspect-[4/5] w-20 overflow-hidden rounded-md bg-muted transition-all duration-200 ease-out active:scale-95",
                    imageIndex === i
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                      : "opacity-60 hover:opacity-100",
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="product-detail-info flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="eyebrow capitalize">{product.category}</p>
            <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight tracking-tight">
              {product.name}
            </h1>
            <Price
              amountNGN={product.priceNGN}
              compareAtNGN={product.compareAtNGN}
              className="text-lg"
            />
          </div>

          <p className="max-w-lg text-[0.9375rem] leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <Separator />

          {/* Size selector */}
          {!oneSize ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className={cn("text-sm font-medium", sizeError && "text-destructive")}>
                  Select size
                </p>
                <button
                  type="button"
                  onClick={() =>
                    toast("Size guide", {
                      description:
                        "Our sizes are numbered: 6 = XS, 8 = S, 10 = M, 12 = L, 14 = XL, 16 = XXL. True to fit — take your usual.",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  <RulerIcon className="size-3.5" />
                  Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSize(s);
                      setSizeError(false);
                    }}
                    aria-pressed={size === s}
                    className={cn(
                      "grid size-11 place-items-center rounded-md border text-sm tabular-nums transition-all duration-150 ease-out active:scale-95",
                      size === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-foreground/50",
                      sizeError && size === null && "border-destructive/50",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-[0.75rem] text-muted-foreground">
                Numbered sizing — 6 (XS) through 16 (XXL). True to fit.
              </p>
            </div>
          ) : (
            <p className="text-[0.8125rem] text-muted-foreground">
              One size — adjustable fit.
            </p>
          )}

          {/* Qty + Add */}
          <div className="flex items-stretch gap-3">
            <div className="inline-flex items-center rounded-lg border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQtyLocal((q) => Math.max(1, q - 1))}
                className="grid h-full w-10 place-items-center transition-all duration-150 ease-out hover:bg-muted active:scale-90"
              >
                <MinusIcon className="size-4" />
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQtyLocal((q) => Math.min(product.stock || 10, q + 1))}
                className="grid h-full w-10 place-items-center transition-all duration-150 ease-out hover:bg-muted active:scale-90"
              >
                <PlusIcon className="size-4" />
              </button>
            </div>

            <motion.div
              className="flex-1"
              animate={added ? { scale: [1, 0.97, 1] } : {}}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Button
                size="lg"
                disabled={soldOut}
                onClick={handleAdd}
                className="h-12 w-full text-[0.9375rem] transition-all duration-150 ease-out active:scale-[0.98]"
              >
                {added ? (
                  <CheckIcon data-icon="inline-start" />
                ) : (
                  <ShoppingBagIcon data-icon="inline-start" />
                )}
                {soldOut ? "Sold out" : added ? "Added to bag" : "Add to bag"}
              </Button>
            </motion.div>
          </div>

          <WishlistButton id={product.id} name={product.name} showLabel />
          {product.stock > 0 && product.stock <= 8 && (
            <p className="text-[0.75rem] font-medium text-bronze">
              {product.stock} pieces available.
            </p>
          )}

          {/* Accordions */}
          <Accordion defaultValue={["details"]} multiple className="mt-2">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm font-medium">Details & care</AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-2 pb-2 text-[0.8125rem] text-muted-foreground">
                  {product.details.map((d) => (
                    <li key={d} className="flex gap-2.5">
                      <span className="mt-[0.5em] size-1 shrink-0 rounded-full bg-bronze" />
                      {d}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-sm font-medium">Shipping & delivery</AccordionTrigger>
              <AccordionContent>
                <p className="pb-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  Dispatched within 48 hours. Lagos same-day delivery available;
                  nationwide 2–4 business days. Complimentary delivery on orders
                  over ₦150,000.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger className="text-sm font-medium">Exchanges & returns</AccordionTrigger>
              <AccordionContent>
                <p className="pb-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  Exchange sizes within 7 days, unworn with tags attached. For
                  hygiene reasons, earrings are final sale unless faulty.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="product-related">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl tracking-tight">You may also like</h2>
            <Link
              href={`/shop?category=${product.category}`}
              className="link-underline text-sm font-medium"
            >
              More {product.category}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
