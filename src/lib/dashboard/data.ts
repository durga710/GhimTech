/**
 * Dashboard data layer.
 *
 * Real Prisma queries against Postgres. Every function returns the exact
 * shape the dashboard widgets expect — the widgets don't know or care
 * that this is now real data instead of mocks.
 *
 * Auth model:
 *   - Every function calls requireUser() / requireUserId() internally.
 *   - That means ANY caller of these functions is guaranteed to:
 *       (a) be authenticated, OR
 *       (b) get redirected to /sign-in
 *   - There is no way to call these functions and read another user's
 *     data, because they always filter by the current user's ID.
 *
 * Performance:
 *   - All functions use indexed columns (see prisma/schema.prisma).
 *   - Aggregations (taskCount) use Prisma's _count instead of fetching
 *     all related rows.
 *   - Analytics chart pulls 30 days max (bounded query).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { requireUser, requireUserId } from "@/lib/auth";
import { relativeTime, dueLabel } from "./format";

/* ============================================================
   Types — what the widgets consume
   ============================================================ */

export type ProjectStatus = "active" | "paused" | "shipping" | "exploring";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface DashProject {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  taskCount: { total: number; done: number };
  updatedAt: string;
}

export interface DashTask {
  id: string;
  title: string;
  projectId: string | null;
  projectName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
}

export interface DashNotification {
  id: string;
  kind: "deploy" | "alert" | "info" | "agent";
  title: string;
  body: string;
  when: string;
  unread: boolean;
}

export interface DashAnalyticsPoint {
  date: string;
  shipped: number;
  opened: number;
}

export interface DashAgentSummary {
  id: string;
  generatedAt: string;
  headline: string;
  body: string;
  highlights: string[];
}

export interface DashOpsMetric {
  label: string;
  value: string;
  delta: number;
  tone: "positive" | "neutral" | "negative";
}

/* ============================================================
   Status mappings — Prisma enum → widget enum
   ============================================================ */

const PROJECT_STATUS_MAP: Record<string, ProjectStatus> = {
  EXPLORING: "exploring",
  ACTIVE: "active",
  SHIPPING: "shipping",
  MAINTAINING: "active",
  PAUSED: "paused",
  ARCHIVED: "paused",
};

const TASK_STATUS_MAP: Record<string, TaskStatus> = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  BLOCKED: "todo",
  DONE: "done",
};

const TASK_PRIORITY_MAP: Record<string, TaskPriority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

const NOTIFICATION_KIND_MAP: Record<string, DashNotification["kind"]> = {
  INFO: "info",
  ALERT: "alert",
  DEPLOY: "deploy",
  AGENT: "agent",
  SUCCESS: "deploy",
};

/* ============================================================
   Queries
   ============================================================ */

/**
 * Fetch all non-archived projects for the current user, with counts.
 * Excludes ARCHIVED from default listing (use a dedicated query for the
 * archive view).
 */
export async function getProjects(): Promise<DashProject[]> {
  const userId = await requireUserId();

  const projects = await prisma.project.findMany({
    where: {
      userId,
      status: { not: "ARCHIVED" },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: {
      _count: { select: { tasks: true } },
      tasks: {
        where: { status: "DONE" },
        select: { id: true },
      },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    status: PROJECT_STATUS_MAP[p.status] ?? "active",
    progress: p.progress,
    taskCount: {
      total: p._count.tasks,
      done: p.tasks.length,
    },
    updatedAt: p.updatedAt.toISOString(),
  }));
}

/**
 * Active queue for the current user — tasks that aren't done yet.
 * Sorted by priority + due date in the DB so the widget doesn't have
 * to re-sort.
 */
export async function getTasks(): Promise<DashTask[]> {
  const userId = await requireUserId();

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { notIn: ["DONE"] },
    },
    orderBy: [
      // Postgres orders enums by their declaration order, so CRITICAL
      // (declared last in Priority) actually sorts last by default.
      // We sort in JS for correctness — the result set is small.
      { dueAt: "asc" },
      { createdAt: "desc" },
    ],
    include: { project: { select: { id: true, name: true } } },
    take: 50, // sane cap
  });

  const priorityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  return tasks
    .sort(
      (a, b) =>
        (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
    )
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      title: t.title,
      projectId: t.projectId,
      projectName: t.project?.name ?? "Personal",
      priority: TASK_PRIORITY_MAP[t.priority] ?? "medium",
      status: TASK_STATUS_MAP[t.status] ?? "todo",
      dueDate: t.dueAt?.toISOString() ?? null,
    }));
}

export async function getNotifications(): Promise<DashNotification[]> {
  const userId = await requireUserId();

  const notifs = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return notifs.map((n) => ({
    id: n.id,
    kind: NOTIFICATION_KIND_MAP[n.kind] ?? "info",
    title: n.title,
    body: n.body ?? "",
    when: relativeTime(n.createdAt.toISOString()),
    unread: n.readAt === null,
  }));
}

