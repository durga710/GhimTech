"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import type { DashProject } from "@/lib/dashboard/data";
import { relativeTime } from "@/lib/dashboard/format";
import { cn } from "@/lib/utils";

interface ProjectsWidgetProps {
  projects: DashProject[];
}

const STATUS_STYLES = {
  shipping: {
    label: "Shipping",
    chip: "bg-vital-400/10 text-vital-300 border-vital-400/30",
    dot: "bg-vital-400 animate-pulse-vital",
    bar: "from-vital-400 to-vital-300",
  },
  active: {
    label: "Active",
    chip: "bg-signal-400/10 text-signal-300 border-signal-400/30",
    dot: "bg-signal-400",
    bar: "from-signal-400 to-signal-300",
  },
  paused: {
    label: "Paused",
    chip: "bg-flare-400/10 text-flare-400 border-flare-400/30",
    dot: "bg-flare-400",
    bar: "from-flare-400 to-flare-400",
  },
  exploring: {
    label: "Exploring",
    chip: "bg-zinc-400/10 text-zinc-300 border-zinc-400/30",
    dot: "bg-zinc-400",
    bar: "from-zinc-400 to-zinc-500",
  },
} as const;

/**
 * Projects widget.
 *
 * Compact list of all active projects with:
 *   - status pill
 *   - progress bar (animates in on mount)
 *   - task count summary
 *   - last-updated relative time
 *
 * Each row is a Link to the project's detail page. The whole row is the
 * click target, with an arrow indicator on the right.
 */
export function ProjectsWidget({ projects }: ProjectsWidgetProps) {
  return (
    <section className="glass-panel p-6 relative">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-signal-300" />
          <h2 className="label-tactical">Active projects · {projects.length}</h2>
        </div>
        <Link
          href="/dashboard/projects"
          className="text-xs font-mono text-signal-300 hover:text-signal-200 transition-colors inline-flex items-center gap-1"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </header>

      <ol className="space-y-2">
        {projects.map((p, i) => {
          const s = STATUS_STYLES[p.status];
          return (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.04,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/dashboard/projects/${p.slug}`}
                className="group block p-4 rounded-lg border border-white/[0.04]
                           hover:border-white/[0.12] hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-white truncate group-hover:text-signal-200 transition-colors">
                      {p.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-mono text-zinc-500">
                      <span>
                        {p.taskCount.done}/{p.taskCount.total} tasks
                      </span>
                      <span>·</span>
                      <span>updated {relativeTime(p.updatedAt)}</span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-tactical border",
                      s.chip
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                    {s.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r",
                        s.bar
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${p.progress}%` }}
                      transition={{
                        duration: 1.2,
                        delay: 0.3 + i * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-zinc-400 tabular-nums w-9 text-right">
                    {p.progress}%
                  </span>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
