/**
 * /api/notes
 *   GET  → list (pinned first, then most recent)
 *   POST → create
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { NoteCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 200,
  });

  return ok({ notes });
}

export async function POST(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`notes.create:${user.id}`, {
    limit: 100,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = NoteCreateSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const note = await prisma.note.create({
    data: { ...parsed.data, userId: user.id },
  });

  await audit({
    action: "note.create",
    target: note.id,
    actorId: user.id,
    diff: { title: parsed.data.title, tags: parsed.data.tags },
    req,
  });

  return ok({ note }, { status: 201 });
}
