import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * Next.js hot-reload in dev creates a new module instance on every save,
 * which means a naive `new PrismaClient()` at module scope creates a new
 * connection pool every time — eventually exhausting Postgres connections.
 *
 * The standard fix: stash the client on globalThis in dev, reuse it across
 * reloads. In production this code path is never hit since modules don't
 * reload.
 *
 * Phase 4: this is exported but unused — the dashboard runs on mock data.
 * Phase 5: import this in src/lib/dashboard/data.ts and replace MOCK_*
 *          constants with prisma.*.findMany() calls.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
