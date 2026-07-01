import { ShieldCheck } from "lucide-react";
import { FOUNDER } from "@/lib/content";

export function FounderPanel() {
  return (
    <div className="surface-premium grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
      <div className="rounded-2xl border border-white/[0.08] bg-ink-950/50 p-5">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-signal-300 to-vital-300 text-xl font-semibold text-ink-950">
          DG
        </div>
        <div className="mt-5 text-xl font-medium text-white">{FOUNDER.name}</div>
        <p className="mt-2 text-sm text-zinc-400">{FOUNDER.title}</p>
      </div>
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-vital-300/20 bg-vital-300/10 px-3 py-1 text-xs font-medium text-vital-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Founder-led discipline
        </div>
        <h3 className="mt-5 max-w-2xl font-display text-3xl leading-tight text-white">
          Built by an operator who cares about trust, accountability, and real product outcomes.
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Durga Ghimeray is a USMC Veteran and Nepali entrepreneur building GhimTech across healthcare operations, developer tools, AI systems, and accountability software. The company stays small, exacting, and focused on software that has to be trusted.
        </p>
      </div>
    </div>
  );
}
