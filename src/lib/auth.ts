/**
 * Auth context helpers.
 *
 * Every protected query in the app goes through one of these functions.
 * Supabase Auth is the identity source; Prisma owns app data and keeps a
 * local User row for dashboard relationships.
 */

import "server-only";

import type { User as PrismaUser } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import {
  isAllowedOperatorEmail,
  normalizeEmail,
} from "@/lib/auth-policy";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UserProfile = {
  authUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

function metadataString(
  metadata: SupabaseUser["user_metadata"],
  key: string
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function profileFromAuthUser(authUser: SupabaseUser): UserProfile {
  const email = normalizeEmail(authUser.email);

  if (!email) {
    throw new Error("Authenticated Supabase user has no email");
  }

  const fullName =
    metadataString(authUser.user_metadata, "full_name") ??
    metadataString(authUser.user_metadata, "name");
  const [firstFromFull, ...lastFromFull] = fullName?.split(/\s+/) ?? [];

  return {
    authUserId: authUser.id,
    email,
    firstName:
      metadataString(authUser.user_metadata, "first_name") ??
      firstFromFull ??
      null,
    lastName:
      metadataString(authUser.user_metadata, "last_name") ??
      (lastFromFull.length > 0 ? lastFromFull.join(" ") : null),
    avatarUrl:
      metadataString(authUser.user_metadata, "avatar_url") ??
      metadataString(authUser.user_metadata, "picture"),
  };
}

async function ensurePreferences(userId: string) {
  await prisma.userPreferences.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function ensureLocalUser(authUser: SupabaseUser): Promise<PrismaUser> {
  const profile = profileFromAuthUser(authUser);

  const existingByAuthId = await prisma.user.findUnique({
    where: { clerkId: profile.authUserId },
  });

  if (existingByAuthId) {
    await ensurePreferences(existingByAuthId.id);

    return prisma.user.update({
      where: { id: existingByAuthId.id },
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      },
    });
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (existingByEmail) {
    await ensurePreferences(existingByEmail.id);

    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId: profile.authUserId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      },
    });
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        clerkId: profile.authUserId,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      },
    });

    await tx.userPreferences.create({
      data: { userId: user.id },
    });

    return user;
  });
}

async function getAuthenticatedSupabaseUser(): Promise<SupabaseUser | null> {
  let supabase;

  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Supabase Auth")) {
      redirect("/sign-in?error=supabase-env-missing");
    }
    throw error;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  if (!isAllowedOperatorEmail(user.email)) {
    await supabase.auth.signOut();
    redirect("/sign-in?error=not-allowed");
  }

  return user;
}

/**
 * Returns the local User row for the currently authenticated Supabase user.
 * Lazy-provisions one if missing. Throws/redirects if unauthenticated.
 *
 * Use this in: server components, server actions, route handlers.
 */
export async function requireUser(): Promise<PrismaUser> {
  const authUser = await getAuthenticatedSupabaseUser();

  if (!authUser) {
    redirect("/sign-in");
  }

  return ensureLocalUser(authUser);
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
export async function getOptionalUser(): Promise<PrismaUser | null> {
  let supabase;

  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return null;
  }

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser || !isAllowedOperatorEmail(authUser.email)) return null;

  const email = normalizeEmail(authUser.email);

  return prisma.user.findFirst({
    where: {
      OR: [{ clerkId: authUser.id }, { email }],
    },
  });
}
