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

  return Response.json({
    supabaseUrlConfigured: Boolean(url),
    supabaseAnonKeyConfigured: Boolean(anonKey),
    databaseReachable: database,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ?? null,
  });
}
