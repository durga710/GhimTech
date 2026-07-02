"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Density = "compact" | "comfortable" | "spacious";
type BoolPref = "peaceOfMindMode" | "notificationEmail" | "weeklyDigest" | "aiBriefEnabled";

interface Prefs {
  peaceOfMindMode: boolean;
  notificationEmail: boolean;
  weeklyDigest: boolean;
  aiBriefEnabled: boolean;
  dashboardDensity: Density;
}

const TOGGLES: { key: BoolPref; label: string; desc: string }[] = [
  { key: "peaceOfMindMode", label: "Peace of Mind Mode", desc: "Surface only what needs attention; suppress the rest." },
  { key: "notificationEmail", label: "Email notifications", desc: "Email me when something important happens." },
  { key: "weeklyDigest", label: "Weekly digest", desc: "A Monday summary of progress and your queue." },
  { key: "aiBriefEnabled", label: "Daily AI brief", desc: "Generate a morning brief of what matters today." },
];

/**
 * Settings form. Every change persists immediately via PATCH /api/preferences
 * (optimistic local state), so there's no separate save button.
 */
export function SettingsForm({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [saved, setSaved] = useState(false);

  async function update(patch: Partial<Prefs>) {
    setPrefs((p) => ({ ...p, ...patch }));
    setSaved(false);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1600);
      }
    } catch {
      /* optimistic */
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <section className="glass-panel-strong p-6">
        <h2 className="label-tactical mb-4">Preferences</h2>
        <div className="divide-y divide-white/[0.06]">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div>
                <div className="text-sm text-white">{t.label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[t.key]}
                aria-label={t.label}
                onClick={() => update({ [t.key]: !prefs[t.key] } as Partial<Prefs>)}
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                  prefs[t.key] ? "bg-vital-400" : "bg-white/10 hover:bg-white/15"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full transition-all",
                    prefs[t.key] ? "right-1 bg-ink-950" : "left-1 bg-white"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel-strong p-6">
        <h2 className="label-tactical mb-4">Dashboard density</h2>
        <div className="grid grid-cols-3 gap-2">
          {(["compact", "comfortable", "spacious"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => update({ dashboardDensity: d })}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-xs font-medium capitalize transition-colors",
                prefs.dashboardDensity === d
                  ? "bg-signal-400/10 border-signal-400/40 text-signal-200"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <div className="h-5 font-mono text-xs text-vital-300">{saved ? "✓ Saved" : ""}</div>
    </div>
  );
}
