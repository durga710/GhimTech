"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Compass, Layers, Rocket, HeartHandshake } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

const HOW_WE_WORK: { icon: typeof Compass; title: string; body: string }[] = [
  { icon: Layers, title: "Small team, real ownership", body: "No layers, no hand-offs. You own problems end-to-end, from the data model to the pixels." },
  { icon: Rocket, title: "Ship weekly", body: "We work in short, honest loops. Real software in production beats decks and roadmaps." },
  { icon: Compass, title: "High trust, low ego", body: "Strong opinions, held loosely. We argue about the work, then commit and move." },
  { icon: HeartHandshake, title: "Remote-friendly", body: "Async by default, deliberate about the moments that are better in person." },
];

const ROLES: { title: string; type: string; blurb: string }[] = [
  {
    title: "Founding Engineer",
    type: "Full-time · Remote",
    blurb: "Own major surfaces across Helix Studio and RayHealthEVV. Full-stack TypeScript, AI integration, and a high bar for craft.",
  },
  {
    title: "Product Designer",
    type: "Full-time · Remote",
    blurb: "Shape premium, motion-rich product experiences. Systems thinker who can also sweat a single interaction.",
  },
  {
    title: "Applied AI Engineer",
    type: "Full-time · Remote",
    blurb: "Build agentic workflows and tool-calling systems that are reliable, auditable, and genuinely useful.",
  },
];

export function CareersContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-12 lg:pt-48">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-vital opacity-60" />
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.span variants={fadeUp} className="eyebrow">
              Careers
            </motion.span>
            <motion.h1 variants={blurIn} className="mt-5 font-display text-hero text-white text-balance">
              Build software that <span className="text-gradient-vital">earns trust</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
              We&apos;re a small, founder-led team with an uncompromising standard. We hire selectively, give
              real ownership early, and care more about how you think than where you&apos;ve been.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* How we work */}
      <section className="container py-20">
        <SectionHeader eyebrow="How we work" title="The way we operate." />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {HOW_WE_WORK.map((w) => {
            const Icon = w.icon;
            return (
              <motion.div key={w.title} variants={fadeUp} className="glass-panel p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-vital-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-base font-medium text-white">{w.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{w.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Roles */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="Open roles"
          title={
            <>
              Where we&apos;re <span className="text-gradient-signal">hiring</span>.
            </>
          }
          sub="We keep our headcount small and our bar high. If one of these is you, reach out."
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 flex flex-col gap-3"
        >
          {ROLES.map((r) => (
            <motion.div key={r.title} variants={fadeUp}>
              <Link
                href={`/contact?role=${encodeURIComponent(r.title)}`}
                className="group flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-white">{r.title}</h3>
                    <span className="chip">{r.type}</span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-400 leading-relaxed">{r.blurb}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-signal-300">
                  Apply
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-sm text-zinc-500">
          Don&apos;t see your role?{" "}
          <Link href="/contact" className="text-signal-300 hover:text-signal-200">
            Introduce yourself
          </Link>{" "}
          — we&apos;re always glad to meet exceptional people.
        </p>
      </section>
    </>
  );
}
