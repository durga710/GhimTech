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

  // The GitHub token is a secret — report presence only, never the value.
  const { githubToken, ...rest } = prefs;
  return ok({ preferences: { ...rest, githubTokenSet: Boolean(githubToken) } });
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

  // "" means clear for the nullable secrets/URLs.
  const data = { ...parsed.data };
  if (data.githubToken === "") data.githubToken = null;
  if (data.aiBaseUrl === "") data.aiBaseUrl = null;

  const prefs = await prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  await audit({
    action: "preferences.update",
    actorId: user.id,
    diff: { ...data, ...(data.githubToken !== undefined ? { githubToken: "[redacted]" } : {}) },
    req,
  });

  const { githubToken, ...rest } = prefs;
  return ok({ preferences: { ...rest, githubTokenSet: Boolean(githubToken) } });
}
