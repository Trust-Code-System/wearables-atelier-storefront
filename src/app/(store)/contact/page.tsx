import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, MapPin, MessageCircle } from "lucide-react";
import { brandContact } from "@/lib/brand-contact";

export const metadata: Metadata = { title: "Contact the atelier" };
export default function ContactPage() {
  return <section className="store-section customer-page contact-page"><div className="contact-copy"><div className="customer-page-heading"><p className="store-label">A conversation away</p><h1>Let’s find<br /><em>your moment.</em></h1><p>A question about a piece, help with your fit, or something made just for you. Talk to the atelier.</p></div><a className="store-button contact-primary" href={brandContact.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} aria-hidden />Chat on WhatsApp <ArrowUpRight size={18} aria-hidden /></a><a className="contact-location" href={brandContact.maps} target="_blank" rel="noopener noreferrer"><MapPin size={20} aria-hidden /><span>Find the atelier<small>{brandContact.address}</small></span><ArrowUpRight size={18} aria-hidden /></a><nav className="contact-socials" aria-label="Social media">{(["instagram", "tiktok", "youtube"] as const).map((name) => <a key={name} href={brandContact[name]} target="_blank" rel="noopener noreferrer">{name === "tiktok" ? "TikTok" : name === "youtube" ? "YouTube" : "Instagram"}<ArrowUpRight size={15} aria-hidden /></a>)}</nav></div><div className="contact-image"><Image src="/collection/look-06.png" alt="Rust and teal Ashabi occasionwear" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" /></div></section>;
}
