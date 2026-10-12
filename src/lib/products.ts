import type { Product } from "@/lib/types";

/** Build an Unsplash CDN URL (IDs verified live) */
const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export const CLOTHING_SIZES = [6, 8, 10, 12, 14, 16];

export const HERO_IMAGE = "/collection/look-02.png";
export const COLLECTION_CLOTHING_IMAGE = "/collection/look-01.png";
export const COLLECTION_JEWELRY_IMAGE = "/collection/look-03.png";
export const EDITORIAL_IMAGE = "/collection/look-10.png";
export const ATELIER_IMAGE = "/collection/look-04.png";
export const SPOTLIGHT_IMAGE = "/collection/look-05.png";

const legacySeedProducts: Product[] = [
  {
    id: "p-ada-slip-dress",
    slug: "ada-silk-slip-dress",
    name: "Ada Silk Slip Dress",
    category: "clothing",
    priceNGN: 185000,
    compareAtNGN: 220000,
    description:
      "A bias-cut slip in sandwashed silk that moves the way you do. Cut on the bias so it skims rather than clings, finished with hand-rolled edges.",
    details: [
      "100% sandwashed mulberry silk, 19 momme",
      "Bias cut, adjustable straps",
      "Hand-rolled hem",
      "Dry clean only",
    ],
    images: [u("1595777457583-95e059d581b8")],
    sizes: [6, 8, 10, 12, 14, 16],
    stock: 14,
    badge: "bestseller",
    createdAt: "2026-08-02",
  },
  {
    id: "p-iyoba-wrap-gown",
    slug: "iyoba-wrap-gown",
    name: "Iyoba Wrap Gown",
    category: "clothing",
    priceNGN: 210000,
    description:
      "Our signature wrap silhouette in fluid crepe. Ties at the waist, falls to the ankle, and works from ceremony to dinner without changing a thing.",
    details: [
      "Fluid matte crepe",
      "True wrap closure with interior tie",
      "Ankle length",
      "Made in Lagos",
    ],
    images: [u("1539008835657-9e8e9680c956"), u("1496747611176-843222e1e57c")],
    sizes: [6, 8, 10, 12, 14, 16],
    stock: 9,
    badge: "new",
    createdAt: "2026-09-21",
  },
  {
    id: "p-eko-poplin-shirt",
    slug: "eko-oversized-poplin-shirt",
    name: "Eko Oversized Poplin Shirt",
    category: "clothing",
    priceNGN: 95000,
    description:
      "Crisp organic cotton poplin with a dropped shoulder and a longer back hem. The shirt you reach for when you want to look considered without trying.",
    details: [
      "Organic cotton poplin",
      "Dropped shoulder, side vents",
      "Corozo buttons",
      "Machine washable",
    ],
    images: [u("1620799140408-edc6dcb6d633"), u("1618244972963-dbee1a7edc95")],
    sizes: [6, 8, 10, 12, 14, 16],
    stock: 22,
    createdAt: "2026-07-14",
  },
  {
    id: "p-zuri-boxy-tee",
    slug: "zuri-boxy-tee",
    name: "Zuri Boxy Tee",
    category: "clothing",
    priceNGN: 45000,
    description:
      "A heavyweight boxy tee with a structured drape. Garment-dyed, pre-shrunk, and cut slightly cropped to sit right at the waistband.",
    details: [
      "240gsm heavyweight cotton",
      "Garment-dyed, pre-shrunk",
      "Ribbed collar, side-seamed",
      "Machine washable",
    ],
    images: [u("1521572163474-6864f9cf17ab"), u("1576566588028-4147f3842f27")],
    sizes: [6, 8, 10, 12, 14, 16],
    stock: 40,
    badge: "bestseller",
    createdAt: "2026-06-01",
  },
  {
    id: "p-kano-structured-blazer",
    slug: "kano-structured-blazer",
    name: "Kano Structured Blazer",
    category: "clothing",
    priceNGN: 240000,
    description:
      "Half-canvassed tailoring with a soft shoulder — structure where you want it, ease everywhere else. Fully lined in cupro.",
    details: [
      "Wool-blend suiting",
      "Half-canvas construction",
      "Cupro lining",
      "Functional cuff buttons",
    ],
    images: [u("1591047139829-d91aecb6caea"), u("1581044777550-4cfa60707c03")],
    sizes: [6, 8, 10, 12, 14, 16],
    stock: 7,
    createdAt: "2026-08-19",
  },
  {
    id: "p-sade-column-skirt",
    slug: "sade-column-skirt",
    name: "Sade Column Skirt",
    category: "clothing",
    priceNGN: 120000,
    description:
      "A clean column silhouette in double-faced crepe with a back vent for movement. Sits high on the waist, lands mid-calf.",
    details: [
      "Double-faced crepe",
      "High-rise, concealed zip",
      "Back vent",
      "Dry clean recommended",
    ],
    images: [u("1529139574466-a303027c1d8b"), u("1509631179647-0177331693ae")],
    sizes: [6, 8, 10, 12, 14, 16],
    stock: 11,
    createdAt: "2026-07-28",
  },
  {
    id: "p-amara-linen-coord",
    slug: "amara-linen-co-ord",
    name: "Amara Linen Co-ord",
    category: "clothing",
    priceNGN: 175000,
    description:
      "A two-piece set in washed European linen — relaxed shirt, wide trouser. Wear together or split across your wardrobe.",
    details: [
      "100% washed European linen",
      "Relaxed shirt + wide-leg trouser",
      "Natural corozo buttons",
      "Softens with every wash",
    ],
    images: [u("1539533018447-63fcce2678e3"), u("1515886657613-9f3515b0c78f")],
    sizes: [6, 8, 10, 12, 14, 16],
    stock: 6,
    badge: "limited",
    createdAt: "2026-09-05",
  },
  {
    id: "p-oba-vermeil-hoops",
    slug: "oba-gold-vermeil-hoops",
    name: "Oba Gold Vermeil Hoops",
    category: "jewelry",
    priceNGN: 85000,
    description:
      "Chunky-but-light hoops in 18k gold vermeil over recycled sterling silver. Hollow-formed so they never pull on the lobe.",
    details: [
      "18k gold vermeil (2.5 microns)",
      "Recycled sterling silver core",
      "Hollow-formed, 8g per pair",
      "Hypoallergenic posts",
    ],
    images: [u("1611591437281-460bfbe1220a"), u("1599643478518-a784e5dc4c8f")],
    sizes: [],
    stock: 18,
    badge: "bestseller",
    createdAt: "2026-06-15",
  },
  {
    id: "p-nala-pendant-necklace",
    slug: "nala-pendant-necklace",
    name: "Nala Pendant Necklace",
    category: "jewelry",
    priceNGN: 120000,
    description:
      "A hand-cast pendant on a fine curb chain, finished with our maker's mark. Designed to sit just below the collarbone.",
    details: [
      "Hand-cast pendant, 18k gold vermeil",
      "45cm curb chain + 5cm extender",
      "Maker's mark engraving",
      "Tarnish-resistant finish",
    ],
    images: [u("1611652022419-a9419f74343d"), u("1602173574767-37ac01994b2a")],
    sizes: [],
    stock: 12,
    badge: "new",
    createdAt: "2026-09-28",
  },
  {
    id: "p-esosa-signet-ring",
    slug: "esosa-signet-ring",
    name: "Esosa Signet Ring",
    category: "jewelry",
    priceNGN: 95000,
    description:
      "A softened signet with a brushed face — substantial without shouting. Cast, filed, and finished by hand in our atelier.",
    details: [
      "18k gold vermeil over sterling silver",
      "Brushed face, polished band",
      "Hand-finished in Lagos",
      "Includes ring pouch",
    ],
    images: [u("1605100804763-247f67b3557e"), u("1573408301185-9146fe634ad0")],
    sizes: [],
    stock: 15,
    createdAt: "2026-07-30",
  },
  {
    id: "p-ivie-chain-bracelet",
    slug: "ivie-chain-bracelet",
    name: "Ivie Chain Bracelet",
    category: "jewelry",
    priceNGN: 65000,
    description:
      "A fluid curb-link bracelet that catches light with every gesture. Weighted to drape, not spin.",
    details: [
      "18k gold vermeil",
      "18cm + 2cm extender",
      "Lobster clasp",
      "Weighted drape links",
    ],
    images: [u("1610694955371-d4a3e0ce4b52"), u("1600003014755-ba31aa59c4b6")],
    sizes: [],
    stock: 20,
    createdAt: "2026-08-11",
  },
  {
    id: "p-uyi-pearl-earrings",
    slug: "uyi-pearl-drop-earrings",
    name: "Uyi Pearl Drop Earrings",
    category: "jewelry",
    priceNGN: 78000,
    description:
      "Baroque freshwater pearls suspended from vermeil hooks. Each pair is matched by hand — no two are identical, and that's the point.",
    details: [
      "Baroque freshwater pearls",
      "18k gold vermeil hooks",
      "Hand-matched pairs",
      "Approx. 28mm drop",
    ],
    images: [u("1617038220319-276d3cfab638"), u("1515562141207-7a88fb7ce338")],
    sizes: [],
    stock: 8,
    badge: "limited",
    createdAt: "2026-09-12",
  },
];

