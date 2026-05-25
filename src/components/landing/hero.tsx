"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Command, Mail } from "lucide-react";
import { HERO, FOUNDER, FOCUS_TICKER } from "@/lib/content";
import { blurIn, fadeUp, staggerContainer, springSoft } from "@/lib/motion";

/**
 * Landing hero.
 *
 * Composition:
 *  - Left column: tactical pre-headline, blur-in headline, sub, CTAs
 *  - Right column: floating founder profile card (HUD-style)
 *  - Bottom: ticker of current focus items
 *
 * The headline uses `blurIn` for a single cinematic moment.
 * Everything else cascades with a staggered fade-up so the eye lands
 * on the headline first, then drifts down.
 */
export function Hero() {
  // Split headline by newline to support a 2-line layout
  const [line1, line2] = HERO.headline.split("\n");

  return (
    <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32">
      <div className="container relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* ---------------- LEFT: Headline column ---------------- */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 relative"
        >
          {/* Pre-headline — tactical label */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <span className="status-dot status-dot-live" />
            <span className="label-tactical">
              {HERO.status.label} ·{" "}
              <span className="text-vital-300">{HERO.status.value}</span>
            </span>
          </motion.div>

          {/* Headline — the moment */}
          <motion.h1
            variants={blurIn}
            className="font-display text-hero text-white"
          >
            <span className="block">{line1}</span>
            <span className="block text-gradient-signal">{line2}</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-xl text-lg text-zinc-400 leading-relaxed"
          >
            {HERO.sub}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/projects" className="btn-signal group">
              View Projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/dashboard" className="btn-ghost group">
              <Command className="h-3.5 w-3.5" />
              Enter Dashboard
            </Link>
            <Link href="/contact" className="btn-ghost group">
              <Mail className="h-3.5 w-3.5" />
              Contact
            </Link>
          </motion.div>

          {/* Quick stats row */}
          <motion.dl
            variants={fadeUp}
            className="mt-14 grid grid-cols-3 max-w-md divide-x divide-white/10"
          >
            {[
              { k: "Active project", v: "RayHealth" },
              { k: "Mission", v: "Care · Verified" },
              { k: "Role", v: "Founder" },
            ].map((s) => (
              <div key={s.k} className="px-4 first:pl-0">
                <dt className="label-tactical">{s.k}</dt>
                <dd className="mt-1.5 text-sm font-medium text-white">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ---------------- RIGHT: Floating founder card ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ ...springSoft, delay: 0.4 }}
          className="lg:col-span-5 relative perspective-1000"
          style={{ perspective: "1200px" }}
        >
          <FounderCard />
        </motion.div>
      </div>

      {/* ---------------- Bottom: focus ticker ---------------- */}
      <FocusTicker />
    </section>
  );
}

/* ============================================================
   Floating founder card — HUD-style identity panel
   ============================================================ */
function FounderCard() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      className="relative"
    >
      {/* Glow behind card */}
      <div className="absolute -inset-8 bg-signal-400/10 blur-3xl rounded-full" />

      <div className="glass-panel-strong relative p-6 hud-corners">
        <span className="hud-corner-tl" aria-hidden />
        <span className="hud-corner-br" aria-hidden />

        {/* Top: label + live */}
        <div className="flex items-center justify-between">
          <span className="label-tactical">Operator profile</span>
          <span className="flex items-center gap-1.5 label-tactical text-vital-300">
            <span className="status-dot status-dot-live" /> Online
          </span>
        </div>

        {/* Avatar + identity */}
        <div className="mt-6 flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-signal-400 via-signal-500 to-signal-700 shadow-glow-signal grid place-items-center overflow-hidden">
            <span className="font-display text-2xl font-semibold text-white">D</span>
            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
            {/* Scanning shimmer */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 4s linear infinite",
              }}
            />
          </div>
          <div>
            <div className="text-lg font-medium text-white tracking-tight">
              {FOUNDER.name}
            </div>
            <div className="label-tactical mt-1">{FOUNDER.title}</div>
          </div>
        </div>

        <div className="hairline my-6" />

        {/* Telemetry rows */}
        <dl className="space-y-3 font-mono text-xs">
          {[
            { k: "LOC", v: FOUNDER.location },
            { k: "MISSION", v: "Healthcare ops" },
            { k: "PROJECT", v: "RayHealthEVV" },
            { k: "STATUS", v: "Shipping" },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between">
              <dt className="text-zinc-500 tracking-tactical">{row.k}</dt>
              <dd className="text-zinc-200">{row.v}</dd>
            </div>
          ))}
        </dl>

        <div className="hairline my-6" />

        {/* Mini bar — confidence/progress */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="label-tactical">Operational confidence</span>
            <span className="font-mono text-vital-300">94%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ duration: 1.4, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-gradient-to-r from-vital-400 to-vital-300 shadow-glow-vital"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Focus ticker — current focus items scroll horizontally
   ============================================================ */
function FocusTicker() {
  // Duplicate so the marquee loops seamlessly
  const items = [...FOCUS_TICKER, ...FOCUS_TICKER];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute bottom-0 left-0 right-0 border-y border-white/5 bg-ink-900/40 backdrop-blur-sm"
    >
      <div className="container py-3 flex items-center gap-6">
        <span className="label-tactical shrink-0">Now</span>
        <div className="flex-1 overflow-hidden mask-fade-edges">
          <div className="flex animate-marquee gap-12 whitespace-nowrap">
            {items.map((it, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="status-dot status-dot-signal" />
                {it}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
