import { FEDERAL_2025 } from "./federal-2025.js";
import { PENNSYLVANIA_2025 } from "./pennsylvania-2025.js";
import type { FederalYearConfig, PennsylvaniaYearConfig } from "./types.js";

export * from "./types.js";
export { FEDERAL_2025 } from "./federal-2025.js";
export { PENNSYLVANIA_2025 } from "./pennsylvania-2025.js";

export class UnsupportedTaxYearError extends Error {
  constructor(
    public readonly taxYear: number,
    public readonly jurisdiction: string,
  ) {
    super(`Tax year ${taxYear} is not supported for ${jurisdiction}`);
    this.name = "UnsupportedTaxYearError";
  }
}

const FEDERAL_CONFIGS = new Map<number, FederalYearConfig>([[2025, FEDERAL_2025]]);
const PA_CONFIGS = new Map<number, PennsylvaniaYearConfig>([[2025, PENNSYLVANIA_2025]]);

export function supportedTaxYears(): number[] {
  return [...FEDERAL_CONFIGS.keys()].sort();
}

export function getFederalConfig(taxYear: number): FederalYearConfig {
  const config = FEDERAL_CONFIGS.get(taxYear);
  if (!config) throw new UnsupportedTaxYearError(taxYear, "FEDERAL");
  return config;
}

export function getPennsylvaniaConfig(taxYear: number): PennsylvaniaYearConfig {
  const config = PA_CONFIGS.get(taxYear);
  if (!config) throw new UnsupportedTaxYearError(taxYear, "PENNSYLVANIA");
  return config;
}
