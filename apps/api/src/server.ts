/**
 * API server assembly. Secure headers, CORS restricted to the web app
 * origin, global rate limiting, and structured error handling that never
 * leaks internals or sensitive values.
 */
import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { scrubSensitive } from "@ghimtech/security";
import { loadConfig, type ApiConfig } from "./env.js";
import { registerAuth } from "./plugins/auth.js";
import { AuditService } from "./services/audit-service.js";
import { registerAuthRoutes, type RouteContext } from "./routes/auth-routes.js";
import { registerUserAndClientRoutes } from "./routes/user-client-routes.js";
import { registerReturnRoutes } from "./routes/return-routes.js";
import { registerEfileRoutes } from "./routes/efile-routes.js";
import { registerDocumentRoutes } from "./routes/document-routes.js";
import { registerPlatformRoutes } from "./routes/platform-routes.js";
import { MemoryStore } from "./store/memory.js";
import type { Store } from "./store/types.js";

export interface BuildOptions {
  config?: ApiConfig;
  store?: Store;
}

export async function buildServer(options: BuildOptions = {}): Promise<{
  app: FastifyInstance;
  store: Store;
  config: ApiConfig;
  audit: AuditService;
}> {
  const config = options.config ?? loadConfig();
  let store = options.store;
  if (!store) {
    if (config.storeBackend === "prisma") {
      const { PrismaStore } = await import("./store/prisma.js");
      const prismaStore = new PrismaStore();
      await prismaStore.ensureOrganization();
      store = prismaStore;
    } else {
      store = new MemoryStore();
    }
  }

  const app = Fastify({
    logger: config.environment !== "test" && {
      level: "info",
      redact: {
        paths: ["req.headers.authorization", "*.password", "*.tin", "*.contentBase64"],
        censor: "[redacted]",
      },
    },
    bodyLimit: 40 * 1024 * 1024,
    trustProxy: true,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.corsOrigin.split(","),
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE"],
  });
  await app.register(rateLimit, {
    max: config.environment === "test" ? 10_000 : 300,
    timeWindow: "1 minute",
  });

  const audit = new AuditService(store);
  registerAuth(app, { store, audit });

  const ctx: RouteContext = { store, audit, config };
  registerAuthRoutes(app, ctx);
  registerUserAndClientRoutes(app, ctx);
  registerReturnRoutes(app, ctx);
  registerEfileRoutes(app, ctx);
  registerDocumentRoutes(app, ctx);
  registerPlatformRoutes(app, ctx);

  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
    const status = typeof error.statusCode === "number" ? error.statusCode : 500;
    if (status >= 500) {
      request.log?.error({ err: { name: error.name, message: scrubSensitive(error.message) } });
      return reply.code(500).send({ error: "Internal server error" });
    }
    return reply.code(status).send({ error: scrubSensitive(error.message) });
  });

  return { app, store, config, audit };
}
