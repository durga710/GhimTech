"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Sparkles, Loader2, Check, Flag, Map as MapIcon, CheckSquare, X } from "lucide-react";

interface Proposal {
  direction: string;
  summary: string;
  suggestedProgress: number;
  milestones: { title: string; description: string }[];
  roadmap: { title: string; quarter: string; status: string }[];
  tasks: { title: string; priority: string }[];
}

/**
 * Reads the project's linked GitHub repo via the Copilot, shows the proposed
 * tracker updates, and applies them only on the operator's approval.
 */
export function CopilotSyncPanel({
  projectId,
  repo,
  currentProgress,
}: {
  projectId: string;
  repo: string;
  currentProgress: number;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "syncing" | "applying">("idle");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function sync() {
    setPhase("syncing");
    setError(null);
    setDone(null);
    setProposal(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/copilot-sync`, { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "Sync failed.");
      } else {
        setProposal(json.data.proposal as Proposal);
      }
    } catch {
      setError("Network error.");
    }
    setPhase("idle");
  }

  async function apply() {
    if (!proposal) return;
    setPhase("applying");
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/copilot-apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestedProgress: proposal.suggestedProgress,
          milestones: proposal.milestones,
          roadmap: proposal.roadmap,
          tasks: proposal.tasks,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "Apply failed.");
      } else {
        const a = json.data.applied as { milestones: number; roadmap: number; tasks: number };
        setDone(`Applied — ${a.milestones} milestones, ${a.roadmap} roadmap items, ${a.tasks} tasks.`);
        setProposal(null);
        router.refresh();
      }
    } catch {
      setError("Network error.");
    }
    setPhase("idle");
  }

  return (
    <section className="glass-panel-strong p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Github className="h-4 w-4 text-signal-300 shrink-0" />
          <h2 className="label-tactical truncate">Copilot · source: {repo}</h2>
        </div>
        <button type="button" onClick={sync} disabled={phase !== "idle"} className="btn-signal text-xs shrink-0 disabled:opacity-50">
          {phase === "syncing" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading repo…
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" /> Propose updates
            </>
          )}
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        GPT-5 reads the repo (README, status &amp; next-steps docs, open issues, recent commits) and proposes tracker
        updates for your approval — nothing is written until you apply.
      </p>

      {error && <p className="mt-3 text-xs text-critical-400">{error}</p>}
      {done && (
        <p className="mt-3 text-xs text-vital-300 flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" /> {done}
        </p>
      )}

      {proposal && (
        <div className="mt-5 space-y-5">
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-4">
            <div className="label-tactical mb-1">Direction</div>
            <p className="text-sm text-zinc-200 leading-relaxed">{proposal.direction || proposal.summary}</p>
            <div className="mt-3 text-xs text-zinc-400">
              Suggested progress: <span className="font-mono text-signal-200">{proposal.suggestedProgress}%</span>{" "}
              <span className="text-zinc-600">(currently {currentProgress}%)</span>
            </div>
          </div>

          {proposal.milestones.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Flag className="h-3.5 w-3.5 text-zinc-400" />
                <span className="label-tactical">New milestones ({proposal.milestones.length})</span>
              </div>
              <ul className="space-y-1.5">
                {proposal.milestones.map((m, i) => (
                  <li key={i} className="text-sm text-zinc-300">
                    • {m.title}
                    {m.description && <span className="text-zinc-500"> — {m.description}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {proposal.roadmap.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span className="label-tactical">New roadmap ({proposal.roadmap.length})</span>
              </div>
              <ul className="space-y-1.5">
                {proposal.roadmap.map((r, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                    • {r.title}
                    {r.quarter && <span className="font-mono text-[10px] text-zinc-500">{r.quarter}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {proposal.tasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckSquare className="h-3.5 w-3.5 text-zinc-400" />
                <span className="label-tactical">New tasks ({proposal.tasks.length})</span>
              </div>
              <ul className="space-y-1.5">
                {proposal.tasks.map((t, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                    • {t.title}
                    <span className="font-mono text-[10px] text-zinc-500 capitalize">{t.priority.toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={apply} disabled={phase === "applying"} className="btn-signal text-xs disabled:opacity-50">
              {phase === "applying" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Applying…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Apply updates
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setProposal(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs text-zinc-400 border border-white/10 hover:text-white hover:border-white/20 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Discard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
