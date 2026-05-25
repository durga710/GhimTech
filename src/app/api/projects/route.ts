/**
 * /api/projects
 *   GET  → list current user's projects (non-archived, with task counts)
 *   POST → create a new project
 *
 * Both endpoints require authentication. Auth is enforced by middleware
 * (route matches /dashboard or /api/* — see src/middleware.ts) AND by
 * requireUser() inside the handlers as defense in depth.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { ProjectCreateSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// ============ GET — list projects ============
export async function GET() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where: { userId: user.id, status: { not: "ARCHIVED" } },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: {
      _count: { select: { tasks: true, milestones: true, deployments: true } },
    },
  });

  return ok({ projects });
}

// ============ POST — create project ============
export async function POST(req: Request) {
  const user = await requireUser();

  // Rate-limit: 30 project creates per hour, per user. Generous because
  // this is a personal tool, but not unbounded.
  const rl = rateLimit(`projects.create:${user.id}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  // Parse + validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = ProjectCreateSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  // Create — slug must be unique. Handle the race on the DB layer.
  try {
    const created = await prisma.project.create({
      data: { ...parsed.data, userId: user.id },
    });

    await audit({
      action: "project.create",
      target: created.id,
      actorId: user.id,
      diff: parsed.data,
      req,
    });

    return ok({ project: created }, { status: 201 });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002" // unique constraint
    ) {
      return apiErrors.conflict("A project with that slug already exists");
    }
    console.error("[api/projects POST]", e);
    return apiErrors.internal();
  }
}
