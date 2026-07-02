"use client";

import { motion } from "framer-motion";
import { GitCommit, CheckCircle2, Activity } from "lucide-react";
import { DEPLOYMENTS, SPRINT_METRICS } from "@/lib/projects";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Operations panel — the "live ops" beat of the deep-dive page.
 *
 *   LEFT:  Recent deployment activity (commit-style log entries)
 *   RIGHT: Sprint shipped-vs-opened chart (animated SVG bars)
 *
 * The data is currently from `src/lib/projects.ts`. In Phase 4 this section
 * gets swapped for live Prisma `DeploymentLog` + `AnalyticsEvent` queries
 * without touching the layout — just replace the imports with `await getDeployments()`.
 */
export function RayHealthOperations() {
  return (
    <section className="relative py-24 lg:py-32 bg-ink-900/30 border-y border-white/5">
      <div className="container">
        <SectionHeader
          eyebrow="Live ops · telemetry"
          title={
            <>
              The platform in <span className="text-gradient-vital">motion</span>.
            </>
          }
          sub="Recent deployments, sprint throughput, and the heartbeat of the system. In Phase 4 this section reads from Prisma directly."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* DEPLOYMENT FEED */}
          <motion.div variants={fadeUp} className="lg:col-span-7">
            <DeploymentFeed />
          </motion.div>

          {/* SPRINT CHART */}
          <motion.div variants={fadeUp} className="lg:col-span-5">
            <SprintChart />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Deployment feed
   ============================================================ */
function DeploymentFeed() {
  return (
    <div className="glass-panel-strong p-6 relative hud-corners">
      <span className="hud-corner-tl" aria-hidden />
      <span className="hud-corner-br" aria-hidden />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-signal-300" />
          <span className="label-tactical">Deployment activity · last 48h</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-mono text-vital-300">
          <span className="status-dot status-dot-live" /> healthy
        </span>
      </div>

      <ol className="space-y-2.5">
        {DEPLOYMENTS.map((d, i) => (
          <motion.li
            key={d.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-12 gap-3 items-center py-2 border-t border-white/[0.04] first:border-t-0"
          >
            {/* sha */}
            <span className="col-span-2 lg:col-span-2 font-mono text-xs text-signal-300">
              {d.sha}
            </span>

            {/* message */}
            <span className="col-span-6 lg:col-span-6 text-sm text-zinc-200 truncate">
              {d.msg}
            </span>

            {/* env */}
            <span
              className={cn(
                "col-span-2 hidden sm:inline-flex items-center justify-center px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-tactical border",
                d.env === "production"
                  ? "bg-vital-400/10 text-vital-300 border-vital-400/30"
                  : "bg-flare-400/10 text-flare-400 border-flare-400/30"
              )}
            >
              {d.env}
            </span>

            {/* status + time */}
            <span className="col-span-4 lg:col-span-2 flex items-center justify-end gap-2 text-xs font-mono">
              <CheckCircle2 className="h-3 w-3 text-vital-300" />
              <span className="text-zinc-500">{d.when}</span>
            </span>
          </motion.li>
        ))}
      </ol>

      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs text-zinc-500">
        <span>6 / 6 successful</span>
        <span className="text-vital-300">avg 2m 24s</span>
      </div>
    </div>
  );
}

/* ============================================================
   Sprint shipped-vs-opened chart
   ============================================================ */
function SprintChart() {
  const maxVal = Math.max(...SPRINT_METRICS.map((m) => Math.max(m.shipped, m.opened)));
  const barWidth = 100 / SPRINT_METRICS.length;

  return (
    <div className="glass-panel-strong p-6 h-full relative hud-corners">
      <span className="hud-corner-tl" aria-hidden />
      <span className="hud-corner-br" aria-hidden />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-vital-300" />
          <span className="label-tactical">Sprint throughput · 8w</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-vital-300">
            <span className="h-1.5 w-1.5 rounded-full bg-vital-400" /> shipped
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" /> opened
          </span>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative h-48">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Background grid */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.2"
            />
          ))}

          {/* Bars */}
          {SPRINT_METRICS.map((m, i) => {
            const x = i * barWidth;
            const shippedH = (m.shipped / maxVal) * 90;
            const openedH = (m.opened / maxVal) * 90;
            const gap = barWidth * 0.15;
            const bw = (barWidth - gap * 3) / 2;
            return (
              <g key={m.week}>
                {/* Opened (back, dim) */}
                <motion.rect
                  x={x + gap}
                  y={100 - openedH}
                  width={bw}
                  height={openedH}
                  fill="rgba(255,255,255,0.08)"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.2 + i * 0.05,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ transformOrigin: "center bottom" }}
                />
                {/* Shipped (front, vital) */}
                <motion.rect
                  x={x + gap + bw + gap}
                  y={100 - shippedH}
                  width={bw}
                  height={shippedH}
                  fill="#1fe294"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.3 + i * 0.05,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ transformOrigin: "center bottom" }}
                />
              </g>
            );
          })}
        </svg>

        {/* x-axis labels */}
        <div className="absolute inset-x-0 -bottom-5 flex justify-between font-mono text-[9px] text-zinc-500 px-1">
          {SPRINT_METRICS.map((m) => (
            <span key={m.week}>{m.week}</span>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 font-mono text-xs">
        <div>
          <div className="label-tactical">Avg shipped/wk</div>
          <div className="mt-1 font-display text-xl text-vital-300 tabular-nums">8.4</div>
        </div>
        <div>
          <div className="label-tactical">Ship velocity</div>
          <div className="mt-1 font-display text-xl text-white tabular-nums">↑ 24%</div>
        </div>
      </div>
    </div>
  );
}
