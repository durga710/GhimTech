export { calculateFederal } from "./engine.js";
export type { FederalCalculationResult } from "./types.js";
export {
  bracketTax,
  taxFromTableOrSchedule,
  qualifiedDividendsCapGainTax,
  taxableSocialSecurity,
  seTax,
  earnedIncomeCredit,
} from "./worksheets.js";
export { childTaxCredit, dependentCareCredit, educationCredits } from "./credits.js";
export { structuralDiagnostics, ageAtYearEnd } from "./diagnostics.js";
