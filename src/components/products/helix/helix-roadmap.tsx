"use client";

import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";
import { HELIX_ROADMAP, HELIX_CHANGELOG } from "@/lib/products";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";

/** Roadmap (now → vision) + a changelog of what shipped. */
export function HelixRoadmap() {
  return (
    <section className="container py-24 lg:py-32">
      <SectionHeader
        eyebrow="Roadmap & changelog"
        title={
          <>
            Shipping in the <span className="text-gradient-vital">open</span>.
          </>
        }
        sub="Where Helix is going, and what's already landed."
      />

      {/* Roadmap */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {HELIX_ROADMAP.map((phase, i) => (
          <motion.div
            key={phase.phase}
            variants={fadeUp}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-white">{phase.phase}</span>
              <span
                className={`status-dot ${i === 0 ? "status-dot-live" : "bg-white/20"}`}
              />
            </div>
            <span className="mt-1 block font-mono text-[11px] uppercase tracking-tactical text-zinc-500">
              {phase.when}
            </span>
            <ul className="mt-4 space-y-2">
              {phase.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-signal-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Changelog */}
      <div className="mt-20">
        <div className="label-tactical mb-6">Changelog</div>
        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="relative border-l border-white/[0.08] pl-6"
        >
          {HELIX_CHANGELOG.map((entry) => (
            <motion.li key={entry.version} variants={fadeUp} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-ink-900 text-signal-300">
                <GitCommit size={12} />
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-medium text-white">{entry.version}</span>
                <span className="font-mono text-xs text-zinc-500">{entry.date}</span>
                <span className="text-sm text-zinc-300">{entry.title}</span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {entry.notes.map((n) => (
                  <li key={n} className="chip">
                    {n}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
