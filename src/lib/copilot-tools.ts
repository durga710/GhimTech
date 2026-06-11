import "server-only";
import { prisma } from "@/lib/prisma";
import {
  createPullRequest,
  createRepo,
  fetchRepoActivity,
  fetchRepoContext,
  listAccessibleRepos,
  openPullRequest,
  pushFilesToRepo,
  scanRepoSecrets,
} from "@/lib/github";
import {
  isValidBranchName,
  isValidRepoName,
  validatePushFiles,
  MAX_PUSH_FILES,
} from "@/lib/repo-files";

/**
 * Copilot agent tools. `web_search` is OpenAI's built-in browsing tool
 * (executed by OpenAI). The function tools act on the operator's own data and
 * are executed server-side by executeTool(), always scoped to their userId.
 */
export const COPILOT_TOOLS = [
  { type: "web_search" as const },
  {
    type: "function" as const,
    name: "list_tasks",
    description: "List the operator's tasks. Optionally filter by status.",
    parameters: {
      type: "object",
      properties: { status: { type: "string", enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] } },
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "create_task",
    description: "Create a new task for the operator.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
        projectSlug: { type: "string", description: "optional project slug to attach the task to" },
      },
      required: ["title"],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "update_task_status",
    description: "Set a task's status by its id (get ids from list_tasks).",
    parameters: {
      type: "object",
      properties: { taskId: { type: "string" }, status: { type: "string", enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] } },
      required: ["taskId", "status"],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "list_projects",
    description: "List the operator's projects with status and progress.",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    strict: false,
  },
  {
    type: "function" as const,
    name: "create_note",
    description: "Save a note for the operator.",
    parameters: {
      type: "object",
      properties: { title: { type: "string" }, body: { type: "string" } },
      required: ["title", "body"],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "read_project_repo",
    description: "Read a project's linked GitHub repo signal (README, status docs, open issues, recent commits) by project slug.",
    parameters: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "read_repo_activity",
    description:
      "Live GitHub activity for a project's linked repo by project slug: recent commits, open pull requests, open issues, last push time. Use for 'what's happening / what changed recently' questions.",
    parameters: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "scan_repo_secrets",
    description: "Scan a project's linked GitHub repo (current files) for leaked secrets/credentials. Returns findings with file + rule (values masked).",
    parameters: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "create_github_repo",
    description:
      "Create a brand-new GitHub repo on the operator's account (auto-initialized with a main branch). Use when building a NEW app that deserves its own repo, then push files into it with build_app_files (branch 'main', no PR needed). Name must be short kebab-case.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "repo name, kebab-case, e.g. waitlist-landing" },
        description: { type: "string" },
        private: { type: "boolean", description: "default false (public)" },
      },
      required: ["name"],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "list_github_repos",
    description:
      "List ALL GitHub repos the token can access (name, private, default branch, last push). Call this BEFORE build_app_files when unsure of the target, and whenever a repo seems unreachable - it is the source of truth for valid push targets.",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    strict: false,
  },
  {
    type: "function" as const,
    name: "build_app_files",
    description:
      "BUILD AN APP: write a complete set of files (up to " +
      MAX_PUSH_FILES +
      " per call) to a branch of one of the operator's GitHub repos in a single commit, and optionally open a PR. Repos connected to Vercel automatically get a live preview deployment on the PR — so describing an app, building its files here, and opening a PR yields a running preview URL. Call again with the same branch to add or fix files.",
    parameters: {
      type: "object",
      properties: {
        repo: { type: "string", description: 'target repo as "owner/name"' },
        branch: { type: "string", description: "branch to write to; omit to create a new copilot/app-* branch" },
        message: { type: "string", description: "commit message" },
        files: {
          type: "array",
          items: {
            type: "object",
            properties: { path: { type: "string" }, content: { type: "string" } },
            required: ["path", "content"],
            additionalProperties: false,
          },
        },
        prTitle: { type: "string", description: "open a PR with this title (omit to just push the branch)" },
        prBody: { type: "string" },
      },
      required: ["repo", "message", "files"],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function" as const,
    name: "open_pull_request",
    description: "Open a single-file pull request on a project's linked GitHub repo (e.g., add a CI workflow or doc). Creates a branch + commit + PR for review; never merges.",
    parameters: {
      type: "object",
      properties: {
        slug: { type: "string" },
        title: { type: "string" },
        body: { type: "string" },
        path: { type: "string", description: "file path in the repo, e.g. .github/workflows/gitleaks.yml" },
        content: { type: "string", description: "full file contents" },
      },
      required: ["slug", "title", "path", "content"],
      additionalProperties: false,
    },
    strict: false,
  },
];

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const s = (v: unknown): string => (typeof v === "string" ? v : "");

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  userId: string,
): Promise<unknown> {
  switch (name) {
    case "list_tasks": {
      const status = TASK_STATUSES.includes(s(args.status) as TaskStatus) ? (s(args.status) as TaskStatus) : undefined;
      const tasks = await prisma.task.findMany({
        where: { userId, ...(status ? { status } : {}) },
        orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
        include: { project: { select: { name: true } } },
        take: 50,
      });
      return tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        project: t.project?.name ?? null,
        due: t.dueAt ? t.dueAt.toISOString().slice(0, 10) : null,
      }));
    }
    case "create_task": {
      const title = s(args.title).slice(0, 300);
      if (!title) return { error: "title is required" };
      const priority: Priority = PRIORITIES.includes(s(args.priority) as Priority) ? (s(args.priority) as Priority) : "MEDIUM";
      let projectId: string | null = null;
      if (s(args.projectSlug)) {
        const p = await prisma.project.findFirst({ where: { slug: s(args.projectSlug), userId }, select: { id: true } });
        projectId = p?.id ?? null;
      }
      const t = await prisma.task.create({ data: { userId, title, priority, projectId } });
      return { created: true, id: t.id, title: t.title };
    }
    case "update_task_status": {
      const taskId = s(args.taskId);
      const status = s(args.status) as TaskStatus;
      if (!TASK_STATUSES.includes(status)) return { error: "invalid status" };
      const existing = await prisma.task.findUnique({ where: { id: taskId }, select: { userId: true } });
      if (!existing || existing.userId !== userId) return { error: "task not found" };
      await prisma.task.update({
        where: { id: taskId },
        data: { status, completedAt: status === "DONE" ? new Date() : null },
      });
      return { updated: true, taskId, status };
    }
    case "list_projects": {
      return prisma.project.findMany({
        where: { userId, status: { not: "ARCHIVED" } },
        select: { id: true, name: true, slug: true, status: true, progress: true, sourceRepo: true },
        orderBy: { updatedAt: "desc" },
        take: 30,
      });
    }
    case "create_note": {
      const title = s(args.title).slice(0, 300);
      const body = s(args.body).slice(0, 50000);
      if (!title || !body) return { error: "title and body are required" };
      const n = await prisma.note.create({ data: { userId, title, body } });
      return { created: true, id: n.id };
    }
    case "read_project_repo": {
      const slug = s(args.slug);
      const p = await prisma.project.findFirst({ where: { slug, userId }, select: { sourceRepo: true } });
      if (!p?.sourceRepo) return { error: "that project has no linked repo" };
      const ctx = await fetchRepoContext(p.sourceRepo);
      if (!ctx) return { error: "couldn't read the repo" };
      return {
        repo: ctx.repo,
        readme: (ctx.readme ?? "").slice(0, 2500),
        status: (ctx.statusDoc ?? "").slice(0, 2500),
        nextSteps: (ctx.nextSteps ?? "").slice(0, 1500),
        openIssues: ctx.openIssues,
        recentCommits: ctx.recentCommits,
      };
    }
    case "read_repo_activity": {
      const slug = s(args.slug);
      const p = await prisma.project.findFirst({ where: { slug, userId }, select: { sourceRepo: true } });
      if (!p?.sourceRepo) return { error: "that project has no linked repo" };
      const activity = await fetchRepoActivity(p.sourceRepo);
      if (!activity) return { error: "couldn't read the repo" };
      return activity;
    }
    case "scan_repo_secrets": {
      const slug = s(args.slug);
      const p = await prisma.project.findFirst({ where: { slug, userId }, select: { sourceRepo: true } });
      if (!p?.sourceRepo) return { error: "that project has no linked repo" };
      const res = await scanRepoSecrets(p.sourceRepo);
      if (!res) return { error: "couldn't read the repo" };
      return { repo: p.sourceRepo, scannedFiles: res.scannedFiles, findingCount: res.findings.length, findings: res.findings.slice(0, 40) };
    }
    case "create_github_repo": {
      const name = s(args.name).trim();
      if (!/^[a-z0-9][a-z0-9-_.]{0,90}$/i.test(name)) return { error: "invalid repo name (use kebab-case)" };
      const created = await createRepo(name, {
        description: s(args.description) || undefined,
        isPrivate: args.private === true,
      });
      return created;
    }
    case "list_github_repos": {
      const repos = await listAccessibleRepos();
      if (!repos) return { error: "GitHub token missing or invalid" };
      return { count: repos.length, repos: repos.slice(0, 60) };
    }
    case "build_app_files": {
      const repo = s(args.repo);
      if (!isValidRepoName(repo)) return { error: 'repo must be "owner/name"' };

      const rawFiles = Array.isArray(args.files) ? args.files : [];
      const files = rawFiles.map((f) => {
        const o = f && typeof f === "object" ? (f as Record<string, unknown>) : {};
        return { path: s(o.path), content: typeof o.content === "string" ? o.content : "" };
      });
      const check = validatePushFiles(files);
      if (!check.ok) return { error: check.error };

      const branch = s(args.branch) || `copilot/app-${Date.now().toString(36)}`;
      if (!isValidBranchName(branch)) return { error: "invalid branch name" };
      const message = s(args.message).slice(0, 200) || "Copilot: build app files";

      const pushed = await pushFilesToRepo(repo, { branch, message, files });
      if ("error" in pushed) return pushed;

      const prTitle = s(args.prTitle).slice(0, 200);
      if (!prTitle) return { repo, branch, commitUrl: pushed.commitUrl, fileCount: files.length };

      const pr = await createPullRequest(repo, {
        title: prTitle,
        body: s(args.prBody).slice(0, 4000) || prTitle,
        head: branch,
      });
      return {
        repo,
        branch,
        commitUrl: pushed.commitUrl,
        fileCount: files.length,
        ...("url" in pr ? { prUrl: pr.url } : { prError: pr.error }),
      };
    }
    case "open_pull_request": {
      const slug = s(args.slug);
      const p = await prisma.project.findFirst({ where: { slug, userId }, select: { sourceRepo: true } });
      if (!p?.sourceRepo) return { error: "that project has no linked repo" };
      const path = s(args.path);
      const content = s(args.content);
      if (!path || !content) return { error: "path and content are required" };
      const title = s(args.title).slice(0, 200) || "Copilot change";
      const branch = `copilot/${Date.now().toString(36)}`;
      return openPullRequest(p.sourceRepo, {
        title,
        body: s(args.body).slice(0, 4000) || title,
        path,
        content,
        branch,
      });
    }
    default:
      return { error: `unknown tool: ${name}` };
  }
}

