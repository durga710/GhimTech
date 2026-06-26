"use client";

import { motion } from "framer-motion";
import { CULTURE, COMPANY_STATS } from "@/lib/company";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";

/** Engineering culture — how we build, with a credibility stat strip. */
export function CultureSection() {
  return (
    <section className="container py-24 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left — heading + stats */}
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="How we build"
            title={
              <>
                Engineering culture, <span className="text-gradient-vital">not theater</span>.
              </>
            }
            sub="We are a small team with an uncompromising standard. The way we work is the product."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mt-10 grid grid-cols-2 gap-4"
          >
            {COMPANY_STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <div className="font-display text-2xl font-semibold text-white">{s.value}</div>
                <div className="mt-1 text-xs text-zinc-500">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right — principles */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04]"
        >
          {CULTURE.map((p, i) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="bg-ink-900/60 p-6 transition-colors hover:bg-ink-850/80"
            >
              <span className="font-mono text-xs text-signal-300">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-base font-medium text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
