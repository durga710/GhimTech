"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Activity, Zap, ShieldCheck } from "lucide-react";
import { RAYHEALTH } from "@/lib/projects";
import { PROJECTS } from "@/lib/content";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Projects index featured card — RayHealth as a wide entry card on the
 * projects index. Clicking takes you to /projects/rayhealth-evv.
 *
 * Visually distinct from the landing "FeaturedProject" component:
 *   - landing: thesis + telemetry + stack
 *   - index:   tagline + status pill + big "Enter the platform" CTA
 */
export function ProjectsIndexFeatured() {
  const summary = PROJECTS[0];

  return (
    <section className="relative pb-32">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="label-tactical mb-6">
            Featured · the work
          </motion.div>

          <motion.article
            variants={fadeUp}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <Link
              href={`/projects/${RAYHEALTH.slug}`}
              className="block glass-panel-strong p-10 lg:p-14 hud-corners relative overflow-hidden group"
            >
              <span className="hud-corner-tl" aria-hidden />
              <span className="hud-corner-br" aria-hidden />

              {/* Animated top hairline */}
              <motion.div
                className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-vital-400/60 to-transparent"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Hover-tracking radial glow */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700
                           bg-[radial-gradient(circle_at_50%_50%,rgba(31,226,148,0.08),transparent_60%)]"
              />

              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* LEFT */}
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="status-dot status-dot-live" />
                    <span className="label-tactical text-vital-300">
                      {RAYHEALTH.status}
                    </span>
                  </div>

                  <h2 className="font-display text-display text-white tracking-tight leading-[0.95]">
                    {RAYHEALTH.name}
                  </h2>
                  <p className="mt-3 text-2xl text-zinc-300 italic font-display">
                    {RAYHEALTH.tagline}
                  </p>
                  <p className="mt-6 text-lg text-zinc-400 max-w-2xl leading-relaxed">
                    {RAYHEALTH.oneLiner}
                  </p>

                  <div className="mt-8 inline-flex items-center gap-2 text-signal-300 group-hover:text-signal-200 transition-colors">
                    <span className="text-base">Enter the platform</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* RIGHT — quick stats */}
                <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                  {summary.metrics.map((m, i) => {
                    const icons = [Zap, ShieldCheck, Activity];
                    const Icon = icons[i] ?? Activity;
                    return (
                      <div
                        key={m.label}
                        className="glass-panel p-4 flex flex-col gap-2"
                      >
                        <Icon className="h-4 w-4 text-signal-300" />
                        <div className="font-display text-2xl text-white tabular-nums">
                          {m.value}
                        </div>
                        <div className="label-tactical">{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Link>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
