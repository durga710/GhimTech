"use client";

import { motion } from "framer-motion";
import { MODULES } from "@/lib/projects";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Module inventory.
 *
 * Renders all 12 production modules as a dense HUD-style grid. Each tile
 * shows:
 *   - module code (M01..M12) in mono
 *   - state pill (active / beta)
 *   - human name
 *   - short technical note
 *
 * The grid is deliberately dense — it reads as "inventory readout" rather
 * than marketing fluff. State chips use existing tone tokens.
 */
export function RayHealthModules() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-white/5">
      <div className="container">
        <SectionHeader
          eyebrow="Module inventory · 12 surfaces"
          title={
            <>
              The platform, <span className="text-gradient-signal">enumerated</span>.
            </>
          }
          sub="Every module is in production or active beta. No vapor — only what's actually deployed and observed."
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {MODULES.map((m) => {
            const isBeta = m.state === "beta";
            return (
              <motion.li
                key={m.code}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="glass-panel p-5 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-zinc-500 tracking-tactical">
                    {m.code}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase border tracking-tactical",
                      isBeta
                        ? "bg-flare-400/10 text-flare-400 border-flare-400/30"
                        : "bg-vital-400/10 text-vital-300 border-vital-400/30"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isBeta ? "bg-flare-400" : "bg-vital-400 animate-pulse-vital"
                      )}
                    />
                    {m.state}
                  </span>
                </div>

                <h3 className="text-base font-medium text-white tracking-tight leading-snug">
                  {m.name}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-400 font-mono">
                  {m.note}
                </p>

                {/* Hover accent line */}
                <div
                  aria-hidden
                  className={cn(
                    "absolute left-5 right-5 bottom-3 h-px",
                    "bg-gradient-to-r from-signal-400/40 via-vital-400/40 to-transparent",
                    "scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100"
                  )}
                />
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
