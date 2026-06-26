"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface CompanyCtaProps {
  eyebrow?: string;
  title?: React.ReactNode;
  sub?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}

/** Closing call-to-action — used on the home page and reusable elsewhere. */
export function CompanyCta({
  eyebrow = "Where we're going",
  title = (
    <>
      Building the company we&apos;d want to{" "}
      <span className="text-gradient-signal">build with</span>.
    </>
  ),
  sub = "Whether you're a customer, an investor, an engineer, or a partner — we'd like to hear from you.",
  primary = { label: "Get in touch", href: "/contact" },
  secondary = { label: "See our products", href: "/products" },
}: CompanyCtaProps) {
  return (
    <section className="container py-28 lg:py-36">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-850/60 px-6 py-20 text-center backdrop-blur-xl sm:px-12"
      >
        {/* Ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-400/50 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-70" />

        <motion.span variants={fadeUp} className="eyebrow">
          {eyebrow}
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="mx-auto mt-5 max-w-3xl font-display text-display text-white text-balance"
        >
          {title}
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href={primary.href} className="btn-signal group">
            {primary.label}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href={secondary.href} className="btn-ghost">
            {secondary.label}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
