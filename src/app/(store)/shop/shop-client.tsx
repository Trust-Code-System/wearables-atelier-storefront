"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import type { Category } from "@/lib/types";
import { useCatalog } from "@/lib/store";
import { CLOTHING_SIZES } from "@/lib/products";
import { EASE_OUT } from "@/components/motion";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | Category;
type Sort = "featured" | "newest" | "price-asc" | "price-desc";
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const COLLECTION_INTROS = {
  all: {
    title: "The Ashabi edit.",
    description: "Nigerian occasionwear and statement jewellery. Culture, luxury and elegance, brought together.",
    caption: "Occasionwear & statement jewellery",
    images: [
      { src: "/collection/look-06.png", alt: "Rust and teal occasionwear with a coordinated gele and sash" },
      { src: "/collection/look-03.png", alt: "Gold statement necklace and earrings styled with teal gele" },
    ],
  },
  clothing: {
    title: "Clothing",
    description: "Iro & Buba, occasionwear and coordinated headwraps. Find your look for the moments that matter.",
    caption: "Iro & Buba · Occasionwear",
    images: [
      { src: "/collection/look-01.png", alt: "Lime Iro and Buba with a matching headwrap and embroidered sash" },
      { src: "/collection/look-06.png", alt: "Ashabi occasion look in rust and teal" },
    ],
  },
  jewelry: {
    title: "Jewelry",
    description: "Statement necklaces, earrings and bracelets, styled with the Ashabi collection.",
    caption: "The finishing touch",
    images: [
      { src: "/collection/look-03.png", alt: "Statement necklace, earrings and bracelets styled with the Ashabi collection" },
      { src: "/collection/look-05.png", alt: "Crystal jewellery styled with lime occasionwear" },
    ],
  },
} satisfies Record<CategoryFilter, { title: string; description: string; caption: string; images: { src: string; alt: string }[] }>;

const PRICE_RANGES = [
  { id: "all", label: "All prices", test: () => true },
  { id: "under-100", label: "Under ₦100,000", test: (p: number) => p < 100_000 },
  { id: "100-200", label: "₦100,000 – ₦200,000", test: (p: number) => p >= 100_000 && p <= 200_000 },
  { id: "over-200", label: "Over ₦200,000", test: (p: number) => p > 200_000 },
] as const;

