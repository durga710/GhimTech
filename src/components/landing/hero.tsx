"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { HERO, PRODUCTS } from "@/lib/content";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { ScreenshotFrame } from "@/components/marketing/screenshot-frame";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-44">
      <div className="container relative grid gap-12 lg:grid-cols-12 lg:items-center">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="lg:col-span-6">
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-vital-300" />
            {HERO.eyebrow}
          </motion.div>
          <motion.h1 variants={blurIn} className="text-balance font-display text-[clamp(3.4rem,7vw,7.2rem)] leading-[0.9] tracking-tightest text-white">
            {HERO.headline}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg leading-relaxed text-zinc-300 lg:text-xl">
            {HERO.sub}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            <MarketingButton href={HERO.primaryCta.href}>{HERO.primaryCta.label}</MarketingButton>
            <MarketingButton href={HERO.secondaryCta.href} variant="secondary">{HERO.secondaryCta.label}</MarketingButton>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative lg:col-span-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="label-tactical">{HERO.status.label}</span>
            <span className="text-xs text-zinc-400">{HERO.status.value}</span>
          </div>
          <ScreenshotFrame
            src={PRODUCTS[0].screenshot.src}
            alt={PRODUCTS[0].screenshot.alt}
            url={PRODUCTS[0].screenshot.url}
            priority
          />
          <ScreenshotFrame
            src={PRODUCTS[1].screenshot.src}
            alt={PRODUCTS[1].screenshot.alt}
            url={PRODUCTS[1].screenshot.url}
            sizes="(min-width: 1024px) 20vw, 45vw"
            className="absolute -bottom-8 -left-6 hidden w-[42%] rotate-[-1.5deg] shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:block lg:-left-12"
          />
        </motion.div>
      </div>
    </section>
  );
}
