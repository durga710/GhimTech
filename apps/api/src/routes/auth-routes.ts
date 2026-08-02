/**
 * Authentication routes: password login → mandatory TOTP MFA → session.
 * First login enrolls MFA (secret returned once, over TLS, for authenticator
 * apps). Brute force is limited by per-account lockout plus global rate
 * limiting configured in server.ts.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import {
  decryptField,
  encryptField,
  generateRecoveryCodes,
  generateToken,
  generateTotpSecret,
  hashToken,
  hashPassword,
  otpauthUrl,
  passwordMeetsPolicy,
  verifyPassword,
  verifyTotp,
} from "@ghimtech/security";
import { loginSchema, mfaVerifySchema } from "@ghimtech/validation";
import type { ApiConfig } from "../env.js";
import type { AuthenticatedApp } from "../plugins/auth.js";
import type { AuditService } from "../services/audit-service.js";
import type { Store } from "../store/types.js";

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export interface RouteContext {
  store: Store;
  audit: AuditService;
  config: ApiConfig;
}

export function registerAuthRoutes(app: FastifyInstance, ctx: RouteContext): void {
  const typedApp = app as AuthenticatedApp;
  const { store, audit, config } = ctx;

  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "Invalid credentials payload" });

    const user = await store.getUserByEmail(body.data.email);
    // Uniform failure path — do not reveal whether the account exists.
    const fail = async () => {
      if (user) {
        const failed = user.failedLoginCount + 1;
        await store.updateUser(user.id, {
          failedLoginCount: failed,
          ...(failed >= MAX_FAILED_LOGINS
            ? { lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString() }
            : {}),
        });
        await audit.log({
          action: failed >= MAX_FAILED_LOGINS ? "auth.login.locked" : "auth.login.failure",
          actorId: user.id,
          actorRole: user.role,
          ipAddress: request.ip,
        });
      }
      return reply.code(401).send({ error: "Invalid email or password" });
    };

    if (!user || user.disabled) return fail();
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return reply.code(423).send({ error: "Account temporarily locked. Try again later." });
    }
    if (!(await verifyPassword(body.data.password, user.passwordHash))) return fail();

    await store.updateUser(user.id, { failedLoginCount: 0, lockedUntil: undefined });

    // Stage-1 session: not MFA-verified yet, short-lived.
    const mfaToken = generateToken();
    await store.createSession({
      id: randomUUID(),
      userId: user.id,
      tokenHash: hashToken(mfaToken),
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    if (!user.mfaEnrolled) {
      // Mandatory enrollment: mint the TOTP secret now; verified on first MFA check.
      const secret = generateTotpSecret();
      await store.updateUser(user.id, {
        totpSecretEncrypted: encryptField(secret, config.masterKey),
      });
      await audit.log({
        action: "auth.mfa.enrolled",
        actorId: user.id,
        actorRole: user.role,
        ipAddress: request.ip,
      });
      return reply.send({
        mfaRequired: true,
        mfaEnrollment: {
          secret,
          otpauthUrl: otpauthUrl(secret, user.email),
        },
        mfaToken,
      });
    }
    return reply.send({ mfaRequired: true, mfaToken });
  });

  app.post("/auth/mfa/verify", async (request, reply) => {
    const body = mfaVerifySchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "Invalid MFA payload" });

    const session = await store.getSessionByTokenHash(hashToken(body.data.mfaToken));
    if (!session || session.revokedAt || new Date(session.expiresAt) < new Date()) {
      return reply.code(401).send({ error: "MFA session expired — sign in again" });
    }
    const user = await store.getUserById(session.userId);
    if (!user?.totpSecretEncrypted) {
      return reply.code(401).send({ error: "MFA not initialized — sign in again" });
    }
    const secret = decryptField(user.totpSecretEncrypted, config.masterKey);
    if (!verifyTotp(secret, body.data.code, Date.now())) {
      await audit.log({
        action: "auth.mfa.failed",
        actorId: user.id,
        actorRole: user.role,
        ipAddress: request.ip,
      });
      return reply.code(401).send({ error: "Incorrect code" });
    }

    let recoveryCodes: string[] | undefined;
    if (!user.mfaEnrolled) {
      recoveryCodes = generateRecoveryCodes();
      await store.updateUser(user.id, {
        mfaEnrolled: true,
        recoveryCodeHashes: recoveryCodes.map(hashToken),
      });
    }

    // Upgrade to a full session with a fresh token (rotation).
    const token = generateToken();
    await store.updateSession(session.id, { revokedAt: new Date().toISOString() });
    const fullSession = await store.createSession({
      id: randomUUID(),
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + config.sessionTtlMinutes * 60_000).toISOString(),
      mfaVerifiedAt: new Date().toISOString(),
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });
    await audit.log({
      action: "auth.login.success",
      actorId: user.id,
      actorRole: user.role,
      ipAddress: request.ip,
      details: { sessionId: fullSession.id },
    });
    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordResetForced: user.passwordResetForced,
      },
      ...(recoveryCodes ? { recoveryCodes } : {}),
    });
  });

  app.post("/auth/logout", { preHandler: [typedApp.authenticate] }, async (request, reply) => {
    await store.updateSession(request.auth!.sessionId, { revokedAt: new Date().toISOString() });
    await audit.log({
      action: "auth.logout",
      actorId: request.auth!.user.id,
      actorRole: request.auth!.user.role,
      ipAddress: request.ip,
    });
    return reply.send({ ok: true });
  });

  app.get("/auth/me", { preHandler: [typedApp.authenticate] }, async (request) => {
    const { user } = request.auth!;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordResetForced: user.passwordResetForced,
    };
  });

  app.post("/auth/password", { preHandler: [typedApp.authenticate] }, async (request, reply) => {
    const body = request.body as { currentPassword?: string; newPassword?: string };
    if (!body?.currentPassword || !body?.newPassword) {
      return reply.code(400).send({ error: "currentPassword and newPassword required" });
    }
    const { user } = request.auth!;
    if (!(await verifyPassword(body.currentPassword, user.passwordHash))) {
      return reply.code(401).send({ error: "Current password is incorrect" });
    }
    const policy = passwordMeetsPolicy(body.newPassword);
    if (!policy.ok) return reply.code(400).send({ error: policy.reason });
    await store.updateUser(user.id, {
      passwordHash: await hashPassword(body.newPassword),
      passwordResetForced: false,
    });
    await store.revokeUserSessions(user.id);
    await audit.log({
      action: "auth.password.changed",
      actorId: user.id,
      actorRole: user.role,
      ipAddress: request.ip,
    });
    return reply.send({ ok: true, message: "Password changed. Sign in again." });
  });
}
