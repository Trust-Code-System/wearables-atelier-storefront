"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCatalog, useSettings } from "@/lib/store";
import { ProductCard } from "@/components/shop/product-card";
import { Magnetic } from "@/components/micro/magnetic";
import { BlurText } from "@/components/micro/blur-text";
import { BrandIntro } from "@/components/micro/brand-intro";
import { formatPrice } from "@/lib/format";
import type { ReactNode } from "react";
import { brandContact } from "@/lib/brand-contact";

function EditorialReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ y: reduced ? 0 : 20 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export default function HomePage() {
  const { products } = useCatalog();
  const { settings } = useSettings();
  const featured = [...products].sort((a, b) => Number(b.badge === "bestseller") - Number(a.badge === "bestseller")).slice(0, 4);
  const jewelry = products.filter((product) => product.category === "jewelry").slice(0, 2);

  return (
    <>
      <BrandIntro />
      <section className="campaign-hero" aria-labelledby="campaign-title">
        <div className="campaign-image">
          <Image src="/collection/look-02.png" alt="Wearables by Ashabi embroidered occasionwear styled with a gold gele and shoulder sash" fill priority sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
        </div>
        <div className="campaign-shade" />
        <div className="campaign-topline"><span>The Ashabi edit</span><span>Culture · Luxury · Elegance</span></div>
        <div className="campaign-copy">
          <p className="store-label">From Lagos. For your moment.</p>
          <h1 id="campaign-title"><BlurText text="Wear it" /><br /><BlurText text="your way." className="campaign-title-italic" delay={0.12} /></h1>
          <p className="campaign-description">Rich colour. Statement silhouettes.<br />Nigerian elegance, made personal.</p>
          <Magnetic strength={0.22}><Link href="/shop" className="store-button store-button-light">Discover the collection <ArrowUpRight size={17} aria-hidden /></Link></Magnetic>
        </div>
        <a href="#bestsellers" className="campaign-scroll" aria-label="Explore the collection below"><ArrowDown size={18} aria-hidden /><span>There’s more to discover</span></a>
        <span className="campaign-index" aria-hidden>01 — 26</span>
      </section>

      <nav className="collection-navigation" aria-label="Explore collections">
        <span className="store-label">Find your next favourite</span>
        <Link href="/shop?sort=newest">New arrivals <ArrowUpRight size={16} aria-hidden /></Link>
        <Link href="/shop?category=clothing">Clothing <ArrowUpRight size={16} aria-hidden /></Link>
        <Link href="/shop?category=jewelry">Jewelry <ArrowUpRight size={16} aria-hidden /></Link>
      </nav>

      <section id="bestsellers" className="store-section">
        <EditorialReveal className="store-section-heading">
          <div><p className="store-label">The Ashabi collection</p><h2>Made for your moment.</h2></div>
          <Link href="/shop" className="store-text-link">Shop all pieces <ArrowUpRight size={17} aria-hidden /></Link>
        </EditorialReveal>
        <div className="home-product-grid">
          {featured.map((product) => <EditorialReveal key={product.id}><ProductCard product={product} /></EditorialReveal>)}
        </div>
      </section>

      <section className="collection-editorial" aria-label="Our two collections">
        <EditorialReveal className="collection-clothing">
          <Link href="/shop?category=clothing" className="collection-image-link">
            <Image src="/collection/look-01.png" alt="Lime green Iro and Buba styled with a matching gele and embroidered sash" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
            <span className="collection-image-caption">Ready to wear</span>
          </Link>
          <div className="collection-caption"><div><p className="store-label">Make room in your wardrobe</p><h2>Life, well dressed.</h2></div><Magnetic strength={0.38}><Link href="/shop?category=clothing" className="store-round-link" aria-label="Shop clothing"><ArrowUpRight size={25} aria-hidden /></Link></Magnetic></div>
        </EditorialReveal>
        <EditorialReveal className="collection-jewelry">
          <Link href="/shop?category=jewelry" className="collection-image-link">
            <Image src="/collection/look-03.png" alt="Wearables by Ashabi look styled with a statement necklace, earrings and teal gele" fill sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" />
            <span className="collection-image-caption">The finishing touch</span>
          </Link>
          <div className="collection-caption"><div><p className="store-label">A little something, every day</p><h2>All in the details.</h2></div><Magnetic strength={0.38}><Link href="/shop?category=jewelry" className="store-round-link" aria-label="Shop jewelry"><ArrowUpRight size={25} aria-hidden /></Link></Magnetic></div>
        </EditorialReveal>
      </section>

      <section className="jewelry-edit store-section">
        <EditorialReveal className="jewelry-edit-copy">
          <p className="store-label">The jewelry edit</p>
          <h2>Small details.<br /><em>Big feeling.</em></h2>
          <p>Statement necklaces. Coordinated earrings. The finishing touches that bring your occasion look together.</p>
          <Link href="/shop?category=jewelry" className="store-text-link">Explore jewelry <ArrowRight size={17} aria-hidden /></Link>
        </EditorialReveal>
        <div className="jewelry-product-grid">{jewelry.map((product) => <EditorialReveal key={product.id}><ProductCard product={product} /></EditorialReveal>)}</div>
      </section>

      <section id="craft" className="atelier-story">
        <div className="atelier-portrait"><Image src="/collection/look-10.png" alt="Wearables by Ashabi rust and teal occasion look with matching gele" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" /></div>
        <EditorialReveal className="atelier-story-copy">
          <p className="store-label">The Wearables point of view</p>
          <h2>Style is personal.<br /><em>Keep it that way.</em></h2>
          <p>We believe the best things in your wardrobe feel like you. The right cut. An unexpected detail. A piece of jewelry that becomes part of your story.</p>
          <p>Iro & Buba, occasionwear and statement jewellery, brought together with a little more intention. From Lagos, for wherever the day takes you.</p>
          <Link href="/shop" className="store-text-link">Find your everyday <ArrowUpRight size={17} aria-hidden /></Link>
          <span className="atelier-signature">Wearables Atelier</span>
        </EditorialReveal>
      </section>

      <div className="store-service-strip">
        <div><span>01</span><p>Delivered to your door<small>Complimentary standard delivery over {formatPrice(settings.freeShippingThresholdNGN, "NGN")}</small></p></div>
        <div><span>02</span><p>Find your fit<small>Numbered clothing sizes. Clear product details.</small></p></div>
        <div><span>03</span><p>Here to help<small><a href={brandContact.whatsapp} target="_blank" rel="noopener noreferrer">Talk to the atelier <ArrowUpRight size={12} aria-hidden /></a></small></p></div>
      </div>
    </>
  );
}
