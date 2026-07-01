"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Stethoscope, Sparkles } from "lucide-react";
import { VALUES } from "@/lib/content";
import { MarketingSection, MarketingSectionHeader } from "@/components/marketing/marketing-section";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * How we build — company-level operating principles as a calm 2x2 grid.
 */

const ICONS = [Shield, Eye, Stethoscope, Sparkles];

export function ValuesSection() {
  return (
    <MarketingSection>
      <MarketingSectionHeader
        eyebrow="How we build"
        title={<>Discipline is the product standard.</>}
        body="Operating principles carried from USMC service into every GhimTech product decision."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {VALUES.map((value, index) => {
          const Icon = ICONS[index] ?? Shield;
          return (
            <motion.article
              key={value.title}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="surface-subtle group relative min-h-[200px] p-7"
            >
              <span className="absolute right-5 top-5 font-mono text-[11px] text-zinc-500">
                0{index + 1}
              </span>
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-signal-300/20 bg-signal-300/10">
                <Icon className="h-5 w-5 text-signal-200" />
              </div>
              <h3 className="mt-6 text-lg font-medium tracking-tight text-white">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{value.body}</p>
            </motion.article>
          );
        })}
      </motion.div>
    </MarketingSection>
  );
}
