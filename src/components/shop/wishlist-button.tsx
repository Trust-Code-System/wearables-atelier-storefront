"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/lib/store";

export function WishlistButton({ id, name, showLabel = false }: { id: string; name: string; showLabel?: boolean }) {
  const { ids, toggle } = useWishlist();
  const saved = ids.includes(id);
  return <button type="button" className={showLabel ? "wishlist-detail-button" : "product-wishlist-button"} aria-label={`${saved ? "Remove" : "Save"} ${name} ${saved ? "from" : "to"} wishlist`} aria-pressed={saved} onClick={() => { toggle(id); toast(saved ? "Removed from your wishlist" : "Saved to your wishlist"); }}><Heart size={18} fill={saved ? "currentColor" : "none"} strokeWidth={1.7} aria-hidden />{showLabel && (saved ? "Saved to wishlist" : "Save to wishlist")}</button>;
}
