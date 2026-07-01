import { Lock, Radar, ServerCog, Sparkles, TestTube2, Workflow } from "lucide-react";
import { TECHNOLOGY_PILLARS } from "@/lib/content";
import { MarketingSection, MarketingSectionHeader } from "@/components/marketing/marketing-section";

const ICONS = [TestTube2, Lock, Radar, Sparkles, ServerCog, Workflow];

export function TechnologyGrid() {
  return (
    <MarketingSection id="technology">
      <MarketingSectionHeader
        eyebrow="Technology"
        title={<>Systems designed to be trusted.</>}
        body="The product standard is simple: type-safe, privacy-aware, observable, accessible, and explicit about when AI needs human judgment."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TECHNOLOGY_PILLARS.map((pillar, index) => {
          const Icon = ICONS[index] ?? ServerCog;
          return (
            <article key={pillar.title} className="surface-subtle p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-signal-300/20 bg-signal-300/10 text-signal-200">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{pillar.body}</p>
            </article>
          );
        })}
      </div>
    </MarketingSection>
  );
}
