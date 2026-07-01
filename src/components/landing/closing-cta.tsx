"use client";

import { motion } from "framer-motion";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Closing CTA — invites serious conversations before the footer.
 * Contact is primary; the product roster is the secondary path.
 */
export function ClosingCta() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2
                   rounded-full bg-[radial-gradient(circle,rgba(31,226,148,0.1),transparent_62%)] blur-3xl"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="container relative max-w-4xl text-center"
      >
        <motion.span variants={fadeUp} className="section-kicker">
          Work with GhimTech
        </motion.span>

        <motion.h2
          variants={fadeUp}
          className="mt-6 text-balance font-display text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.95] tracking-tightest text-white"
        >
          Bring the problem that has to work.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
        >
          Agencies, partners, engineers, investors, and technical buyers — if the
          software has to be trusted under pressure, that is the work GhimTech takes seriously.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MarketingButton href="/contact" variant="vital">Start a serious conversation</MarketingButton>
          <MarketingButton href="/#products" variant="secondary">Review products</MarketingButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
