/**
 * /api/notifications/[id]
 *   PATCH  { read: true|false } → mark as read/unread
 *   DELETE → remove notification
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { z } from "zod";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

const PatchSchema = z.object({ read: z.boolean() });

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id)
    return apiErrors.notFound("Notification");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: parsed.data.read ? new Date() : null },
  });

  return ok({ notification: updated });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id)
    return apiErrors.notFound("Notification");

  await prisma.notification.delete({ where: { id } });

  await audit({
    action: "notification.delete",
    target: id,
    actorId: user.id,
    req,
  });

  return ok({ deleted: true });
}
