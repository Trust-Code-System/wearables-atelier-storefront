"use client";

import { useRef, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Trash2Icon } from "lucide-react";

const ACTION_WIDTH = 88;

/**
 * SwipeRow — a list row that swipes open to reveal a remove action, and
 * deletes outright on a full swipe or a hard flick. Everything is
 * gesture-driven, so it runs on springs that preserve flick velocity.
 * Reduced-motion users get no drag; the row's own remove button remains.
 */
export function SwipeRow({
  children,
  onRemove,
  removeLabel = "Remove",
}: {
  children: ReactNode;
  onRemove: () => void;
  removeLabel?: string;
}) {
  const x = useMotionValue(0);
  const reduce = useReducedMotion();
  const removedRef = useRef(false);

  const settle = (target: number, velocity = 0) =>
    animate(x, target, reduce ? { duration: 0.12 } : { type: "spring", stiffness: 480, damping: 38, velocity });

  return (
    <div className="swipe-row">
      <div className="swipe-row-action" style={{ width: ACTION_WIDTH }}>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => {
            removedRef.current = true;
            onRemove();
          }}
          className="swipe-row-delete"
        >
          <Trash2Icon className="size-4" aria-hidden />
          <span>{removeLabel}</span>
        </button>
      </div>
      <motion.div
        className="swipe-row-content"
        style={{ x }}
        drag={reduce ? false : "x"}
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.05 }}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (removedRef.current) return;
          const offset = x.get();
          // Overdrag past the action, or a decisive flick, removes the row.
          if (offset < -ACTION_WIDTH - 20 || info.velocity.x < -850) {
            removedRef.current = true;
            settle(-ACTION_WIDTH, info.velocity.x);
            onRemove();
            return;
          }
          settle(offset < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0, info.velocity.x);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
