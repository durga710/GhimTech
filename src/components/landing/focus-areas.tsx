"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Stethoscope,
  Terminal,
  Workflow,
  LayoutDashboard,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { FOCUS_AREAS } from "@/lib/company";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp, staggerContainer } from "@/lib/motion";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Stethoscope,
  Terminal,
  Workflow,
  LayoutDashboard,
  ShieldCheck,
};

/** "What we build" — the six domains GhimTech works in. */
export function FocusAreas() {
  return (
    <section className="container py-24 lg:py-32">
      <SectionHeader
        eyebrow="What we build"
        title={
          <>
            Software for the work that{" "}
            <span className="text-gradient-signal">actually matters</span>.
          </>
        }
        sub="We focus where intelligent software changes outcomes — not where it makes a flashy demo."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {FOCUS_AREAS.map((area) => {
          const Icon = ICONS[area.icon] ?? Sparkles;
          const accent = area.accent === "vital" ? "text-vital-300" : "text-signal-300";
          return (
            <motion.div
              key={area.id}
              variants={fadeUp}
              className="group glass-panel p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] ${accent}`}
              >
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">{area.title}</h3>
              <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">{area.body}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
