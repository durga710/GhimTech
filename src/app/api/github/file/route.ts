/**
 * /api/github/file?repo=owner/name&path=src/x.ts&ref=branch
 *   GET → one file's text content for the in-browser code editor.
 *
 * Operator-only, rate-limited.
 */

import { requireUser } from "@/lib/auth";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { fetchRepoFileContent } from "@/lib/github";
import { isSafeRepoPath, isValidRepoName } from "@/lib/repo-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`code.read:${user.id}`, { limit: 600, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const url = new URL(req.url);
  const repo = url.searchParams.get("repo") ?? "";
  const path = url.searchParams.get("path") ?? "";
  const ref = url.searchParams.get("ref") ?? undefined;
  if (!isValidRepoName(repo)) return apiErrors.badRequest('repo must be "owner/name"');
  if (!isSafeRepoPath(path)) return apiErrors.badRequest("invalid file path");

  const file = await fetchRepoFileContent(repo, path, ref);
  if (!file) return apiErrors.badRequest("Couldn't read that file (missing, binary, or too large).");

  return ok({ path, content: file.content });
}
