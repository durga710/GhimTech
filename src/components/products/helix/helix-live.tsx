import Link from "next/link";
import { Github, GitCommit, ArrowUpRight } from "lucide-react";
import { HELIX_GITHUB } from "@/lib/products";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface RawCommit {
  sha?: string;
  commit?: {
    message?: string;
    author?: { name?: string; date?: string };
  };
}

/**
 * Live development status — pulls recent commits from the public GitHub repo.
 * Server component with hourly revalidation; falls back gracefully if the
 * GitHub API is unreachable or rate-limited.
 */
async function fetchCommits(): Promise<Commit[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${HELIX_GITHUB.owner}/${HELIX_GITHUB.repo}/commits?per_page=6`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;
    return (data as RawCommit[]).slice(0, 6).map((c) => ({
      sha: (c.sha ?? "").slice(0, 7),
      message: (c.commit?.message ?? "").split("\n")[0],
      author: c.commit?.author?.name ?? "unknown",
      date: c.commit?.author?.date ?? "",
    }));
  } catch {
    return null;
  }
}

export async function HelixLive() {
  const commits = await fetchCommits();

  return (
    <section className="container py-24 lg:py-32">
      <div className="glass-panel-strong overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white">
              <Github size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-white">
                  {HELIX_GITHUB.owner}/{HELIX_GITHUB.repo}
                </span>
                <span className="status-dot status-dot-live" />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-tactical text-zinc-500">
                Live development status
              </span>
            </div>
          </div>
          <a
            href={HELIX_GITHUB.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            Open repository
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {commits && commits.length > 0 ? (
            commits.map((c) => (
              <div key={c.sha} className="flex items-start gap-4 p-5">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-signal-300">
                  <GitCommit size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-200">{c.message}</p>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500">
                    {c.sha} · {c.author}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-400">Recent activity lives on GitHub.</p>
              <Link
                href={HELIX_GITHUB.url}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-signal-300 hover:text-signal-200"
              >
                View commits <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
