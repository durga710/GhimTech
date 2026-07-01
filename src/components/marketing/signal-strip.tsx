"use client";

import { motion } from "framer-motion";
import { HOME_SIGNALS } from "@/lib/content";

export function SignalStrip() {
  return (
    <div className="container">
      <div className="surface-subtle overflow-hidden px-4 py-3">
        <div className="mask-fade-edges flex overflow-hidden">
          <motion.div
            className="flex min-w-max gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          >
            {[...HOME_SIGNALS, ...HOME_SIGNALS].map((signal, index) => (
              <span key={`${signal}-${index}`} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-300" />
                {signal}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
