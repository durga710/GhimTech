import { ShieldCheck } from "lucide-react";
import { FOUNDER } from "@/lib/content";

export function FounderPanel() {
  return (
    <div className="surface-premium grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid h-16 w-16 place-items-center rounded-xl bg-slate-900 text-xl font-semibold text-white">
          DG
        </div>
        <div className="mt-5 text-xl font-medium text-slate-950">{FOUNDER.name}</div>
        <p className="mt-2 text-sm text-slate-600">{FOUNDER.title}</p>
      </div>
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          Founder-led discipline
        </div>
        <h3 className="mt-5 max-w-2xl font-display text-3xl leading-tight text-slate-950">
          Built by an operator who cares about trust, accountability, and real product outcomes.
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
          Durga Ghimeray is a USMC Veteran and Nepali entrepreneur building GhimTech across healthcare operations, developer tools, AI systems, and accountability software. The company stays small, exacting, and focused on software that has to be trusted.
        </p>
      </div>
    </div>
  );
}
