"use client";

import { motion } from "framer-motion";

/**
 * Ambient background layer.
 * Pure decorative. Sits behind hero content. Built from:
 *   - Carbon grid (Tailwind bg-carbon-grid)
 *   - Two animated radial gradients (signal blue overhead, vital emerald below)
 *   - A single horizontal scanline that drifts down — military HUD reference
 *
 * Pointer-events: none everywhere so it never blocks interaction.
 */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Carbon grid with radial mask so it fades toward edges */}
      <div
        className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-60"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      {/* Aurora signal — top */}
      <motion.div
        className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[800px] w-[1200px] rounded-full
                   bg-[radial-gradient(circle,rgba(58,164,255,0.25),transparent_60%)]
                   blur-3xl"
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 12, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* Aurora vital — bottom corner */}
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[700px] w-[700px] rounded-full
                   bg-[radial-gradient(circle,rgba(31,226,148,0.18),transparent_60%)]
                   blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: [0.65, 0, 0.35, 1], delay: 2 }}
      />

      {/* Scan line — slow drift, HUD reference */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-signal-400/40 to-transparent"
        animate={{ y: ["-20vh", "120vh"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(4,5,8,0.8)_90%)]" />
    </div>
  );
}
