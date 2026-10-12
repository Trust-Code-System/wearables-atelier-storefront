"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * SpringCheck — a checkbox row where one spring fills the box and a second
 * spring draws the tick. Selection is user-driven, so the fill uses a spring
 * (interruptible if tapped again mid-flight); unchecking is a quick ease-in
 * retreat. The whole row is the button, so the tap target stays generous.
 */
export function SpringCheck({
  checked,
  onCheckedChange,
  label,
  description,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="spring-check"
    >
      <span className="spring-check-box">
        <motion.span
          className="spring-check-fill"
          aria-hidden
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={
            reduce
              ? { duration: 0.1 }
              : checked
                ? { type: "spring", stiffness: 460, damping: 22 }
                : { duration: 0.14, ease: "easeIn" }
          }
        />
        <svg viewBox="0 0 12 10" className="spring-check-tick" aria-hidden>
          <motion.path
            d="M1.2 5.4 4.4 8.6 10.8 1.4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={
              reduce
                ? { duration: 0.1 }
                : checked
                  ? { type: "spring", stiffness: 380, damping: 26, delay: 0.07 }
                  : { duration: 0.1, ease: "easeIn" }
            }
          />
        </svg>
      </span>
      <span className="spring-check-copy">
        <span className="spring-check-label">{label}</span>
        {description ? <span className="spring-check-description">{description}</span> : null}
      </span>
    </button>
  );
}
