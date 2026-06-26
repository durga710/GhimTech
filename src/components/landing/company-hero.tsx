"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { COMPANY_HERO, COMPANY_TICKER } from "@/lib/company";
import { PRODUCTS } from "@/lib/products";
import { blurIn, fadeUp, staggerContainer, floatY, easeOut } from "@/lib/motion";

/**
 * Company hero — the front door.
 *
 * Left: the thesis (who we are / what we build), two CTAs.
 * Right: a floating glass panel showing the live product roster.
 * Below: a marquee ticker of what's shipping now.
 */
export function CompanyHero() {
  const [line1, line2] = COMPANY_HERO.headline.split("\n");

  return (
    <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-28">
      <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left — thesis */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="lg:col-span-7"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1"
          >
            <span className="status-dot status-dot-signal" />
            <span className="font-mono text-[11px] uppercase tracking-tactical text-zinc-300">
              {COMPANY_HERO.eyebrow}
            </span>
          </motion.span>

          <motion.h1
            variants={blurIn}
            className="mt-6 font-display text-hero text-white text-balance"
          >
            {line1}
            <br />
            <span className="text-gradient-signal">{line2}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-lg text-zinc-400 leading-relaxed"
          >
            {COMPANY_HERO.sub}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={COMPANY_HERO.primary.href} className="btn-signal group">
              {COMPANY_HERO.primary.label}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href={COMPANY_HERO.secondary.href} className="btn-ghost">
              {COMPANY_HERO.secondary.label}
            </Link>
          </motion.div>
        </motion.div>

        {/* Right — live product roster panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.2 }}
          className="lg:col-span-5"
        >
          <motion.div variants={floatY} animate="animate" className="glass-panel-strong p-5">
            <div className="flex items-center justify-between">
              <span className="label-tactical">Product roster</span>
              <span className="flex items-center gap-2 text-[11px] font-mono text-vital-300">
                <span className="status-dot status-dot-live" />
                LIVE
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {PRODUCTS.map((p, i) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: easeOut, delay: 0.4 + i * 0.12 }}
                >
                  <Link
                    href={p.href}
                    className="group block rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{p.name}</span>
                      <span
                        className={`status-dot ${p.accent === "vital" ? "status-dot-live" : "status-dot-signal"}`}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {p.oneLiner}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      {p.metrics.slice(0, 3).map((m) => (
                        <div key={m.label} className="flex items-baseline gap-1.5">
                          <span
                            className={`font-mono text-sm ${p.accent === "vital" ? "text-vital-300" : "text-signal-300"}`}
                          >
                            {m.value}
                          </span>
                          <span className="text-[10px] uppercase tracking-tactical text-zinc-500">
                            {m.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="hairline my-4" />
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>{PRODUCTS.length} products shipping</span>
              <span className="tracking-tactical uppercase">GhimTech</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Ticker */}
      <div className="mt-16 lg:mt-24 relative overflow-hidden mask-fade-edges">
        <div className="flex w-max animate-marquee gap-8">
          {[...COMPANY_TICKER, ...COMPANY_TICKER].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 whitespace-nowrap font-mono text-xs uppercase tracking-tactical text-zinc-500"
            >
              <span className="h-1 w-1 rounded-full bg-signal-400/60" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