/** Short human label for an executed tool, for the chat's "actions taken" line. */
export function toolLabel(name: string, result: unknown): string {
  const r = (result ?? {}) as Record<string, unknown>;
  switch (name) {
    case "web_search":
      return "searched the web";
    case "list_tasks":
      return "read your tasks";
    case "create_task":
      return r.created ? `created task “${String(r.title ?? "")}”` : "tried to create a task";
    case "update_task_status":
      return r.updated ? `set a task to ${String(r.status ?? "")}` : "tried to update a task";
    case "list_projects":
      return "read your projects";
    case "create_note":
      return r.created ? "saved a note" : "tried to save a note";
    case "read_project_repo":
      return r.repo ? `read ${String(r.repo)}` : "tried to read a repo";
    case "read_repo_activity":
      return r.repo ? `checked live activity on ${String(r.repo)}` : "tried to check repo activity";
    case "scan_repo_secrets":
      return r.findingCount !== undefined ? `scanned ${String(r.repo ?? "repo")} — ${String(r.findingCount)} finding(s)` : "scanned a repo";
    case "create_github_repo":
      return r.repo ? `created repo ${String(r.repo)}` : "tried to create a repo";
    case "list_github_repos":
      return r.count !== undefined ? `listed ${String(r.count)} accessible repo(s)` : "tried to list repos";
    case "build_app_files":
      return r.prUrl
        ? `built ${String(r.fileCount ?? "")} file(s) & opened a PR`
        : r.branch
          ? `pushed ${String(r.fileCount ?? "")} file(s) to ${String(r.branch)}`
          : "tried to build app files";
    case "open_pull_request":
      return r.url ? "opened a pull request" : "tried to open a PR";
    default:
      return name;
  }
}
