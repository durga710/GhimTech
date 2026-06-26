"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { RAYHEALTH } from "@/lib/projects";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

/**
 * RayHealthEVV product hero — the entry beat of the deep-dive page.
 *
 * LEFT  : status badge, product wordmark, thesis paragraphs
 * RIGHT : pure-CSS device mockup of the Command Glass surface.
 *         No external screenshots needed — everything is rendered from
 *         design tokens so it scales cleanly and never goes stale.
 */
export function RayHealthHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-50"
          style={{
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 80%)",
          }}
        />
        <motion.div
          className="absolute -top-32 right-0 h-[600px] w-[800px] rounded-full
                     bg-[radial-gradient(circle,rgba(31,226,148,0.18),transparent_60%)] blur-3xl"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>

      <div className="container relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="lg:col-span-6"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <span className="status-dot status-dot-live" />
            <span className="label-tactical text-vital-300">{RAYHEALTH.status}</span>
          </motion.div>

          <motion.div variants={blurIn}>
            <h1 className="font-display font-semibold text-white tracking-tightest leading-[0.95] text-[clamp(3rem,7vw,5.5rem)]">
              RayHealth<span className="text-gradient-vital">EVV</span>
              <span className="text-zinc-500 align-top text-3xl ml-2">™</span>
            </h1>
            <p className="mt-3 font-display text-2xl text-zinc-300 italic">
              {RAYHEALTH.tagline}
            </p>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-xl text-lg text-zinc-300 leading-relaxed"
          >
            {RAYHEALTH.oneLiner}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-6 space-y-4 max-w-xl text-zinc-400 leading-relaxed"
          >
            {RAYHEALTH.thesis.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={RAYHEALTH.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-vital group"
            >
              Visit {RAYHEALTH.urlLabel}
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative"
        >
          <CommandGlassMockup />
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Pure CSS/SVG device mockup — abstract command center view
   ============================================================ */
function CommandGlassMockup() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      className="relative"
      style={{ perspective: "1400px" }}
    >
      <div className="absolute -inset-12 bg-vital-400/10 blur-3xl rounded-full" />
      <div className="absolute -inset-12 bg-signal-400/10 blur-3xl rounded-full" />

      <div
        className="relative glass-panel-strong overflow-hidden rounded-3xl"
        style={{ transform: "rotateX(4deg) rotateY(-6deg)", transformStyle: "preserve-3d" }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-ink-900/40">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-vital-400 animate-pulse-vital" />
            <span className="label-tactical text-vital-300">
              Command Glass · Owner view
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "Active visits", v: "47", c: "vital" as const },
              { l: "Open punches", v: "3", c: "flare" as const },
              { l: "Caregivers", v: "112", c: "signal" as const },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.l}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="glass-panel p-3"
              >
                <div className="label-tactical text-[9px]">{kpi.l}</div>
                <div className="mt-1 font-display text-2xl text-white tabular-nums">{kpi.v}</div>
                <div
                  className={`mt-2 h-0.5 rounded-full ${
                    kpi.c === "vital"
                      ? "bg-vital-400 shadow-glow-vital"
                      : kpi.c === "flare"
                      ? "bg-flare-400"
                      : "bg-signal-400 shadow-glow-signal"
                  }`}
                />
              </motion.div>
            ))}
          </div>

          {/* Chart + activity */}
          <div className="grid grid-cols-5 gap-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="col-span-3 glass-panel p-4 h-32 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="label-tactical text-[9px]">Sprint shipped · last 8w</div>
                <div className="font-mono text-[10px] text-vital-300">↑ 24%</div>
              </div>
              <svg className="w-full h-20 mt-1" viewBox="0 0 200 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(31,226,148,0.4)" />
                    <stop offset="100%" stopColor="rgba(31,226,148,0)" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M0,48 L25,42 L50,46 L75,32 L100,36 L125,22 L150,26 L175,14 L200,18"
                  fill="none"
                  stroke="#1fe294"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                />
                <motion.path
                  d="M0,48 L25,42 L50,46 L75,32 L100,36 L125,22 L150,26 L175,14 L200,18 L200,60 L0,60 Z"
                  fill="url(#chartGrad)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2 }}
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="col-span-2 glass-panel p-4 h-32 space-y-2"
            >
              <div className="label-tactical text-[9px]">Live activity</div>
              {[
                { dot: "vital" as const, w: "70%" },
                { dot: "signal" as const, w: "55%" },
                { dot: "vital" as const, w: "82%" },
                { dot: "flare" as const, w: "40%" },
              ].map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.08, duration: 0.5 }}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      row.dot === "vital" ? "bg-vital-400" : row.dot === "flare" ? "bg-flare-400" : "bg-signal-400"
                    }`}
                  />
                  <div className="h-1.5 rounded-full bg-white/10" style={{ width: row.w }} />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Coordinator queue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="glass-panel p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="label-tactical text-[9px]">Coordinator queue</div>
              <span className="font-mono text-[10px] text-flare-400">3 review</span>
            </div>
            <div className="space-y-1.5">
              {[
                { name: "Visit · M.S.", status: "Missed punch", c: "flare" as const },
                { name: "Visit · L.K.", status: "Signature pending", c: "signal" as const },
                { name: "Visit · R.D.", status: "Cleared", c: "vital" as const },
              ].map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + i * 0.1, duration: 0.5 }}
                  className="flex items-center justify-between text-[11px] font-mono py-1 border-t border-white/[0.04]"
                >
                  <span className="text-zinc-400">{row.name}</span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      row.c === "vital"
                        ? "text-vital-300"
                        : row.c === "flare"
                        ? "text-flare-400"
                        : "text-signal-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        row.c === "vital" ? "bg-vital-400" : row.c === "flare" ? "bg-flare-400" : "bg-signal-400"
                      }`}
                    />
                    {row.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scanline */}
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-signal-400/40 to-transparent"
          animate={{ y: ["0%", "100%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
