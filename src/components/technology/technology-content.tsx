"use client";

import { motion } from "framer-motion";
import { ShieldCheck, FileCheck2, KeyRound, ScrollText, Gauge, Boxes } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

const STACK: { group: string; items: string[] }[] = [
  { group: "Framework", items: ["Next.js 15", "React Server Components", "TypeScript", "Edge-ready"] },
  { group: "Interface", items: ["Tailwind CSS", "Framer Motion", "Radix UI", "Geist"] },
  { group: "Data", items: ["PostgreSQL", "Prisma", "Supabase", "Zod"] },
  { group: "Intelligence", items: ["OpenAI", "Anthropic", "Local models", "Tool calling"] },
  { group: "Delivery", items: ["Vercel", "Preview deploys", "GitHub", "CI checks"] },
  { group: "State", items: ["TanStack Query", "Zustand", "Server actions", "Streaming"] },
];

const PRACTICES: { icon: typeof ShieldCheck; title: string; body: string }[] = [
  { icon: FileCheck2, title: "Typed end-to-end", body: "TypeScript from the database to the DOM. Schemas are the single source of truth, inferred — never duplicated." },
  { icon: ScrollText, title: "Validated at every boundary", body: "Every request body is parsed with Zod before it touches business logic. Untrusted input never gets the benefit of the doubt." },
  { icon: KeyRound, title: "Ownership-enforced", body: "Every query is scoped to the authenticated user. Single-resource lookups return 404 — never 403 — so we never leak what exists." },
  { icon: ScrollText, title: "Audited on every write", body: "Creates, updates, and deletes append to an immutable audit log with actor, diff, IP, and user-agent. Forensics-ready by default." },
  { icon: Gauge, title: "Rate-limited", body: "Per-user and per-IP limits guard every endpoint, tuned to the cost of the operation. Abuse is bounded, not assumed away." },
  { icon: ShieldCheck, title: "AI confirms, never assumes", body: "Automation proposes; people decide. AI surfaces are explicit, reversible, and locked down until you turn them on." },
];

export function TechnologyContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-12 lg:pt-48">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-70" />
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.span variants={fadeUp} className="eyebrow">
              Technology
            </motion.span>
            <motion.h1 variants={blurIn} className="mt-5 font-display text-hero text-white text-balance">
              Boring fundamentals, <span className="text-gradient-signal">done exceptionally</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
              We build modern, AI-native software on a foundation we trust: typed end-to-end, validated at
              every boundary, audited on every write. Here&apos;s how it&apos;s put together.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stack */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="The stack"
          title={
            <>
              Proven tools, <span className="text-gradient-vital">chosen deliberately</span>.
            </>
          }
          sub="We favor battle-tested infrastructure over novelty. Every choice earns its place."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {STACK.map((s) => (
            <motion.div key={s.group} variants={fadeUp} className="glass-panel p-6">
              <div className="flex items-center gap-2 text-signal-300">
                <Boxes size={16} />
                <span className="font-mono text-xs uppercase tracking-tactical">{s.group}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.items.map((i) => (
                  <span key={i} className="chip">
                    {i}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Practices */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="How we engineer"
          title={
            <>
              Trust is an <span className="text-gradient-signal">architecture decision</span>.
            </>
          }
          sub="The unglamorous guarantees that make our software dependable."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {PRACTICES.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.title} variants={fadeUp} className="glass-panel p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-vital-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-base font-medium text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{p.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </>
  );
}
