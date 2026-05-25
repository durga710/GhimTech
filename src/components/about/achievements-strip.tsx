"use client";

import { motion } from "framer-motion";
import { ACHIEVEMENTS } from "@/lib/narrative";
import { CountUp } from "@/components/shared/count-up";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Big-number strip.
 *
 * Each tile counts up from 0 when the strip enters the viewport.
 * Tiles use the same glass panel + corner HUD treatment as the founder
 * card on the landing page, keeping the visual grammar consistent.
 */
export function AchievementsStrip() {
  return (
    <section className="relative py-24 lg:py-32 border-y border-white/5 bg-ink-900/20">
      {/* Subtle vital glow on the strip */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-radial-vital opacity-30"
      />

      <div className="container">
        <SectionHeader
          eyebrow="Telemetry"
          title={
            <>
              The work, <span className="text-gradient-vital">measured</span>.
            </>
          }
          sub="Numbers that matter — not vanity metrics. Each one reflects a system that's live, observed, and accountable."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          {ACHIEVEMENTS.map((a) => (
            <motion.div
              key={a.label}
              variants={fadeUp}
              className="glass-panel p-6 lg:p-8 relative hud-corners"
            >
              <span className="hud-corner-tl" aria-hidden />
              <span className="hud-corner-br" aria-hidden />

              <span className="label-tactical">{a.label}</span>

              <div className="mt-4 font-display text-5xl lg:text-6xl text-white tracking-tighter tabular-nums">
                <CountUp
                  to={a.value}
                  duration={a.duration}
                  decimals={"decimals" in a ? a.decimals : 0}
                  suffix={a.suffix}
                />
              </div>

              <div className="mt-4 h-px bg-gradient-to-r from-signal-400/40 via-vital-400/40 to-transparent" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
