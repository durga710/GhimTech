/**
 * /api/admin/repair-schema — GET (operator-only): applies the additive
 * UserPreferences columns directly to the RUNTIME database. Emergency lever
 * for schema drift (build pushed elsewhere / build command overridden).
 * Idempotent: ADD COLUMN IF NOT EXISTS only — never drops or rewrites.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATEMENTS = [
  `ALTER TABLE "UserPreferences" ADD COLUMN IF NOT EXISTS "aiProvider" TEXT NOT NULL DEFAULT 'openai'`,
  `ALTER TABLE "UserPreferences" ADD COLUMN IF NOT EXISTS "aiModel" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "UserPreferences" ADD COLUMN IF NOT EXISTS "aiBaseUrl" TEXT`,
  `ALTER TABLE "UserPreferences" ADD COLUMN IF NOT EXISTS "githubToken" TEXT`,
  `ALTER TABLE "UserPreferences" ADD COLUMN IF NOT EXISTS "aiApiKey" TEXT`,
];

export async function GET(req: Request) {
  const user = await requireUser();

  const results: { statement: string; ok: boolean; error?: string }[] = [];
  for (const sql of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push({ statement: sql.slice(0, 80), ok: true });
    } catch (e) {
      results.push({
        statement: sql.slice(0, 80),
        ok: false,
        error: e instanceof Error ? e.message.slice(0, 200) : "unknown",
      });
    }
  }

  let verified = false;
  try {
    await prisma.userPreferences.findFirst({ select: { aiProvider: true, aiApiKey: true } });
    verified = true;
  } catch {
    // stays false
  }

  await audit({ action: "admin.repair-schema", actorId: user.id, diff: { verified }, req });

  return ok({ repaired: results.every((r) => r.ok), verified, results });
}
