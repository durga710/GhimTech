import type { Metadata } from "next";
import { Github, Star, GitFork, ArrowUpRight } from "lucide-react";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { CompanyCta } from "@/components/landing/company-cta";
import { SOCIAL } from "@/lib/company";
import { HELIX_GITHUB } from "@/lib/products";

export const metadata: Metadata = {
  title: "Open Source",
  description:
    "GhimTech in the open — public repositories, contributions, and the tools we share with the community.",
  openGraph: {
    title: "GhimTech Open Source",
    description: "Public repositories and contributions from GhimTech.",
  },
};

interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

interface RawRepo {
  name?: string;
  description?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  html_url?: string;
  fork?: boolean;
}

async function fetchRepos(): Promise<Repo[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${HELIX_GITHUB.owner}/repos?sort=updated&per_page=18`,
      { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;
    return (data as RawRepo[])
      .filter((r) => !r.fork)
      .slice(0, 9)
      .map((r) => ({
        name: r.name ?? "repository",
        description: r.description ?? "No description provided.",
        language: r.language ?? "—",
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        url: r.html_url ?? HELIX_GITHUB.url,
      }));
  } catch {
    return null;
  }
}

export default async function OpenSourcePage() {
  const repos = await fetchRepos();

  return (
    <main className="relative overflow-x-clip">
      <TopNav />

      <section className="relative pt-40 pb-12 lg:pt-48">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-60" />
        <div className="container">
          <span className="eyebrow">Open source</span>
          <h1 className="mt-5 font-display text-hero text-white text-balance">
            We build in the <span className="text-gradient-signal">open</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            We believe good tools should be shared. These are public repositories and contributions from
            the GhimTech team — pulled live from GitHub.
          </p>
          <a
            href={SOCIAL.github}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost mt-8"
          >
            <Github size={16} />
            Follow on GitHub
          </a>
        </div>
      </section>

      <section className="container pb-12">
        {repos && repos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="group glass-panel flex flex-col p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Github size={16} className="text-zinc-400" />
                    <span className="font-mono text-sm">{r.name}</span>
                  </div>
                  <ArrowUpRight size={16} className="text-zinc-500 transition-all group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-3 flex-1 text-sm text-zinc-400 leading-relaxed line-clamp-3">
                  {r.description}
                </p>
                <div className="mt-5 flex items-center gap-4 font-mono text-xs text-zinc-500">
                  {r.language !== "—" && (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-signal-400" />
                      {r.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={12} /> {r.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={12} /> {r.forks}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 text-center">
            <p className="text-zinc-400">Our repositories live on GitHub.</p>
            <a
              href={SOCIAL.github}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-signal-300 hover:text-signal-200"
            >
              Browse them <ArrowUpRight size={14} />
            </a>
          </div>
        )}
      </section>

      <CompanyCta
        eyebrow="Contribute"
        title={
          <>
            Found something worth <span className="text-gradient-signal">improving</span>?
          </>
        }
        sub="Open an issue, send a pull request, or just say hello. We welcome thoughtful contributions."
        primary={{ label: "Visit GitHub", href: SOCIAL.github }}
        secondary={{ label: "How we build", href: "/technology" }}
      />
      <SiteFooter />
    </main>
  );
}
