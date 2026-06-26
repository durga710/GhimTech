"use client";

import { motion } from "framer-motion";
import { HELIX_WORKFLOW, HELIX_ARCHITECTURE } from "@/lib/products";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";

/** Workflow (prompt → production) + the layered architecture. */
export function HelixPipeline() {
  return (
    <section className="relative py-24 lg:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-vital opacity-50" />
      <div className="container">
        <SectionHeader
          eyebrow="How it works"
          title={
            <>
              From a sentence to a <span className="text-gradient-signal">shipped pull request</span>.
            </>
          }
          sub="Six steps, fully automated, every one reviewable."
        />

        {/* Workflow steps */}
        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {HELIX_WORKFLOW.map((step) => (
            <motion.li
              key={step.n}
              variants={fadeUp}
              className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6"
            >
              <span className="font-mono text-3xl font-semibold text-white/15">{step.n}</span>
              <h3 className="mt-2 text-base font-medium text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{step.body}</p>
            </motion.li>
          ))}
        </motion.ol>

        {/* Architecture */}
        <div className="mt-20">
          <div className="label-tactical mb-6">Architecture</div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="overflow-hidden rounded-2xl border border-white/[0.07]"
          >
            {HELIX_ARCHITECTURE.map((layer, i) => (
              <motion.div
                key={layer.layer}
                variants={fadeUp}
                className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 ${
                  i % 2 === 0 ? "bg-ink-900/50" : "bg-ink-850/40"
                } ${i > 0 ? "border-t border-white/[0.05]" : ""}`}
              >
                <div className="sm:w-40 shrink-0">
                  <span className="font-mono text-sm font-medium text-signal-300">{layer.layer}</span>
                </div>
                <p className="flex-1 text-sm text-zinc-300">{layer.detail}</p>
                <div className="flex flex-wrap gap-2">
                  {layer.tech.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
