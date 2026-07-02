import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldRedirectAuthenticatedAuthRoute } from "../src/lib/auth-route-policy";

describe("auth route redirect policy", () => {
  it("keeps the sign-in page reachable after a not-approved redirect", () => {
    assert.equal(
      shouldRedirectAuthenticatedAuthRoute("?error=not-allowed"),
      false
    );
  });

  it("redirects authenticated users away from normal auth pages", () => {
    assert.equal(shouldRedirectAuthenticatedAuthRoute(""), true);
  });
});
