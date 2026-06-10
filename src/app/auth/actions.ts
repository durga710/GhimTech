"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isAuthorizedDashboardAuthUser } from "@/lib/auth";
import {
  canEnrollWithInvite,
  normalizeEmail,
  safeRedirectPath,
} from "@/lib/auth-policy";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email().max(320);
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().trim().max(80).optional();
const inviteCodeSchema = z.string().trim().max(120).optional();

function stringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function redirectToAuthError(route: "/sign-in" | "/sign-up", error: string, next: string): never {
  const search = new URLSearchParams({ error });
  if (next !== "/dashboard") search.set("next", next);
  redirect(`${route}?${search.toString()}`);
}

async function getSupabaseOrRedirect(route: "/sign-in" | "/sign-up", next: string) {
  try {
    return await createSupabaseServerClient();
  } catch {
    redirectToAuthError(route, "supabase-env-missing", next);
  }
}

export async function signInWithPasswordAction(formData: FormData) {
  const next = safeRedirectPath(formData.get("next"));
  const emailResult = emailSchema.safeParse(stringValue(formData, "email"));
  const passwordResult = passwordSchema.safeParse(stringValue(formData, "password"));

  if (!emailResult.success || !passwordResult.success) {
    redirectToAuthError("/sign-in", "invalid-credentials", next);
  }

  const email = normalizeEmail(emailResult.data);

  const supabase = await getSupabaseOrRedirect("/sign-in", next);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: passwordResult.data,
  });

  if (error || !data.user) {
    redirectToAuthError("/sign-in", "invalid-credentials", next);
  }

  // Authorization happens after authentication: the owner email or an
  // enrolled team member (existing local User row) may enter the dashboard.
  if (!(await isAuthorizedDashboardAuthUser(data.user))) {
    await supabase.auth.signOut();
    redirectToAuthError("/sign-in", "not-allowed", next);
  }

  redirect(next);
}

export async function signUpWithPasswordAction(formData: FormData) {
  const next = safeRedirectPath(formData.get("next"));
  const emailResult = emailSchema.safeParse(stringValue(formData, "email"));
  const passwordResult = passwordSchema.safeParse(stringValue(formData, "password"));
  const firstNameResult = nameSchema.safeParse(stringValue(formData, "firstName"));
  const lastNameResult = nameSchema.safeParse(stringValue(formData, "lastName"));
  const inviteCodeResult = inviteCodeSchema.safeParse(stringValue(formData, "inviteCode"));

  if (
    !emailResult.success ||
    !passwordResult.success ||
    !firstNameResult.success ||
    !lastNameResult.success ||
    !inviteCodeResult.success
  ) {
    redirectToAuthError("/sign-up", "invalid-signup", next);
  }

  const email = normalizeEmail(emailResult.data);
  const firstName = firstNameResult.data || undefined;
  const lastName = lastNameResult.data || undefined;

  if (!canEnrollWithInvite(email, inviteCodeResult.data)) {
    redirectToAuthError("/sign-up", "invalid-invite", next);
  }

  const supabase = await getSupabaseOrRedirect("/sign-up", next);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: passwordResult.data,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
      },
    },
  });

  if (error || !data.user) {
    redirectToAuthError("/sign-up", "signup-failed", next);
  }

  // Record membership now, while the invite code is in hand. Sign-in (and
  // email confirmation later) authorizes against this local User row.
  try {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        clerkId: data.user.id,
        email,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
      },
    });
  } catch {
    redirectToAuthError("/sign-up", "signup-failed", next);
  }

  if (data.session) {
    redirect(next);
  }

  const search = new URLSearchParams({ message: "check-email" });
  if (next !== "/dashboard") search.set("next", next);
  redirect(`/sign-in?${search.toString()}`);
}

export async function signOutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Missing auth env should not trap a user on a protected screen.
  }

  redirect("/sign-in");
}
