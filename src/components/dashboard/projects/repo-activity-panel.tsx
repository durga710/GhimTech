"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitBranch, GitCommitHorizontal, GitPullRequest, CircleDot, Code2, Loader2, Star, Pencil, Rocket } from "lucide-react";
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
  deployments: { environment: string; state: string; url: string | null; createdAt: string }[];
}

const DEPLOY_STATE_CLS: Record<string, string> = {
  success: "text-vital-300",
  failure: "text-flare-200",
  error: "text-flare-200",
  pending: "text-zinc-400",
  in_progress: "text-zinc-400",
};

const REFRESH_MS = 60_000;

function cnDeploy(state: string): string {
  return `font-mono text-[10px] shrink-0 ${DEPLOY_STATE_CLS[state] ?? "text-zinc-400"}`;
}

/**
 * Live GitHub activity for a project. Polls the API (which reads GitHub
 * uncached) every minute while the tab is visible, so the tracker shows
 * what's actually happening in the repo right now. When the project has no
 * linked repo yet, renders an inline "link a repo" form instead (PATCHes
 * the project's sourceRepo).
 */
export function RepoActivityPanel({ projectId, repo: initialRepo }: { projectId: string; repo: string | null }) {
  const router = useRouter();
  const [repo, setRepo] = useState(initialRepo);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialRepo ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
    if (!repo) return;
    setLoading(true);
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load, repo]);

  async function saveRepo() {
    const value = draft.trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(value)) {
      setSaveError('Use "owner/name", e.g. durga710/rayhealth-evv-platform');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceRepo: value }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setSaveError(json?.error?.message ?? "Couldn't save.");
      } else {
        setRepo(value);
        setEditing(false);
        setActivity(null);
        setError(null);
        router.refresh();
      }
    } catch {
      setSaveError("Couldn't save.");
    }
    setSaving(false);
  }

  const linkForm = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void saveRepo();
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="owner/repo — e.g. durga710/rayhealth-evv-platform"
        className="flex-1 min-w-[16rem] bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
      />
      <button type="submit" disabled={saving || !draft.trim()} className="btn-signal text-xs disabled:opacity-50">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : repo ? "Update" : "Link repo"}
      </button>
      {repo && (
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setDraft(repo);
            setSaveError(null);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </button>
      )}
      {saveError && <span className="w-full text-xs text-flare-200">{saveError}</span>}
    </form>
  );

  if (!repo) {
    return (
      <section className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-4 w-4 text-signal-300" />
          <h2 className="label-tactical">Live repo activity</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-3">
          Link this project to a GitHub repo to track commits, pull requests, and issues live.
        </p>
        {linkForm}
      </section>
    );
  }

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
        <button
          type="button"
          aria-label="Change linked repo"
          onClick={() => {
            setEditing((v) => !v);
            setDraft(repo);
            setSaveError(null);
          }}
          className="text-zinc-600 hover:text-signal-300 transition-colors"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <Link
          href={`/dashboard/code?repo=${encodeURIComponent(repo)}`}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-500 hover:text-signal-300 transition-colors"
        >
          <Code2 className="h-3 w-3" /> edit code
        </Link>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-zinc-600">
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-vital-400 animate-pulse" aria-hidden />
          )}
          {fetchedAt ? `updated ${relativeTime(fetchedAt)}` : "connecting…"}
        </span>
      </div>

      {editing && <div className="mb-4">{linkForm}</div>}

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

              {activity.deployments.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Deployments</h3>
                  <ul className="space-y-1.5">
                    {activity.deployments.slice(0, 3).map((d, i) => (
                      <li key={i} className="flex items-baseline gap-2 text-sm min-w-0">
                        <Rocket className="h-3 w-3 text-zinc-600 shrink-0 self-center" />
                        <span className="text-zinc-300 truncate">{d.environment}</span>
                        <span className={cnDeploy(d.state)}>{d.state}</span>
                        {d.url && (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[10px] text-signal-300 hover:text-signal-200 transition-colors shrink-0"
                          >
                            open
                          </a>
                        )}
                        <span className="ml-auto font-mono text-[10px] text-zinc-600 shrink-0">
                          {relativeTime(d.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
