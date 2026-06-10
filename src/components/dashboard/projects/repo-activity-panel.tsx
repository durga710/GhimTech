"use client";

import { useCallback, useEffect, useState } from "react";
import { GitBranch, GitCommitHorizontal, GitPullRequest, CircleDot, Loader2, Star } from "lucide-react";
import { relativeTime } from "@/lib/dashboard/format";

interface RepoActivity {
  repo: string;
  url: string;
  defaultBranch: string;
  pushedAt: string | null;
  stars: number;
  commits: { sha: string; message: string; author: string | null; date: string | null; url: string }[];
  pullRequests: { number: number; title: string; author: string | null; draft: boolean; updatedAt: string; url: string }[];
  issues: { number: number; title: string; updatedAt: string; url: string }[];
}

const REFRESH_MS = 60_000;

/**
 * Live GitHub activity for a repo-linked project. Polls the API (which reads
 * GitHub uncached) every minute while the tab is visible, so the tracker
 * shows what's actually happening in the repo right now.
 */
export function RepoActivityPanel({ projectId, repo }: { projectId: string; repo: string }) {
  const [activity, setActivity] = useState<RepoActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/github`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "Couldn't reach GitHub.");
      } else {
        setActivity(json.data.activity);
        setFetchedAt(json.data.fetchedAt);
        setError(null);
      }
    } catch {
      setError("Couldn't reach GitHub.");
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="h-4 w-4 text-signal-300" />
        <h2 className="label-tactical">Live repo activity</h2>
        <a
          href={activity?.url ?? `https://github.com/${repo}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-zinc-500 hover:text-signal-300 transition-colors truncate"
        >
          {repo}
        </a>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-zinc-600">
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-vital-400 animate-pulse" aria-hidden />
          )}
          {fetchedAt ? `updated ${relativeTime(fetchedAt)}` : "connecting…"}
        </span>
      </div>

      {error ? (
        <p className="text-xs text-flare-200">{error}</p>
      ) : !activity ? (
        <p className="text-xs text-zinc-600">Reading {repo}…</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 font-mono text-[11px] text-zinc-500">
            <span>
              last push {activity.pushedAt ? relativeTime(activity.pushedAt) : "—"} · {activity.defaultBranch}
            </span>
            <span className="inline-flex items-center gap-1">
              <GitPullRequest className="h-3 w-3" /> {activity.pullRequests.length} open PR
              {activity.pullRequests.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1">
              <CircleDot className="h-3 w-3" /> {activity.issues.length} open issue
              {activity.issues.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3" /> {activity.stars}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Recent commits</h3>
              {activity.commits.length === 0 ? (
                <p className="text-xs text-zinc-600">No commits yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {activity.commits.slice(0, 6).map((c) => (
                    <li key={c.sha} className="flex items-baseline gap-2 text-sm min-w-0">
                      <GitCommitHorizontal className="h-3.5 w-3.5 text-zinc-600 shrink-0 self-center" />
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-300 hover:text-signal-200 transition-colors truncate"
                      >
                        {c.message}
                      </a>
                      <span className="ml-auto font-mono text-[10px] text-zinc-600 shrink-0">
                        {c.date ? relativeTime(c.date) : c.sha}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Open pull requests</h3>
                {activity.pullRequests.length === 0 ? (
                  <p className="text-xs text-zinc-600">None open.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {activity.pullRequests.slice(0, 4).map((p) => (
                      <li key={p.number} className="flex items-baseline gap-2 text-sm min-w-0">
                        <span className="font-mono text-[10px] text-zinc-600 shrink-0">#{p.number}</span>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-300 hover:text-signal-200 transition-colors truncate"
                        >
                          {p.draft ? "[draft] " : ""}
                          {p.title}
                        </a>
                        <span className="ml-auto font-mono text-[10px] text-zinc-600 shrink-0">
                          {relativeTime(p.updatedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Open issues</h3>
                {activity.issues.length === 0 ? (
                  <p className="text-xs text-zinc-600">None open.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {activity.issues.slice(0, 4).map((i) => (
                      <li key={i.number} className="flex items-baseline gap-2 text-sm min-w-0">
                        <span className="font-mono text-[10px] text-zinc-600 shrink-0">#{i.number}</span>
                        <a
                          href={i.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-300 hover:text-signal-200 transition-colors truncate"
                        >
                          {i.title}
                        </a>
                        <span className="ml-auto font-mono text-[10px] text-zinc-600 shrink-0">
                          {relativeTime(i.updatedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