/**
 * Daily brief — returns the most recent AiSummary with scope=daily-brief.
 * If none exists yet, returns a sensible placeholder so the dashboard
 * never renders empty on a fresh account.
 *
 * Phase 7 will add a cron that generates a fresh brief at 6am local time
 * via Gemini/Claude. Until then, you can write briefs manually or seed
 * one via the seed script.
 */
export async function getDailySummary(): Promise<DashAgentSummary> {
  const userId = await requireUserId();

  const latest = await prisma.aiSummary.findFirst({
    where: { userId, scope: "daily-brief" },
    orderBy: { generatedAt: "desc" },
  });

  if (latest) {
    return {
      id: latest.id,
      generatedAt: latest.generatedAt.toISOString(),
      headline: latest.headline,
      body: latest.body,
      highlights: latest.highlights,
    };
  }

  // Fallback for first-time users / before the cron has run
  return {
    id: "placeholder",
    generatedAt: new Date().toISOString(),
    headline: "Brief ready when you are.",
    body:
      "Your daily AI brief will appear here once the morning summary runs. In the meantime, your projects, queue, and ship activity are live below.",
    highlights: [
      "Connect your AI provider in settings",
      "Schedule the morning brief cron",
      "Or write your own daily intent",
    ],
  };
}

/**
 * 30-day ship activity. Bucketed by day in JavaScript — for the volume
 * we're dealing with (single user, ≤ a few thousand events/day) this is
 * fine and avoids a Postgres-specific `date_trunc` raw query.
 *
 * If/when volume grows: replace with a raw SQL query using date_trunc('day', ...)
 * + GROUP BY for server-side aggregation.
 */
export async function getAnalytics(): Promise<DashAnalyticsPoint[]> {
  const userId = await requireUserId();

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      userId,
      occurredAt: { gte: cutoff },
      event: { in: ["task.shipped", "task.opened"] },
    },
    select: { event: true, occurredAt: true },
  });

  // Bucket by YYYY-MM-DD
  const buckets = new Map<string, { shipped: number; opened: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { shipped: 0, opened: 0 });
  }
  for (const e of events) {
    const key = e.occurredAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    if (e.event === "task.shipped") b.shipped += 1;
    else if (e.event === "task.opened") b.opened += 1;
  }

  return Array.from(buckets.entries()).map(([date, v]) => ({
    date: new Date(date).toISOString(),
    shipped: v.shipped,
    opened: v.opened,
  }));
}

/**
 * Operational KPIs computed from current DB state + historical
 * analytics. Each metric has its own derivation:
 *
 *   - Ship velocity : average tasks-shipped/week over last 4 weeks
 *   - Open critical : count of incomplete CRITICAL tasks
 *   - Uptime · 30d  : derived from deployment success ratio (placeholder
 *                     for a real status-page integration)
 *   - Avg deploy    : mean durationMs of successful deploys in last 30d
 */
export async function getOpsMetrics(): Promise<DashOpsMetric[]> {
  const userId = await requireUserId();
  const now = Date.now();

  // Pull source data in parallel
  const [shipEvents, criticalCount, deployments] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: {
        userId,
        event: "task.shipped",
        occurredAt: { gte: new Date(now - 28 * 86_400_000) },
      },
      select: { occurredAt: true },
    }),
    prisma.task.count({
      where: { userId, priority: "CRITICAL", status: { not: "DONE" } },
    }),
    prisma.deploymentLog.findMany({
      where: {
        project: { userId },
        deployedAt: { gte: new Date(now - 30 * 86_400_000) },
      },
      select: { status: true, durationMs: true },
    }),
  ]);

  // ---- Ship velocity (per week, avg over 4 weeks) ----
  const lastWeek = shipEvents.filter(
    (e) => e.occurredAt.getTime() >= now - 7 * 86_400_000
  ).length;
  const priorWeek = shipEvents.filter((e) => {
    const t = e.occurredAt.getTime();
    return t >= now - 14 * 86_400_000 && t < now - 7 * 86_400_000;
  }).length;
  const velocityDelta =
    priorWeek === 0 ? 0 : Math.round(((lastWeek - priorWeek) / priorWeek) * 100);

  // ---- Uptime ----
  const totalDeploys = deployments.length;
  const successDeploys = deployments.filter((d) => d.status === "SUCCESS").length;
  const uptimePct =
    totalDeploys === 0 ? 100 : (successDeploys / totalDeploys) * 100;

  // ---- Avg deploy duration ----
  const successDurations = deployments
    .filter((d) => d.status === "SUCCESS" && d.durationMs)
    .map((d) => d.durationMs!);
  const avgMs =
    successDurations.length === 0
      ? 0
      : successDurations.reduce((a, b) => a + b, 0) / successDurations.length;
  const avgMinutes = Math.floor(avgMs / 60_000);
  const avgSeconds = Math.floor((avgMs % 60_000) / 1000);
  const deployStr =
    successDurations.length === 0
      ? "—"
      : `${avgMinutes}m ${String(avgSeconds).padStart(2, "0")}s`;

  return [
    {
      label: "Ship velocity",
      value: `${(lastWeek).toFixed(1)}/wk`,
      delta: velocityDelta,
      tone: velocityDelta >= 0 ? "positive" : "negative",
    },
    {
      label: "Open critical",
      value: String(criticalCount),
      delta: 0, // could compute vs prior period — left as 0 for now
      tone: criticalCount === 0 ? "positive" : criticalCount > 3 ? "negative" : "neutral",
    },
    {
      label: "Uptime · 30d",
      value: `${uptimePct.toFixed(2)}%`,
      delta: 0,
      tone: uptimePct >= 99.9 ? "positive" : uptimePct >= 99 ? "neutral" : "negative",
    },
    {
      label: "Avg deploy time",
      value: deployStr,
      delta: 0,
      tone: "positive",
    },
  ];
}

