/**
 * Calculation snapshots. A snapshot freezes the return model together with
 * both engine results; its canonical SHA-256 hash is what clients sign and
 * what the duplicate-submission guard keys on. Any material change to the
 * model changes the hash and invalidates existing signatures.
 */
import { createHash } from "node:crypto";
import type { TaxReturnModel } from "@ghimtech/tax-domain";
import type { FederalCalculationResult } from "@ghimtech/tax-engine-federal";
import type { PaCalculationResult } from "@ghimtech/tax-engine-pennsylvania";

export interface CalculationSnapshot {
  model: TaxReturnModel;
  federal: FederalCalculationResult;
  pennsylvania?: PaCalculationResult;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`);
  return `{${entries.join(",")}}`;
}

export function snapshotHash(snapshot: CalculationSnapshot): string {
  return createHash("sha256").update(canonicalize(snapshot)).digest("hex");
}
