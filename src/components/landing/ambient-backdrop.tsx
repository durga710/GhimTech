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
        className="absolute inset-0 bg-carbon-grid bg-grid-md opacity-45"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      {/* Aurora signal — top */}
      <motion.div
        className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[920px] w-[1280px] rounded-full
                   bg-[radial-gradient(circle,rgba(86,168,255,0.3),transparent_60%)]
                   blur-3xl"
        animate={{ scale: [1, 1.06, 1], opacity: [0.62, 1, 0.62] }}
        transition={{ duration: 12, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* Aurora vital — bottom corner */}
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[760px] w-[760px] rounded-full
                   bg-[radial-gradient(circle,rgba(49,227,154,0.18),transparent_60%)]
                   blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.48, 0.82, 0.48] }}
        transition={{ duration: 14, repeat: Infinity, ease: [0.65, 0, 0.35, 1], delay: 2 }}
      />

      {/* Warm accent — keeps the backdrop from feeling too sterile */}
      <motion.div
        className="absolute left-1/3 top-2/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full
                   bg-[radial-gradient(circle,rgba(255,183,74,0.12),transparent_62%)]
                   blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.22, 0.42, 0.22] }}
        transition={{ duration: 16, repeat: Infinity, ease: [0.65, 0, 0.35, 1], delay: 1 }}
      />

      {/* Scan line — slow drift, HUD reference */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-signal-300/40 to-transparent blur-[0.5px]"
        animate={{ y: ["-20vh", "120vh"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(4,5,8,0.82)_92%)]" />
    </div>
  );
}
