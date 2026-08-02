/**
 * Masking for sensitive values. Full values must never appear in list views,
 * logs, analytics, error tracking, or support tools — mask by default.
 */

export function maskSsn(last4: string): string {
  return `***-**-${last4.padStart(4, "0").slice(-4)}`;
}

export function maskBankAccount(last4: string): string {
  return `******${last4.padStart(4, "0").slice(-4)}`;
}

export function maskEin(last4: string): string {
  return `**-***${last4.padStart(4, "0").slice(-4)}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
}

const SSN_PATTERN = /\b\d{3}-?\d{2}-?\d{4}\b/g;
const ACCOUNT_PATTERN = /\b\d{8,17}\b/g;

/**
 * Defensive log scrubber: strips anything that looks like an SSN or account
 * number from a string before it can reach a log line or error report.
 */
export function scrubSensitive(text: string): string {
  return text.replace(SSN_PATTERN, "***-**-****").replace(ACCOUNT_PATTERN, "************");
}
