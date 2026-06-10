import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  canEnrollWithInvite,
  DEFAULT_OPERATOR_EMAIL,
  getTeamInviteCodes,
  isAllowedOperatorEmail,
  isValidTeamInviteCode,
  normalizeEmail,
  safeRedirectPath,
} from "../src/lib/auth-policy";

const originalAllowedEmail = process.env.AUTH_ALLOWED_EMAIL;
const originalInviteCodes = process.env.AUTH_TEAM_INVITE_CODES;

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

afterEach(() => {
  restoreEnv("AUTH_ALLOWED_EMAIL", originalAllowedEmail);
  restoreEnv("AUTH_TEAM_INVITE_CODES", originalInviteCodes);
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    assert.equal(normalizeEmail("  Rey@Example.COM "), "rey@example.com");
  });

  it("returns empty string for null/undefined", () => {
    assert.equal(normalizeEmail(null), "");
    assert.equal(normalizeEmail(undefined), "");
  });
});

describe("isAllowedOperatorEmail", () => {
  it("accepts the configured owner email case-insensitively", () => {
    process.env.AUTH_ALLOWED_EMAIL = "owner@example.com";
    assert.equal(isAllowedOperatorEmail("Owner@Example.com"), true);
  });

  it("rejects other emails", () => {
    process.env.AUTH_ALLOWED_EMAIL = "owner@example.com";
    assert.equal(isAllowedOperatorEmail("teammate@example.com"), false);
  });

  it("falls back to the default operator email", () => {
    delete process.env.AUTH_ALLOWED_EMAIL;
    assert.equal(isAllowedOperatorEmail(DEFAULT_OPERATOR_EMAIL), true);
  });
});

describe("getTeamInviteCodes", () => {
  it("parses a comma-separated list with whitespace", () => {
    process.env.AUTH_TEAM_INVITE_CODES = " alpha-1 , beta-2 ,, gamma-3 ";
    assert.deepEqual(getTeamInviteCodes(), ["alpha-1", "beta-2", "gamma-3"]);
  });

  it("returns an empty list when unset", () => {
    delete process.env.AUTH_TEAM_INVITE_CODES;
    assert.deepEqual(getTeamInviteCodes(), []);
  });
});

describe("isValidTeamInviteCode", () => {
  it("accepts a configured code, ignoring surrounding whitespace", () => {
    process.env.AUTH_TEAM_INVITE_CODES = "alpha-1,beta-2";
    assert.equal(isValidTeamInviteCode(" beta-2 "), true);
  });

  it("rejects unknown, empty, and missing codes", () => {
    process.env.AUTH_TEAM_INVITE_CODES = "alpha-1";
    assert.equal(isValidTeamInviteCode("wrong"), false);
    assert.equal(isValidTeamInviteCode(""), false);
    assert.equal(isValidTeamInviteCode(null), false);
    assert.equal(isValidTeamInviteCode(undefined), false);
  });

  it("rejects everything when no codes are configured", () => {
    delete process.env.AUTH_TEAM_INVITE_CODES;
    assert.equal(isValidTeamInviteCode("anything"), false);
  });
});

describe("canEnrollWithInvite", () => {
  it("lets the owner enroll without an invite code", () => {
    process.env.AUTH_ALLOWED_EMAIL = "owner@example.com";
    process.env.AUTH_TEAM_INVITE_CODES = "alpha-1";
    assert.equal(canEnrollWithInvite("owner@example.com", undefined), true);
  });

  it("lets a teammate enroll with a valid invite code", () => {
    process.env.AUTH_ALLOWED_EMAIL = "owner@example.com";
    process.env.AUTH_TEAM_INVITE_CODES = "alpha-1";
    assert.equal(canEnrollWithInvite("teammate@example.com", "alpha-1"), true);
  });

  it("rejects a teammate without a valid invite code", () => {
    process.env.AUTH_ALLOWED_EMAIL = "owner@example.com";
    process.env.AUTH_TEAM_INVITE_CODES = "alpha-1";
    assert.equal(canEnrollWithInvite("teammate@example.com", "nope"), false);
    assert.equal(canEnrollWithInvite("teammate@example.com", undefined), false);
  });
});

describe("safeRedirectPath", () => {
  it("defaults to /dashboard for non-strings and unsafe values", () => {
    assert.equal(safeRedirectPath(null), "/dashboard");
    assert.equal(safeRedirectPath("https://evil.example"), "/dashboard");
    assert.equal(safeRedirectPath("//evil.example"), "/dashboard");
    assert.equal(safeRedirectPath("/sign-in?next=/dashboard"), "/dashboard");
    assert.equal(safeRedirectPath("/sign-up"), "/dashboard");
  });

  it("keeps safe internal paths", () => {
    assert.equal(safeRedirectPath("/dashboard/projects"), "/dashboard/projects");
  });
});
