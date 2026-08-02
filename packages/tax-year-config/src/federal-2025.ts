import type { FederalYearConfig } from "./types.js";

const K = 100; // dollars → cents

/**
 * Federal rule configuration — tax year 2025.
 *
 * Values reflect the 2025 inflation adjustments in Rev. Proc. 2024-40 as
 * modified by Public Law 119-21 (enacted July 2025: standard deduction,
 * child tax credit, and SALT cap changes effective for 2025).
 *
 * Every value here must be verified against the final 2025 IRS instructions
 * before a production filing season — see docs/tax-rules/federal-2025.md for
 * the line-by-line source table and verification checklist. The ruleVersion
 * is bumped whenever any value changes so calculation snapshots identify
 * exactly which rule set produced them.
 */
export const FEDERAL_2025: FederalYearConfig = {
  taxYear: 2025,
  ruleVersion: "2025.1",
  sources: [
    "Rev. Proc. 2024-40 (2025 inflation adjustments)",
    "Public Law 119-21 (2025 standard deduction, CTC, SALT changes)",
    "2025 Form 1040 and schedule instructions",
    "docs/tax-rules/federal-2025.md",
  ],

  standardDeduction: {
    SINGLE: 15_750 * K,
    MARRIED_FILING_JOINTLY: 31_500 * K,
    MARRIED_FILING_SEPARATELY: 15_750 * K,
    HEAD_OF_HOUSEHOLD: 23_625 * K,
    QUALIFYING_SURVIVING_SPOUSE: 31_500 * K,
  },
  additionalStandardDeductionMarried: 1_600 * K,
  additionalStandardDeductionUnmarried: 2_000 * K,
  dependentStandardDeductionFloor: 1_350 * K,
  dependentStandardDeductionEarnedAddition: 450 * K,

  brackets: {
    SINGLE: [
      { over: 0, rate: 0.1 },
      { over: 11_925 * K, rate: 0.12 },
      { over: 48_475 * K, rate: 0.22 },
      { over: 103_350 * K, rate: 0.24 },
      { over: 197_300 * K, rate: 0.32 },
      { over: 250_525 * K, rate: 0.35 },
      { over: 626_350 * K, rate: 0.37 },
    ],
    MARRIED_FILING_JOINTLY: [
      { over: 0, rate: 0.1 },
      { over: 23_850 * K, rate: 0.12 },
      { over: 96_950 * K, rate: 0.22 },
      { over: 206_700 * K, rate: 0.24 },
      { over: 394_600 * K, rate: 0.32 },
      { over: 501_050 * K, rate: 0.35 },
      { over: 751_600 * K, rate: 0.37 },
    ],
    MARRIED_FILING_SEPARATELY: [
      { over: 0, rate: 0.1 },
      { over: 11_925 * K, rate: 0.12 },
      { over: 48_475 * K, rate: 0.22 },
      { over: 103_350 * K, rate: 0.24 },
      { over: 197_300 * K, rate: 0.32 },
      { over: 250_525 * K, rate: 0.35 },
      { over: 375_800 * K, rate: 0.37 },
    ],
    HEAD_OF_HOUSEHOLD: [
      { over: 0, rate: 0.1 },
      { over: 17_000 * K, rate: 0.12 },
      { over: 64_850 * K, rate: 0.22 },
      { over: 103_350 * K, rate: 0.24 },
      { over: 197_300 * K, rate: 0.32 },
      { over: 250_500 * K, rate: 0.35 },
      { over: 626_350 * K, rate: 0.37 },
    ],
    QUALIFYING_SURVIVING_SPOUSE: [
      { over: 0, rate: 0.1 },
      { over: 23_850 * K, rate: 0.12 },
      { over: 96_950 * K, rate: 0.22 },
      { over: 206_700 * K, rate: 0.24 },
      { over: 394_600 * K, rate: 0.32 },
      { over: 501_050 * K, rate: 0.35 },
      { over: 751_600 * K, rate: 0.37 },
    ],
  },

  capitalGains: {
    SINGLE: { zeroRateMax: 48_350 * K, fifteenRateMax: 533_400 * K },
    MARRIED_FILING_JOINTLY: { zeroRateMax: 96_700 * K, fifteenRateMax: 600_050 * K },
    MARRIED_FILING_SEPARATELY: { zeroRateMax: 48_350 * K, fifteenRateMax: 300_000 * K },
    HEAD_OF_HOUSEHOLD: { zeroRateMax: 64_750 * K, fifteenRateMax: 566_700 * K },
    QUALIFYING_SURVIVING_SPOUSE: { zeroRateMax: 96_700 * K, fifteenRateMax: 600_050 * K },
  },

  childTaxCredit: {
    perChild: 2_200 * K,
    perOtherDependent: 500 * K,
    refundableLimitPerChild: 1_700 * K,
    phaseoutThreshold: {
      SINGLE: 200_000 * K,
      MARRIED_FILING_JOINTLY: 400_000 * K,
      MARRIED_FILING_SEPARATELY: 200_000 * K,
      HEAD_OF_HOUSEHOLD: 200_000 * K,
      QUALIFYING_SURVIVING_SPOUSE: 400_000 * K,
    },
    phaseoutRatePer1000: 50 * K,
    actcEarnedIncomeFloor: 2_500 * K,
    actcEarnedIncomeRate: 0.15,
  },

  eitc: {
    earnedIncomeAmount: [8_490 * K, 12_730 * K, 17_880 * K, 17_880 * K],
    creditRate: [0.0765, 0.34, 0.4, 0.45],
    phaseoutRate: [0.0765, 0.1598, 0.2106, 0.2106],
    phaseoutStart: [10_620 * K, 23_350 * K, 23_350 * K, 23_350 * K],
    phaseoutStartMfj: [17_730 * K, 30_470 * K, 30_470 * K, 30_470 * K],
    investmentIncomeLimit: 11_950 * K,
  },

  education: {
    aotcMax: 2_500 * K,
    aotcFirstTier: 2_000 * K,
    aotcSecondTierRate: 0.25,
    aotcRefundableRate: 0.4,
    llcRate: 0.2,
    llcExpenseLimit: 10_000 * K,
    phaseoutStart: {
      SINGLE: 80_000 * K,
      MARRIED_FILING_JOINTLY: 160_000 * K,
      MARRIED_FILING_SEPARATELY: 0, // MFS is not eligible for education credits
      HEAD_OF_HOUSEHOLD: 80_000 * K,
      QUALIFYING_SURVIVING_SPOUSE: 80_000 * K,
    },
    phaseoutEnd: {
      SINGLE: 90_000 * K,
      MARRIED_FILING_JOINTLY: 180_000 * K,
      MARRIED_FILING_SEPARATELY: 0,
      HEAD_OF_HOUSEHOLD: 90_000 * K,
      QUALIFYING_SURVIVING_SPOUSE: 90_000 * K,
    },
  },

  dependentCare: {
    maxExpensesOneQualifying: 3_000 * K,
    maxExpensesTwoPlus: 6_000 * K,
    maxRate: 0.35,
    minRate: 0.2,
    rateStepdownStart: 15_000 * K,
    rateStepdownPer: 2_000 * K,
  },

  selfEmployment: {
    netEarningsFactor: 0.9235,
    socialSecurityRate: 0.124,
    medicareRate: 0.029,
    socialSecurityWageBase: 176_100 * K,
    filingThreshold: 400 * K,
  },

  qbi: {
    deductionRate: 0.2,
    simplifiedThreshold: {
      SINGLE: 197_300 * K,
      MARRIED_FILING_JOINTLY: 394_600 * K,
      MARRIED_FILING_SEPARATELY: 197_300 * K,
      HEAD_OF_HOUSEHOLD: 197_300 * K,
      QUALIFYING_SURVIVING_SPOUSE: 394_600 * K,
    },
  },

  socialSecurityTaxability: {
    baseAmount: {
      SINGLE: 25_000 * K,
      MARRIED_FILING_JOINTLY: 32_000 * K,
      MARRIED_FILING_SEPARATELY: 0, // MFS living with spouse; separate-household MFS is unsupported
      HEAD_OF_HOUSEHOLD: 25_000 * K,
      QUALIFYING_SURVIVING_SPOUSE: 25_000 * K,
    },
    adjustedBaseAmount: {
      SINGLE: 34_000 * K,
      MARRIED_FILING_JOINTLY: 44_000 * K,
      MARRIED_FILING_SEPARATELY: 0,
      HEAD_OF_HOUSEHOLD: 34_000 * K,
      QUALIFYING_SURVIVING_SPOUSE: 34_000 * K,
    },
    tier1Rate: 0.5,
    tier2Rate: 0.85,
  },

  additionalMedicare: {
    rate: 0.009,
    threshold: {
      SINGLE: 200_000 * K,
      MARRIED_FILING_JOINTLY: 250_000 * K,
      MARRIED_FILING_SEPARATELY: 125_000 * K,
      HEAD_OF_HOUSEHOLD: 200_000 * K,
      QUALIFYING_SURVIVING_SPOUSE: 200_000 * K,
    },
  },

  niit: {
    rate: 0.038,
    threshold: {
      SINGLE: 200_000 * K,
      MARRIED_FILING_JOINTLY: 250_000 * K,
      MARRIED_FILING_SEPARATELY: 125_000 * K,
      HEAD_OF_HOUSEHOLD: 200_000 * K,
      QUALIFYING_SURVIVING_SPOUSE: 200_000 * K,
    },
  },

  scheduleBThreshold: 1_500 * K,
  earlyDistributionPenaltyRate: 0.1,

  saltDeductionCap: 40_000 * K,
  saltDeductionCapMfs: 20_000 * K,
  medicalExpenseAgiFloor: 0.075,
};
