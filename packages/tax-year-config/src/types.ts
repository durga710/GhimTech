import type { Cents, FilingStatus } from "@ghimtech/tax-domain";

/** One marginal bracket: rate applies to income above `over` up to the next bracket's `over`. */
export interface TaxBracket {
  /** Lower bound of the bracket in cents (taxable income strictly above this). */
  over: Cents;
  /** Marginal rate, e.g. 0.22. */
  rate: number;
}

export type PerStatus<T> = Record<FilingStatus, T>;

export interface EitcParameters {
  /** Earned income amount at which the credit maxes out, per number of qualifying children (0..3+). */
  earnedIncomeAmount: [Cents, Cents, Cents, Cents];
  /** Credit rate per number of qualifying children. */
  creditRate: [number, number, number, number];
  /** Phase-out rate per number of qualifying children. */
  phaseoutRate: [number, number, number, number];
  /** Phase-out start (AGI or earned income, whichever is greater) for non-MFJ filers. */
  phaseoutStart: [Cents, Cents, Cents, Cents];
  /** Phase-out start for married filing jointly. */
  phaseoutStartMfj: [Cents, Cents, Cents, Cents];
  /** Maximum investment income before full disqualification. */
  investmentIncomeLimit: Cents;
}

export interface FederalYearConfig {
  taxYear: number;
  /** Version of this rule set, bumped when any value is corrected. */
  ruleVersion: string;
  /** Where these values come from — kept current in docs/tax-rules/. */
  sources: string[];

  standardDeduction: PerStatus<Cents>;
  /** Additional standard deduction per instance of age-65+ or blindness. */
  additionalStandardDeductionMarried: Cents;
  additionalStandardDeductionUnmarried: Cents;
  /** Standard deduction limits for dependents: max(earned + base, floor), capped at normal SD. */
  dependentStandardDeductionFloor: Cents;
  dependentStandardDeductionEarnedAddition: Cents;

  brackets: PerStatus<TaxBracket[]>;

  /** Long-term capital gain / qualified dividend rate breakpoints (0% up to first, 15% up to second, then 20%). */
  capitalGains: PerStatus<{ zeroRateMax: Cents; fifteenRateMax: Cents }>;

  childTaxCredit: {
    perChild: Cents;
    perOtherDependent: Cents;
    refundableLimitPerChild: Cents;
    phaseoutThreshold: PerStatus<Cents>;
    phaseoutRatePer1000: Cents; // credit reduction per $1,000 over threshold
    /** Earned income floor for the additional (refundable) CTC computation. */
    actcEarnedIncomeFloor: Cents;
    actcEarnedIncomeRate: number;
  };

  eitc: EitcParameters;

  education: {
    aotcMax: Cents;
    aotcFirstTier: Cents; // 100% of first tier
    aotcSecondTierRate: number; // 25% of next tier (up to aotcMax)
    aotcRefundableRate: number;
    llcRate: number;
    llcExpenseLimit: Cents;
    /** MAGI phase-out range (both credits share it since 2021). */
    phaseoutStart: PerStatus<Cents>;
    phaseoutEnd: PerStatus<Cents>;
  };

  dependentCare: {
    maxExpensesOneQualifying: Cents;
    maxExpensesTwoPlus: Cents;
    maxRate: number; // 0.35
    minRate: number; // 0.20
    /** AGI above which the rate starts stepping down, and step size. */
    rateStepdownStart: Cents;
    rateStepdownPer: Cents; // 1% per this much AGI
  };

  selfEmployment: {
    netEarningsFactor: number; // 0.9235
    socialSecurityRate: number; // 0.124
    medicareRate: number; // 0.029
    socialSecurityWageBase: Cents;
    /** SE tax filing threshold on net earnings. */
    filingThreshold: Cents;
  };

  qbi: {
    deductionRate: number; // 0.20
    /** Taxable income threshold above which Form 8995-A rules apply — unsupported in this release. */
    simplifiedThreshold: PerStatus<Cents>;
  };

  socialSecurityTaxability: {
    baseAmount: PerStatus<Cents>;
    adjustedBaseAmount: PerStatus<Cents>;
    tier1Rate: number; // 0.50
    tier2Rate: number; // 0.85
  };

  additionalMedicare: {
    rate: number; // 0.009
    threshold: PerStatus<Cents>;
  };

  niit: {
    rate: number; // 0.038
    threshold: PerStatus<Cents>;
  };

  /** Schedule B is required above this amount of interest or dividends. */
  scheduleBThreshold: Cents;

  /** 10% additional tax on early retirement distributions (Form 5329). */
  earlyDistributionPenaltyRate: number;

  saltDeductionCap: Cents;
  saltDeductionCapMfs: Cents;
  medicalExpenseAgiFloor: number; // 0.075
}

export interface PennsylvaniaYearConfig {
  taxYear: number;
  ruleVersion: string;
  sources: string[];

  /** Flat PA personal income tax rate. */
  taxRate: number;

  taxForgiveness: {
    /** Eligibility income limit for 100% forgiveness — single claimant. */
    baseClaimant: Cents;
    /** Additional allowance for a married claimant's spouse. */
    marriedAddition: Cents;
    /** Additional allowance per dependent child. */
    perDependent: Cents;
    /** Forgiveness decreases by 10 percentage points per this increment of income over the limit. */
    phaseoutStep: Cents;
    phaseoutStepPercentage: number; // 0.10
  };
}
