"use client";

import { motion } from "framer-motion";
import { RAYHEALTH } from "@/lib/projects";
import { ScreenshotFrame } from "@/components/marketing/screenshot-frame";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

/**
 * RayHealthEVV product hero — the entry beat of the deep-dive page.
 *
 * LEFT  : status badge, product wordmark, thesis paragraphs
 * RIGHT : pure-CSS device mockup of the Command Glass surface.
 *         No external screenshots needed — everything is rendered from
 *         design tokens so it scales cleanly and never goes stale.
 */
export function RayHealthHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-50"
          style={{
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 80%)",
          }}
        />
        <motion.div
          className="absolute -top-32 right-0 h-[600px] w-[800px] rounded-full
                     bg-[radial-gradient(circle,rgba(31,226,148,0.18),transparent_60%)] blur-3xl"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>

      <div className="container relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="lg:col-span-6"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <span className="status-dot status-dot-live" />
            <span className="label-tactical text-vital-300">{RAYHEALTH.status}</span>
          </motion.div>

          <motion.div variants={blurIn}>
            <h1 className="font-display font-semibold text-white tracking-tightest leading-[0.95] text-[clamp(3rem,7vw,5.5rem)]">
              RayHealth<span className="text-gradient-vital">EVV</span>
              <span className="text-zinc-500 align-top text-3xl ml-2">™</span>
            </h1>
            <p className="mt-3 font-display text-2xl text-zinc-300 italic">
              {RAYHEALTH.tagline}
            </p>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-xl text-lg text-zinc-300 leading-relaxed"
          >
            {RAYHEALTH.oneLiner}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-6 space-y-4 max-w-xl text-zinc-400 leading-relaxed"
          >
            {RAYHEALTH.thesis.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative"
        >
          <ScreenshotFrame
            src="/products/rayhealth-command-center.jpg"
            alt="RayHealthEVV admin Command Center showing live visit alerts, compliance readiness, and today's schedule — captured from the live product"
            url="rayhealthevv.com/admin"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
