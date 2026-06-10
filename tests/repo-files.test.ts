import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isSafeRepoPath,
  isValidBranchName,
  isValidRepoName,
  validatePushFiles,
  MAX_FILE_CHARS,
  MAX_PUSH_FILES,
} from "../src/lib/repo-files";

describe("isValidRepoName", () => {
  it("accepts owner/name forms", () => {
    assert.equal(isValidRepoName("durga710/rayhealth-evv-platform"), true);
    assert.equal(isValidRepoName("a-b/c.d"), true);
  });

  it("rejects everything else", () => {
    assert.equal(isValidRepoName("no-slash"), false);
    assert.equal(isValidRepoName("a/b/c"), false);
    assert.equal(isValidRepoName("owner/"), false);
    assert.equal(isValidRepoName("https://github.com/a/b"), false);
  });
});

describe("isValidBranchName", () => {
  it("accepts normal branch names", () => {
    assert.equal(isValidBranchName("copilot/app-xyz"), true);
    assert.equal(isValidBranchName("feature/landing.v2"), true);
  });

  it("rejects traversal, slashes at edges, and lock suffix", () => {
    assert.equal(isValidBranchName("a..b"), false);
    assert.equal(isValidBranchName("/lead"), false);
    assert.equal(isValidBranchName("trail/"), false);
    assert.equal(isValidBranchName("x".repeat(81)), false);
    assert.equal(isValidBranchName("name.lock"), false);
    assert.equal(isValidBranchName(""), false);
  });
});

describe("isSafeRepoPath", () => {
  it("accepts nested repo-relative paths", () => {
    assert.equal(isSafeRepoPath("index.html"), true);
    assert.equal(isSafeRepoPath("src/components/App.tsx"), true);
    assert.equal(isSafeRepoPath(".github/workflows/ci.yml"), true);
  });

  it("rejects traversal, absolute paths, and .git", () => {
    assert.equal(isSafeRepoPath("../escape.txt"), false);
    assert.equal(isSafeRepoPath("a/../b"), false);
    assert.equal(isSafeRepoPath("/etc/passwd"), false);
    assert.equal(isSafeRepoPath(".git/config"), false);
    assert.equal(isSafeRepoPath("a//b"), false);
    assert.equal(isSafeRepoPath(""), false);
  });
});

describe("validatePushFiles", () => {
  const file = (path: string, content = "x") => ({ path, content });

  it("accepts a normal file set", () => {
    assert.deepEqual(
      validatePushFiles([file("index.html"), file("src/main.ts"), file("package.json")]),
      { ok: true },
    );
  });

  it("rejects empty sets, oversized sets, and duplicates", () => {
    assert.equal(validatePushFiles([]).ok, false);
    assert.equal(
      validatePushFiles(Array.from({ length: MAX_PUSH_FILES + 1 }, (_, i) => file(`f${i}.txt`))).ok,
      false,
    );
    assert.equal(validatePushFiles([file("a.txt"), file("a.txt")]).ok, false);
  });

  it("rejects unsafe paths, empty content, and oversized files", () => {
    assert.equal(validatePushFiles([file("../x")]).ok, false);
    assert.equal(validatePushFiles([file("a.txt", "")]).ok, false);
    assert.equal(validatePushFiles([file("a.txt", "y".repeat(MAX_FILE_CHARS + 1))]).ok, false);
  });
});
