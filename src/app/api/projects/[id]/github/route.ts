/**
 * /api/projects/[id]/github
 *   GET → live activity for the project's linked GitHub repo (recent commits,
 *         open PRs, open issues). Fetched fresh from GitHub on every request —
 *         no caching — so the tracker reflects what's happening right now.
 *
 * Operator-only, owner-scoped, rate-limited.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { fetchRepoActivity, hasGitHubToken } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const rl = rateLimit(`repo.activity:${user.id}`, { limit: 240, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const project = await prisma.project.findUnique({
    where: { id },
    select: { userId: true, sourceRepo: true },
  });
  if (!project || project.userId !== user.id) return apiErrors.notFound("Project");
  if (!project.sourceRepo) return apiErrors.badRequest("This project has no linked GitHub repo.");

  const activity = await fetchRepoActivity(project.sourceRepo);
  if (!activity) {
    return apiErrors.badRequest(
      hasGitHubToken()
        ? `Couldn't read ${project.sourceRepo} — check the token's repo access.`
        : `Couldn't read ${project.sourceRepo} — set GITHUB_TOKEN for private repos and higher rate limits.`,
    );
  }

  return ok({ activity, fetchedAt: new Date().toISOString() });
}
