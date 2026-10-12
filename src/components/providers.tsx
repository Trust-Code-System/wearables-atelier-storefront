"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { MotionConfig } from "motion/react";
import {
  CartProvider,
  CatalogProvider,
  CurrencyProvider,
  OrdersProvider,
  SettingsProvider,
  WishlistProvider,
} from "@/lib/store";

/**
 * Single smooth-scroll engine (Lenis), bypassed entirely under
 * prefers-reduced-motion. No GSAP scroll engine is used anywhere.
 */
function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // The body grows with route content; a viewport-height html element does not.
      // Observe that growth so the scroll limit never stays on the previous page.
      content: document.body,
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      lenis.destroy();
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
    <CurrencyProvider>
      <CatalogProvider>
        <WishlistProvider><CartProvider>
          <OrdersProvider>
            <SettingsProvider>
              <SmoothScroll />
              {children}
            </SettingsProvider>
          </OrdersProvider>
        </CartProvider></WishlistProvider>
      </CatalogProvider>
    </CurrencyProvider>
    </MotionConfig>
  );
}
