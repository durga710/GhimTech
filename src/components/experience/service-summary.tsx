"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Service summary — bridges the timeline to the closing CTA.
 *
 * Three glass cards that distill the experience page into:
 *   1. Disciplines carried from service
 *   2. Operator posture today
 *   3. What's deployed right now
 *
 * Each card uses the same HUD hairline + tactical label vocabulary as the
 * landing/about pages so the whole site reads as one system.
 */

const SUMMARY_CARDS = [
  {
    label: "Disciplines",
    title: "Carried from service",
    points: [
      "Operational discipline at unit scale",
      "Audit-proof systems thinking",
      "Accountability under stress",
      "Boring fundamentals, repeated",
    ],
    tone: "signal" as const,
  },
  {
    label: "Operating posture",
    title: "Founder mode",
    points: [
      "Owner-first product decisions",
      "Hands across product, sales, and ops",
      "Compliance as a tool, not a fear",
      "Quiet, confirmed automation",
    ],
    tone: "vital" as const,
  },
  {
    label: "In motion",
    title: "Deployed right now",
    points: [
      "Command Glass platform redesign",
      "AI workflow copilots (Fast / Deep)",
      "iOS + Android caregiver apps",
      "Per-agency legal templates",
    ],
    tone: "signal" as const,
  },
] as const;

export function ServiceSummary() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-white/5">
      <div className="container">
        <SectionHeader
          eyebrow="At a glance"
          title={
            <>
              The record in <span className="text-gradient-signal">three lines</span>.
            </>
          }
          sub="Where the experience above lives in the day-to-day work."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {SUMMARY_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="glass-panel p-7 relative hud-corners h-full"
            >
              <span className="hud-corner-tl" aria-hidden />
              <span className="hud-corner-br" aria-hidden />

              <div className="flex items-center justify-between">
                <span className="label-tactical">{card.label}</span>
                <span className="font-mono text-xs text-zinc-600">
                  0{i + 1}
                </span>
              </div>

              <h3 className="mt-5 font-display text-xl text-white tracking-tight">
                {card.title}
              </h3>

              <div className="hairline my-5" />

              <ul className="space-y-2.5">
                {card.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-sm text-zinc-300 leading-relaxed"
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        card.tone === "vital"
                          ? "bg-vital-400 shadow-glow-vital"
                          : "bg-signal-400 shadow-glow-signal"
                      }`}
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
