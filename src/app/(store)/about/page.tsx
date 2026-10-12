import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About the atelier",
  description: "Meet Wearables by Ashabi: Nigerian occasionwear and statement jewelry, brought together in Lagos.",
};

export default function AboutPage() {
  return (
    <article className="about-page">
      <header className="about-hero">
        <div className="about-hero-copy">
          <p className="store-label">The Wearables point of view</p>
          <h1>
            Made in Lagos.
            <br />
            <em>Worn your way.</em>
          </h1>
          <p>
            Wearables by Ashabi brings Nigerian occasionwear and statement jewelry together
            with one belief: the best-dressed version of you should still feel like you.
          </p>
        </div>
        <div className="about-hero-image">
          <Image
            src="/collection/look-10.png"
            alt="Wearables by Ashabi rust and teal occasionwear with a coordinating gele"
            fill
            priority
            sizes="(min-width: 768px) 52vw, 100vw"
            className="object-cover"
          />
        </div>
      </header>

      <section className="about-statement">
        <p className="store-label">Our approach</p>
        <div>
          <h2>Culture, luxury and elegance—<em>made personal.</em></h2>
          <p>
            We look to rich colour, expressive silhouettes and the finishing details that
            turn getting dressed into a moment. From Iro &amp; Buba to coordinated jewelry,
            every edit is designed to help the whole look feel considered.
          </p>
          <p>
            This is style with room for personality: pieces for celebrations, meaningful
            gatherings and the days when you simply want to show up beautifully.
          </p>
        </div>
      </section>

      <section className="about-details">
        <div className="about-detail-image">
          <Image
            src="/collection/look-03.png"
            alt="Statement necklace and earrings styled with teal occasionwear"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="about-detail-copy">
          <p className="store-label">More than the outfit</p>
          <h2>The detail is part of the story.</h2>
          <p>
            Clothing and jewelry live side by side at the atelier because a look is rarely
            about one piece. It is the cut, the colour, the way the accessories meet the
            moment—and the confidence you bring to all of it.
          </p>
          <div className="about-actions">
            <Link href="/shop" className="store-button">
              Explore the collection <ArrowUpRight size={17} aria-hidden />
            </Link>
            <Link href="/contact" className="store-text-link">
              Visit or contact the atelier <ArrowUpRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
