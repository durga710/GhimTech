/**
 * Nonrefundable and partially refundable credits: Child Tax Credit / Credit
 * for Other Dependents (Schedule 8812), education credits (Form 8863), and
 * the Child and Dependent Care Credit (Form 2441).
 */
import {
  type Cents,
  type FilingStatus,
  type TaxReturnModel,
  minCents,
  multiplyRate,
  notLessThanZero,
} from "@ghimtech/tax-domain";
import type { FederalYearConfig } from "@ghimtech/tax-year-config";
import { rd } from "./worksheets.js";

export interface CtcResult {
  /** Nonrefundable CTC + ODC actually allowed against tax. */
  nonrefundable: Cents;
  ctcPortion: Cents;
  odcPortion: Cents;
  /** Additional (refundable) Child Tax Credit. */
  additional: Cents;
}

/** Schedule 8812 — Child Tax Credit, Credit for Other Dependents, and ACTC. */
export function childTaxCredit(params: {
  qualifyingChildren: number;
  otherDependents: number;
  agi: Cents;
  filingStatus: FilingStatus;
  /** Tax remaining after other nonrefundable credits are applied. */
  taxRemaining: Cents;
  earnedIncome: Cents;
  config: FederalYearConfig;
}): CtcResult {
  const cfg = params.config.childTaxCredit;
  const grossCtc = params.qualifyingChildren * cfg.perChild;
  const grossOdc = params.otherDependents * cfg.perOtherDependent;
  let totalCredit = grossCtc + grossOdc;

  const threshold = cfg.phaseoutThreshold[params.filingStatus];
  if (params.agi > threshold) {
    // Reduce by $50 per $1,000 (or fraction) of AGI over the threshold.
    const over = params.agi - threshold;
    const steps = Math.ceil(over / (1_000 * 100));
    totalCredit = notLessThanZero(totalCredit - steps * cfg.phaseoutRatePer1000);
  }
  if (totalCredit === 0) {
    return { nonrefundable: 0, ctcPortion: 0, odcPortion: 0, additional: 0 };
  }

  const nonrefundable = minCents(totalCredit, params.taxRemaining);

  // ACTC: only the CTC portion is refundable, up to the per-child limit and
  // 15% of earned income over the floor.
  const ctcShare = minCents(totalCredit, grossCtc);
  const unusedCtc = notLessThanZero(ctcShare - nonrefundable);
  let additional = 0;
  if (unusedCtc > 0 && params.qualifyingChildren > 0) {
    const refundableCap = params.qualifyingChildren * cfg.refundableLimitPerChild;
    const earnedOverFloor = notLessThanZero(params.earnedIncome - cfg.actcEarnedIncomeFloor);
    const earnedLimit = rd(multiplyRate(earnedOverFloor, cfg.actcEarnedIncomeRate));
    additional = minCents(minCents(unusedCtc, refundableCap), earnedLimit);
  }

  const odcPortion = minCents(notLessThanZero(totalCredit - grossCtc), nonrefundable);
  return {
    nonrefundable,
    ctcPortion: notLessThanZero(nonrefundable - odcPortion),
    odcPortion,
    additional,
  };
}

export interface EducationCreditResult {
  nonrefundable: Cents;
  refundable: Cents;
}

/** Form 8863 — American Opportunity and Lifetime Learning credits with MAGI phase-out. */
export function educationCredits(params: {
  model: TaxReturnModel;
  magi: Cents;
  filingStatus: FilingStatus;
  config: FederalYearConfig;
}): EducationCreditResult {
  const cfg = params.config.education;
  if (params.filingStatus === "MARRIED_FILING_SEPARATELY") {
    return { nonrefundable: 0, refundable: 0 };
  }
  const start = cfg.phaseoutStart[params.filingStatus];
  const end = cfg.phaseoutEnd[params.filingStatus];
  if (params.magi >= end) return { nonrefundable: 0, refundable: 0 };
  // Phase-out multiplier in thousandths for determinism.
  const ratio =
    params.magi <= start ? 1 : Math.round(((end - params.magi) / (end - start)) * 1000) / 1000;

  let aotcTotal = 0;
  let llcExpenses = 0;
  for (const expense of params.model.educationExpenses) {
    if (expense.eligibleForAotc && expense.atLeastHalfTime && !expense.aotcClaimedFourPriorYears) {
      const first = minCents(expense.qualifiedExpenses, cfg.aotcFirstTier);
      const secondBase = minCents(
        notLessThanZero(expense.qualifiedExpenses - cfg.aotcFirstTier),
        cfg.aotcFirstTier,
      );
      aotcTotal += minCents(
        first + rd(multiplyRate(secondBase, cfg.aotcSecondTierRate)),
        cfg.aotcMax,
      );
    } else {
      llcExpenses += expense.qualifiedExpenses;
    }
  }
  const llc = rd(multiplyRate(minCents(llcExpenses, cfg.llcExpenseLimit), cfg.llcRate));

  const aotcAfterPhaseout = rd(multiplyRate(aotcTotal, ratio));
  const llcAfterPhaseout = rd(multiplyRate(llc, ratio));
  const refundable = rd(multiplyRate(aotcAfterPhaseout, cfg.aotcRefundableRate));
  return {
    nonrefundable: notLessThanZero(aotcAfterPhaseout - refundable) + llcAfterPhaseout,
    refundable,
  };
}

/** Form 2441 — Child and Dependent Care Credit (nonrefundable). */
export function dependentCareCredit(params: {
  model: TaxReturnModel;
  agi: Cents;
  earnedIncomeTaxpayer: Cents;
  earnedIncomeSpouse: Cents;
  config: FederalYearConfig;
}): Cents {
  const cfg = params.config.dependentCare;
  const qualifying = params.model.dependents.filter((d) => d.qualifiesForDependentCare).length;
  if (qualifying === 0) return 0;
  const paid = params.model.dependentCareExpenses.reduce((sum, e) => sum + e.amountPaid, 0);
  if (paid <= 0) return 0;

  const expenseCap = qualifying >= 2 ? cfg.maxExpensesTwoPlus : cfg.maxExpensesOneQualifying;
  let allowed = minCents(rd(paid), expenseCap);
  // Limited to the earned income of the lower-earning spouse (or the taxpayer).
  const isJoint = params.model.filingStatus === "MARRIED_FILING_JOINTLY";
  const earnedLimit = isJoint
    ? minCents(params.earnedIncomeTaxpayer, params.earnedIncomeSpouse)
    : params.earnedIncomeTaxpayer;
  allowed = minCents(allowed, notLessThanZero(earnedLimit));
  if (allowed <= 0) return 0;

  let rate = cfg.maxRate;
  if (params.agi > cfg.rateStepdownStart) {
    const steps = Math.ceil((params.agi - cfg.rateStepdownStart) / cfg.rateStepdownPer);
    rate = Math.max(cfg.minRate, cfg.maxRate - steps * 0.01);
  }
  return rd(multiplyRate(allowed, Math.round(rate * 100) / 100));
}
