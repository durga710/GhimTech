"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, FileText, Users } from "lucide-react";
import { COMPLIANCE_POSTURE } from "@/lib/projects";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Compliance posture.
 *
 * IMPORTANT brand governance note (from project preferences):
 * RayHealth is "designed to support" EVV / privacy / compliance — it does
 * NOT claim blanket certification, universal compliance, or federal approval.
 * The copy here mirrors that exactly. Do not change to stronger claims
 * without legal review.
 */
const ICONS = [ShieldCheck, Lock, FileText, Users];

export function RayHealthCompliance() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container">
        <SectionHeader
          eyebrow="Compliance posture · designed to support"
          title={
            <>
              Built around <span className="text-gradient-signal">the rules</span>.
            </>
          }
          sub="RayHealth is designed to support EVV, privacy, and state requirements. We don't claim blanket federal certification — what we claim, we mean."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {COMPLIANCE_POSTURE.map((c, i) => {
            const Icon = ICONS[i] ?? ShieldCheck;
            return (
              <motion.article
                key={c.label}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="glass-panel-strong p-7 relative overflow-hidden group"
              >
                <div className="flex items-start gap-5">
                  {/* Icon chip */}
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-signal-400/15 to-signal-600/15 border border-signal-400/30 grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-signal-300" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="label-tactical">{c.label}</span>
                      <span className="font-mono text-[10px] text-zinc-600">·</span>
                      <span className="font-mono text-[10px] text-vital-300 uppercase tracking-tactical">
                        supported
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white tracking-tight">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                      {c.note}
                    </p>
                  </div>
                </div>

                {/* Hover hairline */}
                <div
                  aria-hidden
                  className="absolute left-7 right-7 bottom-4 h-px
                             bg-gradient-to-r from-signal-400/40 via-vital-400/40 to-transparent
                             scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100"
                />
              </motion.article>
            );
          })}
        </motion.div>

        {/* Footnote — explicit disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 font-mono text-xs text-zinc-500 max-w-2xl leading-relaxed"
        >
          <span className="text-zinc-400">Note:</span> &ldquo;Designed to
          support&rdquo; means the platform is engineered around relevant
          standards and state requirements. It does not constitute legal or
          regulatory certification. Specific certifications vary by jurisdiction
          and agency configuration.
        </motion.p>
      </div>
    </section>
  );
}
