"use client";

import { motion } from "framer-motion";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Experience page intro.
 *
 * Intentionally compact — the timeline below is the centerpiece, so this
 * intro acts like a tactical briefing card rather than a hero. It introduces
 * the operator and the framing of the page in roughly one screen.
 */
export function ExperienceIntro() {
  return (
    <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16">
      {/* Soft signal glow overhead */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2
                   h-[500px] w-[900px] rounded-full blur-3xl
                   bg-[radial-gradient(circle,rgba(58,164,255,0.18),transparent_60%)]"
      />

      <div className="container relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <span className="status-dot status-dot-signal" />
            <span className="label-tactical">Experience · service record</span>
          </motion.div>

          <motion.h1
            variants={blurIn}
            className="font-display text-hero text-white"
          >
            <span className="block">A timeline of</span>
            <span className="block text-gradient-signal">execution.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 text-xl text-zinc-300 leading-relaxed max-w-2xl"
          >
            From Marine Corps service to founding RayHealth — the same operating
            standard runs the length of the line. Below is the record.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
