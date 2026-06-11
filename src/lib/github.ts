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

export interface RepoActivity {
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

/**
 * Live activity snapshot for the project tracker: recent commits, open PRs,
 * and open issues, fetched fresh on every call (no caching). Returns null if
 * the repo is unreachable (bad/missing token or wrong repo).
 */
export async function fetchRepoActivity(repo: string): Promise<RepoActivity | null> {
  const meta = await ghJson<{
    full_name?: string;
    html_url?: string;
    default_branch?: string;
    pushed_at?: string;
    stargazers_count?: number;
  }>(`/repos/${repo}`);
  if (!meta?.full_name) return null;

  const [commitsRaw, pullsRaw, issuesRaw, deploymentsRaw] = await Promise.all([
    ghJson<Array<{
      sha: string;
      html_url: string;
      commit: { message: string; author?: { name?: string; date?: string } };
      author?: { login?: string } | null;
    }>>(`/repos/${repo}/commits?per_page=10`),
    ghJson<Array<{
      number: number;
      title: string;
      draft?: boolean;
      updated_at: string;
      html_url: string;
      user?: { login?: string } | null;
    }>>(`/repos/${repo}/pulls?state=open&per_page=10`),
    ghJson<Array<{
      number: number;
      title: string;
      updated_at: string;
      html_url: string;
      pull_request?: unknown;
    }>>(`/repos/${repo}/issues?state=open&per_page=15`),
    ghJson<Array<{ id: number; environment?: string; created_at: string }>>(
      `/repos/${repo}/deployments?per_page=4`,
    ),
  ]);

  // Vercel (and other platforms) report deploys via the GitHub deployments
  // API, so one read-only token covers code AND deploy status.
  const deployments = await Promise.all(
    (deploymentsRaw ?? []).map(async (d) => {
      const statuses = await ghJson<Array<{ state?: string; environment_url?: string; target_url?: string }>>(
        `/repos/${repo}/deployments/${d.id}/statuses?per_page=1`,
      );
      const latest = statuses?.[0];
      return {
        environment: d.environment ?? "unknown",
        state: latest?.state ?? "pending",
        url: latest?.environment_url ?? latest?.target_url ?? null,
        createdAt: d.created_at,
      };
    }),
  );

  return {
    repo: meta.full_name,
    url: meta.html_url ?? `https://github.com/${repo}`,
    defaultBranch: meta.default_branch ?? "main",
    pushedAt: meta.pushed_at ?? null,
    stars: meta.stargazers_count ?? 0,
    commits: (commitsRaw ?? []).map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0].slice(0, 160),
      author: c.author?.login ?? c.commit.author?.name ?? null,
      date: c.commit.author?.date ?? null,
      url: c.html_url,
    })),
    pullRequests: (pullsRaw ?? []).map((p) => ({
      number: p.number,
      title: p.title.slice(0, 160),
      author: p.user?.login ?? null,
      draft: Boolean(p.draft),
      updatedAt: p.updated_at,
      url: p.html_url,
    })),
    issues: (issuesRaw ?? [])
      .filter((i) => !i.pull_request)
      .map((i) => ({
        number: i.number,
        title: i.title.slice(0, 160),
        updatedAt: i.updated_at,
        url: i.html_url,
      })),
    deployments,
  };
}

/* ============================================================
   Write + scan helpers (used by the agentic Copilot tools)
   ============================================================ */

