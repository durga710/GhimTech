export function shouldRedirectAuthenticatedAuthRoute(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get("error") !== "not-allowed";
}
