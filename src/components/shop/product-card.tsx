"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/store";
import { Price } from "@/components/price";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { canAddStock, stockCount, stockLabel } from "@/lib/stock";

const LABELS = { new: "Just arrived", bestseller: "Most loved", limited: "Limited edition" };

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { items, addItem, setOpen } = useCart();
  const soldOut = stockCount(product) === 0;
  const oneSize = product.sizes.length === 0;
  const image = product.images[0];
  return (
    <article className="store-product-card" data-unavailable={soldOut || undefined}>
      <div className="store-product-image">
        <Link href={`/product/${product.slug}`} className="store-product-image-link" aria-label={`View ${product.name}`}>
          {image ? <Image src={image} alt={product.name} fill priority={priority} sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 50vw" className="product-primary-image" unoptimized /> : <span className="product-image-placeholder">Wearables Atelier</span>}
          {product.images[1] && <Image src={product.images[1]} alt="" fill sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 50vw" className="product-secondary-image" unoptimized />}
        </Link>
        {!soldOut && product.badge && <span className="store-product-badge">{LABELS[product.badge]}</span>}
        {soldOut && <span className="product-unavailable-overlay">Unavailable at the moment</span>}
        <WishlistButton id={product.id} name={product.name} />
        {!soldOut && (oneSize ? <button type="button" className="product-quick-action" disabled={!canAddStock(items, product)} aria-label={`Add ${product.name} to bag`} onClick={() => { addItem(product.id, null); setOpen(true); }}><Plus size={18} aria-hidden /></button> : <Link href={`/product/${product.slug}`} className="product-quick-action" aria-label={`Choose size for ${product.name}`}><ArrowUpRight size={18} aria-hidden /></Link>)}
      </div>
      <div className="store-product-info">
        <p className="store-product-category">{product.category === "clothing" ? "Ready to wear" : "Jewelry"}</p>
        <h3><Link href={`/product/${product.slug}`}>{product.name}</Link></h3>
        <span>{product.variants && new Set(product.variants.map((variant) => variant.priceNGN)).size > 1 && <span className="text-xs">From </span>}<Price amountNGN={product.priceNGN} compareAtNGN={soldOut ? undefined : product.compareAtNGN} className="store-product-price" /></span>
        <p className="product-stock" data-unavailable={soldOut || undefined}>{stockLabel(product)}</p>
      </div>
    </article>
  );
}
