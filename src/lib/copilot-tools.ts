import "server-only";
import { prisma } from "@/lib/prisma";
import { fetchRepoContext, scanRepoSecrets, openPullRequest } from "@/lib/github";

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
    case "scan_repo_secrets": {
      const slug = s(args.slug);
      const p = await prisma.project.findFirst({ where: { slug, userId }, select: { sourceRepo: true } });
      if (!p?.sourceRepo) return { error: "that project has no linked repo" };
      const res = await scanRepoSecrets(p.sourceRepo);
      if (!res) return { error: "couldn't read the repo" };
      return { repo: p.sourceRepo, scannedFiles: res.scannedFiles, findingCount: res.findings.length, findings: res.findings.slice(0, 40) };
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
    case "scan_repo_secrets":
      return r.findingCount !== undefined ? `scanned ${String(r.repo ?? "repo")} — ${String(r.findingCount)} finding(s)` : "scanned a repo";
    case "open_pull_request":
      return r.url ? "opened a pull request" : "tried to open a PR";
    default:
      return name;
  }
}
