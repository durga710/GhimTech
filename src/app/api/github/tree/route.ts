/**
 * /api/github/tree?repo=owner/name&ref=branch
 *   GET → editable file list for the in-browser code editor.
 *
 * Operator-only, rate-limited. The repo must be reachable by GITHUB_TOKEN.
 */

import { requireUser } from "@/lib/auth";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { fetchRepoTree } from "@/lib/github";
import { isValidRepoName } from "@/lib/repo-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`code.read:${user.id}`, { limit: 600, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const url = new URL(req.url);
  const repo = url.searchParams.get("repo") ?? "";
  const ref = url.searchParams.get("ref") ?? undefined;
  if (!isValidRepoName(repo)) return apiErrors.badRequest('repo must be "owner/name"');

  const tree = await fetchRepoTree(repo, ref);
  if (!tree) return apiErrors.badRequest(`Couldn't read ${repo} — check the token's repo access.`);

  return ok(tree);
}
