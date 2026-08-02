/**
 * API configuration from the environment. Fails fast on missing secrets in
 * production; generates ephemeral keys in development/test so a fresh clone
 * runs without setup (with a clear warning).
 */
import { generateMasterKeyHex, parseMasterKey } from "@ghimtech/security";

export interface ApiConfig {
  port: number;
  host: string;
  environment: "development" | "test" | "staging" | "production";
  masterKey: Buffer;
  indexKey: Buffer;
  /** Storage backend: in-memory for dev/test, Postgres via Prisma otherwise. */
  storeBackend: "memory" | "prisma";
  efileProvider: string;
  sessionTtlMinutes: number;
  corsOrigin: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const environment = (env.GHIMTECH_ENV ??
    env.NODE_ENV ??
    "development") as ApiConfig["environment"];
  const isProd = environment === "production" || environment === "staging";

  let masterKeyHex = env.GHIMTECH_MASTER_KEY;
  let indexKeyHex = env.GHIMTECH_INDEX_KEY;
  if (!masterKeyHex || !indexKeyHex) {
    if (isProd) {
      throw new Error(
        "GHIMTECH_MASTER_KEY and GHIMTECH_INDEX_KEY must be configured outside development",
      );
    }
    masterKeyHex = masterKeyHex ?? generateMasterKeyHex();
    indexKeyHex = indexKeyHex ?? generateMasterKeyHex();

    console.warn(
      "[ghimtech-api] Using ephemeral encryption keys — encrypted data will be unreadable after restart. Set GHIMTECH_MASTER_KEY / GHIMTECH_INDEX_KEY.",
    );
  }

  const storeBackend =
    (env.GHIMTECH_STORE as "memory" | "prisma" | undefined) ??
    (env.DATABASE_URL ? "prisma" : "memory");
  if (isProd && storeBackend !== "prisma") {
    throw new Error("Production requires DATABASE_URL (Prisma store)");
  }

  return {
    port: Number(env.PORT ?? 4000),
    host: env.HOST ?? "0.0.0.0",
    environment,
    masterKey: parseMasterKey(masterKeyHex),
    indexKey: Buffer.from(indexKeyHex, "hex"),
    storeBackend,
    efileProvider: env.GHIMTECH_EFILE_PROVIDER ?? "mock",
    sessionTtlMinutes: Number(env.GHIMTECH_SESSION_TTL_MINUTES ?? 30),
    corsOrigin: env.GHIMTECH_CORS_ORIGIN ?? "http://localhost:3000",
  };
}
