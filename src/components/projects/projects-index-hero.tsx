"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { RAYHEALTH } from "@/lib/projects";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Projects index hero.
 *
 * Acknowledges that there is ONE primary venture — RayHealth — rather than
 * pretending to be a multi-project portfolio. A future "Lab" or "Side work"
 * section can stack below this without changing the framing.
 */
export function ProjectsIndexHero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-44 lg:pb-24 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 -bottom-40 h-[500px]
                   bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(31,226,148,0.18),transparent_70%)]"
      />

      <div className="container relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <span className="status-dot status-dot-live" />
            <span className="label-tactical">Products · GhimTech</span>
          </motion.div>

          <motion.h1
            variants={blurIn}
            className="font-display text-hero text-white max-w-5xl"
          >
            <span className="block">Real products.</span>
            <span className="block text-gradient-vital">Built deeply.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-2xl text-xl text-zinc-300 leading-relaxed"
          >
            The GhimTech portfolio:{" "}
            <strong className="text-white font-medium">RayHealthEVV™</strong> running
            home-care operations today, and{" "}
            <strong className="text-white font-medium">Helix Studio</strong>, the
            prompt-to-production developer platform direction. Below is each in detail.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10">
            <Link
              href={`/projects/${RAYHEALTH.slug}`}
              className="group inline-flex items-center gap-2 text-base text-signal-300 hover:text-signal-200 transition-colors"
            >
              Jump to the deep-dive
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
