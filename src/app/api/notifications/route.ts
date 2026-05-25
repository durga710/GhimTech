/**
 * /api/notifications
 *   GET   ?unread=true → list (filtered by read status)
 *   POST  → mark all as read (no body)
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await requireUser();
  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unread") === "true";

  const notifs = await prisma.notification.findMany({
    where: {
      userId: user.id,
      ...(unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return ok({
    notifications: notifs,
    unreadCount: await prisma.notification.count({
      where: { userId: user.id, readAt: null },
    }),
  });
}

export async function POST(req: Request) {
  const user = await requireUser();

  const result = await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  await audit({
    action: "notifications.mark_all_read",
    actorId: user.id,
    diff: { count: result.count },
    req,
  });

  return ok({ marked: result.count });
}
