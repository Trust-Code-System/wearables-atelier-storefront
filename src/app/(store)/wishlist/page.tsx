import type { Metadata } from "next";
import { WishlistClient } from "./wishlist-client";

export const metadata: Metadata = { title: "Your wishlist", robots: { index: false, follow: false } };
export default function WishlistPage() { return <WishlistClient />; }
