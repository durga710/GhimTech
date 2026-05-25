"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Command } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Closing CTA — the final visual beat before the footer.
 *
 * Two-line poetic headline + two paths forward (dashboard, contact).
 * Big radial signal glow behind the title pulls the eye in.
 */
export function ClosingCta() {
  return (
    <section className="relative py-32">
      {/* Massive glow ring */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px]
                   rounded-full bg-[radial-gradient(circle,rgba(58,164,255,0.18),transparent_60%)] blur-3xl"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="container max-w-3xl text-center relative"
      >
        <motion.span variants={fadeUp} className="label-tactical">
          Two paths forward
        </motion.span>

        <motion.h2
          variants={fadeUp}
          className="mt-6 font-display text-display text-white"
        >
          Step inside the{" "}
          <span className="text-gradient-signal">command center</span>,
          <br />
          or reach out directly.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed"
        >
          The dashboard is where the work happens — projects, tasks, telemetry,
          and an executive-grade view of every system in motion.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-signal group">
            <Command className="h-3.5 w-3.5" />
            Enter Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/contact" className="btn-ghost">
            Contact directly
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
