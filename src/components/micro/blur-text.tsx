"use client";

// Adapted from React Bits' BlurText by David Haz.
// Source and license: docs/react-bits-license.md and docs/motion-components.md.
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/** Word reveal with visible server-rendered text and a static reduced-motion path. */
export function BlurText({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);

  return <span ref={ref} className={`atelier-blur-text ${className}`}>
    {text.split(" ").map((word, index) => <motion.span
      key={`${word}-${index}`}
      className="atelier-blur-word"
      initial={false}
      animate={inView && !reduced ? { filter: ["blur(6px)", "blur(2px)", "blur(0px)"], opacity: [0.65, 1, 1], y: [12, -1, 0] } : { filter: "blur(0px)", opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.65, delay: reduced ? 0 : delay + Math.min(index * 0.08, 0.24), times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1] }}
    >{word}{index < text.split(" ").length - 1 ? "\u00a0" : ""}</motion.span>)}
  </span>;
}
