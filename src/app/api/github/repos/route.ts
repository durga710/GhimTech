/**
 * /api/github/repos — GET: repos the GITHUB_TOKEN can access (the GCODE
 * studio's repo picker and the editor's target list). Operator-only.
 */

import { requireUser } from "@/lib/auth";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { listAccessibleRepos, withGitHubToken } from "@/lib/github";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  const rl = rateLimit(`code.read:${user.id}`, { limit: 600, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const memberPrefs = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
    select: { githubToken: true },
  });

  const repos = await withGitHubToken(memberPrefs?.githubToken, () => listAccessibleRepos());
  if (!repos) return apiErrors.badRequest("GitHub token missing or invalid.");

  // The repo this dashboard deploys from — GCODE should not build new apps
  // into its own home unless explicitly asked.
  const selfRepo =
    process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : null;

  return ok({ repos, selfRepo });
}
