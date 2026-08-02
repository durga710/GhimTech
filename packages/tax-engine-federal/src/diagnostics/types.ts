/**
 * The vocabulary of the diagnostics engine.
 *
 * A rule declares its identity once — code, severity, the form it belongs to,
 * the IRS business rule it anticipates — and returns bare findings. The engine
 * stamps that identity onto each finding, so a given code always carries the
 * same severity and citation no matter which branch of a rule produced it.
 */
import type { ComputedTotals, FederalReturn, IsoDate } from '../types.js';

/**
 * How serious a finding is.
 *
 * - `reject` — the IRS Modernized e-File gateway will refuse the transmission.
 * - `error` — the return is internally inconsistent or mathematically wrong.
 * - `warning` — probable data-entry defect; a preparer should look before filing.
 * - `informational` — an election or opportunity worth a preparer's attention.
 */
export type DiagnosticSeverity = 'reject' | 'error' | 'warning' | 'informational';

/** Sort weight for each severity; lower sorts first. */
export const SEVERITY_RANK: Readonly<Record<DiagnosticSeverity, number>> = {
  reject: 0,
  error: 1,
  warning: 2,
  informational: 3,
};

/** Severities that must be cleared before a return may be transmitted. */
export function blocksElectronicFiling(severity: DiagnosticSeverity): boolean {
  return severity === 'reject' || severity === 'error';
}

/** A single finding, ready to be shown to a preparer. */
export interface Diagnostic {
  /** Stable identifier, e.g. `GT-W2-004`. Safe to key a UI or a suppression list on. */
  code: string;
  severity: DiagnosticSeverity;
  /** One sentence, written for a preparer, naming the offending value. */
  message: string;
  /** The form or schedule the finding sits on, e.g. `Form W-2`. */
  form?: string;
  /** Path into {@link FederalReturn}, e.g. `income.w2s[1].employerEin`. */
  field?: string;
  /** The MeF business rule this anticipates, e.g. `F1040-524-01`. */
  irsBusinessRule?: string;
  /** Authority for the rule: a Code section, publication or instruction. */
  reference?: string;
  /** What the preparer should do about it. */
  resolution?: string;
}

/** What a rule returns. The engine supplies everything else. */
export interface DiagnosticFinding {
  message: string;
  field?: string;
  resolution?: string;
  /**
   * Overrides the rule's declared severity for this finding only — used when a
   * single rule distinguishes a certain defect from a suspicious one.
   */
  severity?: DiagnosticSeverity;
}

/** Everything a rule is allowed to look at. */
export interface DiagnosticContext {
  return: FederalReturn;
  /** Calculation-engine output, when the return has been computed. */
  computed?: ComputedTotals;
  /**
   * The date the diagnostics are being run, for "is this in the future" tests.
   * Always supplied by the engine so rules stay deterministic and testable.
   */
  asOfDate: IsoDate;
}

export interface DiagnosticRule {
  /** Stable identifier. Prefixed `GT-` so it never collides with an IRS code. */
  code: string;
  severity: DiagnosticSeverity;
  /** Short human label for a rule-listing screen. */
  title: string;
  form?: string;
  irsBusinessRule?: string;
  reference?: string;
  evaluate(context: DiagnosticContext): DiagnosticFinding[];
}

export interface DiagnosticReport {
  taxYear: number;
  /** Findings, ordered by severity then code then field. */
  diagnostics: Diagnostic[];
  counts: Readonly<Record<DiagnosticSeverity, number>>;
  /** Count of findings that block transmission. */
  blockingCount: number;
  /** True when nothing blocks transmission. */
  eFileEligible: boolean;
  /** Number of rules that ran, after suppression. */
  rulesEvaluated: number;
  /** Codes the caller suppressed that actually matched a known rule. */
  suppressedCodes: string[];
}

export interface RunDiagnosticsOptions {
  computed?: ComputedTotals;
  /** Defaults to the current calendar date. */
  asOfDate?: IsoDate;
  /** Rule codes to skip, e.g. ones a preparer has reviewed and accepted. */
  suppress?: readonly string[];
  /** Drop findings less severe than this. */
  minimumSeverity?: DiagnosticSeverity;
  /** Rule set to run. Defaults to the full federal registry. */
  rules?: readonly DiagnosticRule[];
}
