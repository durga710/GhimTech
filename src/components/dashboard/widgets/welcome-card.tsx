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
      className="glass-panel-strong p-8 relative overflow-hidden hud-corners"
    >
      <span className="hud-corner-tl" aria-hidden />
      <span className="hud-corner-br" aria-hidden />

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

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT — Greeting + headline */}
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <div className="flex items-center gap-3 mb-5">
            <span className="status-dot status-dot-live" />
            <span className="label-tactical">Morning brief · auto-generated</span>
          </div>

          <h1 className="font-display text-4xl lg:text-5xl text-white tracking-tight leading-[1.05]">
            {greeting},{" "}
            <span className="text-gradient-signal">{displayName}</span>.
          </h1>

          <p className="mt-6 text-lg text-zinc-300 leading-relaxed">
            {summary.headline}
          </p>

          <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
            {summary.body}
          </p>
        </motion.div>

        {/* RIGHT — Highlights checklist */}
        <motion.div variants={fadeUp} className="lg:col-span-5">
          <div className="glass-panel p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-signal-400/15 border border-signal-400/30 grid place-items-center">
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
