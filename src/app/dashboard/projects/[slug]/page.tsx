import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban, Flag, Map as MapIcon, Rocket, CheckSquare } from "lucide-react";
import { getProjectDetail } from "@/lib/dashboard/data";
import { relativeTime } from "@/lib/dashboard/format";
import { cn } from "@/lib/utils";
import { CopilotSyncPanel } from "@/components/dashboard/copilot/copilot-sync-panel";

export const metadata: Metadata = {
  title: "Project",
  robots: { index: false, follow: false },
};

const STATUS_META: Record<string, { label: string; cls: string; bar: string }> = {
  ACTIVE: { label: "Active", cls: "text-signal-200 bg-signal-400/10 border-signal-400/30", bar: "bg-signal-400" },
  SHIPPING: { label: "Shipping", cls: "text-vital-200 bg-vital-400/10 border-vital-400/30", bar: "bg-vital-400" },
  EXPLORING: { label: "Exploring", cls: "text-flare-400 bg-flare-400/10 border-flare-400/30", bar: "bg-flare-400" },
  MAINTAINING: { label: "Maintaining", cls: "text-signal-200 bg-signal-400/10 border-signal-400/30", bar: "bg-signal-400" },
  PAUSED: { label: "Paused", cls: "text-zinc-300 bg-white/[0.06] border-white/15", bar: "bg-zinc-500" },
  ARCHIVED: { label: "Archived", cls: "text-zinc-400 bg-white/[0.05] border-white/10", bar: "bg-zinc-600" },
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectDetail(slug);
  if (!project) notFound();

  const meta = STATUS_META[project.status] ?? STATUS_META.ACTIVE;
  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/projects"
        className="control-chip w-fit transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All projects
      </Link>

      <section className="glass-panel-strong p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-signal-400/20 bg-signal-400/10">
              <FolderKanban className="h-5 w-5 text-signal-300" />
            </div>
            <div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[0.95] tracking-tightest text-white">
                {project.name}
              </h1>
              {project.tagline && <p className="text-sm text-zinc-400 mt-0.5">{project.tagline}</p>}
            </div>
          </div>
          <span className={cn("shrink-0 px-2.5 py-1 rounded text-[11px] font-medium border", meta.cls)}>{meta.label}</span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
            <span>Progress</span>
            <span className="font-mono">{project.progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div className={cn("h-full rounded-full", meta.bar)} style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {project.description && (
          <p className="mt-5 text-sm text-zinc-300 leading-relaxed max-w-3xl whitespace-pre-wrap">
            {project.description}
          </p>
        )}
      </section>

      {project.sourceRepo && (
        <CopilotSyncPanel projectId={project.id} repo={project.sourceRepo} currentProgress={project.progress} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="glass-panel-strong p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="h-4 w-4 text-signal-300" />
            <h2 className="label-tactical">
              Tasks · {doneTasks}/{project.tasks.length} done
            </h2>
          </div>
          {project.tasks.length === 0 ? (
            <p className="text-xs text-zinc-600">No tasks.</p>
          ) : (
            <ul className="space-y-2">
              {project.tasks.slice(0, 12).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      t.status === "DONE" ? "bg-vital-400" : "bg-zinc-600"
                    )}
                  />
                  <span className={cn("truncate", t.status === "DONE" ? "text-zinc-500 line-through" : "text-zinc-300")}>
                    {t.title}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-zinc-600 capitalize">
                    {t.priority.toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-panel-strong p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="h-4 w-4 text-signal-300" />
            <h2 className="label-tactical">Milestones</h2>
          </div>
          {project.milestones.length === 0 ? (
            <p className="text-xs text-zinc-600">No milestones.</p>
          ) : (
            <ol className="space-y-3">
              {project.milestones.map((m) => (
                <li key={m.id} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 rounded-full shrink-0",
                      m.achievedAt ? "bg-vital-400" : "bg-zinc-600 ring-1 ring-white/20"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-sm text-zinc-200">{m.title}</div>
                    <div className="font-mono text-[10px] text-zinc-500">
                      {m.achievedAt ? `achieved ${relativeTime(m.achievedAt.toISOString())}` : "pending"}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="glass-panel-strong p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapIcon className="h-4 w-4 text-signal-300" />
            <h2 className="label-tactical">Roadmap</h2>
          </div>
          {project.roadmapItems.length === 0 ? (
            <p className="text-xs text-zinc-600">No roadmap items.</p>
          ) : (
            <ul className="space-y-2">
              {project.roadmapItems.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-300 truncate">{r.title}</span>
                  {r.quarter && <span className="font-mono text-[10px] text-zinc-500">{r.quarter}</span>}
                  <span className="ml-auto font-mono text-[10px] text-zinc-600 capitalize">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-panel-strong p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-4 w-4 text-signal-300" />
            <h2 className="label-tactical">Recent deployments</h2>
          </div>
          {project.deployments.length === 0 ? (
            <p className="text-xs text-zinc-600">No deployments.</p>
          ) : (
            <ul className="space-y-2">
              {project.deployments.map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-[10px] text-zinc-500">{d.commitSha?.slice(0, 7) ?? "—"}</span>
                  <span className="text-zinc-300 truncate">{d.commitMsg ?? d.environment}</span>
                  <span className="ml-auto font-mono text-[10px] text-zinc-600">
                    {relativeTime(d.deployedAt.toISOString())}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
