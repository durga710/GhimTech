/**
 * /api/contact — public contact form submissions.
 *
 * No auth required (this is the public landing page form). Heavily
 * rate-limited: 5 submissions per IP per hour. Stores to ContactMessage
 * table and writes an audit log entry. Reading the queue happens through
 * /api/admin/contact (auth-gated, future).
 *
 * Future: integrate Resend or similar to actually notify Durga
 * (durga@rayhealthevv.com) when a new message arrives.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit, rateLimitKey, rateLimitHeaders } from "@/lib/rate-limit";
import { ContactSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Rate-limit per IP. Strict because this is public.
  const key = rateLimitKey(req, null, "contact");
  const rl = rateLimit(key, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "Slow down, please try again later." } },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const message = await prisma.contactMessage.create({
    data: {
      ...parsed.data,
      ip,
      userAgent,
    },
  });

  await audit({
    action: "contact.received",
    target: message.id,
    diff: { purpose: parsed.data.purpose, email: parsed.data.email },
    req,
  });

  // TODO: dispatch email notification via Resend or similar
  // await sendEmail({ to: "durga@rayhealthevv.com", ... });

  return ok({ id: message.id }, { status: 201, headers: rateLimitHeaders(rl) });
}
