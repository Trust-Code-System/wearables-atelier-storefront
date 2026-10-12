import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { brandContact } from "@/lib/brand-contact";

type CustomerInformationPageProps = {
  eyebrow: string;
  title: string;
  accent: string;
  introduction: string;
  updated?: string;
  children: React.ReactNode;
};

export function CustomerInformationPage({
  eyebrow,
  title,
  accent,
  introduction,
  updated,
  children,
}: CustomerInformationPageProps) {
  return (
    <article className="information-page">
      <header className="information-hero">
        <p className="store-label">{eyebrow}</p>
        <h1>
          {title}
          <br />
          <em>{accent}</em>
        </h1>
        <p>{introduction}</p>
        {updated ? <span>Last updated {updated}</span> : null}
      </header>

      <div className="information-layout">
        <aside className="information-help">
          <p className="store-label">Still wondering?</p>
          <h2>Talk to a real person.</h2>
          <p>For an order, a fit question, or anything else, the atelier is a conversation away.</p>
          <a href={brandContact.whatsapp} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={17} aria-hidden />
            Chat on WhatsApp
            <ArrowUpRight size={16} aria-hidden />
          </a>
          <Link href="/contact">More ways to reach us</Link>
        </aside>

        <div className="information-content">{children}</div>
      </div>
    </article>
  );
}
