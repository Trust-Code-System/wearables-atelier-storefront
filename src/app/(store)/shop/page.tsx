import { Suspense } from "react";
import { ShopClient } from "./shop-client";

export const metadata = { title: "Shop All" };

export default function ShopPage() {
  return (
    <Suspense>
      <ShopClient />
    </Suspense>
  );
}
