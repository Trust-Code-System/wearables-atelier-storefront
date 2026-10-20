"use client";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { useCatalog, useWishlist } from "@/lib/store";
import { ProductCard } from "@/components/shop/product-card";

export function WishlistClient() {
  const {
    products,
    loading: catalogLoading,
    error: catalogError,
    refresh: refreshCatalog,
  } = useCatalog();
  const { ids, mode, loading, busy, error, notice, refresh, toggle } =
    useWishlist();
  const unavailable =
    catalogLoading || catalogError
      ? []
      : ids.filter((id) => !products.some((product) => product.id === id));
  const saved = products.filter((product) => ids.includes(product.id));
  const waitingForCatalog =
    ids.length > 0 && (catalogLoading || !!catalogError);
  return (
    <section className="store-section customer-page">
      <div className="customer-page-heading">
        <p className="store-label">Your personal edit</p>
        <h1>
          Keep a little
          <br />
          <em>something you love.</em>
        </h1>
        <p>
          Your favourite pieces, saved for another look.{" "}
          {mode === "account"
            ? "Saved to your account, so your favourites follow you across devices."
            : "Guest favourites stay in this browser and merge into your account when you sign in."}
        </p>
      </div>
      {loading && <p role="status">Loading your wishlist…</p>}
      {error && (
        <p role="alert">
          {error}{" "}
          <button
            type="button"
            className="underline"
            disabled={busy}
            onClick={() => {
              void refresh();
            }}
          >
            Retry
          </button>
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {waitingForCatalog ? (
        <div className="customer-empty-state" role="status">
          <Heart size={30} strokeWidth={1.3} aria-hidden />
          <h2>
            {catalogLoading
              ? "Finding your favourites…"
              : "Your favourites are safely saved."}
          </h2>
          <p>
            {catalogLoading
              ? "Loading the latest details for your saved pieces."
              : "We couldn’t load the collection. Please try again to view your pieces."}
          </p>
          {catalogError && (
            <button
              type="button"
              className="store-button"
              disabled={catalogLoading}
              onClick={refreshCatalog}
            >
              Try again
              <ArrowUpRight size={18} aria-hidden />
            </button>
          )}
        </div>
      ) : (
        <>
          {unavailable.map((id) => (
            <p key={id} className="py-3 text-sm">
              This saved piece is currently unavailable.{" "}
              <button
                type="button"
                className="underline"
                disabled={busy}
                onClick={() => {
                  void toggle(id);
                }}
              >
                Remove
              </button>
            </p>
          ))}
          {saved.length ? (
            <>
              <div className="wishlist-toolbar">
                <p>
                  {saved.length} {saved.length === 1 ? "piece" : "pieces"} saved
                </p>
                <Link href="/shop" className="store-text-link">
                  Keep exploring <ArrowUpRight size={16} aria-hidden />
                </Link>
              </div>
              <div className="home-product-grid">
                {saved.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : !loading && !error && ids.length === 0 ? (
            <div className="customer-empty-state">
              <Heart size={30} strokeWidth={1.3} aria-hidden />
              <h2>Your next favourite is out there.</h2>
              <p>Tap the heart on a piece to make it part of your edit.</p>
              <Link href="/shop" className="store-button">
                Explore the collection <ArrowUpRight size={18} aria-hidden />
              </Link>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
