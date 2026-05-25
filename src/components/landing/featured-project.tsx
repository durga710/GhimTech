"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Activity, Zap, ShieldCheck } from "lucide-react";
import { PROJECTS } from "@/lib/content";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Featured project preview.
 *
 * Showcases RayHealthEVV as the single, central work of the platform.
 * Uses a wide horizontal panel with three regions:
 *  - Identity (name, tagline, status badge)
 *  - Telemetry (progress bar + metric tiles)
 *  - Stack chips + CTA
 *
 * The progress bar animates from 0 → target when scrolled into view.
 */
export function FeaturedProject() {
  const project = PROJECTS[0];

  return (
    <section className="relative py-24 lg:py-32">
      {/* Section gradient */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-radial-vital opacity-50"
      />

      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-12"
        >
          <motion.span variants={fadeUp} className="label-tactical">
            Featured · Production
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-4 font-display text-display text-white max-w-2xl"
          >
            The work that <span className="text-gradient-signal">defines</span> the
            mission.
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel-strong p-8 lg:p-10 relative overflow-hidden hud-corners"
        >
          <span className="hud-corner-tl" aria-hidden />
          <span className="hud-corner-br" aria-hidden />

          {/* Top scan line accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-vital-400/60 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* IDENTITY */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="status-dot status-dot-live" />
                <span className="label-tactical text-vital-300">
                  {project.tag}
                </span>
              </div>

              <h3 className="font-display text-4xl text-white tracking-tight">
                {project.name}
              </h3>
              <p className="mt-2 text-lg text-zinc-300 italic">
                {project.tagline}
              </p>
              <p className="mt-6 text-zinc-400 leading-relaxed">
                {project.description}
              </p>

              {/* Highlight chips */}
              <ul className="mt-6 space-y-2.5">
                {project.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-3 text-sm text-zinc-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-signal-400 shrink-0 shadow-glow-signal" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* TELEMETRY + STACK */}
            <div className="lg:col-span-7 space-y-6">
              {/* Big progress card */}
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-signal-300" />
                    <span className="label-tactical">Deployment progress</span>
                  </div>
                  <span className="font-mono text-2xl text-white tabular-nums">
                    {project.progress}%
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${project.progress}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.6,
                      delay: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full bg-gradient-to-r from-signal-400 via-signal-300 to-vital-300 shadow-glow-signal"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-tactical text-zinc-500">
                  <span>· Planning</span>
                  <span className="text-center">· Build</span>
                  <span className="text-right text-vital-300">· Ship</span>
                </div>
              </div>

              {/* Metric tiles */}
              <div className="grid grid-cols-3 gap-3">
                {project.metrics.map((m, i) => {
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

              {/* Stack chips */}
              <div>
                <span className="label-tactical">Stack</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-full text-xs font-mono text-zinc-300 bg-white/[0.04] border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/projects/${project.slug}`}
                className="group inline-flex items-center gap-2 text-sm text-signal-300 hover:text-signal-200 transition-colors"
              >
                Explore {project.name}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
