/**
 * /api/admin/contact/[id]
 *   PATCH → mark read/unread, archive/unarchive
 *
 * Operator-only. ContactMessage is global (no userId) — there is exactly
 * one operator — so we just require an authenticated user.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { ContactMessageUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) return apiErrors.notFound("Message");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = ContactMessageUpdateSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const { read, archived } = parsed.data;

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: {
      ...(read !== undefined ? { readAt: read ? new Date() : null } : {}),
      ...(archived !== undefined ? { archived } : {}),
    },
  });

  await audit({
    action: "contact.update",
    target: id,
    actorId: user.id,
    diff: parsed.data,
    req,
  });

  return ok({
    message: {
      id: updated.id,
      read: updated.readAt !== null,
      archived: updated.archived,
    },
  });
}
