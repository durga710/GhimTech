export const DEFAULT_OPERATOR_EMAIL = "reyghim1093@gmail.com";

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function getAllowedOperatorEmail(): string {
  return normalizeEmail(process.env.AUTH_ALLOWED_EMAIL ?? DEFAULT_OPERATOR_EMAIL);
}

export function isAllowedOperatorEmail(email: string | null | undefined): boolean {
  const allowedEmail = getAllowedOperatorEmail();
  return Boolean(allowedEmail) && normalizeEmail(email) === allowedEmail;
}

export function safeRedirectPath(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== "string") return "/dashboard";

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/dashboard";
  if (trimmed.startsWith("/sign-in") || trimmed.startsWith("/sign-up")) return "/dashboard";

  return trimmed;
}