// Collection photographs recovered from the original Wearables Atelier site.
// Prices/stock remain the existing demo values; the names describe what is shown.
type BrandPatch = Pick<Product, "name" | "slug" | "description" | "details" | "images"> & Partial<Pick<Product, "sizes">>;
const clothingDetails = ["Occasionwear styled with coordinated accessories", "Contact the atelier for fabric, fit and availability", "Jewellery and bag shown are styling accessories"];
const jewelryDetails = ["Photographed as part of a styled Wearables by Ashabi look", "Clothing and headwrap are not included", "Contact the atelier for measurements, materials and availability"];

const brandPatches: Record<string, BrandPatch> = {
  "p-ada-slip-dress": {
    name: "Lime Iro & Buba Set", slug: "lime-iro-buba-set",
    description: "A vibrant lime blouse and wrapper with patterned detailing, styled with a coordinated gele and shoulder sash. An occasion look with a distinctly Nigerian point of view.",
    details: clothingDetails, images: ["/collection/look-01.png", "/collection/look-07.png"],
  },
  "p-iyoba-wrap-gown": {
    name: "Gold & Velvet Occasion Set", slug: "gold-velvet-occasion-set",
    description: "Deep brown occasionwear with gold embroidery, styled with a gold gele and a statement shoulder sash. Rich colour for celebrations that matter.",
    details: clothingDetails, images: ["/collection/look-02.png"],
  },
  "p-eko-poplin-shirt": {
    name: "Olive Iro & Buba Set", slug: "olive-iro-buba-set",
    description: "An olive blouse and wrapper with embroidered sleeves and a patterned green sash. A coordinated occasion look from the Ashabi collection.",
    details: clothingDetails, images: ["/collection/look-04.png"],
  },
  "p-zuri-boxy-tee": {
    name: "Ashabi Rust & Teal Set", slug: "ashabi-rust-teal-set",
    description: "Rust and teal meet in a statement blouse and wrapper, styled with a sculptural gele. Contrasting sleeves and coordinated accessories complete the look.",
    details: clothingDetails, images: ["/collection/look-06.png", "/collection/look-10.png"],
  },
  "p-kano-structured-blazer": {
    name: "Teal Statement Gele", slug: "teal-statement-gele",
    description: "A sculptural teal headwrap, shown styled with the rust and teal Ashabi outfit. A bold finishing touch for your occasion look.",
    details: ["Headwrap pictured in a styled occasion look", "Clothing and jewellery are not included", "Contact the atelier for tying and fit guidance"],
    images: ["/collection/look-03.png"], sizes: [],
  },
  "p-sade-column-skirt": {
    name: "Lime Statement Gele", slug: "lime-statement-gele",
    description: "A generously styled lime headwrap with a sculptural finish. Photographed with the matching Iro & Buba and crystal accessories.",
    details: ["Headwrap pictured in a coordinated occasion look", "Clothing and jewellery are not included", "Contact the atelier for tying and fit guidance"],
    images: ["/collection/look-05.png"], sizes: [],
  },
  "p-amara-linen-coord": {
    name: "Gold Gele & Sash", slug: "gold-gele-sash",
    description: "A gold gele and patterned shoulder sash, shown styled with brown embroidered occasionwear. A coordinated finishing touch for your celebration wardrobe.",
    details: ["Coordinated gold headwrap and shoulder sash", "Blouse, wrapper, bag and jewellery are not included", "Contact the atelier for fabric and styling guidance"],
    images: ["/collection/look-02.png"], sizes: [],
  },
  "p-oba-vermeil-hoops": {
    name: "Gold Occasion Necklace", slug: "gold-occasion-necklace",
    description: "A statement necklace that brings a warm gold accent to the rust and teal Ashabi look. Photographed on the model to show how it sits with occasionwear.",
    details: jewelryDetails, images: ["/collection/look-03.png"],
  },
  "p-nala-pendant-necklace": {
    name: "Crystal Statement Necklace", slug: "crystal-statement-necklace",
    description: "A statement necklace with pale blue accents, shown with the lime Iro & Buba. A bright finishing touch for coordinated occasion dressing.",
    details: jewelryDetails, images: ["/collection/look-05.png"],
  },
  "p-esosa-signet-ring": {
    name: "Gold Drop Earrings", slug: "gold-drop-earrings",
    description: "Drop earrings shown styled with the teal gele and statement necklace. The portrait shows the accessories together as an occasion look.",
    details: jewelryDetails, images: ["/collection/look-03.png"],
  },
  "p-ivie-chain-bracelet": {
    name: "Crystal Bracelet Set", slug: "crystal-bracelet-set",
    description: "Crystal bracelets shown as part of the coordinated lime occasion look. The full styled photograph shows their scale alongside the outfit.",
    details: jewelryDetails, images: ["/collection/look-07.png"],
  },
  "p-uyi-pearl-earrings": {
    name: "Crystal Drop Earrings", slug: "crystal-drop-earrings",
    description: "Pale blue statement earrings, shown with the matching necklace and lime gele. A coordinated accent for your celebration look.",
    details: jewelryDetails, images: ["/collection/look-05.png"],
  },
};

export const seedProducts: Product[] = legacySeedProducts.map((product) => ({ ...product, ...brandPatches[product.id] }));
export const legacyProductSlugIds: Record<string, string> = Object.fromEntries(legacySeedProducts.map((product) => [product.slug, product.id]));

export function migrateBrandCatalog(products: Product[]): Product[] {
  let changed = false;
  const updated = products.map((product) => {
    const legacy = legacySeedProducts.find((sample) => sample.id === product.id);
    if (!legacy || product.name !== legacy.name || product.slug !== legacy.slug ||
        product.description !== legacy.description || JSON.stringify(product.details) !== JSON.stringify(legacy.details)) return product;
    const originalImages = JSON.stringify(product.images) === JSON.stringify(legacy.images);
    const originalAdaPair = product.id === "p-ada-slip-dress" && product.images.length === 2 &&
      product.images[0] === u("1594633312681-425c7b97ccd1") && product.images[1] === u("1595777457583-95e059d581b8");
    if (!originalImages && !originalAdaPair) return product;
    changed = true;
    return { ...product, ...brandPatches[product.id] };
  });
  return changed ? updated : products;
}
