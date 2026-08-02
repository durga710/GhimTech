/**
 * Test helpers: an API instance on the in-memory store with deterministic
 * keys, plus a login helper that walks the full password + TOTP MFA flow.
 */
import type { FastifyInstance } from "fastify";
import { hashPassword, totpCode } from "@ghimtech/security";
import type { Role } from "@ghimtech/tax-domain";
import { randomUUID } from "node:crypto";
import { loadConfig } from "./env.js";
import { buildServer } from "./server.js";
import { MemoryStore } from "./store/memory.js";

export const TEST_PASSWORD = "TestPassw0rdLong!";

/** TOTP secrets captured at first enrollment, for later logins in the same test file. */
const totpSecrets = new Map<string, string>();

export async function buildTestServer() {
  const config = loadConfig({
    GHIMTECH_ENV: "test",
    GHIMTECH_MASTER_KEY: "a".repeat(64),
    GHIMTECH_INDEX_KEY: "b".repeat(64),
    GHIMTECH_STORE: "memory",
    GHIMTECH_EFILE_PROVIDER: "mock",
  } as NodeJS.ProcessEnv);
  const store = new MemoryStore();
  const { app, audit } = await buildServer({ config, store });
  return { app, store, config, audit };
}

export async function createUser(
  store: MemoryStore,
  role: Role,
  email = `${role.toLowerCase()}-${randomUUID().slice(0, 8)}@test.ghimtech.example`,
) {
  return store.createUser({
    id: randomUUID(),
    email,
    name: `Test ${role}`,
    role,
    passwordHash: await hashPassword(TEST_PASSWORD),
    passwordResetForced: false,
    mfaEnrolled: false,
    recoveryCodeHashes: [],
    failedLoginCount: 0,
    disabled: false,
  });
}

/** Full login: password → (enrollment) → TOTP verify → bearer token. */
export async function login(app: FastifyInstance, email: string): Promise<string> {
  const loginRes = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { email, password: TEST_PASSWORD },
  });
  if (loginRes.statusCode !== 200) {
    throw new Error(`login failed: ${loginRes.statusCode} ${loginRes.body}`);
  }
  const loginBody = loginRes.json() as {
    mfaToken: string;
    mfaEnrollment?: { secret: string };
  };
  let secret = loginBody.mfaEnrollment?.secret;
  if (secret) {
    totpSecrets.set(email, secret);
  } else {
    secret = totpSecrets.get(email);
  }
  if (!secret) throw new Error("no TOTP secret available for this user");
  const verifyRes = await app.inject({
    method: "POST",
    url: "/auth/mfa/verify",
    payload: { mfaToken: loginBody.mfaToken, code: totpCode(secret, Date.now()) },
  });
  if (verifyRes.statusCode !== 200) {
    throw new Error(`mfa failed: ${verifyRes.statusCode} ${verifyRes.body}`);
  }
  return (verifyRes.json() as { token: string }).token;
}

export function authed(token: string) {
  return { authorization: `Bearer ${token}` };
}
