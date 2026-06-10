import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAuthRoute,
  isProtectedRoute,
  matchesRoutePrefix,
  shouldRedirectAuthenticatedToDashboard,
} from "../src/lib/auth-route-policy";

describe("matchesRoutePrefix", () => {
  it("matches exact prefixes and nested paths only", () => {
    assert.equal(matchesRoutePrefix("/dashboard", ["/dashboard"]), true);
    assert.equal(matchesRoutePrefix("/dashboard/tasks", ["/dashboard"]), true);
    assert.equal(matchesRoutePrefix("/dashboards", ["/dashboard"]), false);
  });
});

describe("isProtectedRoute", () => {
  it("protects dashboard, admin, and private API routes", () => {
    assert.equal(isProtectedRoute("/dashboard"), true);
    assert.equal(isProtectedRoute("/admin/users"), true);
    assert.equal(isProtectedRoute("/api/private/notes"), true);
  });

  it("leaves marketing and auth routes public", () => {
    assert.equal(isProtectedRoute("/"), false);
    assert.equal(isProtectedRoute("/projects/ghimtech"), false);
    assert.equal(isProtectedRoute("/sign-in"), false);
  });
});

describe("isAuthRoute", () => {
  it("matches sign-in and sign-up routes", () => {
    assert.equal(isAuthRoute("/sign-in"), true);
    assert.equal(isAuthRoute("/sign-up/step"), true);
    assert.equal(isAuthRoute("/dashboard"), false);
  });
});

describe("shouldRedirectAuthenticatedToDashboard", () => {
  it("redirects authenticated sessions from clean auth routes", () => {
    assert.equal(
      shouldRedirectAuthenticatedToDashboard("/sign-in", new URLSearchParams()),
      true
    );
    assert.equal(
      shouldRedirectAuthenticatedToDashboard(
        "/sign-in",
        new URLSearchParams("next=%2Fdashboard")
      ),
      true
    );
  });

  it("keeps auth routes with an error reachable to avoid redirect loops", () => {
    assert.equal(
      shouldRedirectAuthenticatedToDashboard(
        "/sign-in",
        new URLSearchParams("error=not-allowed")
      ),
      false
    );
    assert.equal(
      shouldRedirectAuthenticatedToDashboard(
        "/sign-up",
        new URLSearchParams("error=invalid-invite")
      ),
      false
    );
  });

  it("never redirects non-auth routes", () => {
    assert.equal(
      shouldRedirectAuthenticatedToDashboard("/dashboard", new URLSearchParams()),
      false
    );
  });
});
