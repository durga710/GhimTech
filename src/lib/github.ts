import "server-only";

/**
 * Minimal GitHub reader for the Copilot. Pulls the signal that tells us where
 * a project is heading: README, PROJECT_STATUS.md, NEXT_STEPS.md, open issues,
 * and recent commit subjects. Read-only; uses GITHUB_TOKEN (a fine-grained,
 * read-only PAT scoped to the project's repo).
 */

const GH_API = "https://api.github.com";

function ghHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ghimtech-copilot",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function hasGitHubToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

async function ghJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${GH_API}${path}`, { headers: ghHeaders(), cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function decodeBase64(content: string | undefined): string | null {
  if (!content) return null;
  try {
    return Buffer.from(content, "base64").toString("utf8");
  } catch {
    return null;
  }
}

async function fetchFile(repo: string, path: string): Promise<string | null> {
  const data = await ghJson<{ content?: string }>(`/repos/${repo}/contents/${path}`);
  return decodeBase64(data?.content);
}

export interface RepoContext {
  repo: string;
  readme: string | null;
  statusDoc: string | null;
  nextSteps: string | null;
  openIssues: { number: number; title: string; body: string }[];
  recentCommits: string[];
}

const cap = (s: string | null, n: number): string | null => (s ? s.slice(0, n) : null);

/**
 * Returns the repo's planning signal, or null if the repo is unreachable
 * (bad/missing token or wrong repo).
 */
export async function fetchRepoContext(repo: string): Promise<RepoContext | null> {
  const meta = await ghJson<{ full_name?: string }>(`/repos/${repo}`);
  if (!meta) return null;

  const readmeData = await ghJson<{ content?: string }>(`/repos/${repo}/readme`);

  const [statusDoc, nextSteps, issuesRaw, commitsRaw] = await Promise.all([
    fetchFile(repo, "PROJECT_STATUS.md"),
    fetchFile(repo, "NEXT_STEPS.md"),
    ghJson<Array<{ number: number; title: string; body: string | null; pull_request?: unknown }>>(
      `/repos/${repo}/issues?state=open&per_page=20`,
    ),
    ghJson<Array<{ commit: { message: string } }>>(`/repos/${repo}/commits?per_page=15`),
  ]);

  const openIssues = (issuesRaw ?? [])
    .filter((i) => !i.pull_request)
    .map((i) => ({ number: i.number, title: i.title, body: (i.body ?? "").slice(0, 400) }));

  const recentCommits = (commitsRaw ?? []).map((c) => c.commit.message.split("\n")[0]).slice(0, 15);

  return {
    repo,
    readme: cap(decodeBase64(readmeData?.content), 6000),
    statusDoc: cap(statusDoc, 6000),
    nextSteps: cap(nextSteps, 4000),
    openIssues,
    recentCommits,
  };
}
