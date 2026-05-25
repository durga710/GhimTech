"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ABOUT_CHAPTERS } from "@/lib/narrative";
import { cn } from "@/lib/utils";

/**
 * The narrative spine of the About page.
 *
 * Each chapter is a self-contained `<ChapterBlock>` that uses scroll-linked
 * transforms on its parallax layer. The chapter number floats on the opposite
 * side of the body text and alternates left/right per chapter for rhythm.
 *
 * Accent colors per chapter map to the narrative tone:
 *   origin   → soft white/silver (foundational)
 *   usmc     → tactical amber-leaning (service)
 *   pivot    → signal blue (transition)
 *   build    → emerald vital (active mission)
 *   vision   → signal blue with glow (forward-looking)
 */

const ACCENT_STYLES = {
  origin: {
    ring: "ring-zinc-400/30",
    dot: "bg-zinc-300",
    glow: "rgba(244,246,250,0.15)",
    num: "text-zinc-200",
  },
  usmc: {
    ring: "ring-flare-400/40",
    dot: "bg-flare-400",
    glow: "rgba(255,167,38,0.20)",
    num: "text-flare-400",
  },
  pivot: {
    ring: "ring-signal-400/40",
    dot: "bg-signal-400",
    glow: "rgba(58,164,255,0.20)",
    num: "text-signal-300",
  },
  build: {
    ring: "ring-vital-400/40",
    dot: "bg-vital-400",
    glow: "rgba(31,226,148,0.20)",
    num: "text-vital-300",
  },
  vision: {
    ring: "ring-signal-300/50",
    dot: "bg-signal-300",
    glow: "rgba(58,164,255,0.25)",
    num: "text-signal-200",
  },
} as const;

export function ChapterSection() {
  return (
    <section className="relative">
      {/* Vertical spine — runs through all chapters, fades at top/bottom */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px
                   bg-gradient-to-b from-transparent via-white/10 to-transparent
                   hidden lg:block"
      />

      <div className="container py-16">
        {ABOUT_CHAPTERS.map((chapter, i) => (
          <ChapterBlock key={chapter.id} chapter={chapter} index={i} />
        ))}
      </div>
    </section>
  );
}

interface ChapterBlockProps {
  chapter: (typeof ABOUT_CHAPTERS)[number];
  index: number;
}

function ChapterBlock({ chapter, index }: ChapterBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll-linked parallax — the big chapter number drifts slower than the body
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const numberY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const numberOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  const isRight = index % 2 === 1;
  const accent = ACCENT_STYLES[chapter.accent as keyof typeof ACCENT_STYLES];

  return (
    <div
      ref={ref}
      className={cn(
        "relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 py-20 lg:py-32",
        // The first chapter has no top padding so it sits closer to the intro
        index === 0 && "pt-8 lg:pt-12"
      )}
    >
      {/* Center spine dot — sits on the vertical line */}
      <div
        aria-hidden
        className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-32"
      >
        <span
          className={cn("block h-2.5 w-2.5 rounded-full ring-4", accent.dot, accent.ring)}
          style={{ boxShadow: `0 0 24px ${accent.glow}` }}
        />
      </div>

      {/* Large parallax chapter number */}
      <motion.div
        style={{ y: numberY, opacity: numberOpacity }}
        className={cn(
          "lg:col-span-4 select-none",
          isRight ? "lg:order-2 lg:text-right" : "lg:order-1"
        )}
      >
        <span className="label-tactical block mb-3">{chapter.label}</span>
        <div
          className={cn(
            "font-display font-semibold leading-[0.8] tracking-tightest",
            "text-[clamp(5rem,12vw,9rem)]",
            accent.num
          )}
          style={{ opacity: 0.85 }}
        >
          {chapter.label.replace("Chapter ", "")}
        </div>
      </motion.div>

      {/* Body content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "lg:col-span-8",
          isRight ? "lg:order-1" : "lg:order-2"
        )}
      >
        <h3 className="font-display text-4xl lg:text-5xl text-white tracking-tight leading-[1.05]">
          {chapter.title}
        </h3>

        <div className="mt-8 space-y-5 text-lg text-zinc-300 leading-relaxed max-w-2xl">
          {chapter.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Pull quote — only renders if present */}
        {chapter.pullQuote && (
          <motion.figure
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 max-w-xl relative pl-6"
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1 bottom-1 w-0.5 rounded-full",
                accent.dot
              )}
              style={{ boxShadow: `0 0 16px ${accent.glow}` }}
            />
            <blockquote className="font-display text-xl lg:text-2xl text-white italic leading-snug">
              &ldquo;{chapter.pullQuote}&rdquo;
            </blockquote>
          </motion.figure>
        )}
      </motion.div>
    </div>
  );
}
