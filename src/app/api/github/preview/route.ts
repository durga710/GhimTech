/**
 * /api/github/preview?repo=owner/name&branch=x
 *   GET → latest deployment state + URL for that branch (GCODE's live
 *         preview pane polls this until the Vercel preview is ready).
 */

import { requireUser } from "@/lib/auth";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { fetchBranchPreview, withGitHubToken } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import { isValidBranchName, isValidRepoName } from "@/lib/repo-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`code.read:${user.id}`, { limit: 600, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const memberPrefs = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
    select: { githubToken: true },
  });

  const url = new URL(req.url);
  const repo = url.searchParams.get("repo") ?? "";
  const branch = url.searchParams.get("branch") ?? "";
  if (!isValidRepoName(repo)) return apiErrors.badRequest('repo must be "owner/name"');
  if (!isValidBranchName(branch)) return apiErrors.badRequest("invalid branch name");

  const preview = await withGitHubToken(memberPrefs?.githubToken, () => fetchBranchPreview(repo, branch));
  if (!preview) return apiErrors.badRequest("Couldn't read deployments for that repo.");

  return ok(preview);
}
