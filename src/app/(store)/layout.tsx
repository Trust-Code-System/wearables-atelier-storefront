import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CatalogNotice } from "@/lib/store";
import "./store.css";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="storefront flex min-h-dvh flex-col">
      <a href="#store-content" className="store-skip-link">Skip to content</a>
      <SiteHeader />
      <CatalogNotice />
      <main id="store-content" className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
