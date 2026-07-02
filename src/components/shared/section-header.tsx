"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface SectionHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Section header used across About, Experience, Projects, Contact.
 *
 * Three layers:
 *   - eyebrow:  tactical mono label
 *   - title:    large display headline (pass `<span className="text-gradient-signal">` for accents)
 *   - sub:      optional supporting paragraph
 *
 * Reveals on viewport entry with a staggered cascade.
 */
export function SectionHeader({
  eyebrow,
  title,
  sub,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className={cn(
        "max-w-4xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <motion.span variants={fadeUp} className="control-chip w-fit">
        <span className="status-dot status-dot-signal" />
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="mt-5 font-display text-[clamp(2.4rem,5vw,4.8rem)] text-white tracking-tightest leading-[0.95]"
      >
        {title}
      </motion.h2>
      {sub && (
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed"
        >
          {sub}
        </motion.p>
      )}
    </motion.div>
  );
}
