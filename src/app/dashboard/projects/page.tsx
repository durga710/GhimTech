import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { getProjects } from "@/lib/dashboard/data";
import { relativeTime } from "@/lib/dashboard/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
};

const STATUS_META: Record<string, { label: string; cls: string; bar: string }> = {
  active: { label: "Active", cls: "text-signal-200 bg-signal-400/10 border-signal-400/30", bar: "bg-signal-400" },
  shipping: { label: "Shipping", cls: "text-vital-200 bg-vital-400/10 border-vital-400/30", bar: "bg-vital-400" },
  paused: { label: "Paused", cls: "text-zinc-300 bg-white/[0.06] border-white/15", bar: "bg-zinc-500" },
  exploring: { label: "Exploring", cls: "text-flare-400 bg-flare-400/10 border-flare-400/30", bar: "bg-flare-400" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl grid place-items-center bg-signal-400/10 border border-signal-400/20">
          <FolderKanban className="h-5 w-5 text-signal-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-zinc-500">{projects.length} active</p>
        </div>
      </header>

      {projects.length === 0 ? (
        <div className="glass-panel p-12 text-center text-sm text-zinc-400">No projects yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => {
            const meta = STATUS_META[p.status] ?? STATUS_META.active;
            return (
              <div key={p.id} className="glass-panel p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-medium text-white leading-tight">{p.name}</h2>
                  <span className={cn("shrink-0 px-2 py-0.5 rounded text-[10px] font-medium border", meta.cls)}>
                    {meta.label}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                    <span>Progress</span>
                    <span className="font-mono">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div className={cn("h-full rounded-full", meta.bar)} style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 pt-3 border-t border-white/[0.06]">
                  <span>{p.taskCount.done}/{p.taskCount.total} tasks done</span>
                  <span>updated {relativeTime(p.updatedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
