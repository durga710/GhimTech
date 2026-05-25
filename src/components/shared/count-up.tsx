"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";

interface CountUpProps {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

/**
 * CountUp — counts from 0 → `to` when scrolled into view.
 *
 * Built on Motion's `animate()` driving a `MotionValue`, with subscribe
 * to update local state for rendering. This keeps the animation off the
 * React render path so it's silky even with multiple counters on screen.
 *
 * Triggers once, then stops — no thrashing if the element re-enters view.
 */
export function CountUp({
  to,
  duration = 1.8,
  decimals = 0,
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        setDisplay(
          decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
        );
      },
    });
    return controls.stop;
  }, [inView, to, duration, decimals, mv]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
