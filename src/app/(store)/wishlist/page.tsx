import type { Metadata } from "next";
import { WishlistClient } from "./wishlist-client";

export const metadata: Metadata = { title: "Your wishlist" };
export default function WishlistPage() { return <WishlistClient />; }
