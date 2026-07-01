"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashAgentSummary } from "@/lib/dashboard/data";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface WelcomeCardProps {
  firstName: string | null;
  summary: DashAgentSummary;
}

/**
 * Welcome card with daily AI summary.
 *
 * Reads as the operator's morning brief — a single calm panel that says:
 * "Here's what matters. Here's what I noticed. Here's what wants your judgment."
 *
 * The greeting adapts to time-of-day (morning/afternoon/evening). The summary
 * itself is currently mock; in Phase 5+ this will hit an OpenAI/Anthropic
 * call against project + task + deployment context for a real synthesis.
 */
export function WelcomeCard({ firstName, summary }: WelcomeCardProps) {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const displayName = firstName ?? "Operator";

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="surface-premium operating-console p-6 relative overflow-hidden lg:p-7"
    >
            
      {/* Subtle animated hairline at top */}
      <motion.div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-signal-400/60 to-transparent"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Background glow tracking the AI badge */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full
                   bg-[radial-gradient(circle,rgba(58,164,255,0.10),transparent_70%)] blur-2xl"
      />

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT — Greeting + headline */}
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="status-dot status-dot-live" />
            <span className="label-tactical">Morning brief · auto-generated</span>
            <span className="control-chip">
              <Sparkles className="h-3 w-3 text-signal-300" />
              Live synthesis
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.96] tracking-tightest text-white">
            {greeting},{" "}
            <span className="text-gradient-signal">{displayName}</span>.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zinc-300">
            {summary.headline}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            {summary.body}
          </p>
        </motion.div>

        {/* RIGHT — Highlights checklist */}
        <motion.div variants={fadeUp} className="lg:col-span-5">
          <div className="surface-subtle h-full p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg border border-signal-400/30 bg-signal-400/15">
                <Sparkles className="h-3.5 w-3.5 text-signal-300" />
              </div>
              <span className="label-tactical text-signal-300">
                Today&apos;s highlights
              </span>
            </div>

            <ul className="space-y-3">
              {summary.highlights.map((h, i) => (
                <motion.li
                  key={h}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3 + i * 0.08,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-3 text-sm text-zinc-200 leading-relaxed"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-signal-400 shadow-glow-signal shrink-0" />
                  <span>{h}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
