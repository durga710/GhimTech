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

function normalizeInviteCode(code: string | null | undefined): string {
  return (code ?? "").trim();
}

function constantTimeEquals(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;

  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

export function getTeamInviteCodes(): string[] {
  const rawCodes =
    process.env.AUTH_TEAM_INVITE_CODES ??
    process.env.AUTH_TEAM_INVITE_CODE ??
    "";

  return rawCodes
    .split(",")
    .map((code) => normalizeInviteCode(code))
    .filter(Boolean);
}

export function isValidTeamInviteCode(code: string | null | undefined): boolean {
  const candidate = normalizeInviteCode(code);
  if (!candidate) return false;

  return getTeamInviteCodes().some((configuredCode) =>
    constantTimeEquals(candidate, configuredCode)
  );
}

export function canCreateAccountWithInvite(
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
