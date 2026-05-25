import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getDailySummary } from "@/lib/dashboard/data";
import { relativeTime } from "@/lib/dashboard/format";
import { GenerateBriefButton } from "@/components/dashboard/copilot/generate-brief-button";

export const metadata: Metadata = {
  title: "AI Copilot",
  robots: { index: false, follow: false },
};

export default async function CopilotPage() {
  const brief = await getDailySummary();
  const isPlaceholder = brief.id === "placeholder";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-signal-400/10 border border-signal-400/20">
            <Sparkles className="h-5 w-5 text-signal-300" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">AI Copilot</h1>
            <p className="text-sm text-zinc-500">Your daily operations brief, by GPT-5</p>
          </div>
        </div>
        <GenerateBriefButton />
      </header>

      <section className="glass-panel-strong p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="label-tactical">Daily brief</span>
          {!isPlaceholder && (
            <span className="font-mono text-[10px] text-zinc-500">· {relativeTime(brief.generatedAt)}</span>
          )}
        </div>

        <h2 className="text-2xl font-semibold leading-tight text-gradient-signal">{brief.headline}</h2>
        <p className="mt-4 text-sm text-zinc-300 leading-relaxed max-w-2xl">{brief.body}</p>

        {brief.highlights.length > 0 && (
          <ul className="mt-6 space-y-2">
            {brief.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-signal-400 shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {isPlaceholder && (
          <p className="mt-6 text-xs text-zinc-600">
            No brief generated yet — hit “Generate brief” to create your first one from your projects and tasks.
          </p>
        )}
      </section>
    </div>
  );
}
