"use client";

import { motion } from "framer-motion";
import { COMPANY, CULTURE } from "@/lib/company";
import { FOUNDER } from "@/lib/content";
import { Logo } from "@/components/shared/logo";
import { SectionHeader } from "@/components/shared/section-header";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

/** Company-first About intro: positioning, beliefs, and leadership. */
export function AboutCompany() {
  return (
    <>
      {/* Intro */}
      <section className="relative pt-40 pb-12 lg:pt-48">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-70" />
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.span variants={fadeUp} className="eyebrow">
              About {COMPANY.name}
            </motion.span>
            <motion.h1 variants={blurIn} className="mt-5 font-display text-hero text-white text-balance">
              We build software the way it{" "}
              <span className="text-gradient-signal">should be built</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
              {COMPANY.name} is a technology company building AI-powered software that is intelligent,
              beautifully engineered, and genuinely useful. We are small and founder-led by design — close
              to the code, close to the customer, and unwilling to ship anything we wouldn&apos;t stake our
              name on.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-lg text-zinc-400 leading-relaxed">
              Founded in {COMPANY.founded}, we work where intelligent software changes real outcomes —
              healthcare operations, developer tools, and the everyday systems that run a business.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="What we believe"
          title={
            <>
              A few convictions we <span className="text-gradient-vital">don&apos;t compromise</span>.
            </>
          }
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {CULTURE.map((c, i) => (
            <motion.div
              key={c.title}
              variants={fadeUp}
              className="glass-panel p-6"
            >
              <span className="font-mono text-xs text-signal-300">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-medium text-white">{c.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Leadership */}
      <section className="container py-20">
        <SectionHeader eyebrow="Leadership" title="Who's behind it." />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          <motion.div variants={fadeUp} className="lg:col-span-4">
            <div className="glass-panel-strong p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-400/30 to-vital-400/20 font-display text-xl font-semibold text-white">
                  {FOUNDER.name.charAt(0)}
                </div>
                <div>
                  <div className="text-base font-medium text-white">{FOUNDER.name}</div>
                  <div className="text-xs text-zinc-500">Founder · {COMPANY.name}</div>
                </div>
              </div>
              <div className="hairline my-5" />
              <dl className="space-y-2.5 font-mono text-xs">
                {[
                  ["Role", "Founder · Builder"],
                  ["Background", "USMC Veteran"],
                  ["Origin", "Nepal → United States"],
                  ["Focus", "AI-native software"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <dt className="uppercase tracking-tactical text-zinc-500">{k}</dt>
                    <dd className="text-zinc-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-8">
            <p className="text-lg text-zinc-300 leading-relaxed">
              {COMPANY.name} is led by {FOUNDER.name} — a U.S. Marine Corps veteran who brought
              operational discipline from the Corps into software. The through-line from the mountains of
              Nepal to the Marines to building operating systems is the same: build the boring fundamentals
              exceptionally well, and trust compounds.
            </p>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              That standard is the company&apos;s standard. Below is the story of how we got here.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-zinc-500">
              <Logo variant="mark" size={20} className="text-signal-400" />
              <span className="font-mono text-xs uppercase tracking-tactical">
                One standard, every product
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
