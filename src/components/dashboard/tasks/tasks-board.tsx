"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Circle, CheckCircle2, Loader2 } from "lucide-react";
import type { DashTask, TaskStatus, TaskPriority } from "@/lib/dashboard/data";
import { dueLabel } from "@/lib/dashboard/format";
import { cn } from "@/lib/utils";
import { TaskWorkButton } from "@/components/dashboard/tasks/task-work-button";

const STATUS_TO_API: Record<TaskStatus, string> = {
  todo: "TODO",
  in_progress: "IN_PROGRESS",
  review: "REVIEW",
  done: "DONE",
};

const PRIORITY_META: Record<TaskPriority, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "text-critical-400 bg-critical-500/10 border-critical-500/30" },
  high: { label: "High", cls: "text-flare-400 bg-flare-400/10 border-flare-400/30" },
  medium: { label: "Medium", cls: "text-signal-200 bg-signal-400/10 border-signal-400/30" },
  low: { label: "Low", cls: "text-zinc-400 bg-white/[0.05] border-white/10" },
};

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

/**
 * Kanban-style task board. Click the circle to toggle a task done/undone,
 * which PATCHes /api/tasks/[id] (mapping the lowercase widget status back to
 * the uppercase Prisma enum). State updates optimistically.
 */
export function TasksBoard({ initialTasks }: { initialTasks: DashTask[] }) {
  const [tasks, setTasks] = useState<DashTask[]>(initialTasks);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(t: DashTask, status: TaskStatus) {
    setBusyId(t.id);
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, status } : x)));
    try {
      await fetch(`/api/tasks/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: STATUS_TO_API[status] }),
      });
    } catch {
      /* optimistic */
    }
    setBusyId(null);
  }

  if (tasks.length === 0) {
    return <div className="glass-panel p-12 text-center text-sm text-zinc-400">No tasks yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="label-tactical">{col.label}</h2>
              <span className="font-mono text-[10px] text-zinc-500">{items.length}</span>
            </div>
            <ul className="space-y-2">
              {items.map((t) => {
                const pm = PRIORITY_META[t.priority];
                const done = t.status === "done";
                return (
                  <motion.li
                    key={t.id}
                    layout
                    className={cn(
                      "rounded-lg border p-3 bg-white/[0.015]",
                      done ? "border-white/[0.04] opacity-60" : "border-white/[0.08]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus(t, done ? "todo" : "done")}
                        disabled={busyId === t.id}
                        aria-label={done ? "Mark not done" : "Mark done"}
                        className="mt-0.5 shrink-0 text-zinc-400 hover:text-vital-300 transition-colors disabled:opacity-50"
                      >
                        {busyId === t.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : done ? (
                          <CheckCircle2 className="h-4 w-4 text-vital-300" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", done ? "text-zinc-500 line-through" : "text-zinc-200")}>
                          {t.title}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border", pm.cls)}>
                            {pm.label}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-500">{t.projectName}</span>
                          {t.dueDate && (
                            <span className="font-mono text-[10px] text-zinc-500">· {dueLabel(t.dueDate)}</span>
                          )}
                        </div>
                      </div>
                      <TaskWorkButton taskId={t.id} title={t.title} />
                    </div>
                  </motion.li>
                );
              })}
              {items.length === 0 && (
                <li className="text-xs text-zinc-600 py-2 text-center">—</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
