import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Auth gating.
 *
 *  - Public routes: marketing pages (/, /about, /experience, /projects/**, /contact)
 *    plus the sign-in / sign-up flows themselves.
 *  - Protected: everything under /dashboard, /admin, and any /api/private routes.
 *
 * Clerk's `auth.protect()` redirects unauthenticated requests to the configured
 * sign-in page (set via NEXT_PUBLIC_CLERK_SIGN_IN_URL in env).
 */

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/api/private(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static assets, but always run on API routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
