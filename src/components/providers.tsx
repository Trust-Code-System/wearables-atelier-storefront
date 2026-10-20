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
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let raf = 0;
    const loop = (time: number) => {
      if (!lenis || document.hidden) return;
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    const syncPreference = () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
      if (preference.matches) return;
      lenis = new Lenis({
        // Observe route content growth so the limit follows the current page.
        content: document.body,
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    syncPreference();
    preference.addEventListener("change", syncPreference);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && lenis) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", syncPreference);
      lenis?.destroy();
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
