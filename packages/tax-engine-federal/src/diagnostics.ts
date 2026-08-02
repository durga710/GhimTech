/**
 * The federal diagnostics engine.
 *
 * This is the only entry point a caller needs: hand it a return, get back an
 * ordered, severity-graded report and a single boolean saying whether the return
 * can be transmitted. Everything here is designed around one requirement — a
 * preparer running diagnostics twice on the same return must see exactly the
 * same report both times, in the same order, so that "I have fixed three of
 * these" is a statement about the return and never about the engine. That is why
 * the as-of date is an explicit input rather than a call to the clock buried
 * inside a rule, and why the sort is total rather than merely by severity.
 */
import {
  SEVERITY_RANK,
  blocksElectronicFiling,
  type Diagnostic,
  type DiagnosticContext,
  type DiagnosticFinding,
  type DiagnosticReport,
  type DiagnosticRule,
  type DiagnosticSeverity,
  type RunDiagnosticsOptions,
} from './diagnostics/types.js';
import { FEDERAL_DIAGNOSTIC_RULES } from './diagnostics/registry.js';
import type { FederalReturn, IsoDate } from './types.js';

/** Reported when a rule throws instead of returning findings. */
const ENGINE_FAILURE_CODE = 'GT-ENGINE-001';

/** Every severity, in report order, so counts always carry all four keys. */
const ALL_SEVERITIES: readonly DiagnosticSeverity[] = [
  'reject',
  'error',
  'warning',
  'informational',
];

/**
 * Today's calendar date in `YYYY-MM-DD` form.
 *
 * Tests always pass `asOfDate` explicitly; nothing in the suite is allowed to
 * depend on the day it runs. This default exists only for the application,
 * where "is this signature dated in the future" genuinely means "later than
 * now".
 */
function today(): IsoDate {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Promote a bare finding to a full diagnostic by stamping the rule's identity
 * onto it. Optional keys are omitted rather than set to `undefined`, because
 * `exactOptionalPropertyTypes` makes those two things different and a JSON
 * round trip of the report should not sprout null fields.
 */
function toDiagnostic(rule: DiagnosticRule, finding: DiagnosticFinding): Diagnostic {
  const diagnostic: Diagnostic = {
    code: rule.code,
    severity: finding.severity ?? rule.severity,
    message: finding.message,
  };
  if (rule.form !== undefined) diagnostic.form = rule.form;
  if (finding.field !== undefined) diagnostic.field = finding.field;
  if (rule.irsBusinessRule !== undefined) diagnostic.irsBusinessRule = rule.irsBusinessRule;
  if (rule.reference !== undefined) diagnostic.reference = rule.reference;
  if (finding.resolution !== undefined) diagnostic.resolution = finding.resolution;
  return diagnostic;
}

/**
 * A total order over diagnostics: severity, then code, then field, then message.
 *
 * A diagnostic with no field sorts after those that name one, so the return-wide
 * observations sit below the specific findings a preparer can click straight
 * into.
 */
function compareDiagnostics(a: Diagnostic, b: Diagnostic): number {
  const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  if (bySeverity !== 0) return bySeverity;

  const byCode = a.code.localeCompare(b.code);
  if (byCode !== 0) return byCode;

  if (a.field !== b.field) {
    if (a.field === undefined) return 1;
    if (b.field === undefined) return -1;
    const byField = a.field.localeCompare(b.field);
    if (byField !== 0) return byField;
  }

  return a.message.localeCompare(b.message);
}

/** The message of a thrown value, whatever kind of value it turned out to be. */
function describeThrown(thrown: unknown): string {
  if (thrown instanceof Error) return thrown.message;
  return String(thrown);
}

/**
 * Run the diagnostics rule set against a return.
 *
 * The return is never mutated: the report is a pure function of the return, the
 * computed totals and the as-of date.
 */
export function runDiagnostics(
  federalReturn: FederalReturn,
  options: RunDiagnosticsOptions = {},
): DiagnosticReport {
  const rules = options.rules ?? FEDERAL_DIAGNOSTIC_RULES;
  const asOfDate = options.asOfDate ?? today();
  const suppress = new Set(options.suppress ?? []);

  const context: DiagnosticContext = {
    return: federalReturn,
    asOfDate,
    ...(options.computed !== undefined ? { computed: options.computed } : {}),
  };

  const diagnostics: Diagnostic[] = [];
  let rulesEvaluated = 0;

  for (const rule of rules) {
    if (suppress.has(rule.code)) continue;
    rulesEvaluated += 1;

    try {
      for (const finding of rule.evaluate(context)) {
        diagnostics.push(toDiagnostic(rule, finding));
      }
    } catch (thrown) {
      // One defective rule must not cost the preparer the whole report. A
      // partial report with an honest note naming the rule that failed is far
      // more useful than an exception that leaves them with nothing at all and
      // no idea which of a hundred rules to blame.
      diagnostics.push({
        code: ENGINE_FAILURE_CODE,
        severity: 'error',
        message: `Diagnostic rule ${rule.code} failed to run: ${describeThrown(thrown)}`,
        resolution:
          'The remaining rules ran normally, so the rest of this report is complete. Report the failing rule code, and treat this return as unreviewed for that rule.',
      });
    }
  }

  const minimum = options.minimumSeverity;
  const retained =
    minimum === undefined
      ? diagnostics
      : diagnostics.filter(
          (diagnostic) => SEVERITY_RANK[diagnostic.severity] <= SEVERITY_RANK[minimum],
        );

  retained.sort(compareDiagnostics);

  const counts: Record<DiagnosticSeverity, number> = {
    reject: 0,
    error: 0,
    warning: 0,
    informational: 0,
  };
  let blockingCount = 0;
  for (const diagnostic of retained) {
    counts[diagnostic.severity] += 1;
    if (blocksElectronicFiling(diagnostic.severity)) blockingCount += 1;
  }

  // Only codes that actually name a rule in the set being run are echoed back.
  // A typo in a suppression list would otherwise look like it had taken effect.
  const known = new Set(rules.map((rule) => rule.code));
  const suppressedCodes = [...suppress].filter((code) => known.has(code)).sort();

  return {
    taxYear: federalReturn.taxYear,
    diagnostics: retained,
    counts,
    blockingCount,
    eFileEligible: blockingCount === 0,
    rulesEvaluated,
    suppressedCodes,
  };
}

/** Pluralise a count of findings for the one-line summary. */
function phrase(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

/**
 * A one-line human summary of a report, for a status bar or a log line.
 *
 * The eligibility clause always appears, even when there is nothing to report,
 * because "no diagnostics" and "safe to transmit" are different claims and the
 * preparer is entitled to see the second one stated outright.
 */
export function summarizeDiagnostics(report: DiagnosticReport): string {
  const parts = ALL_SEVERITIES.flatMap((severity) => {
    const count = report.counts[severity];
    return count > 0 ? [phrase(count, severity)] : [];
  });
  const eligibility = report.eFileEligible ? 'eligible for e-file' : 'not eligible for e-file';
  if (parts.length === 0) return `No diagnostics — ${eligibility}.`;
  return `${parts.join(', ')} — ${eligibility}.`;
}
