"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Check, FileDown } from "lucide-react";
import { Modal } from "@/components/dashboard/ui/modal";

/**
 * "Work with Copilot" for a single task. GPT-5 produces the actual
 * deliverable (via /api/tasks/[id]/work); the operator can save it as a note
 * and mark the task done.
 */
export function TaskWorkButton({ taskId, title }: { taskId: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "working" | "saving">("idle");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);

  async function work() {
    setOpen(true);
    setPhase("working");
    setError(null);
    setOutput(null);
    setSavedNote(false);
    try {
      const res = await fetch(`/api/tasks/${taskId}/work`, { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "Couldn't work the task.");
      } else {
        setOutput(json.data.deliverable as string);
      }
    } catch {
      setError("Network error.");
    }
    setPhase("idle");
  }

  async function saveNote() {
    if (!output) return;
    setPhase("saving");
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Copilot: ${title}`.slice(0, 300), body: output, tags: ["copilot"] }),
      });
      setSavedNote(true);
    } catch {
      /* non-fatal */
    }
    setPhase("idle");
  }

  async function markDone() {
    setPhase("saving");
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      setOpen(false);
      router.refresh();
    } catch {
      /* non-fatal */
    }
    setPhase("idle");
  }

  return (
    <>
      <button
        type="button"
        onClick={work}
        title="Work with Copilot"
        aria-label="Work with Copilot"
        className="shrink-0 text-zinc-500 hover:text-signal-300 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Copilot · ${title}`} maxWidthClass="max-w-3xl">
        {phase === "working" && (
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-400 py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> GPT-5 is working the task…
          </div>
        )}
        {error && <p className="text-xs text-critical-400">{error}</p>}
        {output && (
          <div className="space-y-3">
            <div className="max-h-[55vh] overflow-y-auto rounded-lg bg-black/30 border border-white/[0.06] p-4 text-xs text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
              {output}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={saveNote}
                disabled={phase === "saving" || savedNote}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
              >
                {savedNote ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-vital-300" /> Saved to notes
                  </>
                ) : (
                  <>
                    <FileDown className="h-3.5 w-3.5" /> Save as note
                  </>
                )}
              </button>
              <button type="button" onClick={markDone} disabled={phase === "saving"} className="btn-signal text-xs disabled:opacity-50">
                <Check className="h-3.5 w-3.5" /> Mark done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
