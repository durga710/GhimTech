"use client";

import { motion } from "framer-motion";
import { FOUNDER } from "@/lib/content";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Contact intro. Compact and warm.
 *
 * The form below carries the page — the intro just sets the tone.
 */
export function ContactIntro() {
  return (
    <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full blur-3xl
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
            <span className="status-dot status-dot-live" />
            <span className="label-tactical">Contact · GhimTech</span>
          </motion.div>

          <motion.h1 variants={blurIn} className="font-display text-hero text-white">
            <span className="block">Bring a serious</span>
            <span className="block text-gradient-signal">problem.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 text-xl text-zinc-300 leading-relaxed max-w-2xl"
          >
            GhimTech works with agency owners, partners, engineers, and technical
            buyers who need software they can trust under pressure. The form below
            is the fastest way to start that conversation — every message gets read.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-6">
            <a
              href={`mailto:${FOUNDER.email}`}
              className="font-mono text-sm text-signal-300 hover:text-signal-200 transition-colors"
            >
              {FOUNDER.email}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
