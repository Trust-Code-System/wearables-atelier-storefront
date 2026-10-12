"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const MAX_TRAVEL = 12; // px — never let the magnet pull further than this

const clamp = (v: number) => Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, v));

/**
 * Magnetic — gently pulls its child toward the cursor while hovered and
 * springs home on release. Gesture-driven, so it runs on a soft spring
 * (interruptible, preserves velocity). Decorative only: it renders a plain
 * wrapper for reduced-motion users and never fires on touch input.
 */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 170, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 170, damping: 22, mass: 0.4 });

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: "inline-flex" }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set(clamp((event.clientX - (rect.left + rect.width / 2)) * strength));
        y.set(clamp((event.clientY - (rect.top + rect.height / 2)) * strength));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div className="magnetic-content" style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy, display: "inline-flex" }}>{children}</motion.div>
    </div>
  );
}
