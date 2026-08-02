/**
 * The federal rule registry: every rule the diagnostics engine runs by default.
 *
 * VERIFICATION NOTE — the `irsBusinessRule` identifiers cited by these rules
 * (R0000-500-01, IND-031-04, SEIC-F1040-501-02 and the rest) are anticipations
 * of what the Modernized e-File gateway will raise, not authorities in their own
 * right. The IRS republishes the business-rule set for each filing season and
 * renumbers freely between releases. Every citation in this registry must be
 * reconciled against the current MeF business-rules release before a season
 * opens, and the reconciliation recorded in the release checklist. A stale
 * citation does not change what a rule detects, but it does send a preparer to
 * the wrong page of the wrong document at the worst possible moment.
 */
import { identityRules } from './rules/identity.js';
import { householdRules } from './rules/household.js';
import { incomeRules } from './rules/income.js';
import { creditRules } from './rules/credits.js';
import { mechanicsRules } from './rules/mechanics.js';
import type { DiagnosticRule } from './types.js';

/**
 * Every federal rule, grouped by subject. The engine sorts its output, so this
 * order affects nothing a caller can observe; it is kept grouped purely so a
 * rule-listing screen reads sensibly.
 */
export const FEDERAL_DIAGNOSTIC_RULES: readonly DiagnosticRule[] = [
  ...identityRules,
  ...householdRules,
  ...incomeRules,
  ...creditRules,
  ...mechanicsRules,
];

/**
 * Fail loudly if two rules share a code.
 *
 * A duplicate code is not a cosmetic problem. Suppression, the by-code lookup
 * below and any UI that keys on a code all assume the mapping from code to rule
 * is one to one; a collision would silently let a suppression entry disable a
 * rule the preparer never reviewed. Better to refuse to load at all.
 */
export function assertUniqueRuleCodes(rules: readonly DiagnosticRule[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const rule of rules) {
    if (seen.has(rule.code)) {
      duplicates.add(rule.code);
      continue;
    }
    seen.add(rule.code);
  }
  if (duplicates.size > 0) {
    throw new Error(
      `Duplicate diagnostic rule codes in the federal registry: ${[...duplicates].sort().join(', ')}`,
    );
  }
}

assertUniqueRuleCodes(FEDERAL_DIAGNOSTIC_RULES);

const RULES_BY_CODE: ReadonlyMap<string, DiagnosticRule> = new Map(
  FEDERAL_DIAGNOSTIC_RULES.map((rule) => [rule.code, rule]),
);

/** Look up a rule by its code, for a rule-detail screen or a suppression UI. */
export function getRuleByCode(code: string): DiagnosticRule | undefined {
  return RULES_BY_CODE.get(code);
}
