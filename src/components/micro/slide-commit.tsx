"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { ArrowRightIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SlideCommitState = "idle" | "processing" | "done";

const HANDLE_WIDTH = 52;
const TRACK_PADDING = 4;

/**
 * SlideCommit — a slide-to-confirm action. The handle is dragged to the end
 * of the track to commit (a flick counts too), then spins while the action
 * runs and unfurls into a done pill. Clicking or pressing Enter commits as
 * well, so the control stays fully keyboard-accessible.
 *
 * The gesture runs on springs so an interrupted drag snaps back with its
 * velocity preserved; state changes (fill, done) use easing.
 */
export function SlideCommit({
  label,
  processingLabel = "Processing…",
  doneLabel = "Done",
  state,
  onCommit,
  disabled = false,
}: {
  label: string;
  processingLabel?: string;
  doneLabel?: string;
  state: SlideCommitState;
  onCommit: () => void;
  disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const committedRef = useRef(false);
  const movedRef = useRef(false);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setTrackWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const travel = Math.max(1, trackWidth - HANDLE_WIDTH - TRACK_PADDING * 2);
  const fillScale = useTransform(x, [0, travel], [0, 1]);
  const labelOpacity = useTransform(x, [0, travel * 0.55], [1, 0]);

  const commit = () => {
    if (disabled || state !== "idle" || committedRef.current) return;
    committedRef.current = true;
    animate(x, travel, reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 34 });
    onCommit();
  };

  // Follow the parent state machine: park the handle while processing,
  // reset the guard when a fresh attempt becomes possible.
  useEffect(() => {
    if (state === "idle") {
      committedRef.current = false;
      animate(x, 0, { duration: 0.2 });
    } else if (state === "processing") {
      animate(x, travel, reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 34 });
    } else {
      x.set(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, travel]);

  return (
    <div
      ref={trackRef}
      className={cn("slide-commit", state !== "idle" && `is-${state}`)}
      data-disabled={disabled || undefined}
    >
      <motion.span className="slide-commit-fill" style={{ scaleX: fillScale }} aria-hidden />
      <motion.span
        className="slide-commit-label"
        style={{ opacity: state === "idle" ? labelOpacity : 1 }}
        aria-hidden={state === "idle"}
      >
        {state === "idle" && label}
        {state === "processing" && (
          <>
            <Loader2Icon className="size-4 animate-spin [animation-duration:0.7s]" aria-hidden />
            {processingLabel}
          </>
        )}
      </motion.span>
      <motion.button
        type="button"
        className="slide-commit-handle"
        aria-label={state === "done" ? doneLabel : label}
        disabled={disabled || state !== "idle"}
        drag={state === "idle" && !disabled ? "x" : false}
        dragConstraints={{ left: 0, right: travel }}
        dragElastic={0.05}
        dragMomentum={false}
        style={{ x }}
        onDrag={() => {
          if (Math.abs(x.get()) > 8) movedRef.current = true;
        }}
        onDragEnd={(_, info) => {
          if (state !== "idle") return;
          const farEnough = x.get() > travel * 0.72;
          const flicked = info.velocity.x > 650;
          if (farEnough || flicked) {
            commit();
          } else {
            animate(x, 0, reduce ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 32, velocity: info.velocity.x });
          }
          // Let the trailing click event see the drag distance first.
          window.setTimeout(() => {
            movedRef.current = false;
          }, 0);
        }}
        onClick={() => {
          // A real drag ending fires a click too — ignore that one.
          if (movedRef.current) return;
          commit();
        }}
        initial={false}
        animate={{ width: state === "done" ? "calc(100% - 8px)" : HANDLE_WIDTH }}
        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 320, damping: 30 }}
      >
        <span className="slide-commit-handle-inner">
          {state === "done" ? (
            <>
              <CheckIcon className="size-4.5" aria-hidden />
              {doneLabel}
            </>
          ) : state === "processing" ? (
            <Loader2Icon className="size-4.5 animate-spin [animation-duration:0.7s]" aria-hidden />
          ) : (
            <ArrowRightIcon className="size-4.5" aria-hidden />
          )}
        </span>
      </motion.button>
    </div>
  );
}
