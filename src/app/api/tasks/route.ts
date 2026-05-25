/**
 * /api/tasks
 *   GET  ?status=&priority=&projectId=  → list
 *   POST → create
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import {
  TaskCreateSchema,
  TaskStatusEnum,
  PriorityEnum,
} from "@/lib/validation";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// ============ GET ============
export async function GET(req: Request) {
  const user = await requireUser();
  const url = new URL(req.url);

  // Build filters from query params, with validation
  const where: Prisma.TaskWhereInput = { userId: user.id };

  const statusParam = url.searchParams.get("status");
  if (statusParam) {
    const parsed = TaskStatusEnum.safeParse(statusParam);
    if (!parsed.success) return apiErrors.badRequest("Invalid status filter");
    where.status = parsed.data;
  }

  const priorityParam = url.searchParams.get("priority");
  if (priorityParam) {
    const parsed = PriorityEnum.safeParse(priorityParam);
    if (!parsed.success) return apiErrors.badRequest("Invalid priority filter");
    where.priority = parsed.data;
  }

  const projectId = url.searchParams.get("projectId");
  if (projectId) where.projectId = projectId;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    include: { project: { select: { id: true, name: true, slug: true } } },
    take: 200,
  });

  return ok({ tasks });
}

// ============ POST ============
export async function POST(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`tasks.create:${user.id}`, {
    limit: 200,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = TaskCreateSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  // If projectId was provided, verify the user owns that project.
  // Don't trust the client to only send their own project IDs.
  if (parsed.data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return apiErrors.notFound("Project");
    }
  }

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      userId: user.id,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    },
  });

  // Record an analytics event so the ship chart picks it up
  await prisma.analyticsEvent.create({
    data: {
      userId: user.id,
      projectId: task.projectId,
      event: "task.opened",
      payload: { taskId: task.id },
    },
  });

  await audit({
    action: "task.create",
    target: task.id,
    actorId: user.id,
    diff: parsed.data,
    req,
  });

  return ok({ task }, { status: 201 });
}
