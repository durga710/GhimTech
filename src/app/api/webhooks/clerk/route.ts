/**
 * Clerk webhook receiver.
 *
 * Clerk POSTs events here whenever user state changes:
 *   - user.created  → mirror into our User table
 *   - user.updated  → sync email/name/avatar changes
 *   - user.deleted  → cascade-delete the local User (and via FK, all their data)
 *
 * SECURITY:
 *   Clerk signs every webhook payload using svix. We MUST verify the
 *   signature before trusting anything in the body. Without verification,
 *   anyone could POST `{ type: "user.created", data: {...} }` to this
 *   endpoint and provision a User row at will.
 *
 *   Setup:
 *     1. In Clerk dashboard → Webhooks, create an endpoint pointing to
 *        https://ghimtech.org/api/webhooks/clerk
 *     2. Subscribe to user.created, user.updated, user.deleted
 *     3. Copy the "Signing Secret" into CLERK_WEBHOOK_SECRET in env
 *
 * Note on idempotency: the User.create / update path is safe to retry
 * (Clerk retries failed webhooks). We use upsert + delete-if-exists.
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export const runtime = "nodejs"; // svix needs Node, not Edge

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  // ---- Verify svix signature ----
  const hdrs = await headers();
  const svixId = hdrs.get("svix-id");
  const svixTimestamp = hdrs.get("svix-timestamp");
  const svixSignature = hdrs.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { ok: false, error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();
  let event: WebhookEvent;

  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[clerk-webhook] signature verification failed", err);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  // ---- Dispatch ----
  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const u = event.data;
        const primaryEmail = u.email_addresses.find(
          (e) => e.id === u.primary_email_address_id
        )?.email_address;

        if (!primaryEmail) {
          console.warn("[clerk-webhook] no primary email on user event", u.id);
          break;
        }

        await prisma.user.upsert({
          where: { clerkId: u.id },
          create: {
            clerkId: u.id,
            email: primaryEmail,
            firstName: u.first_name ?? null,
            lastName: u.last_name ?? null,
            avatarUrl: u.image_url ?? null,
            preferences: { create: {} },
          },
          update: {
            email: primaryEmail,
            firstName: u.first_name ?? null,
            lastName: u.last_name ?? null,
            avatarUrl: u.image_url ?? null,
          },
        });

        await audit({
          action: event.type === "user.created" ? "user.created" : "user.updated",
          target: u.id,
          req,
        });
        break;
      }

      case "user.deleted": {
        if (event.data.id) {
          // onDelete: Cascade in the schema means deleting User wipes
          // their projects, tasks, notes, everything. That's intentional
          // for a single-operator system.
          await prisma.user.deleteMany({ where: { clerkId: event.data.id } });
          await audit({ action: "user.deleted", target: event.data.id, req });
        }
        break;
      }

      default:
        // Ignore other event types we haven't subscribed to.
        break;
    }
  } catch (err) {
    console.error("[clerk-webhook] handler error", { type: event.type, err });
    // Return 500 so Clerk retries — better than silently losing the event.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
