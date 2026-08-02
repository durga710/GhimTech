/**
 * Calculation traces. Every calculated value on a return records where it came
 * from: the tax year, the rule version, the inputs, the formula or table used,
 * and the module that produced it. Traces make every calculation reproducible
 * and reviewable, and are frozen into calculation snapshots.
 */
import type { Cents } from "./money.js";

export interface TraceEntry {
  /** Stable identifier for the calculated line, e.g. "federal.1040.line11.agi". */
  lineId: string;
  /** Human-readable label, e.g. "Adjusted gross income". */
  label: string;
  /** The result in cents (form-line rounding happens at render time and is also recorded). */
  valueCents: Cents;
  /** The whole-dollar value as it appears on the form line. */
  valueDollars: number;
  /** Tax year the rule applies to. */
  taxYear: number;
  /** Version of the rule set used, e.g. "2025.1". */
  ruleVersion: string;
  /** Formula or table reference, e.g. "Schedule 8812 line 5: qualifyingChildren × $2,200". */
  formula: string;
  /** Named inputs that fed this line (lineIds or literal values in cents). */
  inputs: Record<string, number | string | boolean>;
  /** Module that produced the value, e.g. "@ghimtech/tax-engine-federal". */
  sourceModule: string;
}

export interface CalculationTrace {
  entries: TraceEntry[];
}

/** Helper used by engines to accumulate trace entries. */
export class TraceBuilder {
  private readonly entries: TraceEntry[] = [];

  constructor(
    private readonly taxYear: number,
    private readonly ruleVersion: string,
    private readonly sourceModule: string,
  ) {}

  add(entry: Omit<TraceEntry, "taxYear" | "ruleVersion" | "sourceModule" | "valueDollars">): void {
    const sign = entry.valueCents < 0 ? -1 : 1;
    const abs = Math.abs(entry.valueCents);
    const valueDollars =
      sign * (abs % 100 >= 50 ? Math.floor(abs / 100) + 1 : Math.floor(abs / 100));
    this.entries.push({
      ...entry,
      valueDollars,
      taxYear: this.taxYear,
      ruleVersion: this.ruleVersion,
      sourceModule: this.sourceModule,
    });
  }

  get(lineId: string): TraceEntry | undefined {
    return this.entries.find((e) => e.lineId === lineId);
  }

  build(): CalculationTrace {
    return { entries: [...this.entries] };
  }
}
