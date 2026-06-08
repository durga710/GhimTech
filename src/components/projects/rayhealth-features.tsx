"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/lib/projects";
import { SectionHeader } from "@/components/shared/section-header";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Feature showcase.
 *
 * Six marquee features rendered as alternating left/right blocks. Each block
 * has a body column and a "visual" column with an abstract animated diagram
 * built from divs + SVG — never a real screenshot, so it stays on-brand
 * regardless of what the actual product UI looks like at any moment.
 *
 * Each `FeatureVisual` is keyed off the feature id and renders a different
 * abstract diagram.
 */
export function RayHealthFeatures() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container">
        <SectionHeader
          eyebrow="Marquee features · how it works"
          title={
            <>
              Six surfaces that <span className="text-gradient-vital">define</span> the platform.
            </>
          }
          sub="Each one is a deliberate answer to a real failure mode of home-care software."
        />

        <div className="mt-20 space-y-28 lg:space-y-40">
          {FEATURES.map((f, i) => (
            <FeatureBlock key={f.id} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
interface FeatureBlockProps {
  feature: (typeof FEATURES)[number];
  index: number;
}

function FeatureBlock({ feature, index }: FeatureBlockProps) {
  const flip = index % 2 === 1;
  const accentClasses =
    feature.accent === "vital"
      ? { text: "text-vital-300", dot: "bg-vital-400", glow: "shadow-glow-vital" }
      : { text: "text-signal-300", dot: "bg-signal-400", glow: "shadow-glow-signal" };

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
    >
      {/* TEXT */}
      <motion.div
        variants={fadeUp}
        className={cn("lg:col-span-5", flip ? "lg:order-2" : "lg:order-1")}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className={cn("status-dot", accentClasses.dot)} />
          <span className={cn("label-tactical", accentClasses.text)}>
            {feature.eyebrow}
          </span>
        </div>
        <h3 className="font-display text-4xl lg:text-5xl text-white tracking-tight leading-[1.05]">
          {feature.title}
        </h3>
        <p className="mt-5 text-lg text-zinc-400 leading-relaxed">{feature.body}</p>
        <ul className="mt-6 space-y-2.5">
          {feature.bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 text-sm text-zinc-300"
            >
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                  accentClasses.dot,
                  accentClasses.glow
                )}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* VISUAL */}
      <motion.div
        variants={fadeUp}
        className={cn(
          "lg:col-span-7",
          flip ? "lg:order-1" : "lg:order-2"
        )}
      >
        <FeatureVisual featureId={feature.id} accent={feature.accent} />
      </motion.div>
    </motion.article>
  );
}

/* ============================================================
   Per-feature abstract visualization.
   Different diagram for each so the page doesn't repeat itself.
   ============================================================ */
function FeatureVisual({
  featureId,
  accent,
}: {
  featureId: string;
  accent: string;
}) {
  const accentColor = accent === "vital" ? "#1fe294" : "#3aa4ff";

  switch (featureId) {
    case "command-glass":
      return <VisualCommandGlass color={accentColor} />;
    case "invitation-onboarding":
      return <VisualInvitation color={accentColor} />;
    case "missed-punch":
      return <VisualMissedPunch color={accentColor} />;
    case "ai-copilot":
      return <VisualAICopilot color={accentColor} />;
    case "mobile":
      return <VisualMobile color={accentColor} />;
    case "legal":
      return <VisualLegal color={accentColor} />;
    default:
      return <VisualCommandGlass color={accentColor} />;
  }
}

/* ============ Visual 1 — Command Glass (layered panels) ============ */
function VisualCommandGlass({ color }: { color: string }) {
  return (
    <div className="relative aspect-[4/3] glass-panel-strong overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top right, ${color}22, transparent 60%)` }} />
      <div className="absolute inset-6 grid grid-cols-6 gap-3">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-md bg-white/[0.04] border border-white/[0.06]"
            style={{ minHeight: 28 + ((i * 13) % 32) }}
          />
        ))}
      </div>
      <div className="absolute bottom-6 left-6 right-6 glass-panel p-3">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="label-tactical">Owner surface</span>
          <span style={{ color }}>● unified</span>
        </div>
      </div>
    </div>
  );
}

