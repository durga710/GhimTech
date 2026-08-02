/**
 * User management (admin) and client management routes.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { blindIndex, encryptField, hashPassword, maskSsn } from "@ghimtech/security";
import { createClientSchema, createUserSchema } from "@ghimtech/validation";
import type { AuthenticatedApp } from "../plugins/auth.js";
import { requireOwnClient } from "../plugins/auth.js";
import type { ClientRecord } from "../store/types.js";
import type { RouteContext } from "./auth-routes.js";

function clientView(client: ClientRecord) {
  return {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    tags: client.tags,
    tinMasked: maskSsn(client.tinLast4),
    dateOfBirth: client.dateOfBirth,
    address: client.address,
    assignedPreparerId: client.assignedPreparerId,
    createdAt: client.createdAt,
  };
}

export function registerUserAndClientRoutes(app: FastifyInstance, ctx: RouteContext): void {
  const typedApp = app as AuthenticatedApp;
  const { store, audit, config } = ctx;

  // ---- Users (admin only) ----
  app.post(
    "/users",
    { preHandler: [typedApp.requirePermission("users:manage")] },
    async (request, reply) => {
      const body = createUserSchema.safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
      const existing = await store.getUserByEmail(body.data.email);
      if (existing) return reply.code(409).send({ error: "A user with this email already exists" });
      const user = await store.createUser({
        id: randomUUID(),
        email: body.data.email,
        name: body.data.name,
        role: body.data.role,
        passwordHash: await hashPassword(body.data.temporaryPassword),
        passwordResetForced: true,
        mfaEnrolled: false,
        recoveryCodeHashes: [],
        failedLoginCount: 0,
        disabled: false,
      });
      await audit.log({
        action: "user.created",
        actorId: request.auth!.user.id,
        actorRole: request.auth!.user.role,
        entityType: "user",
        entityId: user.id,
        details: { role: user.role },
      });
      return reply.code(201).send({ id: user.id, email: user.email, role: user.role });
    },
  );

  app.get("/users", { preHandler: [typedApp.requirePermission("users:manage")] }, async () => {
    const users = await store.listUsers();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      disabled: u.disabled,
      mfaEnrolled: u.mfaEnrolled,
    }));
  });

  app.post(
    "/users/:id/disable",
    { preHandler: [typedApp.requirePermission("users:manage")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      if (id === request.auth!.user.id) {
        return reply.code(400).send({ error: "You cannot disable your own account" });
      }
      await store.updateUser(id, { disabled: true });
      await store.revokeUserSessions(id);
      await audit.log({
        action: "user.disabled",
        actorId: request.auth!.user.id,
        actorRole: request.auth!.user.role,
        entityType: "user",
        entityId: id,
      });
      return { ok: true };
    },
  );

  // ---- Clients ----
  app.post(
    "/clients",
    { preHandler: [typedApp.requirePermission("clients:write")] },
    async (request, reply) => {
      const body = createClientSchema.safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: body.error.issues[0]?.message });
      const tinIdx = blindIndex(body.data.tin, config.indexKey);
      const duplicate = await store.getClientByTinIndex(tinIdx);
      if (duplicate) {
        return reply.code(409).send({ error: "A client with this SSN/ITIN already exists" });
      }
      const client = await store.createClient({
        id: randomUUID(),
        assignedPreparerId: body.data.assignedPreparerId ?? request.auth!.user.id,
        firstName: body.data.name.firstName,
        lastName: body.data.name.lastName,
        email: body.data.email,
        phone: body.data.phone,
        tags: body.data.tags,
        tinEncrypted: encryptField(body.data.tin, config.masterKey),
        tinLast4: body.data.tin.slice(-4),
        tinIndex: tinIdx,
        dateOfBirth: body.data.dateOfBirth,
        address: body.data.address,
        createdAt: new Date().toISOString(),
      });
      await audit.log({
        action: "client.created",
        actorId: request.auth!.user.id,
        actorRole: request.auth!.user.role,
        entityType: "client",
        entityId: client.id,
        details: { tinMasked: maskSsn(client.tinLast4) },
      });
      return reply.code(201).send(clientView(client));
    },
  );

  app.get("/clients", { preHandler: [typedApp.requirePermission("clients:read")] }, async () => {
    return (await store.listClients()).map(clientView);
  });

  app.get(
    "/clients/me",
    { preHandler: [typedApp.requirePermission("clients:read-own")] },
    async (request, reply) => {
      const clientId = await requireOwnClient(store, request, reply);
      if (!clientId) return;
      const client = await store.getClient(clientId);
      return clientView(client!);
    },
  );

  app.get("/clients/:id", { preHandler: [typedApp.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = request.auth!.user.role;
    if (role === "CLIENT") {
      const ownId = await requireOwnClient(store, request, reply);
      if (!ownId) return;
      if (ownId !== id) return reply.code(403).send({ error: "Access denied" });
    } else if (!["ADMIN", "PREPARER", "REVIEWER", "AUDITOR"].includes(role)) {
      return reply.code(403).send({ error: "Access denied" });
    }
    const client = await store.getClient(id);
    if (!client) return reply.code(404).send({ error: "Client not found" });
    await audit.log({
      action: "client.viewed",
      actorId: request.auth!.user.id,
      actorRole: role,
      entityType: "client",
      entityId: id,
    });
    return clientView(client);
  });

  // Link a portal login for an existing client (admin/preparer).
  app.post(
    "/clients/:id/portal-account",
    { preHandler: [typedApp.requirePermission("clients:write")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { temporaryPassword?: string };
      const client = await store.getClient(id);
      if (!client) return reply.code(404).send({ error: "Client not found" });
      if (client.userId)
        return reply.code(409).send({ error: "Client already has a portal account" });
      if (!body?.temporaryPassword || body.temporaryPassword.length < 12) {
        return reply
          .code(400)
          .send({ error: "temporaryPassword of at least 12 characters required" });
      }
      const user = await store.createUser({
        id: randomUUID(),
        email: client.email,
        name: `${client.firstName} ${client.lastName}`,
        role: "CLIENT",
        passwordHash: await hashPassword(body.temporaryPassword),
        passwordResetForced: true,
        mfaEnrolled: false,
        recoveryCodeHashes: [],
        failedLoginCount: 0,
        disabled: false,
      });
      await store.updateClient(id, { userId: user.id });
      await audit.log({
        action: "user.created",
        actorId: request.auth!.user.id,
        actorRole: request.auth!.user.role,
        entityType: "user",
        entityId: user.id,
        details: { role: "CLIENT", clientId: id },
      });
      return reply.code(201).send({ userId: user.id });
    },
  );
}
