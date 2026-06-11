/**
 * /api/github/repos — GET: repos the GITHUB_TOKEN can access (the GCODE
 * studio's repo picker and the editor's target list). Operator-only.
 */

import { requireUser } from "@/lib/auth";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { listAccessibleRepos } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  const rl = rateLimit(`code.read:${user.id}`, { limit: 600, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const repos = await listAccessibleRepos();
  if (!repos) return apiErrors.badRequest("GitHub token missing or invalid.");

  return ok({ repos });
}
