import assert from "node:assert/strict";
import { after, beforeEach, describe, it } from "node:test";
import {
  canCreateAccountWithInvite,
  isValidTeamInviteCode,
} from "../src/lib/auth-policy";

const originalAllowedEmail = process.env.AUTH_ALLOWED_EMAIL;
const originalInviteCodes = process.env.AUTH_TEAM_INVITE_CODES;
const originalInviteCode = process.env.AUTH_TEAM_INVITE_CODE;

beforeEach(() => {
  process.env.AUTH_ALLOWED_EMAIL = "owner@example.com";
  delete process.env.AUTH_TEAM_INVITE_CODES;
  delete process.env.AUTH_TEAM_INVITE_CODE;
});

after(() => {
  if (originalAllowedEmail === undefined) {
    delete process.env.AUTH_ALLOWED_EMAIL;
  } else {
    process.env.AUTH_ALLOWED_EMAIL = originalAllowedEmail;
  }

  if (originalInviteCodes === undefined) {
    delete process.env.AUTH_TEAM_INVITE_CODES;
  } else {
    process.env.AUTH_TEAM_INVITE_CODES = originalInviteCodes;
  }

  if (originalInviteCode === undefined) {
    delete process.env.AUTH_TEAM_INVITE_CODE;
  } else {
    process.env.AUTH_TEAM_INVITE_CODE = originalInviteCode;
  }
});

describe("team invite account policy", () => {
  it("allows the configured owner email to create an account without an invite code", () => {
    assert.equal(canCreateAccountWithInvite("OWNER@example.com", ""), true);
  });

  it("allows a team email to create an account with a configured invite code", () => {
    process.env.AUTH_TEAM_INVITE_CODES = "launch-room-42";

    assert.equal(
      canCreateAccountWithInvite("teammate@example.com", "launch-room-42"),
      true
    );
  });

  it("rejects team account creation when the invite code is missing or wrong", () => {
    process.env.AUTH_TEAM_INVITE_CODES = "launch-room-42";

    assert.equal(canCreateAccountWithInvite("teammate@example.com", ""), false);
    assert.equal(
      canCreateAccountWithInvite("teammate@example.com", "wrong-code"),
      false
    );
  });

  it("supports comma-separated invite codes and trims submitted whitespace", () => {
    process.env.AUTH_TEAM_INVITE_CODES = "alpha-code, beta-code";

    assert.equal(isValidTeamInviteCode(" beta-code "), true);
  });

  it("supports the singular invite code env var as a fallback", () => {
    process.env.AUTH_TEAM_INVITE_CODE = "solo-code";

    assert.equal(isValidTeamInviteCode("solo-code"), true);
  });
});
