"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SESSION_KEY = "atelier-intro-seen";

/** A home-page welcome, independent of page loading and document scrolling. */
export function BrandIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // The welcome also works when browser storage is unavailable.
    }

    let timer: number | undefined;
    const frame = requestAnimationFrame(() => {
      // Mark it seen only after mounting; React's development effect replay
      // must not consume the welcome before its first frame.
      try { sessionStorage.setItem(SESSION_KEY, "yes"); } catch { /* Storage is optional. */ }
      setVisible(true);
      timer = window.setTimeout(() => setVisible(false), 1700);
    });
    const dismiss = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      setVisible(false);
    };
    // Navigation, scrolling and keyboard intent always take precedence.
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("wheel", dismiss, { passive: true });
    window.addEventListener("touchmove", dismiss, { passive: true });
    media.addEventListener("change", dismiss);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchmove", dismiss);
      media.removeEventListener("change", dismiss);
    };
  }, []);

  if (!visible) return null;

  return <div className="atelier-intro" onPointerDown={() => setVisible(false)}>
    <div className="atelier-intro-curtain atelier-intro-left" aria-hidden="true" />
    <div className="atelier-intro-curtain atelier-intro-right" aria-hidden="true" />
    <div className="atelier-intro-copy" aria-hidden="true">
      <Image src="/brand/wearables-by-ashabi.png" alt="" width={844} height={351} sizes="(max-width: 600px) 65vw, 340px" priority />
      <p>Made for <em>your moment.</em></p>
      <span>Culture. Luxury. Elegance.</span>
    </div>
    <button type="button" className="atelier-intro-skip" onClick={() => setVisible(false)}>Skip intro <span aria-hidden="true">↗</span></button>
  </div>;
}
