"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Stethoscope, Sparkles } from "lucide-react";
import { VALUES } from "@/lib/content";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Four operating principles. Each card uses a tactical label,
 * an icon in a signal-blue chip, and a soft border that glows on hover.
 *
 * The grid is intentionally asymmetric on desktop — 2x2 — so cards
 * have room to breathe and the icons can carry weight.
 */

const ICONS = [Shield, Eye, Stethoscope, Sparkles];

export function ValuesSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-3xl mb-16"
        >
          <motion.span variants={fadeUp} className="label-tactical">
            Operating principles
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-4 font-display text-display text-white"
          >
            How <span className="text-gradient-vital">we build</span>.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-zinc-400 max-w-2xl">
            Four principles, drilled in from USMC service, that shape every product
            decision at RayHealth.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {VALUES.map((v, i) => {
            const Icon = ICONS[i] ?? Shield;
            return (
              <motion.div
                key={v.title}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group relative glass-panel p-7 overflow-hidden"
              >
                {/* Hover glow */}
                <div
                  aria-hidden
                  className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(58,164,255,0.12), transparent 50%)",
                  }}
                />

                {/* Number */}
                <span className="absolute top-5 right-5 font-mono text-xs text-zinc-600">
                  0{i + 1}
                </span>

                {/* Icon chip */}
                <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-signal-400/20 to-signal-600/20 border border-signal-400/30 grid place-items-center">
                  <Icon className="h-5 w-5 text-signal-300" />
                </div>

                <h3 className="mt-5 text-lg font-medium text-white tracking-tight">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{v.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
