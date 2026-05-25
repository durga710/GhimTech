/**
 * /api/projects/[id]
 *   GET    → fetch one project (with related task counts, recent deploys)
 *   PATCH  → update fields
 *   DELETE → archive (soft-delete) or hard-delete with ?hard=true
 *
 * OWNERSHIP CHECK is critical: even though we filter by userId, an
 * attacker who knows a CUID could try to read someone else's project.
 * Every handler verifies project.userId === currentUser.id before
 * doing anything. If the project belongs to someone else, we return
 * 404 (not 403) — never leak the existence of resources you don't own.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { ProjectUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

// Shared loader — fetches the project and verifies ownership.
async function loadOwned(id: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== userId) return null;
  return project;
}

// ============ GET ============
export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: { select: { tasks: true, milestones: true, deployments: true } },
      milestones: { orderBy: { order: "asc" }, take: 10 },
      roadmapItems: { orderBy: { order: "asc" }, take: 20 },
      deployments: { orderBy: { deployedAt: "desc" }, take: 10 },
    },
  });

  if (!project || project.userId !== user.id) {
    return apiErrors.notFound("Project");
  }

  return ok({ project });
}

// ============ PATCH ============
export async function PATCH(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await loadOwned(id, user.id);
  if (!existing) return apiErrors.notFound("Project");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = ProjectUpdateSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const updated = await prisma.project.update({
    where: { id },
    data: parsed.data,
  });

  await audit({
    action: "project.update",
    target: id,
    actorId: user.id,
    diff: { before: existing, after: parsed.data },
    req,
  });

  return ok({ project: updated });
}

// ============ DELETE ============
//
// Default: soft-delete (status = ARCHIVED). The project stays in the DB
// with all its tasks/deploys/etc. — recoverable.
//
// Hard delete: pass ?hard=true. Cascades through all child records.
//   Use sparingly. The audit log captures the action either way.
export async function DELETE(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await loadOwned(id, user.id);
  if (!existing) return apiErrors.notFound("Project");

  const url = new URL(req.url);
  const hard = url.searchParams.get("hard") === "true";

  if (hard) {
    await prisma.project.delete({ where: { id } });
    await audit({
      action: "project.delete.hard",
      target: id,
      actorId: user.id,
      diff: existing,
      req,
    });
    return ok({ deleted: true, mode: "hard" });
  }

  // Soft delete (default)
  await prisma.project.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  await audit({
    action: "project.archive",
    target: id,
    actorId: user.id,
    req,
  });
  return ok({ archived: true, mode: "soft" });
}
