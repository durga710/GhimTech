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

/**
 * Invite codes let teammates enroll without being the workspace owner.
 * Configure via AUTH_TEAM_INVITE_CODES as a comma-separated list.
 */
export function getTeamInviteCodes(): string[] {
  return (process.env.AUTH_TEAM_INVITE_CODES ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);
}

export function isValidTeamInviteCode(code: string | null | undefined): boolean {
  const candidate = (code ?? "").trim();
  return Boolean(candidate) && getTeamInviteCodes().includes(candidate);
}

/**
 * Sign-up gate: the workspace owner enrolls with their email alone;
 * everyone else needs a valid invite code.
 */
export function canEnrollWithInvite(
  email: string | null | undefined,
  inviteCode: string | null | undefined
): boolean {
  return isAllowedOperatorEmail(email) || isValidTeamInviteCode(inviteCode);
}

export function safeRedirectPath(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== "string") return "/dashboard";

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/dashboard";
  if (trimmed.startsWith("/sign-in") || trimmed.startsWith("/sign-up")) return "/dashboard";

  return trimmed;
}
