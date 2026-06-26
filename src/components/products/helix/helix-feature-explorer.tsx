"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Rocket,
  Cpu,
  GitBranch,
  MonitorPlay,
  Code2,
  ShieldCheck,
  Check,
  type LucideIcon,
} from "lucide-react";
import { HELIX_FEATURES } from "@/lib/products";
import { SectionHeader } from "@/components/shared/section-header";
import { easeOut } from "@/lib/motion";

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  Cpu,
  GitBranch,
  MonitorPlay,
  Code2,
  ShieldCheck,
};

/** Interactive feature explorer — tab list on the left, detail on the right. */
export function HelixFeatureExplorer() {
  const [active, setActive] = useState(0);
  const feature = HELIX_FEATURES[active];
  const accent = feature.accent === "vital" ? "text-vital-300" : "text-signal-300";

  return (
    <section className="container py-24 lg:py-32">
      <SectionHeader
        eyebrow="Feature explorer"
        title={
          <>
            A development platform, <span className="text-gradient-signal">not a toy</span>.
          </>
        }
        sub="Everything Helix does is in service of one promise: real software you can ship."
      />

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tab list */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {HELIX_FEATURES.map((f, i) => {
            const Icon = ICONS[f.icon] ?? Rocket;
            const isActive = i === active;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(i)}
                className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-white/20 bg-white/[0.05]"
                    : "border-white/[0.06] bg-white/[0.01] hover:border-white/12 hover:bg-white/[0.03]"
                }`}
              >
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 ${
                    isActive ? (f.accent === "vital" ? "text-vital-300" : "text-signal-300") : "text-zinc-400"
                  } bg-white/[0.03]`}
                >
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">{f.title}</span>
                  <span className="block text-xs text-zinc-500">{f.eyebrow}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="glass-panel h-full p-8"
            >
              <span className={`font-mono text-xs uppercase tracking-tactical ${accent}`}>
                {feature.eyebrow}
              </span>
              <h3 className="mt-3 font-display text-title text-white">{feature.title}</h3>
              <p className="mt-4 text-zinc-400 leading-relaxed">{feature.body}</p>
              <ul className="mt-7 space-y-3">
                {feature.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-zinc-200">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        feature.accent === "vital" ? "bg-vital-300/15 text-vital-300" : "bg-signal-300/15 text-signal-300"
                      }`}
                    >
                      <Check size={12} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
