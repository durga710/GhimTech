"use client";

import { motion } from "framer-motion";
import { PHILOSOPHY } from "@/lib/narrative";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Personal operating philosophy.
 *
 * Different visual shape than the landing "Values" cards — these are wider,
 * use a left numeral instead of an icon, and use a horizontal layout that
 * reads more like an editorial pull-out than a feature grid.
 */
export function PhilosophySection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container">
        <SectionHeader
          eyebrow="Operating philosophy"
          title={
            <>
              The rules I <span className="text-gradient-signal">actually</span>{" "}
              follow.
            </>
          }
          sub="Four principles, drilled in from service and tested in product. Posted on the wall, not the deck."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mt-14 space-y-3"
        >
          {PHILOSOPHY.map((p) => (
            <motion.div
              key={p.n}
              variants={fadeUp}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="glass-panel-strong p-6 lg:p-8 grid grid-cols-12 gap-6 items-start cursor-default"
            >
              {/* Numeral */}
              <div className="col-span-3 sm:col-span-2 font-mono text-3xl lg:text-4xl text-signal-400/80 tabular-nums">
                {p.n}
              </div>

              {/* Vertical hairline divider */}
              <div className="hidden sm:block sm:col-span-1 h-full">
                <div className="hairline-v mx-auto" />
              </div>

              {/* Title + body */}
              <div className="col-span-9 sm:col-span-9 lg:col-span-9">
                <h3 className="font-display text-xl lg:text-2xl text-white tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-zinc-400 leading-relaxed max-w-2xl">
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
