"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/lib/store";

/** Six motes, evenly fanned, for the save burst. */
const BURST_ANGLES = [-90, -30, 30, 90, 150, 210];

/**
 * Pulse Heart — saving a piece contracts the heart to a dot, flips its
 * colour, and pulses it back with a tiny burst of motes. Removing is a
 * gentler pulse with no burst. Feedback is a state change, so it runs on
 * easing curves and stays under 300ms; reduced motion skips it entirely.
 */
export function WishlistButton({ id, name, showLabel = false }: { id: string; name: string; showLabel?: boolean }) {
  const { ids, toggle, loading, busy, mode } = useWishlist();
  const saved = ids.includes(id);
  const reduce = useReducedMotion();
  const [pulse, setPulse] = useState(0);
  const [burst, setBurst] = useState(0);

  const handleToggle = async () => {
    if (!await toggle(id)) { toast.error("Unable to save your wishlist. Open your wishlist to retry."); return; }
    if (!saved) setBurst((b) => b + 1);
    setPulse((p) => p + 1);
    toast(saved ? "Removed from your wishlist" : "Saved to your wishlist");
  };

  return (
    <button
      type="button"
      className={showLabel ? "wishlist-detail-button" : "product-wishlist-button"}
      aria-label={`${saved ? "Remove" : "Save"} ${name} ${saved ? "from" : "to"} wishlist`}
      disabled={loading || busy || mode === "unknown"}
      aria-pressed={saved}
      onClick={handleToggle}
    >
      <span className="relative grid place-items-center">
        <motion.span
          key={pulse}
          className="grid place-items-center"
          initial={false}
          animate={
            reduce || pulse === 0
              ? undefined
              : { scale: [1, 0.15, 1.18, 1] }
          }
          transition={{ duration: 0.3, times: [0, 0.3, 0.68, 1], ease: ["easeIn", "easeOut", "easeOut"] }}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} strokeWidth={1.7} aria-hidden />
        </motion.span>
        <AnimatePresence>
          {burst > 0 && !reduce && (
            <motion.span key={burst} className="pointer-events-none absolute inset-0" aria-hidden>
              {BURST_ANGLES.map((angle, i) => (
                <motion.span
                  key={angle}
                  className="absolute left-1/2 top-1/2 size-[3px] rounded-full bg-current"
                  initial={{ opacity: 0.9, x: "-50%", y: "-50%", scale: 1 }}
                  animate={{
                    opacity: 0,
                    x: `calc(-50% + ${Math.round(Math.cos((angle * Math.PI) / 180) * 20)}px)`,
                    y: `calc(-50% + ${Math.round(Math.sin((angle * Math.PI) / 180) * 20)}px)`,
                    scale: 0.4,
                  }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  onAnimationComplete={i === 0 ? () => setBurst(0) : undefined}
                />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {showLabel && (saved ? "Saved to wishlist" : "Save to wishlist")}
    </button>
  );
}
