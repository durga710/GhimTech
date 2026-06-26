"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github, Rocket } from "lucide-react";
import { HELIX, HELIX_GITHUB } from "@/lib/products";
import { blurIn, fadeUp, staggerContainer, easeOut } from "@/lib/motion";

/**
 * Helix Studio hero — the flagship moment.
 * Left: positioning + CTAs. Right: an animated studio mockup (chat + live
 * preview pane) that echoes the real product.
 */
export function HelixHero() {
  return (
    <section className="relative pt-40 pb-16 lg:pt-48">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-80" />

      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
          <motion.span variants={fadeUp} className="pill">
            <span className="status-dot status-dot-signal" />
            {HELIX.status} · AI development platform
          </motion.span>

          <motion.h1 variants={blurIn} className="mt-6 font-display text-hero text-white text-balance">
            Helix <span className="text-gradient-signal">Studio</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 font-display text-title text-zinc-200">
            {HELIX.tagline}
          </motion.p>
          <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            {HELIX.oneLiner}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/dashboard/gcode" className="btn-signal group">
              <Rocket size={16} />
              Open the studio
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href={HELIX_GITHUB.url} target="_blank" rel="noreferrer" className="btn-ghost">
              <Github size={16} />
              View on GitHub
            </a>
          </motion.div>
        </motion.div>

        {/* Studio mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.25 }}
          className="mt-16 lg:mt-20"
        >
          <StudioMockup />
        </motion.div>
      </div>
    </section>
  );
}

function StudioMockup() {
  return (
    <div className="glass-panel-strong overflow-hidden p-0">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-critical-400/80" />
        <span className="h-3 w-3 rounded-full bg-flare-400/80" />
        <span className="h-3 w-3 rounded-full bg-vital-400/80" />
        <div className="ml-3 flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-zinc-400">
          helix.ghimtech.org/studio
        </div>
        <span className="ml-auto flex items-center gap-2 text-[11px] font-mono text-vital-300">
          <span className="status-dot status-dot-live" /> building
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Chat column */}
        <div className="border-b border-white/[0.06] p-5 lg:border-b-0 lg:border-r">
          <div className="label-tactical mb-4">Chat</div>
          <div className="space-y-3">
            <ChatBubble who="you">Build a pricing page with three tiers and a FAQ.</ChatBubble>
            <ChatBubble who="helix">
              Planning files… writing <span className="text-signal-300">page.tsx</span>,{" "}
              <span className="text-signal-300">pricing-card.tsx</span>,{" "}
              <span className="text-signal-300">faq.tsx</span>. Opening a pull request.
            </ChatBubble>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 rounded-lg border border-vital-300/20 bg-vital-300/[0.06] px-3 py-2 text-xs text-vital-200"
            >
              <span className="status-dot status-dot-live" />
              PR #128 opened · preview deploying
            </motion.div>
          </div>
        </div>

        {/* Preview pane */}
        <div className="p-5">
          <div className="label-tactical mb-4 flex items-center justify-between">
            <span>Live preview</span>
            <span className="text-zinc-600">vercel · iad1</span>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-ink-950/60 p-4">
            <div className="h-2.5 w-24 rounded-full bg-white/10" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["Starter", "Pro", "Scale"].map((tier, i) => (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.12, ease: easeOut }}
                  className={`rounded-lg border p-3 ${
                    i === 1 ? "border-signal-400/40 bg-signal-400/[0.08]" : "border-white/[0.07] bg-white/[0.02]"
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase tracking-tactical text-zinc-400">{tier}</div>
                  <div className="mt-2 font-display text-sm text-white">${(i + 1) * 9}</div>
                  <div className="mt-3 space-y-1.5">
                    {[0, 1, 2].map((r) => (
                      <div key={r} className="h-1 w-full rounded-full bg-white/[0.08]" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-1.5 w-full rounded-full bg-white/[0.06]" />
              <div className="h-1.5 w-4/5 rounded-full bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ who, children }: { who: "you" | "helix"; children: React.ReactNode }) {
  const isYou = who === "you";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ ease: easeOut }}
      className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
        isYou
          ? "ml-auto max-w-[85%] bg-vital-400/[0.12] text-zinc-100"
          : "max-w-[90%] bg-white/[0.04] text-zinc-300"
      }`}
    >
      {!isYou && (
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-tactical text-signal-300">
          Helix
        </span>
      )}
      {children}
    </motion.div>
  );
}
