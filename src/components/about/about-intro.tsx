"use client";

import { motion } from "framer-motion";
import { FOUNDER } from "@/lib/content";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

/**
 * About page intro.
 *
 * Intentionally structured DIFFERENTLY from the landing hero:
 *   - landing  = headline-left, profile card-right
 *   - about    = full-bleed identity strip with vertical info column
 *
 * This keeps the brand language consistent (gradients, HUD details, type)
 * while making each page visually distinct.
 */
export function AboutIntro() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24">
      {/* Ambient — softer than landing so the text carries the moment */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-40"
          style={{
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 30%, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 50% at 50% 30%, black 30%, transparent 80%)",
          }}
        />
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full
                     bg-[radial-gradient(circle,rgba(58,164,255,0.15),transparent_60%)] blur-3xl"
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>

      <div className="container relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end"
        >
          {/* LEFT: Title block */}
          <div className="lg:col-span-8">
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
              <span className="status-dot status-dot-live" />
              <span className="label-tactical">About · GhimTech</span>
            </motion.div>

            <motion.h1
              variants={blurIn}
              className="font-display text-hero text-white"
            >
              <span className="block">Founder-led software,</span>
              <span className="block text-gradient-signal">built with discipline.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-2xl text-xl text-zinc-300 leading-relaxed"
            >
              From the mountains of Nepal to the United States Marine Corps to building
              AI-native software systems — the through-line is the same: build the
              boring fundamentals exceptionally well, and trust compounds.
            </motion.p>
          </div>

          {/* RIGHT: Identity readout — HUD-style mini panel */}
          <motion.aside
            variants={fadeUp}
            className="lg:col-span-4 glass-panel-strong p-6 relative hud-corners"
          >
            <span className="hud-corner-tl" aria-hidden />
            <span className="hud-corner-br" aria-hidden />

            <div className="flex items-center justify-between">
              <span className="label-tactical">Identity</span>
              <span className="font-mono text-[10px] text-zinc-500">v2.6</span>
            </div>

            <dl className="mt-5 space-y-3.5 font-mono text-xs">
              {[
                { k: "NAME", v: FOUNDER.name },
                { k: "ROLE", v: "Founder · Operator" },
                { k: "BG", v: "USMC Veteran" },
                { k: "ORIGIN", v: "Nepal" },
                { k: "BASED", v: FOUNDER.location },
                { k: "FOCUS", v: "Healthcare ops" },
                { k: "VENTURE", v: "RayHealthEVV™" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between gap-3 py-0.5"
                >
                  <dt className="text-zinc-500 tracking-tactical shrink-0">
                    {row.k}
                  </dt>
                  <dd className="text-zinc-200 text-right truncate">{row.v}</dd>
                </div>
              ))}
            </dl>

            <div className="hairline my-5" />

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-vital-300">
                <span className="status-dot status-dot-live" />
                Active duty (founder mode)
              </span>
            </div>
          </motion.aside>
        </motion.div>
      </div>
    </section>
  );
}
