/**
 * /api/projects/[id]/copilot-apply
 *   POST → apply an operator-approved Copilot proposal: bump progress and
 *          create the approved milestones, roadmap items, and tasks.
 *
 * Operator-only, owner-scoped, Zod-validated. Writes are sequential (the
 * Supabase pooler doesn't support Prisma interactive transactions); a partial
 * apply is acceptable — re-running is safe and additive.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { CopilotProposalSchema } from "@/lib/validation";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== user.id) return apiErrors.notFound("Project");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = CopilotProposalSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const { suggestedProgress, milestones, roadmap, tasks } = parsed.data;

  if (typeof suggestedProgress === "number") {
    await prisma.project.update({ where: { id }, data: { progress: suggestedProgress } });
  }

  const existingMilestones = await prisma.milestone.count({ where: { projectId: id } });
  let mOrder = existingMilestones;
  for (const ms of milestones) {
    await prisma.milestone.create({
      data: { projectId: id, title: ms.title, description: ms.description ?? null, order: mOrder++ },
    });
  }

  const existingRoadmap = await prisma.roadmapItem.count({ where: { projectId: id } });
  let rOrder = existingRoadmap;
  for (const ri of roadmap) {
    await prisma.roadmapItem.create({
      data: { projectId: id, title: ri.title, quarter: ri.quarter ?? null, status: ri.status ?? "planned", order: rOrder++ },
    });
  }

  for (const tk of tasks) {
    await prisma.task.create({
      data: { userId: user.id, projectId: id, title: tk.title, priority: tk.priority ?? "MEDIUM" },
    });
  }

  const applied = {
    milestones: milestones.length,
    roadmap: roadmap.length,
    tasks: tasks.length,
    progress: suggestedProgress ?? null,
  };
  await audit({ action: "copilot.apply", target: id, actorId: user.id, diff: applied, req });

  return ok({ applied });
}
