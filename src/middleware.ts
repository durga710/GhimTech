import { NextResponse, type NextRequest } from "next/server";
import {
  isAuthRoute,
  isProtectedRoute,
  shouldRedirectAuthenticatedToDashboard,
} from "@/lib/auth-route-policy";
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
 * Supabase SSR middleware refreshes the auth cookie and validates the user
 * server-side. Authentication is enforced here; membership (owner email or an
 * enrolled team member) requires a database lookup, so requireUser() enforces
 * it inside the Node runtime for every protected query.
 */

function redirectWithSessionCookies(
  request: NextRequest,
  source: NextResponse,
  path: string
): NextResponse {
  return responseWithAuthCookies(source, NextResponse.redirect(new URL(path, request.url)));
}

export default async function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const protectedRoute = isProtectedRoute(pathname);
  const authRoute = isAuthRoute(pathname);

  if (!protectedRoute && !authRoute) {
    return NextResponse.next();
  }

  const { response, user, error } = await updateSupabaseSession(request);

  if (protectedRoute) {
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

    return response;
  }

  if (user && shouldRedirectAuthenticatedToDashboard(pathname, searchParams)) {
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
