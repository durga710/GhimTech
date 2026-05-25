"use client";

import { motion } from "framer-motion";
import { Activity, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import type { DashAnalyticsPoint } from "@/lib/dashboard/data";

interface ShipActivityChartProps {
  data: DashAnalyticsPoint[];
}

/**
 * 30-day ship velocity chart.
 *
 * Pure SVG line chart with:
 *   - shipped line (vital green, foreground)
 *   - opened area (subtle, background)
 *   - animated path-length reveal on first render
 *   - axis labels in mono
 *   - 7-day rolling average pill
 *
 * Resolution-independent — SVG scales perfectly. No chart library needed
 * for this use case; recharts would be overkill.
 */
export function ShipActivityChart({ data }: ShipActivityChartProps) {
  // Pre-compute the path data + summary stats
  const { shippedPath, areaPath, openedPath, maxV, totalShipped, avg7d } = useMemo(() => {
    const max = Math.max(
      ...data.flatMap((d) => [d.shipped, d.opened]),
      1
    );
    const w = 100;
    const h = 100;
    const stepX = w / (data.length - 1);

    const pointFor = (val: number, i: number) => {
      const x = i * stepX;
      const y = h - (val / max) * (h * 0.85) - h * 0.05;
      return [x, y];
    };

    const shippedPts = data.map((d, i) => pointFor(d.shipped, i));
    const openedPts = data.map((d, i) => pointFor(d.opened, i));

    const toPath = (pts: number[][]) =>
      pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");

    const shippedPath = toPath(shippedPts);
    const openedPath = toPath(openedPts);
    const areaPath = `${shippedPath} L ${w} ${h} L 0 ${h} Z`;

    const totalShipped = data.reduce((acc, d) => acc + d.shipped, 0);
    const last7 = data.slice(-7);
    const avg7d = (last7.reduce((a, d) => a + d.shipped, 0) / 7).toFixed(1);

    return {
      shippedPath,
      openedPath,
      areaPath,
      maxV: max,
      totalShipped,
      avg7d,
    };
  }, [data]);

  return (
    <section className="glass-panel p-6 relative hud-corners">
      <span className="hud-corner-tl" aria-hidden />
      <span className="hud-corner-br" aria-hidden />

      <header className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-vital-300" />
            <h2 className="label-tactical">Ship activity · 30d</h2>
          </div>
          <div className="flex items-baseline gap-4">
            <div className="font-display text-3xl text-white tabular-nums tracking-tight">
              {totalShipped}
            </div>
            <div className="text-xs font-mono text-zinc-500">items shipped</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="label-tactical">7d avg</div>
            <div className="font-display text-lg text-vital-300 tabular-nums">
              {avg7d}/d
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-vital-300 px-2 py-1 rounded-md bg-vital-400/10 border border-vital-400/20">
            <TrendingUp className="h-3 w-3" />
            <span>↑ 24%</span>
          </div>
        </div>
      </header>

      {/* Chart */}
      <div className="relative h-40">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(31,226,148,0.30)" />
              <stop offset="100%" stopColor="rgba(31,226,148,0)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.15"
            />
          ))}

          {/* Opened (dim, background) */}
          <motion.path
            d={openedPath}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.4"
            strokeDasharray="1 1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.4 }}
          />

          {/* Shipped area */}
          <motion.path
            d={areaPath}
            fill="url(#shipGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
          />

          {/* Shipped line */}
          <motion.path
            d={shippedPath}
            fill="none"
            stroke="#1fe294"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = i * (100 / (data.length - 1));
            const y = 100 - (d.shipped / maxV) * 85 - 5;
            return (
              <motion.circle
                key={d.date}
                cx={x}
                cy={y}
                r="0.7"
                fill="#1fe294"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + i * 0.02, duration: 0.3 }}
              />
            );
          })}
        </svg>

        {/* Axis labels */}
        <div className="absolute inset-x-0 -bottom-5 flex justify-between font-mono text-[9px] text-zinc-600">
          <span>30d ago</span>
          <span>15d ago</span>
          <span>today</span>
        </div>
      </div>

      <footer className="mt-10 pt-4 border-t border-white/[0.06] flex items-center gap-5 text-xs font-mono">
        <span className="flex items-center gap-1.5 text-vital-300">
          <span className="h-1.5 w-1.5 rounded-full bg-vital-400" />
          shipped
        </span>
        <span className="flex items-center gap-1.5 text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
          opened
        </span>
      </footer>
    </section>
  );
}
