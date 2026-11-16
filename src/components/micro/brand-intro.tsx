"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Render the welcome in the initial HTML, before the homepage can paint. */
export function BrandIntro() {
  const [visible, setVisible] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let timer: number | undefined;
    const frame = requestAnimationFrame(() => {
      // Hold the curtains closed until hydration, even when scripts load slowly.
      setPlaying(true);
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
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchmove", dismiss);
    };
  }, [visible]);

  if (!visible) return null;

  return <><noscript><style>{`.atelier-intro { display: none; }`}</style></noscript><div className="atelier-intro" data-playing={playing} data-lenis-prevent onPointerDown={() => setVisible(false)}>
    <div className="atelier-intro-curtain atelier-intro-left" aria-hidden="true" />
    <div className="atelier-intro-curtain atelier-intro-right" aria-hidden="true" />
    <div className="atelier-intro-copy" aria-hidden="true">
      <Image src="/brand/wearables-by-ashabi.png" alt="" width={844} height={351} sizes="(max-width: 600px) 65vw, 340px" priority />
      <p>Made for <em>your moment.</em></p>
      <span>Culture. Luxury. Elegance.</span>
    </div>
    <button type="button" className="atelier-intro-skip" onClick={() => setVisible(false)}>Skip intro <span aria-hidden="true">↗</span></button>
  </div></>;
}