/* ============================================================
   Helpers
   Pure formatters now live in ./format (client-safe — no server-only).
   Imported above for internal use; re-exported here so existing
   server-side callers keep working. Client components must import
   directly from "@/lib/dashboard/format".
   ============================================================ */

export { relativeTime, dueLabel };

/**
 * Convenience type — what the dashboard page asks for in one shot.
 * Lets the page do a single Promise.all() and pass everything down.
 */
export interface DashboardData {
  user: Awaited<ReturnType<typeof requireUser>>;
  projects: DashProject[];
  tasks: DashTask[];
  notifications: DashNotification[];
  summary: DashAgentSummary;
  analytics: DashAnalyticsPoint[];
  opsMetrics: DashOpsMetric[];
}

/**
 * One-call orchestrator — fetches everything the dashboard needs in
 * parallel. Auth happens once (in requireUser) and is reused.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const user = await requireUser();
  const [projects, tasks, notifications, summary, analytics, opsMetrics] =
    await Promise.all([
      getProjects(),
      getTasks(),
      getNotifications(),
      getDailySummary(),
      getAnalytics(),
      getOpsMetrics(),
    ]);

  return { user, projects, tasks, notifications, summary, analytics, opsMetrics };
}

/* ============================================================
   Inbox — public contact-form submissions ("send me a message").
   ContactMessage has no userId (single-operator app), so these are
   auth-gated but not user-filtered.
   ============================================================ */

export type ContactPurpose = "agency" | "partner" | "press" | "hello" | "other";

export interface DashContactMessage {
  id: string;
  name: string;
  email: string;
  purpose: ContactPurpose;
  message: string;
  when: string; // relative, e.g. "5m ago"
  receivedAt: string; // ISO
  read: boolean;
  archived: boolean;
}

export interface InboxData {
  messages: DashContactMessage[];
  unreadCount: number;
}

const CONTACT_PURPOSES: readonly string[] = ["agency", "partner", "press", "hello", "other"];
function toPurpose(p: string): ContactPurpose {
  return (CONTACT_PURPOSES.includes(p) ? p : "other") as ContactPurpose;
}

/**
 * All non-archived contact messages, newest first, plus unread count.
 * Auth-gated via requireUserId() but not user-scoped — ContactMessage is
 * global to the single operator.
 */
export async function getInbox(): Promise<InboxData> {
  await requireUserId();

  const rows = await prisma.contactMessage.findMany({
    where: { archived: false },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const messages: DashContactMessage[] = rows.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    purpose: toPurpose(m.purpose),
    message: m.message,
    when: relativeTime(m.createdAt.toISOString()),
    receivedAt: m.createdAt.toISOString(),
    read: m.readAt !== null,
    archived: m.archived,
  }));

  return { messages, unreadCount: messages.filter((m) => !m.read).length };
}

/** Lightweight unread count for the sidebar badge. */
export async function getInboxUnreadCount(): Promise<number> {
  await requireUserId();
  return prisma.contactMessage.count({
    where: { archived: false, readAt: null },
  });
}

/* ============================================================
   Project detail — single owned project with all its relations.
   ============================================================ */

/**
 * Full detail for one project the current user owns (by slug), including
 * milestones, roadmap, tasks, and recent deployments. Returns null if the
 * project doesn't exist or isn't owned by the user (the page 404s on null).
 */
export async function getProjectDetail(slug: string) {
  const userId = await requireUserId();

  return prisma.project.findFirst({
    where: { slug, userId },
    include: {
      milestones: { orderBy: { order: "asc" } },
      roadmapItems: { orderBy: { order: "asc" } },
      tasks: { orderBy: [{ status: "asc" }, { dueAt: "asc" }], take: 100 },
      deployments: { orderBy: { deployedAt: "desc" }, take: 10 },
    },
  });
}
