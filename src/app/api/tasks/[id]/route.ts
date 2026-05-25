/**
 * /api/tasks/[id]
 *   GET    → fetch one
 *   PATCH  → update (auto-emits task.shipped analytics event when status → DONE)
 *   DELETE → hard delete (tasks are cheap, no soft-delete needed)
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { TaskUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

async function loadOwned(id: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) return null;
  return task;
}

// ============ GET ============
export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true, slug: true } } },
  });
  if (!task || task.userId !== user.id) return apiErrors.notFound("Task");

  return ok({ task });
}

// ============ PATCH ============
export async function PATCH(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await loadOwned(id, user.id);
  if (!existing) return apiErrors.notFound("Task");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = TaskUpdateSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  // Verify project ownership if project is being changed
  if (parsed.data.projectId) {
    const proj = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { userId: true },
    });
    if (!proj || proj.userId !== user.id) return apiErrors.notFound("Project");
  }

  // Detect transition to DONE — set completedAt and emit analytics event
  const becomingDone = parsed.data.status === "DONE" && existing.status !== "DONE";
  const becomingUndone = existing.status === "DONE" && parsed.data.status && parsed.data.status !== "DONE";

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...parsed.data,
      dueAt: parsed.data.dueAt !== undefined
        ? parsed.data.dueAt
          ? new Date(parsed.data.dueAt)
          : null
        : undefined,
      completedAt: becomingDone
        ? new Date()
        : becomingUndone
        ? null
        : undefined,
    },
  });

  if (becomingDone) {
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        projectId: updated.projectId,
        event: "task.shipped",
        payload: { taskId: updated.id, title: updated.title },
      },
    });
  }

  await audit({
    action: "task.update",
    target: id,
    actorId: user.id,
    diff: { before: existing, after: parsed.data },
    req,
  });

  return ok({ task: updated });
}

// ============ DELETE ============
export async function DELETE(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await loadOwned(id, user.id);
  if (!existing) return apiErrors.notFound("Task");

  await prisma.task.delete({ where: { id } });

  await audit({
    action: "task.delete",
    target: id,
    actorId: user.id,
    diff: existing,
    req,
  });

  return ok({ deleted: true });
}
