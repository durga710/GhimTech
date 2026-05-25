/**
 * /api/notes/[id]
 *   GET    → fetch
 *   PATCH  → update
 *   DELETE → hard delete
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { NoteUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

async function loadOwned(id: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.userId !== userId) return null;
  return note;
}

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const note = await loadOwned(id, user.id);
  if (!note) return apiErrors.notFound("Note");

  return ok({ note });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await loadOwned(id, user.id);
  if (!existing) return apiErrors.notFound("Note");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = NoteUpdateSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const updated = await prisma.note.update({
    where: { id },
    data: parsed.data,
  });

  await audit({
    action: "note.update",
    target: id,
    actorId: user.id,
    diff: { before: existing, after: parsed.data },
    req,
  });

  return ok({ note: updated });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const existing = await loadOwned(id, user.id);
  if (!existing) return apiErrors.notFound("Note");

  await prisma.note.delete({ where: { id } });

  await audit({
    action: "note.delete",
    target: id,
    actorId: user.id,
    diff: existing,
    req,
  });

  return ok({ deleted: true });
}