function Filters({
  category,
  setCategory,
  sizes,
  toggleSize,
  priceRange,
  setPriceRange,
  clearAll,
  activeCount,
}: {
  category: CategoryFilter;
  setCategory: (c: CategoryFilter) => void;
  sizes: number[];
  toggleSize: (s: number) => void;
  priceRange: string;
  setPriceRange: (id: string) => void;
  clearAll: () => void;
  activeCount: number;
}) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Filters</p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-[0.75rem] text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <XIcon className="size-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="eyebrow">Category</p>
        <ToggleGroup
          value={[category]}
          onValueChange={(v) => {
            const next = (Array.isArray(v) ? v[0] : v) as CategoryFilter | undefined;
            if (next) setCategory(next);
          }}
          variant="outline"
          className="w-full"
        >
          <ToggleGroupItem value="all" className="flex-1">All</ToggleGroupItem>
          <ToggleGroupItem value="clothing" className="flex-1">Clothing</ToggleGroupItem>
          <ToggleGroupItem value="jewelry" className="flex-1">Jewelry</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <p className="eyebrow">Size (numbered)</p>
        <div className="flex flex-wrap gap-2">
          {CLOTHING_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              aria-pressed={sizes.includes(s)}
              className={cn(
                "grid size-9 place-items-center rounded-md border text-[0.8125rem] tabular-nums transition-all duration-150 ease-out active:scale-95",
                sizes.includes(s)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-[0.6875rem] text-muted-foreground">
          Applies to clothing. Jewelry is one size.
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <p className="eyebrow">Price</p>
        <div className="flex flex-col gap-1">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => setPriceRange(range.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[0.8125rem] transition-colors duration-150",
                priceRange === range.id
                  ? "bg-secondary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full transition-colors duration-150",
                  priceRange === range.id ? "bg-bronze" : "bg-border",
                )}
              />
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShopClient() {
  const searchParams = useSearchParams();
  return <ShopCollection key={searchParams.toString()} categoryParam={searchParams.get("category")} sortParam={searchParams.get("sort")} />;
}

function ShopCollection({ categoryParam, sortParam }: { categoryParam: string | null; sortParam: string | null }) {
  const { products, loading, error } = useCatalog();

  const initialCategory = (categoryParam ?? "all") as CategoryFilter;
  const [category, setCategory] = useState<CategoryFilter>(
    ["all", "clothing", "jewelry"].includes(initialCategory) ? initialCategory : "all",
  );
  const [sizes, setSizes] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sort, setSort] = useState<Sort>(["newest", "price-asc", "price-desc"].includes(sortParam ?? "") ? sortParam as Sort : "featured");

  const toggleSize = (s: number) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const activeCount =
    (category !== "all" ? 1 : 0) + sizes.length + (priceRange !== "all" ? 1 : 0);

  const clearAll = () => {
    setCategory("all");
    setSizes([]);
    setPriceRange("all");
  };

  const filtered = useMemo(() => {
    const range = PRICE_RANGES.find((r) => r.id === priceRange) ?? PRICE_RANGES[0];
    let list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (sizes.length > 0 && !p.sizes.some((s) => sizes.includes(s) && (!p.variants || p.variants.some((variant) => variant.size === s && variant.available > 0)))) return false;
      if (!range.test(p.priceNGN)) return false;
      return true;
    });
    switch (sort) {
      case "newest":
        list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "price-asc":
        list = [...list].sort((a, b) => a.priceNGN - b.priceNGN);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.priceNGN - a.priceNGN);
        break;
      default:
        list = [...list].sort(
          (a, b) => Number(b.badge === "bestseller") - Number(a.badge === "bestseller"),
        );
    }
    return list;
  }, [products, category, sizes, priceRange, sort]);

  const filtersProps = {
    category,
    setCategory,
    sizes,
    toggleSize,
    priceRange,
    setPriceRange,
    clearAll,
    activeCount,
  };
  const intro = COLLECTION_INTROS[category];

  return (
    <div className="store-catalog">
      {/* Page header */}
      <div className="store-catalog-header">
        <section className="catalog-intro" aria-labelledby="collection-title" data-collection={category}>
          <div className="catalog-intro-copy">
            <p className="store-label">Wearables Atelier / The collection</p>
            <h1 id="collection-title" className="font-display">{intro.title}</h1>
            <p className="catalog-description">{intro.description}</p>
            <p className="catalog-intro-note">From Lagos.<span>For your moment.</span></p>
          </div>
          <div className="catalog-intro-photos">
            {intro.images.map((image, index) => <div className={`catalog-intro-photo catalog-intro-photo-${index + 1}`} key={image.src}>
              <Image src={image.src} alt={image.alt} fill priority sizes={index === 0 ? "(max-width: 767px) 60vw, 28vw" : "(max-width: 767px) 36vw, 19vw"} />
            </div>)}
            <span className="catalog-intro-caption">{intro.caption}</span>
          </div>
        </section>
        <div className="catalog-toolbar">
          <p className="catalog-piece-count"><span>{filtered.length}</span> {filtered.length === 1 ? "piece" : "pieces"} to discover</p>
          <div className="catalog-toolbar-actions">
            {/* Mobile filters */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" className="lg:hidden" aria-label="Open filters" />
                }
              >
                <SlidersHorizontalIcon data-icon="inline-start" />
                Filters
                {activeCount > 0 && (
                  <span className="ml-1 grid size-5 place-items-center rounded-full bg-bronze text-[0.625rem] font-semibold text-bronze-foreground tabular-nums">
                    {activeCount}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="store-menu-panel w-80 overflow-y-auto" overlayClassName="store-sheet-backdrop" data-lenis-prevent>
                <SheetHeader>
                  <SheetTitle className="font-display text-lg">Refine</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <Filters {...filtersProps} />
                </div>
              </SheetContent>
            </Sheet>

            <Select items={SORT_OPTIONS} value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-44" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SORT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <Filters {...filtersProps} />
          </div>
        </aside>

        {/* Grid */}
        <div>
          {loading || error ? <p role="status" className="py-16 text-center">{loading ? "Loading the collection…" : "Please retry loading the collection above."}</p> : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-24 text-center">
              <p className="font-display text-xl">{products.length ? "Nothing matches those filters" : "The collection is coming soon"}</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {products.length ? "Try widening the price range or clearing a size or two." : "Check back soon for new pieces."}
              </p>
              <Button variant="outline" onClick={clearAll}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.4, ease: [...EASE_OUT], delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <ProductCard product={product} priority={i < 4} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
