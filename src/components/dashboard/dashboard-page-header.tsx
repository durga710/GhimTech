"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface DashboardPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
  tone?: "signal" | "vital" | "flare";
  titleLevel?: 1 | 2;
  className?: string;
}

const TONE_STYLES = {
  signal: {
    chip: "bg-signal-400/10 border-signal-400/20 text-signal-300",
    glow: "bg-[radial-gradient(circle_at_top_right,rgba(86,168,255,0.12),transparent_42%)]",
  },
  vital: {
    chip: "bg-vital-400/10 border-vital-400/20 text-vital-300",
    glow: "bg-[radial-gradient(circle_at_top_right,rgba(49,227,154,0.12),transparent_42%)]",
  },
  flare: {
    chip: "bg-flare-400/10 border-flare-400/20 text-flare-400",
    glow: "bg-[radial-gradient(circle_at_top_right,rgba(255,183,74,0.12),transparent_42%)]",
  },
} as const;

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  tone = "signal",
  titleLevel = 1,
  className,
}: DashboardPageHeaderProps) {
  const toneStyle = TONE_STYLES[tone];
  const TitleTag = titleLevel === 1 ? motion.h1 : motion.h2;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={cn(
        "surface-premium operating-console relative p-5 lg:p-6",
        className
      )}
    >
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <motion.div variants={fadeUp} className="max-w-3xl">
          <div className="flex items-center gap-3">
            <div className={cn("grid h-11 w-11 place-items-center rounded-2xl border", toneStyle.chip)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="control-chip w-fit">{eyebrow}</div>
              <TitleTag className="mt-3 font-display text-[clamp(1.9rem,3.4vw,3.4rem)] leading-[0.95] tracking-tightest text-white">
                {title}
              </TitleTag>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-base text-zinc-400 leading-relaxed">
            {description}
          </p>
        </motion.div>

        {action && (
          <motion.div variants={fadeUp} className="lg:pt-2 shrink-0">
            {action}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
