/**
 * Edge-safe routing rules shared by the middleware and auth pages.
 * No server-only or database imports here — this runs in the edge runtime.
 */

export const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/admin", "/api/private"] as const;
export const AUTH_ROUTE_PREFIXES = ["/sign-in", "/sign-up"] as const;

export function matchesRoutePrefix(
  pathname: string,
  prefixes: readonly string[]
): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isProtectedRoute(pathname: string): boolean {
  return matchesRoutePrefix(pathname, PROTECTED_ROUTE_PREFIXES);
}

export function isAuthRoute(pathname: string): boolean {
  return matchesRoutePrefix(pathname, AUTH_ROUTE_PREFIXES);
}

/**
 * Authenticated visitors on /sign-in or /sign-up normally bounce to the
 * dashboard — except when the page is showing an auth error (for example
 * ?error=not-allowed). Those must stay reachable, otherwise an authenticated
 * but unauthorized session loops between the dashboard guard and sign-in.
 */
export function shouldRedirectAuthenticatedToDashboard(
  pathname: string,
  searchParams: URLSearchParams
): boolean {
  return isAuthRoute(pathname) && !searchParams.has("error");
}
