"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/** Strong ease-out (easings.dev) — the house curve for entrances */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** Strong ease-in-out for elements already on screen */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
/** iOS-like drawer curve */
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** Apple's spring signature — subtle, no bounce */
export const SPRING_SOFT = { type: "spring", duration: 0.5, bounce: 0.15 } as const;

export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.7, delay, ease: [...EASE_OUT] }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-48px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/**
 * Word-by-word heading reveal. The full string stays accessible via
 * aria-label; decorative split words are aria-hidden and the heading
 * remains fully readable with JavaScript disabled via <noscript>-safe
 * initial SSR styles (words render in place before hydration).
 */
const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
} as const;

export function SplitWords({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: keyof typeof MOTION_TAGS;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = MOTION_TAGS[Tag];

  return (
    <MotionTag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={reduce ? { opacity: 0 } : { y: "112%" }}
            whileInView={reduce ? { opacity: 1 } : { y: "0%" }}
            viewport={{ once: true, margin: "-48px" }}
            transition={{
              duration: 0.75,
              delay: delay + i * 0.045,
              ease: [...EASE_OUT],
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
