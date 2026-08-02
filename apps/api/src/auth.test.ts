import { beforeAll, describe, expect, it } from "vitest";
import { authed, buildTestServer, createUser, login, TEST_PASSWORD } from "./test-helpers.js";
import type { MemoryStore } from "./store/memory.js";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;
let store: MemoryStore;

beforeAll(async () => {
  const built = await buildTestServer();
  app = built.app;
  store = built.store as MemoryStore;
});

describe("authentication", () => {
  it("requires MFA before issuing a usable session", async () => {
    const user = await createUser(store, "PREPARER");
    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: user.email, password: TEST_PASSWORD },
    });
    expect(loginRes.statusCode).toBe(200);
    const body = loginRes.json();
    expect(body.mfaRequired).toBe(true);
    expect(body.token).toBeUndefined();

    // The stage-1 token cannot access protected routes.
    const denied = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: authed(body.mfaToken),
    });
    expect(denied.statusCode).toBe(401);
  });

  it("completes MFA and returns recovery codes on first enrollment", async () => {
    const user = await createUser(store, "PREPARER");
    const token = await login(app, user.email);
    const me = await app.inject({ method: "GET", url: "/auth/me", headers: authed(token) });
    expect(me.statusCode).toBe(200);
    expect(me.json().email).toBe(user.email);
  });

  it("rejects bad passwords uniformly and locks after repeated failures", async () => {
    const user = await createUser(store, "PREPARER");
    for (let i = 0; i < 5; i++) {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: user.email, password: "WrongPassword123" },
      });
      expect([401, 423]).toContain(res.statusCode);
    }
    const locked = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: user.email, password: TEST_PASSWORD },
    });
    expect(locked.statusCode).toBe(423);
  });

  it("rejects wrong TOTP codes", async () => {
    const user = await createUser(store, "REVIEWER");
    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: user.email, password: TEST_PASSWORD },
    });
    const { mfaToken } = loginRes.json();
    const bad = await app.inject({
      method: "POST",
      url: "/auth/mfa/verify",
      payload: { mfaToken, code: "000001" },
    });
    expect(bad.statusCode).toBe(401);
  });

  it("revokes sessions on logout", async () => {
    const user = await createUser(store, "PREPARER");
    const token = await login(app, user.email);
    await app.inject({ method: "POST", url: "/auth/logout", headers: authed(token) });
    const after = await app.inject({ method: "GET", url: "/auth/me", headers: authed(token) });
    expect(after.statusCode).toBe(401);
  });

  it("rejects requests without a token", async () => {
    const res = await app.inject({ method: "GET", url: "/clients" });
    expect(res.statusCode).toBe(401);
  });
});

describe("role permissions", () => {
  it("denies client and preparer access to admin-only user management", async () => {
    const preparer = await createUser(store, "PREPARER");
    const token = await login(app, preparer.email);
    const res = await app.inject({ method: "GET", url: "/users", headers: authed(token) });
    expect(res.statusCode).toBe(403);
  });

  it("permission denials are audited", async () => {
    const auditorUser = await createUser(store, "AUDITOR");
    const token = await login(app, auditorUser.email);
    // Auditors cannot create clients…
    const res = await app.inject({
      method: "POST",
      url: "/clients",
      headers: authed(token),
      payload: {},
    });
    expect(res.statusCode).toBe(403);
    // …but can read the audit log, where the denial has been chained.
    const audit = await app.inject({ method: "GET", url: "/audit", headers: authed(token) });
    expect(audit.statusCode).toBe(200);
    const events = audit.json() as Array<{ action: string }>;
    expect(events.some((e) => e.action === "security.permission_denied")).toBe(true);
    const verify = await app.inject({
      method: "GET",
      url: "/audit/verify",
      headers: authed(token),
    });
    expect(verify.json().valid).toBe(true);
  });

  it("admin can create users; duplicates are rejected", async () => {
    const admin = await createUser(store, "ADMIN");
    const token = await login(app, admin.email);
    const created = await app.inject({
      method: "POST",
      url: "/users",
      headers: authed(token),
      payload: {
        email: "new-preparer@test.ghimtech.example",
        name: "New Preparer",
        role: "PREPARER",
        temporaryPassword: "TemporaryPass123",
      },
    });
    expect(created.statusCode).toBe(201);
    const duplicate = await app.inject({
      method: "POST",
      url: "/users",
      headers: authed(token),
      payload: {
        email: "new-preparer@test.ghimtech.example",
        name: "New Preparer",
        role: "PREPARER",
        temporaryPassword: "TemporaryPass123",
      },
    });
    expect(duplicate.statusCode).toBe(409);
  });
});
