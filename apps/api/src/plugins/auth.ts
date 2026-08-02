/**
 * Authentication and authorization plugin.
 *
 * Bearer-token sessions: opaque tokens stored as SHA-256 hashes, short TTL,
 * MFA-gated. Every protected route declares a required permission; client
 * users are additionally scoped to their own records inside handlers via
 * `requireOwnClient`.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { hashToken } from "@ghimtech/security";
import { roleHasPermission, type Permission, type Role } from "@ghimtech/tax-domain";
import type { Store, UserRecord } from "../store/types.js";
import type { AuditService } from "../services/audit-service.js";

export interface AuthContext {
  user: UserRecord;
  sessionId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

export interface AuthPluginOptions {
  store: Store;
  audit: AuditService;
}

export function registerAuth(app: FastifyInstance, options: AuthPluginOptions): void {
  app.decorateRequest("auth", undefined);

  app.decorate("authenticate", (async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "Authentication required" });
    }
    const token = header.slice("Bearer ".length).trim();
    const session = await options.store.getSessionByTokenHash(hashToken(token));
    if (!session || session.revokedAt || new Date(session.expiresAt) < new Date()) {
      return reply.code(401).send({ error: "Session expired or revoked" });
    }
    if (!session.mfaVerifiedAt) {
      return reply.code(401).send({ error: "MFA verification required" });
    }
    const user = await options.store.getUserById(session.userId);
    if (!user || user.disabled) {
      return reply.code(401).send({ error: "Account unavailable" });
    }
    request.auth = { user, sessionId: session.id };
  }) satisfies preHandlerHookHandler);

  app.decorate("requirePermission", (permission: Permission): preHandlerHookHandler => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await (app as FastifyInstance & { authenticate: preHandlerHookHandler }).authenticate.call(
        app,
        request,
        reply,
        () => undefined,
      );
      if (reply.sent) return;
      const role = request.auth!.user.role as Role;
      if (!roleHasPermission(role, permission)) {
        await options.audit.log({
          action: "security.permission_denied",
          actorId: request.auth!.user.id,
          actorRole: role,
          details: { permission, path: request.url },
          ipAddress: request.ip,
        });
        return reply.code(403).send({ error: `Missing permission: ${permission}` });
      }
    };
  });
}

export type AuthenticatedApp = FastifyInstance & {
  authenticate: preHandlerHookHandler;
  requirePermission: (permission: Permission) => preHandlerHookHandler;
};

/** Resolve the client id a CLIENT-role user is allowed to access. */
export async function requireOwnClient(
  store: Store,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<string | undefined> {
  const client = await store.getClientByUserId(request.auth!.user.id);
  if (!client) {
    reply.code(403).send({ error: "No client profile linked to this account" });
    return undefined;
  }
  return client.id;
}
