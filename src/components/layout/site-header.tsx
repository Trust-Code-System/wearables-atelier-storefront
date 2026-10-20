"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Menu, ShoppingBag, Search, ArrowUpRight, Truck, Heart, UserRound } from "lucide-react";
import { useCart, useCatalog, useCurrency } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { Tip, WarmGroup } from "@/components/micro/warm-tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=clothing", label: "Clothing" },
  { href: "/shop?category=jewelry", label: "Jewelry" },
];

function CurrencyControl() {
  const { currency, setCurrency } = useCurrency();
  return <Select items={[{ value: "NGN", label: "NGN ₦" }, { value: "USD", label: "USD $" }]} value={currency} onValueChange={(value) => { if (value === "NGN" || value === "USD") setCurrency(value); }}><SelectTrigger className="store-currency" aria-label="Display currency"><SelectValue /></SelectTrigger><SelectContent className="store-select-menu" align="end" alignItemWithTrigger={false}><SelectItem value="NGN">NGN ₦</SelectItem><SelectItem value="USD">USD $</SelectItem></SelectContent></Select>;
}

function NavigationLinks({ activeHref }: { activeHref?: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();
  // Rubber Segment: one pill glides to the hovered link, and rests on the
  // active page when the pointer leaves. Shared layoutId keeps it a single
  // element travelling between links on a spring.
  const target = hovered ?? activeHref ?? null;
  return (
    <nav className="store-desktop-nav" aria-label="Main navigation" onMouseLeave={() => setHovered(null)}>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={activeHref === item.href ? "is-active" : ""}
          aria-current={activeHref === item.href ? "page" : undefined}
          onMouseEnter={() => setHovered(item.href)}
          onFocus={() => setHovered(item.href)}
          onBlur={() => setHovered(null)}
        >
          {target === item.href && (
            <motion.span
              layoutId="store-nav-glide"
              className="store-nav-glide"
              aria-hidden
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative z-[1]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function DesktopNavigation() {
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category");
  const activeHref = pathname === "/shop" ? (category === "clothing" || category === "jewelry" ? `/shop?category=${category}` : "/shop") : undefined;
  return <NavigationLinks activeHref={activeHref} />;
}

export function SiteHeader() {
  const { count, isOpen: bagOpen, setOpen } = useCart();
  const { products, loading, error, refresh } = useCatalog();
  const { currency } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [headerHidden, setHeaderHidden] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const matching = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8);

  useEffect(() => {
    // Accumulate a little travel before reacting, so trackpads don't flicker the bar.
    let anchor = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
      if (y <= 80) {
        setHeaderHidden(false);
        anchor = y;
      } else if (Math.abs(y - anchor) >= 12) {
        // Hide while moving down the page; reveal when returning upward.
        setHeaderHidden(y > anchor);
        anchor = y;
      }
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); setSearchOpen((open) => !open); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="store-header" data-hidden={headerHidden && !menuOpen && !searchOpen && !bagOpen} onFocusCapture={() => setHeaderHidden(false)}>
      <div className="store-announcement"><span className="store-announcement-brand"><span className="store-announcement-dot" />Culture. Luxury. Elegance.</span><span className="store-announcement-delivery"><Truck size={13} aria-hidden />Delivery options at checkout</span></div>
      <div className="store-header-row">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger render={<button className="store-icon-button store-mobile-menu" aria-label="Open menu" />}><Menu size={21} aria-hidden /></SheetTrigger>
          <SheetContent side="left" className="store-menu-panel w-[min(380px,90vw)]" overlayClassName="store-sheet-backdrop" data-lenis-prevent>
            <SheetHeader><SheetTitle className="store-label">Wearables Atelier</SheetTitle></SheetHeader>
            <nav aria-label="Mobile navigation" className="store-mobile-nav">{NAV.map((item, i) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}><small>0{i + 1}</small>{item.label}<ArrowUpRight size={23} aria-hidden /></Link>)}<Link href="/#craft" onClick={() => setMenuOpen(false)}><small>04</small>Our point of view<ArrowUpRight size={23} aria-hidden /></Link></nav>
            <nav className="store-mobile-personal" aria-label="Your atelier"><Link href="/wishlist" onClick={() => setMenuOpen(false)}><Heart size={18} aria-hidden />Wishlist</Link><Link href="/account" onClick={() => setMenuOpen(false)}><UserRound size={18} aria-hidden />Account</Link></nav>
            <div className="mt-auto p-6"><CurrencyControl /></div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="store-wordmark" aria-label="Wearables Atelier home"><Image src="/brand/wearables-by-ashabi.png" alt="Wearables by Ashabi" width={844} height={351} priority className="store-brand-logo" sizes="(max-width: 767px) 120px, 156px" /></Link>
        <Suspense fallback={<NavigationLinks />}><DesktopNavigation /></Suspense>
        <WarmGroup>
          <div className="store-header-actions">
            <span className="store-desktop-currency"><CurrencyControl /></span>
            <Tip label="Wishlist">
              <Link href="/wishlist" className="store-icon-button store-personal-link" aria-label="Wishlist"><Heart size={18} strokeWidth={1.7} aria-hidden /></Link>
            </Tip>
            <Tip label="Your account">
              <Link href="/account" className="store-icon-button store-personal-link store-account-link" aria-label="Your account"><UserRound size={18} strokeWidth={1.7} aria-hidden /></Link>
            </Tip>
            <Tip label="Search ⌘K">
              <button className="store-icon-button store-search-trigger" aria-label="Search the collection" onClick={() => setSearchOpen(true)}><Search size={18} strokeWidth={1.7} aria-hidden /><span>Search</span></button>
            </Tip>
            <button className="store-bag-button" aria-label={`Open shopping bag, ${count} ${count === 1 ? "item" : "items"}`} onClick={() => setOpen(true)}><ShoppingBag size={18} strokeWidth={1.7} aria-hidden /><span className="store-bag-text">Bag</span><motion.span key={count} className="store-bag-count" initial={reduceMotion ? false : { scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>{count}</motion.span></button>
          </div>
        </WarmGroup>
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="store-search-panel sm:max-w-xl" overlayClassName="store-search-backdrop" data-lenis-prevent>
          <DialogHeader><DialogTitle>Find your next favourite.</DialogTitle></DialogHeader>
          <label className="sr-only" htmlFor="store-search">Search products</label>
          <input id="store-search" className="store-search-input" placeholder="Search clothing, jewelry, a favourite piece…" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" />
          <p className="store-label" aria-live="polite">{loading ? "Loading the collection…" : error ? "Collection unavailable" : query.trim() ? `${matching.length === 8 ? "Showing up to 8" : matching.length} matching ${matching.length === 1 ? "piece" : "pieces"}` : "Explore the collection"}</p>
          <div className="store-search-results">{error ? <div className="catalog-inline-state" role="status"><p>We couldn’t load the collection. Please try again.</p><button type="button" className="store-text-link" disabled={loading} onClick={refresh}>{loading ? "Retrying…" : "Try again"}<ArrowUpRight size={15} aria-hidden /></button></div> : loading ? <p role="status" className="py-8 text-sm text-muted-foreground">Finding your next favourite…</p> : matching.length ? matching.map((product) => <Link key={product.id} href={`/product/${product.slug}`} onClick={() => setSearchOpen(false)}>{product.images[0] && <span className="relative size-12 shrink-0"><Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" unoptimized /></span>}<span className="flex-1">{product.name}<small>{product.category}</small></span><span>{formatPrice(product.priceNGN, currency)}</span><ArrowUpRight size={15} aria-hidden /></Link>) : <p className="py-8 text-sm text-muted-foreground">No pieces found. Try “gele”, “crystal”, or “jewelry”.</p>}</div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
