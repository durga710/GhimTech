"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckSquare, Circle, CircleDot, CheckCircle2 } from "lucide-react";
import type { DashTask, TaskPriority, TaskStatus } from "@/lib/dashboard/data";
import { dueLabel } from "@/lib/dashboard/format";
import { cn } from "@/lib/utils";

interface TasksWidgetProps {
  tasks: DashTask[];
}

const PRIORITY_STYLES: Record<
  TaskPriority,
  { dot: string; text: string; label: string }
> = {
  critical: { dot: "bg-critical-500 animate-pulse-vital", text: "text-critical-400", label: "Critical" },
  high: { dot: "bg-flare-400", text: "text-flare-400", label: "High" },
  medium: { dot: "bg-signal-400", text: "text-signal-300", label: "Med" },
  low: { dot: "bg-zinc-500", text: "text-zinc-400", label: "Low" },
};

const STATUS_ICONS: Record<TaskStatus, typeof Circle> = {
  todo: Circle,
  in_progress: CircleDot,
  review: CircleDot,
  done: CheckCircle2,
};

/**
 * Tasks widget — what's on the operator's plate.
 *
 * Sorted by priority (critical → low), then by due date. Critical-priority
 * dots pulse to grab attention without being shouty.
 */
export function TasksWidget({ tasks }: TasksWidgetProps) {
  // Sort: critical → high → medium → low, then by due date (overdue first)
  const order: TaskPriority[] = ["critical", "high", "medium", "low"];
  const sorted = [...tasks].sort((a, b) => {
    const pa = order.indexOf(a.priority);
    const pb = order.indexOf(b.priority);
    if (pa !== pb) return pa - pb;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <section className="glass-panel p-6 relative">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-vital-300" />
          <h2 className="label-tactical">Your queue · {tasks.length}</h2>
        </div>
        <Link
          href="/dashboard/tasks"
          className="text-xs font-mono text-signal-300 hover:text-signal-200 transition-colors inline-flex items-center gap-1"
        >
          All tasks <ArrowUpRight className="h-3 w-3" />
        </Link>
      </header>

      <ol className="space-y-1">
        {sorted.map((t, i) => {
          const p = PRIORITY_STYLES[t.priority];
          const StatusIcon = STATUS_ICONS[t.status];
          const due = dueLabel(t.dueDate);
          const overdue = due.includes("overdue");
          const dueSoon = due === "today" || due === "tomorrow";

          return (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: i * 0.04,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group flex items-center gap-3 p-3 rounded-lg
                         border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02]
                         transition-colors cursor-pointer"
            >
              {/* Status checkbox */}
              <button
                type="button"
                className="shrink-0 grid place-items-center h-5 w-5 rounded-full
                           text-zinc-600 hover:text-vital-300 transition-colors"
                aria-label={`Mark ${t.title} as done`}
              >
                <StatusIcon className="h-4 w-4" />
              </button>

              {/* Priority dot */}
              <span
                className={cn("shrink-0 h-2 w-2 rounded-full", p.dot)}
                aria-label={`${p.label} priority`}
              />

              {/* Title + project */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-200 truncate group-hover:text-white transition-colors">
                  {t.title}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                  <span className="text-zinc-500">{t.projectName}</span>
                </div>
              </div>

              {/* Due */}
              <span
                className={cn(
                  "shrink-0 font-mono text-[10px] uppercase tracking-tactical px-2 py-0.5 rounded",
                  overdue
                    ? "text-critical-400 bg-critical-500/10"
                    : dueSoon
                    ? "text-flare-400 bg-flare-400/10"
                    : "text-zinc-500"
                )}
              >
                {due}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
