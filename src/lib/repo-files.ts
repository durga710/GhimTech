/**
 * Validation for Copilot-pushed repo files. Pure module (no server deps) so
 * the rules are unit-testable: the agent builds apps by writing files into
 * the operator's repos, and these are the guardrails on what it may write.
 */

export const MAX_PUSH_FILES = 15;
export const MAX_FILE_CHARS = 48_000;
export const MAX_TOTAL_CHARS = 256_000;

export interface PushFile {
  path: string;
  content: string;
}

export function isValidRepoName(repo: string): boolean {
  return /^[\w.-]+\/[\w.-]+$/.test(repo);
}

export function isValidBranchName(branch: string): boolean {
  return (
    branch.length > 0 &&
    branch.length <= 80 &&
    /^[\w./-]+$/.test(branch) &&
    !branch.includes("..") &&
    !branch.startsWith("/") &&
    !branch.endsWith("/") &&
    !branch.endsWith(".lock")
  );
}

/** Repo-relative file path: no traversal, no .git, no absolute paths. */
export function isSafeRepoPath(path: string): boolean {
  if (!path || path.length > 200) return false;
  if (!/^[\w./ -]+$/.test(path)) return false;
  const segments = path.split("/");
  if (segments.some((seg) => !seg || seg === "." || seg === "..")) return false;
  if (segments[0] === ".git") return false;
  return true;
}

export function validatePushFiles(files: PushFile[]): { ok: true } | { ok: false; error: string } {
  if (files.length === 0) return { ok: false, error: "no files to push" };
  if (files.length > MAX_PUSH_FILES) {
    return { ok: false, error: `too many files — max ${MAX_PUSH_FILES} per push` };
  }

  let total = 0;
  const seen = new Set<string>();
  for (const f of files) {
    if (!isSafeRepoPath(f.path)) return { ok: false, error: `unsafe file path: ${f.path || "(empty)"}` };
    if (seen.has(f.path)) return { ok: false, error: `duplicate file path: ${f.path}` };
    seen.add(f.path);
    if (!f.content) return { ok: false, error: `empty content for ${f.path}` };
    if (f.content.length > MAX_FILE_CHARS) {
      return { ok: false, error: `${f.path} is too large — max ${MAX_FILE_CHARS} characters per file` };
    }
    total += f.content.length;
  }
  if (total > MAX_TOTAL_CHARS) {
    return { ok: false, error: `push too large — max ${MAX_TOTAL_CHARS} characters total` };
  }
  return { ok: true };
}