/* ============ Visual 2 — Invitation flow ============ */
function VisualInvitation({ color }: { color: string }) {
  return (
    <div className="relative aspect-[4/3] glass-panel-strong p-8 flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${color}22, transparent 60%)` }} />

      {/* Three nodes connected by lines */}
      <svg viewBox="0 0 400 280" className="w-full h-full relative">
        {/* Connection lines */}
        <motion.path
          d="M 80 140 L 200 140"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        <motion.path
          d="M 200 140 L 320 140"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.6 }}
        />

        {/* Node 1 — Admin */}
        <g>
          <circle cx="80" cy="140" r="32" fill="rgba(15,18,24,0.8)" stroke={color} strokeWidth="1.5" />
          <text x="80" y="144" textAnchor="middle" fill="white" fontSize="11" fontFamily="JetBrains Mono">ADMIN</text>
          <text x="80" y="190" textAnchor="middle" fill="#8a92a1" fontSize="9" fontFamily="JetBrains Mono">SENDS INVITE</text>
        </g>

        {/* Node 2 — Email */}
        <g>
          <rect x="170" y="115" width="60" height="50" rx="6" fill="rgba(15,18,24,0.8)" stroke={color} strokeWidth="1.5" />
          <text x="200" y="138" textAnchor="middle" fill="white" fontSize="10" fontFamily="JetBrains Mono">EMAIL +</text>
          <text x="200" y="152" textAnchor="middle" fill={color} fontSize="10" fontFamily="JetBrains Mono">CODE</text>
          <text x="200" y="190" textAnchor="middle" fill="#8a92a1" fontSize="9" fontFamily="JetBrains Mono">ACCESS GATE</text>
        </g>

        {/* Node 3 — Caregiver */}
        <g>
          <circle cx="320" cy="140" r="32" fill="rgba(15,18,24,0.8)" stroke={color} strokeWidth="1.5" />
          <text x="320" y="138" textAnchor="middle" fill="white" fontSize="9" fontFamily="JetBrains Mono">CARE-</text>
          <text x="320" y="150" textAnchor="middle" fill="white" fontSize="9" fontFamily="JetBrains Mono">GIVER</text>
          <text x="320" y="190" textAnchor="middle" fill="#8a92a1" fontSize="9" fontFamily="JetBrains Mono">ACCEPTS</text>
        </g>

        {/* Title */}
        <text x="200" y="50" textAnchor="middle" fill="#8a92a1" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="2">INVITATION FLOW</text>
      </svg>
    </div>
  );
}

