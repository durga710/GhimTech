/**
 * /api/github/commit
 *   POST → commit edited files to a branch from the in-browser code editor.
 *          Body: { repo, branch, message, files: [{path, content}] }.
 *
 * Operator-only, rate-limited. Uses the same guardrails and single-commit
 * push plumbing as the Copilot's app builder.
 */

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { pushFilesToRepo, withGitHubToken } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import {
  isValidBranchName,
  isValidRepoName,
  validatePushFiles,
  MAX_FILE_CHARS,
  MAX_PUSH_FILES,
} from "@/lib/repo-files";

export const runtime = "nodejs";

const CommitSchema = z.object({
  repo: z.string().max(140),
  branch: z.string().max(80),
  message: z.string().min(1).max(200),
  files: z
    .array(z.object({ path: z.string().max(200), content: z.string().max(MAX_FILE_CHARS) }))
    .min(1)
    .max(MAX_PUSH_FILES),
});

export async function POST(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`code.commit:${user.id}`, { limit: 60, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const memberPrefs = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
    select: { githubToken: true },
  });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }
  const parsed = CommitSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const { repo, branch, message, files } = parsed.data;
  if (!isValidRepoName(repo)) return apiErrors.badRequest('repo must be "owner/name"');
  if (!isValidBranchName(branch)) return apiErrors.badRequest("invalid branch name");
  const check = validatePushFiles(files);
  if (!check.ok) return apiErrors.badRequest(check.error);

  const result = await withGitHubToken(memberPrefs?.githubToken, () => pushFilesToRepo(repo, { branch, message, files }));
  if ("error" in result) return apiErrors.badRequest(result.error);

  await audit({
    action: "code.commit",
    target: `${repo}#${branch}`,
    actorId: user.id,
    diff: { message, paths: files.map((f) => f.path) },
    req,
  });

  return ok(result);
}
