import type { Metadata } from "next";
import type { Product } from "./types";
import { brandContact } from "./brand-contact";

export const SITE_URL = "https://wearablesbyashabi.store";
export const SITE_NAME = "Wearables by Ashabi";
export const SITE_DESCRIPTION =
  "Discover Nigerian occasionwear, Iro & Buba and statement jewellery from Wearables by Ashabi in Lagos. Explore clothing, necklaces, earrings and bracelets.";
export const SOCIAL_IMAGE = `${SITE_URL}/collection/look-02.png`;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(path),
      images: [{ url: SOCIAL_IMAGE, alt: "Wearables by Ashabi Nigerian occasionwear" }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: [SOCIAL_IMAGE] },
  };
}

// Catalog descriptions are untrusted text, including inside a script element.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function brandSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: "Wearables Atelier",
        url: SITE_URL,
        logo: absoluteUrl("/brand/wearables-by-ashabi.png"),
        sameAs: [brandContact.instagram, brandContact.tiktok, brandContact.youtube],
        telephone: brandContact.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: "D4 Shitta Road, Surulere",
          addressLocality: "Lagos",
          addressCountry: "NG",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: "Wearables Atelier",
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

export function productSchema(product: Product) {
  const url = absoluteUrl(`/product/${encodeURIComponent(product.slug)}`);
  const variants = product.variants ?? [];
  const prices = variants.length ? variants.map((variant) => variant.priceNGN) : [product.priceNGN];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        url,
        name: product.name,
        description: product.description,
        image: product.images,
        sku: product.id,
        category: product.category === "clothing" ? "Clothing" : "Jewellery",
        brand: { "@type": "Brand", name: SITE_NAME },
        offers: {
          "@type": "AggregateOffer",
          url,
          priceCurrency: "NGN",
          lowPrice: Math.min(...prices).toFixed(2),
          highPrice: Math.max(...prices).toFixed(2),
          offerCount: variants.length || 1,
          availability: `https://schema.org/${product.stock > 0 ? "InStock" : "OutOfStock"}`,
          seller: { "@id": `${SITE_URL}/#organization` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop") },
          { "@type": "ListItem", position: 3, name: product.name, item: url },
        ],
      },
    ],
  };
}
