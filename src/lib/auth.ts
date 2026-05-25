/**
 * Auth context helpers.
 *
 * Every protected query in the app goes through one of these functions.
 * That's deliberate: security policy lives in ONE place, not scattered
 * across 30 route handlers.
 *
 * Flow:
 *   1. Clerk middleware already gate-checked the route — by the time we
 *      reach a server component or API handler, we know SOME Clerk user
 *      is authenticated. But Clerk identity ≠ our local User row.
 *   2. requireUser() resolves the Clerk userId → our local User. If we
 *      don't have a local row yet, it creates one (lazy-provision).
 *   3. Every Prisma query that filters by user uses the returned User.id.
 *
 * Why lazy-provision a User on demand instead of relying on the webhook?
 * Two reasons:
 *   - The webhook *should* fire on signup, but webhook delivery is async
 *     and can fail. We can't have a UX where the user signs up, lands on
 *     the dashboard, and sees an error because the webhook hasn't run yet.
 *   - Defense in depth: even if the webhook never runs, the user still
 *     gets a working DB row the moment they hit the dashboard.
 *
 * Why is this a Server-only module? Because it reaches into Clerk's auth
 * context, which is only available on the server. Importing this from a
 * client component will throw — by design.
 */

import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Returns the local User row for the currently authenticated Clerk user.
 * Lazy-provisions one if missing. Throws/redirects if unauthenticated.
 *
 * Use this in: server components, server actions, route handlers.
 */
export async function requireUser(): Promise<User> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    // This should be unreachable if middleware is configured correctly,
    // but defense in depth: if it somehow IS reachable, bounce to sign-in.
    redirect("/sign-in");
  }

  // Fast path: user already exists locally
  const existing = await prisma.user.findUnique({
    where: { clerkId },
    include: { preferences: true },
  });

  if (existing) return existing;

  // Lazy-provision: first time this Clerk user hits the dashboard,
  // create their local row. Pull the email + name from Clerk.
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    // Should never happen — Clerk always has at least one email.
    throw new Error("Clerk user has no primary email");
  }

  // Create user + preferences in a transaction so we never leave the
  // user without preferences.
  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        clerkId,
        email: primaryEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        avatarUrl: clerkUser.imageUrl,
      },
    });

    await tx.userPreferences.create({
      data: { userId: user.id },
    });

    return user;
  });

  return created;
}

/**
 * Lighter variant: returns just the user's local DB id without the
 * full row. Useful when you only need the FK for a where-clause.
 */
export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}

/**
 * Optional variant: returns null if unauthenticated instead of redirecting.
 * Use in routes that need to know "is anyone logged in?" without forcing
 * a redirect (e.g. public pages with personalization).
 */
export async function getOptionalUser(): Promise<User | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  return prisma.user.findUnique({
    where: { clerkId },
    include: { preferences: true },
  });
}
