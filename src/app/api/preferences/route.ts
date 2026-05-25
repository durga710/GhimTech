/**
 * /api/preferences
 *   GET   → current user preferences
 *   PATCH → update one or more preference fields
 *
 * The dashboard Peace of Mind toggle persists through here. Preferences
 * are upserted: if the row doesn't exist for some reason, we create it
 * with the new values + defaults.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { UserPreferencesUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();

  const prefs = await prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  return ok({ preferences: prefs });
}

export async function PATCH(req: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = UserPreferencesUpdateSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const prefs = await prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });

  await audit({
    action: "preferences.update",
    actorId: user.id,
    diff: parsed.data,
    req,
  });

  return ok({ preferences: prefs });
}
