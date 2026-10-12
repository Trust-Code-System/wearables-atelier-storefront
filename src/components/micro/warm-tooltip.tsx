"use client";

import {
  createContext,
  useEffect,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const WARM_WINDOW_MS = 2600;
const COLD_DELAY_MS = 380;

const WarmContext = createContext<{ poke: () => boolean }>({ poke: () => false });

/**
 * WarmGroup — wraps a cluster of `Tip`s. The first tooltip to be explored
 * waits out a polite delay; while the group is "warm" (a few seconds after
 * the last hover), its siblings open instantly.
 */
export function WarmGroup({ children }: { children: ReactNode }) {
  const warmUntil = useRef(0);
  const poke = () => {
    const now = Date.now();
    const wasWarm = now < warmUntil.current;
    warmUntil.current = now + WARM_WINDOW_MS;
    return wasWarm;
  };
  return <WarmContext.Provider value={{ poke }}>{children}</WarmContext.Provider>;
}

/**
 * Tip — a quiet, decorative label for an icon control. The control keeps its
 * own aria-label; the tooltip is aria-hidden and appears on hover and focus.
 * Entrance eases out, exit eases in, and everything is instant under
 * reduced motion.
 */
export function Tip({ label, children }: { label: string; children: ReactNode }) {
  const { poke } = useContext(WarmContext);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const show = (immediate = false) => {
    const warm = poke();
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), immediate || warm ? 0 : COLD_DELAY_MS);
  };
  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      className="warm-tip-anchor"
      onMouseEnter={() => show()}
      onMouseLeave={hide}
      onFocus={() => show(true)}
      onBlur={hide}
      onKeyDown={(event) => { if (event.key === "Escape") hide(); }}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            className="warm-tip"
            aria-hidden
            initial={{ opacity: 0, x: "-50%", y: reduce ? 0 : 5, scale: reduce ? 1 : 0.95 }}
            animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: reduce ? 0 : 3, transition: { duration: 0.12, ease: "easeIn" } }}
            transition={{ duration: reduce ? 0.01 : 0.18, ease: "easeOut" }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
