import { NextResponse, type NextRequest } from "next/server";
import { isAllowedOperatorEmail } from "@/lib/auth-policy";
import {
  responseWithAuthCookies,
  updateSupabaseSession,
} from "@/lib/supabase/middleware";

/**
 * Auth gating.
 *
 *  - Public routes: marketing pages (/, /about, /experience, /projects/**, /contact)
 *    plus the sign-in / sign-up flows themselves.
 *  - Protected: everything under /dashboard, /admin, and any /api/private routes.
 *
 * Supabase SSR middleware refreshes the auth cookie, validates the user server-side,
 * and redirects unauthenticated requests to the app-owned sign-in page.
 */

const protectedPrefixes = ["/dashboard", "/admin", "/api/private"];
const authPrefixes = ["/sign-in", "/sign-up"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectWithSessionCookies(
  request: NextRequest,
  source: NextResponse,
  path: string
): NextResponse {
  return responseWithAuthCookies(source, NextResponse.redirect(new URL(path, request.url)));
}

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtectedRoute = matchesPrefix(pathname, protectedPrefixes);
  const isAuthRoute = matchesPrefix(pathname, authPrefixes);

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const { response, user, error } = await updateSupabaseSession(request);

  if (isProtectedRoute) {
    const next = encodeURIComponent(`${pathname}${search}`);

    if (error || !user) {
      const configError = error?.message.includes("Supabase Auth")
        ? "&error=supabase-env-missing"
        : "";

      return redirectWithSessionCookies(
        request,
        response,
        `/sign-in?next=${next}${configError}`
      );
    }

    if (!isAllowedOperatorEmail(user.email)) {
      return redirectWithSessionCookies(request, response, "/sign-in?error=not-allowed");
    }

    return response;
  }

  if (user && isAllowedOperatorEmail(user.email)) {
    return redirectWithSessionCookies(request, response, "/dashboard");
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next internals and static assets, but always run on API routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
