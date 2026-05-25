"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Modal, fieldInputClass } from "@/components/dashboard/ui/modal";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export function NewTaskButton({ projects }: { projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("TODO");
  const [projectId, setProjectId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setPriority("MEDIUM");
    setStatus("TODO");
    setProjectId("");
    setDueAt("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { title, priority, status };
      if (projectId) body.projectId = projectId;
      if (dueAt) body.dueAt = new Date(dueAt).toISOString();

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "Couldn't create task.");
        setBusy(false);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-signal text-xs shrink-0">
        <Plus className="h-3.5 w-3.5" /> New task
      </button>

      <Modal open={open} onClose={() => !busy && setOpen(false)} title="New task">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-tactical block mb-1.5">Title</label>
            <input
              className={fieldInputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ship the invite flow"
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-tactical block mb-1.5">Priority</label>
              <select className={fieldInputClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="bg-ink-900 capitalize">
                    {p.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-tactical block mb-1.5">Stage</label>
              <select className={fieldInputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-ink-900">
                    {s.toLowerCase().replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label-tactical block mb-1.5">
              Project <span className="text-zinc-600">(optional)</span>
            </label>
            <select className={fieldInputClass} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="" className="bg-ink-900">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-ink-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-tactical block mb-1.5">
              Due date <span className="text-zinc-600">(optional)</span>
            </label>
            <input type="date" className={fieldInputClass} value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>

          {error && <p className="text-xs text-critical-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className="px-3 py-2 rounded-full text-xs text-zinc-400 border border-white/10 hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={busy || !title} className="btn-signal text-xs disabled:opacity-50">
              {busy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
                </>
              ) : (
                "Create task"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
