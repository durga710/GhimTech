"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function MarketingSection({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("section-band", className)}>
      <div className="container">{children}</div>
    </section>
  );
}

export function MarketingSectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}
    >
      <motion.div variants={fadeUp} className="section-kicker">
        {eyebrow}
      </motion.div>
      <motion.h2
        variants={fadeUp}
        className="mt-5 text-balance font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98] tracking-tightest text-white"
      >
        {title}
      </motion.h2>
      {body ? (
        <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 lg:text-lg">
          {body}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
