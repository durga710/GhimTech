"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { EXPERIENCE } from "@/lib/narrative";
import { cn } from "@/lib/utils";

/**
 * Experience timeline — the centerpiece of the page.
 *
 * Mechanics:
 *   - A vertical "spine" runs the full height of the timeline.
 *   - A second, brighter "fill" line tracks scroll progress through the
 *     section using Framer's `useScroll` + a spring for smooth lag.
 *   - Each entry has a glowing node sitting on the spine. Nodes are color-
 *     coded by `tone` (service / leadership / founder / vision).
 *   - Cards alternate left and right of the spine on desktop. On mobile,
 *     everything stacks to the right of a left-aligned spine.
 *
 * Performance:
 *   - `whileInView` with `once: true` so reveals never re-fire.
 *   - The fill line is a single transformed element, not per-card animation.
 */

const TONE_STYLES = {
  service: {
    node: "bg-zinc-300",
    ring: "ring-zinc-300/30",
    glow: "rgba(244,246,250,0.35)",
    chip: "bg-zinc-400/10 text-zinc-200 border-zinc-400/20",
    accent: "text-zinc-300",
  },
  leadership: {
    node: "bg-flare-400",
    ring: "ring-flare-400/40",
    glow: "rgba(255,167,38,0.40)",
    chip: "bg-flare-400/10 text-flare-400 border-flare-400/30",
    accent: "text-flare-400",
  },
  founder: {
    node: "bg-vital-400",
    ring: "ring-vital-400/40",
    glow: "rgba(31,226,148,0.45)",
    chip: "bg-vital-400/10 text-vital-300 border-vital-400/30",
    accent: "text-vital-300",
  },
  vision: {
    node: "bg-signal-300",
    ring: "ring-signal-300/40",
    glow: "rgba(58,164,255,0.45)",
    chip: "bg-signal-400/10 text-signal-300 border-signal-400/30",
    accent: "text-signal-300",
  },
} as const;

export function ExperienceTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll progress through the timeline container — drives the fill line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Smooth the progress with a spring so the line glides instead of jitters
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Map 0..1 progress to a CSS scaleY value
  const fillScaleY = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="relative py-16 lg:py-24">
      <div className="container relative">
        {/* ============ SPINE ============ */}
        <div
          aria-hidden
          className={cn(
            "absolute top-0 bottom-0 w-px",
            // On mobile the spine sits 24px from the left edge so cards align right of it.
            // On desktop it centers.
            "left-6 lg:left-1/2 lg:-translate-x-1/2"
          )}
        >
          {/* Base dim spine */}
          <div className="absolute inset-0 bg-white/[0.06]" />

          {/* Animated fill — tracks scroll progress */}
          <motion.div
            style={{ scaleY: fillScaleY, transformOrigin: "top" }}
            className="absolute inset-0 bg-gradient-to-b
                       from-signal-400 via-signal-300 to-vital-400
                       shadow-[0_0_12px_rgba(58,164,255,0.6)]"
          />
        </div>

        {/* ============ ENTRIES ============ */}
        <ol className="space-y-16 lg:space-y-28 relative">
          {EXPERIENCE.map((entry, i) => (
            <TimelineEntry key={`${entry.period}-${i}`} entry={entry} index={i} />
          ))}
        </ol>

        {/* ============ TERMINAL — bottom cap ============ */}
        <div
          aria-hidden
          className="absolute bottom-0 left-6 lg:left-1/2 lg:-translate-x-1/2
                     -translate-y-1/2 flex flex-col items-center gap-2"
        >
          <div className="h-3 w-3 rounded-full bg-vital-400 shadow-glow-vital animate-pulse-vital" />
          <span className="label-tactical text-vital-300 whitespace-nowrap">
            Active · in motion
          </span>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Single timeline entry
   ============================================================ */
interface TimelineEntryProps {
  entry: (typeof EXPERIENCE)[number];
  index: number;
}

function TimelineEntry({ entry, index }: TimelineEntryProps) {
  const isRight = index % 2 === 1;
  const tone = TONE_STYLES[entry.tone];

  return (
    <li className="relative grid grid-cols-12 gap-4 lg:gap-12 items-start">
      {/* ============ NODE on the spine ============ */}
      <div
        aria-hidden
        className={cn(
          "absolute z-10 top-3",
          "left-6 lg:left-1/2 -translate-x-1/2"
        )}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px 0px" }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 22,
            delay: 0.15,
          }}
          className="relative"
        >
          {/* Outer ring */}
          <span
            className={cn(
              "absolute -inset-2 rounded-full ring-1",
              tone.ring
            )}
          />
          {/* Solid node */}
          <span
            className={cn("block h-3 w-3 rounded-full", tone.node)}
            style={{ boxShadow: `0 0 20px ${tone.glow}` }}
          />
        </motion.div>
      </div>

      {/* ============ CARD ============ */}
      <motion.article
        initial={{ opacity: 0, y: 40, x: isRight ? 20 : -20 }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        viewport={{ once: true, margin: "-50px 0px" }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.05,
        }}
        className={cn(
          // Mobile: full width, pushed past the spine
          "col-span-12 pl-14",
          // Desktop: half-width, alternates sides
          isRight
            ? "lg:col-start-7 lg:col-span-6 lg:pl-0"
            : "lg:col-start-1 lg:col-span-6 lg:pl-0 lg:text-right lg:[&_ul]:justify-end"
        )}
      >
        {/* Period label + role */}
        <div
          className={cn(
            "flex items-baseline gap-3 mb-3",
            // When on the left side, push label to the right edge of the card
            !isRight && "lg:justify-end lg:flex-row-reverse"
          )}
        >
          <span className="label-tactical">{entry.period}</span>
          <span className="text-zinc-600">·</span>
          <span className={cn("font-mono text-xs", tone.accent)}>
            {entry.role}
          </span>
        </div>

        {/* Title — the organization / phase */}
        <h3 className="font-display text-2xl lg:text-3xl text-white tracking-tight leading-tight">
          {entry.org}
        </h3>

        {/* Body paragraphs */}
        <div
          className={cn(
            "mt-4 space-y-3 text-zinc-400 leading-relaxed",
            // Limit width and align based on side
            isRight ? "max-w-xl" : "lg:ml-auto max-w-xl"
          )}
        >
          {entry.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Tag chips */}
        <ul
          className={cn(
            "mt-5 flex flex-wrap gap-1.5",
            !isRight && "lg:justify-end"
          )}
        >
          {entry.tags.map((tag) => (
            <li
              key={tag}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-tactical border",
                tone.chip
              )}
            >
              {tag}
            </li>
          ))}
        </ul>
      </motion.article>
    </li>
  );
}