async function ghReq(method: string, path: string, body?: unknown): Promise<{ ok: boolean; json: unknown }> {
  try {
    const res = await fetch(`${GH_API}${path}`, {
      method,
      headers: { ...ghHeaders(), "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, json };
  } catch {
    return { ok: false, json: null };
  }
}

export interface SecretFinding {
  path: string;
  rule: string;
  masked: string;
}

const SECRET_RULES: { rule: string; re: RegExp }[] = [
  { rule: "AWS access key", re: /AKIA[0-9A-Z]{16}/g },
  { rule: "Google API key", re: /AIza[0-9A-Za-z_-]{30,}/g },
  { rule: "OpenAI key", re: /sk-(?:proj|ant)?-?[0-9A-Za-z_-]{20,}/g },
  { rule: "GitHub token", re: /gh[pousr]_[0-9A-Za-z]{36,}|github_pat_[0-9A-Za-z_]{40,}/g },
  { rule: "Slack token", re: /xox[baprs]-[0-9A-Za-z-]{10,}/g },
  { rule: "Private key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { rule: "DB connection string", re: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@[^\s"']+/g },
];

const isPlaceholder = (v: string): boolean =>
  /(<|>|example|placeholder|redacted|xxx|your[-_]|\*\*\*|dummy|changeme|user:pass)/i.test(v);

/**
 * Scans the current working tree of a repo (default branch) for secret-like
 * strings via the GitHub API. Bounded (text files only, capped count) so it
 * runs inside a serverless function. History scanning needs a full clone (CI).
 */
export async function scanRepoSecrets(
  repo: string,
  maxFiles = 60,
): Promise<{ scannedFiles: number; findings: SecretFinding[] } | null> {
  const meta = await ghJson<{ default_branch?: string }>(`/repos/${repo}`);
  if (!meta?.default_branch) return null;
  const tree = await ghJson<{ tree: { path: string; type: string; size?: number }[] }>(
    `/repos/${repo}/git/trees/${meta.default_branch}?recursive=1`,
  );
  if (!tree?.tree) return { scannedFiles: 0, findings: [] };

  const SKIP = /(^|\/)(node_modules|dist|build|\.next|vendor|\.git)\//;
  const TEXT = /\.(env|ts|tsx|js|jsx|json|md|sh|ya?ml|txt|py|rb|go|java|sql|toml|ini|cfg|conf|tf|properties)$|(^|\/)\.env/;
  const risky = (p: string) => /\.env|secret|credential|config|\.tfvars/i.test(p);

  const candidates = tree.tree
    .filter((n) => n.type === "blob" && !SKIP.test(n.path) && TEXT.test(n.path) && (n.size ?? 0) < 200_000)
    .sort((a, b) => Number(risky(b.path)) - Number(risky(a.path)))
    .slice(0, maxFiles);

  const findings: SecretFinding[] = [];
  let scanned = 0;
  for (const f of candidates) {
    const content = await fetchFile(repo, f.path);
    if (content == null) continue;
    scanned++;
    for (const { rule, re } of SECRET_RULES) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(content)) !== null) {
        if (isPlaceholder(m[0])) continue;
        findings.push({ path: f.path, rule, masked: m[0].slice(0, 10) + "…[redacted]" });
        if (findings.length >= 60) break;
      }
    }
    if (findings.length >= 60) break;
  }

  const seen = new Set<string>();
  const uniq = findings.filter((x) => {
    const k = `${x.path}|${x.rule}|${x.masked}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return { scannedFiles: scanned, findings: uniq };
}

export interface RepoTreeEntry {
  path: string;
  size: number;
}

/**
 * Lists the repo's text-editable files (blobs) on a branch for the in-browser
 * editor. Skips vendored/build dirs; capped so huge monorepos stay usable.
 */
export async function fetchRepoTree(
  repo: string,
  ref?: string,
): Promise<{ branch: string; files: RepoTreeEntry[] } | null> {
  const meta = await ghJson<{ default_branch?: string }>(`/repos/${repo}`);
  if (!meta?.default_branch) return null;
  const branch = ref || meta.default_branch;

  const tree = await ghJson<{ tree?: { path: string; type: string; size?: number }[] }>(
    `/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );
  if (!tree?.tree) return null;

  const SKIP = /(^|\/)(node_modules|dist|build|\.next|vendor|\.git)(\/|$)/;
  const files = tree.tree
    .filter((n) => n.type === "blob" && !SKIP.test(n.path))
    .slice(0, 500)
    .map((n) => ({ path: n.path, size: n.size ?? 0 }));

  return { branch, files };
}

/** Reads one file's text content from a branch. Null if missing/too big. */
export async function fetchRepoFileContent(
  repo: string,
  path: string,
  ref?: string,
): Promise<{ content: string } | null> {
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const data = await ghJson<{ content?: string; encoding?: string; size?: number }>(
    `/repos/${repo}/contents/${path}${refQuery}`,
  );
  if (!data || data.size === undefined || data.size > 400_000) return null;
  const content = decodeBase64(data.content);
  if (content === null || content.includes("\u0000")) return null;
  return { content };
}

/**
 * Finds the live preview URL for a branch's latest deployment (Vercel reports
 * deploys to GitHub's deployments API). Used by GCODE to embed the running
 * app next to the chat.
 */
export async function fetchBranchPreview(
  repo: string,
  branch: string,
): Promise<{ state: string; url: string | null } | null> {
  const deployments = await ghJson<Array<{ id: number }>>(
    `/repos/${repo}/deployments?ref=${encodeURIComponent(branch)}&per_page=1`,
  );
  if (!deployments) return null;
  if (!deployments.length) return { state: "none", url: null };

  const statuses = await ghJson<Array<{ state?: string; environment_url?: string; target_url?: string }>>(
    `/repos/${repo}/deployments/${deployments[0].id}/statuses?per_page=1`,
  );
  const latest = statuses?.[0];
  return {
    state: latest?.state ?? "pending",
    url: latest?.environment_url ?? latest?.target_url ?? null,
  };
}

/**
 * Lists the repos the GITHUB_TOKEN can actually reach. For fine-grained PATs
 * this is exactly the granted repo list — the source of truth for where the
 * Copilot can build. Null if the token is missing/invalid.
 */
export async function listAccessibleRepos(): Promise<
  { repo: string; private: boolean; defaultBranch: string; pushedAt: string | null }[] | null
> {
  const repos = await ghJson<
    Array<{ full_name: string; private: boolean; default_branch: string; pushed_at?: string }>
  >(`/user/repos?per_page=100&sort=pushed`);
  if (!repos) return null;
  return repos.map((r) => ({
    repo: r.full_name,
    private: r.private,
    defaultBranch: r.default_branch,
    pushedAt: r.pushed_at ?? null,
  }));
}

/**
 * Pushes a set of files to a branch in one commit using the git data API
 * (blob/tree/commit/ref). Creates the branch off the default branch if it
 * doesn't exist; otherwise commits on top of it. This is how the Copilot
 * builds multi-file apps into a repo.
 */
export async function pushFilesToRepo(
  repo: string,
  opts: { branch: string; message: string; files: { path: string; content: string }[] },
): Promise<{ branch: string; commitSha: string; commitUrl: string } | { error: string }> {
  const meta = await ghJson<{ default_branch?: string }>(`/repos/${repo}`);
  if (!meta?.default_branch)
    return {
      error:
        `the GitHub token has no access to ${repo} (or it doesn't exist). ` +
        `Fix: on GitHub → Settings → Developer settings → Fine-grained tokens → this token → Repository access, grant it ${repo} (or All repositories). ` +
        `Use list_github_repos to see which repos ARE accessible right now.`,
    };

  const baseRef = await ghJson<{ object?: { sha: string } }>(
    `/repos/${repo}/git/ref/heads/${meta.default_branch}`,
  );
  if (!baseRef?.object?.sha) return { error: "couldn't read the default branch" };

  let headSha = baseRef.object.sha;
  const created = await ghReq("POST", `/repos/${repo}/git/refs`, {
    ref: `refs/heads/${opts.branch}`,
    sha: headSha,
  });
  if (!created.ok) {
    const existing = await ghJson<{ object?: { sha: string } }>(
      `/repos/${repo}/git/ref/heads/${opts.branch}`,
    );
    if (!existing?.object?.sha) return { error: "couldn't create the branch (token may be read-only)" };
    headSha = existing.object.sha;
  }

  const headCommit = await ghJson<{ tree?: { sha: string } }>(`/repos/${repo}/git/commits/${headSha}`);
  if (!headCommit?.tree?.sha) return { error: "couldn't read the base commit" };

  const treeRes = await ghReq("POST", `/repos/${repo}/git/trees`, {
    base_tree: headCommit.tree.sha,
    tree: opts.files.map((f) => ({ path: f.path, mode: "100644", type: "blob", content: f.content })),
  });
  const tree = treeRes.json as { sha?: string } | null;
  if (!treeRes.ok || !tree?.sha) return { error: "couldn't write the files (token may be read-only)" };

  const commitRes = await ghReq("POST", `/repos/${repo}/git/commits`, {
    message: opts.message,
    tree: tree.sha,
    parents: [headSha],
  });
  const commit = commitRes.json as { sha?: string; html_url?: string } | null;
  if (!commitRes.ok || !commit?.sha) return { error: "couldn't create the commit" };

  const refRes = await ghReq("PATCH", `/repos/${repo}/git/refs/heads/${opts.branch}`, { sha: commit.sha });
  if (!refRes.ok) return { error: "couldn't update the branch" };

  return { branch: opts.branch, commitSha: commit.sha, commitUrl: commit.html_url ?? "" };
}

/** Opens a PR for an existing branch against the default branch. */
export async function createPullRequest(
  repo: string,
  opts: { title: string; body: string; head: string },
): Promise<{ url: string } | { error: string }> {
  const meta = await ghJson<{ default_branch?: string }>(`/repos/${repo}`);
  if (!meta?.default_branch) return { error: "repo not found or no access" };

  const prRes = await ghReq("POST", `/repos/${repo}/pulls`, {
    title: opts.title,
    body: opts.body,
    head: opts.head,
    base: meta.default_branch,
  });
  const prJson = prRes.json as { html_url?: string } | null;
  if (!prRes.ok || !prJson?.html_url) return { error: "couldn't open the PR" };
  return { url: prJson.html_url };
}

/**
 * Opens a single-file pull request on a repo: creates a branch off the default
 * branch, commits the file, and opens a PR. Reviewable — never auto-merged.
 */
export async function openPullRequest(
  repo: string,
  opts: { title: string; body: string; path: string; content: string; branch: string },
): Promise<{ url: string } | { error: string }> {
  const meta = await ghJson<{ default_branch?: string }>(`/repos/${repo}`);
  if (!meta?.default_branch) return { error: "repo not found or no access" };
  const base = meta.default_branch;

  const ref = await ghJson<{ object?: { sha: string } }>(`/repos/${repo}/git/ref/heads/${base}`);
  if (!ref?.object?.sha) return { error: "couldn't read base branch" };

  const branchRes = await ghReq("POST", `/repos/${repo}/git/refs`, {
    ref: `refs/heads/${opts.branch}`,
    sha: ref.object.sha,
  });
  if (!branchRes.ok) return { error: "couldn't create branch (it may already exist)" };

  const fileRes = await ghReq("PUT", `/repos/${repo}/contents/${opts.path}`, {
    message: opts.title,
    content: Buffer.from(opts.content, "utf8").toString("base64"),
    branch: opts.branch,
  });
  if (!fileRes.ok) return { error: "couldn't commit the file" };

  const pr = await createPullRequest(repo, { title: opts.title, body: opts.body, head: opts.branch });
  if ("error" in pr) return { error: "branch + file created, but couldn't open the PR" };
  return pr;
}
