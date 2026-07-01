"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DashOpsMetric } from "@/lib/dashboard/data";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface OpsMetricsStripProps {
  metrics: DashOpsMetric[];
}

/**
 * Operations metrics strip.
 *
 * Four KPI tiles in a horizontal row. Each tile shows:
 *   - a tactical label
 *   - the big value (tabular nums so they don't jitter)
 *   - a delta vs prior period with directional icon + tone color
 *
 * Tone convention:
 *   - positive: vital green (improvement)
 *   - negative: critical red (regression)
 *   - neutral:  zinc (flat / informational)
 *
 * The animated bottom hairline pulses the accent color — subtle but signals
 * "live, not static".
 */
export function OpsMetricsStrip({ metrics }: OpsMetricsStripProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {metrics.map((m, i) => {
        const toneColor =
          m.tone === "positive"
            ? "text-vital-300"
            : m.tone === "negative"
            ? "text-critical-400"
            : "text-zinc-400";

        const Icon =
          m.delta > 0 ? TrendingUp : m.delta < 0 ? TrendingDown : Minus;

        const hairlineColor =
          m.tone === "positive"
            ? "from-vital-400/60"
            : m.tone === "negative"
            ? "from-critical-500/60"
            : "from-zinc-400/40";

        return (
          <motion.div
            key={m.label}
            variants={fadeUp}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="surface-subtle relative overflow-hidden p-4"
          >
            <div
              aria-hidden
              className={cn(
                "absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
                hairlineColor
              )}
            />

            <div className="flex items-start justify-between">
              <span className="label-tactical">{m.label}</span>
              <span className="font-mono text-xs text-zinc-600">
                0{i + 1}
              </span>
            </div>

            <div className="mt-4 font-display text-[clamp(1.9rem,3vw,3.1rem)] text-white tabular-nums tracking-tight">
              {m.value}
            </div>

            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-mono",
                toneColor
              )}
            >
              <Icon className="h-3 w-3" />
              <span>
                {m.delta > 0 ? "+" : ""}
                {m.delta}%
              </span>
              <span className="text-zinc-600">vs 7d</span>
            </div>

            {/* Bottom hairline */}
            <div className={cn("absolute bottom-0 inset-x-0 h-px bg-gradient-to-r to-transparent", hairlineColor)} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
