import "../(store)/store.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="storefront flex min-h-dvh flex-col">
      <a href="#auth-content" className="store-skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="auth-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
