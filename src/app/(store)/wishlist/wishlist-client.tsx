"use client";

import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { useCatalog, useWishlist } from "@/lib/store";
import { ProductCard } from "@/components/shop/product-card";

export function WishlistClient() {
  const { products } = useCatalog();
  const { ids } = useWishlist();
  const saved = products.filter((product) => ids.includes(product.id));
  return <section className="store-section customer-page"><div className="customer-page-heading"><p className="store-label">Your personal edit</p><h1>Keep a little<br /><em>something you love.</em></h1><p>Your favourite pieces, saved for another look. This wishlist stays in this browser.</p></div>{saved.length ? <><div className="wishlist-toolbar"><p>{saved.length} {saved.length === 1 ? "piece" : "pieces"} saved</p><Link href="/shop" className="store-text-link">Keep exploring <ArrowUpRight size={16} aria-hidden /></Link></div><div className="home-product-grid">{saved.map((product) => <ProductCard key={product.id} product={product} />)}</div></> : <div className="customer-empty-state"><Heart size={30} strokeWidth={1.3} aria-hidden /><h2>Your next favourite is out there.</h2><p>Tap the heart on a piece to make it part of your edit.</p><Link href="/shop" className="store-button">Explore the collection <ArrowUpRight size={18} aria-hidden /></Link></div>}</section>;
}
