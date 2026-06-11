/**
 * /api/health/auth — public, secret-free diagnostic.
 *
 * Reports WHETHER each piece of auth infrastructure is configured (never the
 * values): Supabase URL/key presence, database reachability, and which commit
 * is serving. Used to debug "auth doesn't work" reports against production.
 */

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;

  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    // leave false — that's the diagnostic signal
  }

  // Detect schema drift: can the runtime DB serve the preferences columns?
  let preferencesReadable = false;
  let preferencesError: string | null = null;
  try {
    await prisma.userPreferences.findFirst({ select: { aiProvider: true, githubToken: true } });
    preferencesReadable = true;
  } catch (e) {
    preferencesError = e instanceof Error ? e.message.slice(0, 300) : "unknown";
  }

  // Hostnames only (never credentials): reveals if the build pushes schema
  // to a different database than the app reads at runtime.
  const host = (v?: string) => {
    try {
      return v ? new URL(v).hostname : null;
    } catch {
      return "unparseable";
    }
  };

  return Response.json({
    supabaseUrlConfigured: Boolean(url),
    supabaseAnonKeyConfigured: Boolean(anonKey),
    databaseReachable: database,
    preferencesReadable,
    preferencesError,
    runtimeDbHost: host(process.env.DATABASE_URL),
    pushDbHost: host(process.env.DATABASE_URL_UNPOOLED),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ?? null,
  });
}
