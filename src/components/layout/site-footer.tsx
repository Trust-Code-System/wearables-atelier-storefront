"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { brandContact } from "@/lib/brand-contact";

export function SiteFooter() {
  return (
    <footer className="store-footer atelier-footer">
      <div className="atelier-footer-invitation">
        <div><p className="store-label"><span />A little more you.</p><h2>You bring the occasion.<br /><em>We’ll bring the style.</em></h2></div>
        <div className="atelier-footer-contact"><p>Finding your fit. Finishing your look.<br />Let’s find something that feels like you.</p><a href={brandContact.whatsapp} target="_blank" rel="noopener noreferrer">Talk to the atelier <ArrowUpRight size={19} aria-hidden /></a></div>
      </div>
      <div className="atelier-footer-directory">
        <div className="atelier-footer-brand"><Link href="/" aria-label="Wearables Atelier home"><Image src="/brand/wearables-by-ashabi.png" alt="Wearables by Ashabi" width={844} height={351} sizes="240px" /></Link><p>Culture. Luxury. Elegance.<br />From Lagos, for your moment.</p><span className="atelier-footer-origin"><span />Made personal. Worn with confidence.</span></div>
        <nav aria-label="Footer shopping links"><p className="store-label">The collection</p><Link href="/shop">Shop all pieces</Link><Link href="/shop?sort=newest">New arrivals</Link><Link href="/shop?category=clothing">Clothing</Link><Link href="/shop?category=jewelry">Jewelry</Link></nav>
        <nav aria-label="Footer atelier links"><p className="store-label">The atelier</p><Link href="/#craft">Our point of view</Link><Link href="/contact">Contact & assistance</Link><Link href="/wishlist">Your wishlist</Link><Link href="/account">Your account</Link></nav>
        <button type="button" className="atelier-footer-to-top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })} aria-label="Back to top"><ArrowUp size={20} aria-hidden /><span>Back to top</span></button>
      </div>
      <div className="atelier-footer-connect"><nav aria-label="Social media"><a href={brandContact.instagram} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={14} aria-hidden /></a><a href={brandContact.tiktok} target="_blank" rel="noopener noreferrer">TikTok <ArrowUpRight size={14} aria-hidden /></a><a href={brandContact.youtube} target="_blank" rel="noopener noreferrer">YouTube <ArrowUpRight size={14} aria-hidden /></a><a href={brandContact.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={14} aria-hidden /></a></nav><a href={brandContact.maps} target="_blank" rel="noopener noreferrer">{brandContact.address} <ArrowUpRight size={14} aria-hidden /></a></div>
      <div className="atelier-footer-bottom"><p>© {new Date().getFullYear()} Wearables Atelier</p><span>Clothing & jewelry, with intention.</span></div>
    </footer>
  );
}