/* ============ Visual 3 — Missed punch queue ============ */
function VisualMissedPunch({ color }: { color: string }) {
  const rows = [
    { name: "Visit · M.S.", time: "08:14", status: "Missed", c: "flare" },
    { name: "Visit · L.K.", time: "11:32", status: "Signature pending", c: "signal" },
    { name: "Visit · R.D.", time: "14:08", status: "Approved", c: "vital" },
    { name: "Visit · A.P.", time: "16:45", status: "Approved", c: "vital" },
  ];
  return (
    <div className="relative aspect-[4/3] glass-panel-strong p-6 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at bottom, ${color}22, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="label-tactical">Coordinator review queue</span>
          <span className="font-mono text-xs text-flare-400">2 awaiting</span>
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="glass-panel p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-500">{r.time}</span>
                <span className="text-sm text-zinc-200">{r.name}</span>
              </div>
              <span
                className={cn(
                  "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-tactical",
                  r.c === "vital" ? "text-vital-300" : r.c === "flare" ? "text-flare-400" : "text-signal-300"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    r.c === "vital" ? "bg-vital-400" : r.c === "flare" ? "bg-flare-400" : "bg-signal-400"
                  )}
                />
                {r.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ Visual 4 — AI Copilot (prompt → confirm) ============ */
function VisualAICopilot({ color }: { color: string }) {
  return (
    <div className="relative aspect-[4/3] glass-panel-strong p-6 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top left, ${color}22, transparent 60%)` }} />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="label-tactical">Copilot · Owner role</span>
          <span className="font-mono text-[10px] text-vital-300">⌘ confirm</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-3"
        >
          <div className="text-[10px] font-mono text-zinc-500 mb-1">PROMPT</div>
          <div className="text-sm text-zinc-200">
            Reassign Tuesday&apos;s morning visits for the West cluster
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="glass-panel p-3"
          style={{ borderColor: `${color}40` }}
        >
          <div className="text-[10px] font-mono mb-1" style={{ color }}>PROPOSED ACTION · DEEP</div>
          <div className="text-sm text-zinc-200">
            Move 7 visits from caregiver Jordan → Riley & Sam.
          </div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 rounded-full text-[11px] font-medium text-white" style={{ background: color }}>
              Confirm
            </button>
            <button className="px-3 py-1 rounded-full text-[11px] font-medium text-zinc-300 bg-white/5 border border-white/10">
              Modify
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] font-mono text-zinc-500"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-vital-400 animate-pulse-vital" />
          Confirm-every-action policy active · private billing
        </motion.div>
      </div>
    </div>
  );
}

/* ============ Visual 5 — Mobile devices ============ */
function VisualMobile({ color }: { color: string }) {
  return (
    <div className="relative aspect-[4/3] glass-panel-strong overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${color}22, transparent 60%)` }} />

      <div className="relative flex items-end gap-6">
        {/* iOS device */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -4 }}
          whileInView={{ opacity: 1, y: 0, rotate: -4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-32 h-56 rounded-3xl bg-ink-800 border border-white/[0.08] p-2 shadow-2xl"
        >
          <div className="w-full h-full rounded-2xl bg-ink-900 relative overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-ink-700" />
            <div className="mt-6 px-3 space-y-1.5">
              <div className="h-2 w-1/2 rounded-full bg-white/10" />
              <div className="h-1.5 w-3/4 rounded-full bg-white/5" />
            </div>
            <div className="mt-4 px-3 space-y-1.5">
              <div className="glass-panel p-2 rounded-md">
                <div className="h-1 w-1/3 rounded-full bg-vital-400 mb-1" />
                <div className="h-1 w-2/3 rounded-full bg-white/10" />
              </div>
              <div className="glass-panel p-2 rounded-md">
                <div className="h-1 w-1/4 rounded-full bg-signal-400 mb-1" />
                <div className="h-1 w-3/4 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[7px] text-zinc-500 tracking-tactical">iOS</div>
          </div>
        </motion.div>

        {/* Android device */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: 4 }}
          whileInView={{ opacity: 1, y: 0, rotate: 4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-32 h-60 rounded-2xl bg-ink-800 border border-white/[0.08] p-2 shadow-2xl"
        >
          <div className="w-full h-full rounded-xl bg-ink-900 relative overflow-hidden">
            <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-ink-700" />
            <div className="mt-6 px-3 space-y-1.5">
              <div className="h-2 w-2/3 rounded-full bg-white/10" />
              <div className="h-1.5 w-1/2 rounded-full bg-white/5" />
            </div>
            <div className="mt-4 px-3 space-y-1.5">
              <div className="glass-panel p-2 rounded-md">
                <div className="h-1 w-1/2 rounded-full bg-vital-400 mb-1" />
                <div className="h-1 w-2/3 rounded-full bg-white/10" />
              </div>
              <div className="glass-panel p-2 rounded-md">
                <div className="h-1 w-1/3 rounded-full bg-signal-400 mb-1" />
                <div className="h-1 w-1/2 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[7px] text-zinc-500 tracking-tactical">ANDROID</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ============ Visual 6 — Legal templates ============ */
function VisualLegal({ color }: { color: string }) {
  const docs = [
    "Service Agreement",
    "Caregiver Handbook",
    "HIPAA Acknowledgment",
    "EVV Consent",
    "State Medicaid Cert",
  ];
  return (
    <div className="relative aspect-[4/3] glass-panel-strong p-6 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at bottom right, ${color}22, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="label-tactical">Per-agency legal kit</span>
          <span className="font-mono text-xs text-vital-300">dynamic</span>
        </div>
        <div className="space-y-2">
          {docs.map((d, i) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-panel p-3 flex items-center gap-3"
            >
              <div className="h-7 w-7 rounded grid place-items-center" style={{ background: `${color}22`, border: `1px solid ${color}40` }}>
                <span className="font-mono text-[10px]" style={{ color }}>PDF</span>
              </div>
              <div className="flex-1">
                <div className="text-sm text-zinc-200">{d}</div>
                <div className="text-[10px] font-mono text-zinc-500">agency-customized · v2.{i + 1}</div>
              </div>
              <span className="font-mono text-[10px] text-vital-300">↓</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
