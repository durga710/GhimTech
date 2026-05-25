"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Map, Eye } from "lucide-react";
import { ROADMAP } from "@/lib/projects";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Roadmap — quarterly horizon.
 *
 * Four cards side-by-side on desktop, stacked on mobile. Each card carries
 * a quarter label, a status pill, a title, and a bulleted list of items.
 * Visual rhythm: a faint horizontal "track" runs behind the cards on desktop,
 * tying them together as one timeline.
 */

const STATUS_CONFIG = {
  "in-progress": {
    label: "In progress",
    dot: "bg-vital-400 animate-pulse-vital",
    text: "text-vital-300",
    border: "border-vital-400/40",
    bg: "bg-vital-400/5",
  },
  planned: {
    label: "Planned",
    dot: "bg-signal-400",
    text: "text-signal-300",
    border: "border-signal-400/30",
    bg: "bg-signal-400/5",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-vital-400",
    text: "text-vital-300",
    border: "border-vital-400/30",
    bg: "bg-vital-400/5",
  },
  exploring: {
    label: "Exploring",
    dot: "bg-zinc-400",
    text: "text-zinc-300",
    border: "border-zinc-400/30",
    bg: "bg-zinc-400/5",
  },
} as const;

const LABEL_ICONS = {
  Now: Sparkles,
  Next: Target,
  Horizon: Map,
  Vision: Eye,
} as const;

export function RayHealthRoadmap() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-white/5">
      <div className="container">
        <SectionHeader
          eyebrow="Roadmap · quarterly horizon"
          title={
            <>
              Where it's <span className="text-gradient-signal">going</span>.
            </>
          }
          sub="Now → next → horizon → vision. Status is honest: in-progress means in-progress, exploring means exploring."
        />

        {/* Connecting track */}
        <div className="mt-14 relative">
          <div
            aria-hidden
            className="absolute top-14 left-6 right-6 h-px
                       bg-gradient-to-r from-vital-400/40 via-signal-400/40 to-zinc-400/20
                       hidden lg:block"
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative"
          >
            {ROADMAP.map((r) => {
              const status =
                STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.planned;
              const Icon = LABEL_ICONS[r.label as keyof typeof LABEL_ICONS] ?? Sparkles;

              return (
                <motion.article
                  key={r.quarter}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="glass-panel p-6 relative"
                >
                  {/* Label + node */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] grid place-items-center">
                        <Icon className="h-4 w-4 text-signal-300" />
                      </span>
                      <div>
                        <div className="font-mono text-xs text-zinc-500">
                          {r.quarter}
                        </div>
                        <div className="text-sm font-medium text-white">
                          {r.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status pill */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-tactical border",
                      status.border,
                      status.bg,
                      status.text
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>

                  {/* Title */}
                  <h3 className="mt-4 text-base font-medium text-white tracking-tight leading-snug">
                    {r.title}
                  </h3>

                  {/* Items */}
                  <ul className="mt-4 space-y-2">
                    {r.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed"
                      >
                        <span className="mt-1 h-1 w-1 rounded-full bg-zinc-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
