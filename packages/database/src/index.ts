/**
 * Database client entry point. Exposes a lazily created PrismaClient so apps
 * share one connection pool per process.
 */
import { PrismaClient } from "./generated/client/index.js";

export * from "./generated/client/index.js";
export { PrismaClient };

let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
}

export async function disconnectPrisma(): Promise<void> {
  if (client) {
    await client.$disconnect();
    client = undefined;
  }
}
