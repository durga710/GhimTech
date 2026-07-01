"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Bell, BellOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Peace of Mind Mode.
 *
 * The signature feature. When enabled, the dashboard:
 *   - suppresses non-critical notifications
 *   - dims non-essential widgets in the background
 *   - shows only the 1-3 items that *actually* need attention
 *
 * The idea: founders drown in noise. This is a one-tap "show me only
 * what matters right now" mode. In Phase 5 it persists per-user in
 * Prisma and actually filters visible content; for Phase 4 it's a
 * controlled local-state toggle that demonstrates the affordance.
 *
 * The animation is deliberately calm — slow easing, no bounce. The
 * mode itself is about calm; the interaction should match.
 */
export function PeaceOfMindMode() {
  const [enabled, setEnabled] = useState(false);

  return (
    <section
      className={cn(
        "surface-premium relative overflow-hidden p-6 transition-colors duration-700",
        enabled && "ring-1 ring-vital-400/30 bg-vital-400/[0.02]"
      )}
    >
      {/* Background glow — appears when enabled */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 pointer-events-none
                       bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(31,226,148,0.10),transparent_70%)]"
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: enabled ? 360 : 0,
              }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
              "grid h-10 w-10 place-items-center rounded-xl border transition-colors duration-500",
              enabled
                ? "bg-vital-400/15 border-vital-400/40 text-vital-300"
                : "bg-white/[0.03] border-white/[0.06] text-zinc-400"
            )}
          >
              <Shield className="h-4 w-4" />
            </motion.div>

            <div>
              <h2 className="font-display text-base font-medium text-white">
                Peace of Mind Mode
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Only what matters · suppress the rest
              </p>
            </div>
          </div>

          {/* Custom toggle — matches the design language */}
          <button
            type="button"
            onClick={() => setEnabled((e) => !e)}
            role="switch"
            aria-checked={enabled}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
              enabled
                ? "bg-vital-400 shadow-[0_0_24px_-4px_rgba(31,226,148,0.6)]"
                : "bg-white/10 hover:bg-white/15"
            )}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full transition-colors",
                enabled ? "right-1 bg-ink-950" : "left-1 bg-white"
              )}
            />
          </button>
        </div>

        {/* Status line */}
        <div className="flex items-center gap-2 text-xs font-mono pt-3 border-t border-white/[0.06]">
          {enabled ? (
            <>
              <BellOff className="h-3 w-3 text-vital-300" />
              <span className="text-vital-300">
                Active · 12 alerts muted, 1 critical visible
              </span>
            </>
          ) : (
            <>
              <Bell className="h-3 w-3 text-zinc-500" />
              <span className="text-zinc-500">All notifications visible</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
