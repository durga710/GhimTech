"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { HERO, PRODUCTS } from "@/lib/content";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { ProductPreview } from "@/components/marketing/product-card";
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

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="lg:col-span-6">
          <div className="surface-premium p-4 lg:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="label-tactical">{HERO.status.label}</span>
              <span className="text-xs text-zinc-400">{HERO.status.value}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {PRODUCTS.map((product) => (
                <div key={product.slug} className="min-w-0">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">{product.name}</span>
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  </div>
                  <ProductPreview product={product} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
