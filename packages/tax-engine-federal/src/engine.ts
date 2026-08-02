/**
 * The federal calculation engine. Pure and deterministic: the same return
 * model and rule version always produce the same result. No AI, no network,
 * no clocks — every value is traceable to an input and a versioned rule.
 */
import {
  type Diagnostic,
  DiagnosticCodes,
  type TaxReturnModel,
  minCents,
  multiplyRate,
  notLessThanZero,
  sumCents,
  TraceBuilder,
} from "@ghimtech/tax-domain";
import { getFederalConfig } from "@ghimtech/tax-year-config";
import { childTaxCredit, dependentCareCredit, educationCredits } from "./credits.js";
import { ageAtYearEnd, structuralDiagnostics } from "./diagnostics.js";
import type { FederalCalculationResult } from "./types.js";
import {
  earnedIncomeCredit,
  qualifiedDividendsCapGainTax,
  rd,
  seTax,
  taxFromTableOrSchedule,
  taxableSocialSecurity,
} from "./worksheets.js";

const MODULE = "@ghimtech/tax-engine-federal";

export function calculateFederal(model: TaxReturnModel): FederalCalculationResult {
  const config = getFederalConfig(model.taxYear);
  const trace = new TraceBuilder(model.taxYear, config.ruleVersion, MODULE);
  const diagnostics: Diagnostic[] = structuralDiagnostics(model, config);
  const status = model.filingStatus;

  // ---- Income -------------------------------------------------------------
  const wages = rd(sumCents(model.w2s.map((w) => w.wages)));
  trace.add({
    lineId: "federal.1040.line1a.wages",
    label: "Wages (Form 1040 line 1a)",
    valueCents: wages,
    formula: "Sum of W-2 box 1",
    inputs: { w2Count: model.w2s.length },
  });

  const taxExemptInterest = rd(sumCents(model.interest.map((i) => i.taxExemptInterest)));
  const taxableInterest = rd(
    sumCents(model.interest.map((i) => i.taxableInterest + i.usGovernmentInterest)),
  );
  trace.add({
    lineId: "federal.1040.line2b.taxableInterest",
    label: "Taxable interest (line 2b)",
    valueCents: taxableInterest,
    formula: "Sum of 1099-INT boxes 1 and 3",
    inputs: { payerCount: model.interest.length },
  });

  const ordinaryDividends = rd(sumCents(model.dividends.map((d) => d.ordinaryDividends)));
  const qualifiedDividends = rd(sumCents(model.dividends.map((d) => d.qualifiedDividends)));
  const capitalGainDistributions = rd(
    sumCents(model.dividends.map((d) => d.capitalGainDistributions)),
  );
  trace.add({
    lineId: "federal.1040.line3b.ordinaryDividends",
    label: "Ordinary dividends (line 3b)",
    valueCents: ordinaryDividends,
    formula: "Sum of 1099-DIV box 1a",
    inputs: { payerCount: model.dividends.length },
  });

  const retirementGross = rd(sumCents(model.retirement.map((r) => r.grossDistribution)));
  const retirementTaxable = rd(sumCents(model.retirement.map((r) => r.taxableAmount)));
  const unemploymentCompensation = rd(sumCents(model.unemployment.map((u) => u.compensation)));

  // Schedule C — losses and complex schedules are blocked by diagnostics.
  const businessNetProfit = rd(
    sumCents(
      model.selfEmployment.map((se) => notLessThanZero(se.grossReceipts - se.totalExpenses)),
    ),
  );
  trace.add({
    lineId: "federal.scheduleC.netProfit",
    label: "Schedule C net profit",
    valueCents: businessNetProfit,
    formula: "Gross receipts − total expenses (per business, losses unsupported)",
    inputs: { businessCount: model.selfEmployment.length },
  });

  // ---- Self-employment tax (needed before AGI) ----------------------------
  const w2SocialSecurityWages = rd(sumCents(model.w2s.map((w) => w.socialSecurityWages)));
  const se = seTax({ netProfit: businessNetProfit, w2SocialSecurityWages, config });
  trace.add({
    lineId: "federal.scheduleSE.tax",
    label: "Self-employment tax (Schedule SE)",
    valueCents: se.seTax,
    formula: "12.4% Social Security (to wage base) + 2.9% Medicare on 92.35% of net profit",
    inputs: { netProfit: businessNetProfit, w2SocialSecurityWages },
  });

  const totalAdjustments = se.halfSeTaxDeduction;

  // ---- Social Security taxability -----------------------------------------
  const netBenefits = rd(sumCents(model.socialSecurity.map((s) => s.netBenefits)));
  const otherIncomeForSs =
    wages +
    taxableInterest +
    ordinaryDividends +
    capitalGainDistributions +
    retirementTaxable +
    unemploymentCompensation +
    businessNetProfit -
    totalAdjustments;
  const socialSecurityTaxable = taxableSocialSecurity({
    netBenefits,
    otherIncome: otherIncomeForSs,
    taxExemptInterest,
    filingStatus: status,
    config,
  });
  trace.add({
    lineId: "federal.1040.line6b.taxableSocialSecurity",
    label: "Taxable Social Security (line 6b)",
    valueCents: socialSecurityTaxable,
    formula: "Social Security Benefits Worksheet (50%/85% tiers)",
    inputs: { netBenefits, otherIncome: otherIncomeForSs, taxExemptInterest },
  });

  // ---- Total income and AGI ----------------------------------------------
  const totalIncome =
    wages +
    taxableInterest +
    ordinaryDividends +
    capitalGainDistributions +
    retirementTaxable +
    socialSecurityTaxable +
    unemploymentCompensation +
    businessNetProfit;
  trace.add({
    lineId: "federal.1040.line9.totalIncome",
    label: "Total income (line 9)",
    valueCents: totalIncome,
    formula: "Sum of income lines",
    inputs: {},
  });

  const adjustedGrossIncome = totalIncome - totalAdjustments;
  trace.add({
    lineId: "federal.1040.line11.agi",
    label: "Adjusted gross income (line 11)",
    valueCents: adjustedGrossIncome,
    formula: "Total income − adjustments (½ SE tax)",
    inputs: { totalIncome, totalAdjustments },
  });

  // ---- Earned income (needed by several credits) --------------------------
  const wagesTaxpayer = rd(
    sumCents(model.w2s.filter((w) => !w.belongsToSpouse).map((w) => w.wages)),
  );
  const wagesSpouse = rd(sumCents(model.w2s.filter((w) => w.belongsToSpouse).map((w) => w.wages)));
  const seEarningsAfterDeduction = notLessThanZero(se.netEarnings - se.halfSeTaxDeduction);
  const seTaxpayer = rd(
    sumCents(
      model.selfEmployment
        .filter((s) => !s.belongsToSpouse)
        .map((s) => notLessThanZero(s.grossReceipts - s.totalExpenses)),
    ),
  );
  const seSpouseShare = businessNetProfit > 0 ? businessNetProfit - seTaxpayer : 0;
  const earnedIncome = wages + seEarningsAfterDeduction;
  const earnedIncomeTaxpayer =
    wagesTaxpayer +
    (businessNetProfit > 0
      ? rd(Math.round((seEarningsAfterDeduction * seTaxpayer) / businessNetProfit))
      : 0);
  const earnedIncomeSpouse =
    wagesSpouse +
    (businessNetProfit > 0
      ? rd(Math.round((seEarningsAfterDeduction * seSpouseShare) / businessNetProfit))
      : 0);

  // ---- Deduction ----------------------------------------------------------
  let standardDeduction = config.standardDeduction[status];
  const isMarriedStatus =
    status === "MARRIED_FILING_JOINTLY" ||
    status === "MARRIED_FILING_SEPARATELY" ||
    status === "QUALIFYING_SURVIVING_SPOUSE";
  const additionalAmount = isMarriedStatus
    ? config.additionalStandardDeductionMarried
    : config.additionalStandardDeductionUnmarried;
  let additionalCount = 0;
  if (ageAtYearEnd(model.taxpayer.dateOfBirth, model.taxYear) >= 65) additionalCount++;
  if (model.taxpayer.isBlind) additionalCount++;
  if (model.spouse && status === "MARRIED_FILING_JOINTLY") {
    if (ageAtYearEnd(model.spouse.dateOfBirth, model.taxYear) >= 65) additionalCount++;
    if (model.spouse.isBlind) additionalCount++;
  }
  standardDeduction += additionalCount * additionalAmount;
  if (model.taxpayerClaimedAsDependent) {
    const limited = Math.max(
      config.dependentStandardDeductionFloor,
      minCents(
        earnedIncome + config.dependentStandardDeductionEarnedAddition,
        config.standardDeduction[status],
      ),
    );
    standardDeduction = minCents(standardDeduction, limited);
  }
  trace.add({
    lineId: "federal.1040.line12.standardDeduction",
    label: "Standard deduction",
    valueCents: standardDeduction,
    formula: "Base by filing status + additional (65+/blind), dependent limitation",
    inputs: { additionalCount, claimedAsDependent: model.taxpayerClaimedAsDependent },
  });

  let itemizedDeduction = 0;
  if (model.itemized) {
    const it = model.itemized;
    const medicalOverFloor = notLessThanZero(
      rd(it.medicalExpenses) - rd(multiplyRate(adjustedGrossIncome, config.medicalExpenseAgiFloor)),
    );
    const saltCap =
      status === "MARRIED_FILING_SEPARATELY" ? config.saltDeductionCapMfs : config.saltDeductionCap;
    const salt = minCents(
      rd(
        it.stateAndLocalIncomeTaxes +
          it.stateAndLocalRealEstateTaxes +
          it.stateAndLocalPersonalPropertyTaxes,
      ),
      saltCap,
    );
    const charitableCashLimit = rd(multiplyRate(adjustedGrossIncome, 0.6));
    const charitable =
      minCents(rd(it.charitableCash), charitableCashLimit) + rd(it.charitableNonCash);
    itemizedDeduction =
      medicalOverFloor + salt + rd(it.homeMortgageInterest) + charitable + rd(it.otherDeductions);
    trace.add({
      lineId: "federal.scheduleA.total",
      label: "Itemized deductions (Schedule A)",
      valueCents: itemizedDeduction,
      formula: "Medical over 7.5% AGI + capped SALT + mortgage interest + charitable + other",
      inputs: { medicalOverFloor, salt, charitable },
    });
  }

  let deductionTaken: "STANDARD" | "ITEMIZED";
  if (model.deductionElection === "ITEMIZED" && model.itemized) {
    deductionTaken = "ITEMIZED";
  } else if (model.deductionElection === "STANDARD" || !model.itemized) {
    deductionTaken = "STANDARD";
  } else {
    deductionTaken = itemizedDeduction > standardDeduction ? "ITEMIZED" : "STANDARD";
  }
  const deduction = deductionTaken === "ITEMIZED" ? itemizedDeduction : standardDeduction;

  // ---- QBI deduction (Form 8995 simplified) -------------------------------
  const taxableBeforeQbi = notLessThanZero(adjustedGrossIncome - deduction);
  let qbiDeduction = 0;
  if (businessNetProfit > 0) {
    const threshold = config.qbi.simplifiedThreshold[status];
    if (taxableBeforeQbi > threshold) {
      diagnostics.push({
        code: DiagnosticCodes.UNSUPPORTED_QBI_OVER_THRESHOLD,
        severity: "ERROR",
        message:
          "Taxable income exceeds the Form 8995 threshold — the QBI deduction requires Form 8995-A, which is not supported in this release",
        jurisdiction: "FEDERAL",
      });
    } else {
      const qbi = notLessThanZero(businessNetProfit - se.halfSeTaxDeduction);
      const incomeLimit = notLessThanZero(
        taxableBeforeQbi - qualifiedDividends - capitalGainDistributions,
      );
      qbiDeduction = rd(multiplyRate(minCents(qbi, incomeLimit), config.qbi.deductionRate));
      trace.add({
        lineId: "federal.8995.qbiDeduction",
        label: "Qualified business income deduction (Form 8995)",
        valueCents: qbiDeduction,
        formula: "20% × min(QBI, taxable income before QBI − net capital gain)",
        inputs: { qbi, incomeLimit },
      });
    }
  }

  const taxableIncome = notLessThanZero(taxableBeforeQbi - qbiDeduction);
  trace.add({
    lineId: "federal.1040.line15.taxableIncome",
    label: "Taxable income (line 15)",
    valueCents: taxableIncome,
    formula: "AGI − deduction − QBI deduction, not less than zero",
    inputs: { adjustedGrossIncome, deduction, qbiDeduction, deductionTaken },
  });

  // ---- Income tax ---------------------------------------------------------
  const usePreferentialRates = qualifiedDividends + capitalGainDistributions > 0;
  const incomeTax = usePreferentialRates
    ? qualifiedDividendsCapGainTax({
        taxableIncome,
        qualifiedDividends,
        capitalGainDistributions,
        filingStatus: status,
        config,
      })
    : taxFromTableOrSchedule(taxableIncome, config.brackets[status]);
  trace.add({
    lineId: "federal.1040.line16.tax",
    label: "Tax (line 16)",
    valueCents: incomeTax,
    formula: usePreferentialRates
      ? "Qualified Dividends and Capital Gain Tax Worksheet"
      : "Tax Table / Tax Computation Worksheet",
    inputs: { taxableIncome, qualifiedDividends, capitalGainDistributions },
  });

  // ---- Other taxes --------------------------------------------------------
  const medicareWages = rd(sumCents(model.w2s.map((w) => w.medicareWages)));
  const medicareBase = medicareWages + se.netEarnings;
  const addlMedicareThreshold = config.additionalMedicare.threshold[status];
  const additionalMedicareTax =
    medicareBase > addlMedicareThreshold
      ? rd(multiplyRate(medicareBase - addlMedicareThreshold, config.additionalMedicare.rate))
      : 0;

  const netInvestmentIncome = taxableInterest + ordinaryDividends + capitalGainDistributions;
  const niitThreshold = config.niit.threshold[status];
  const netInvestmentIncomeTax =
    adjustedGrossIncome > niitThreshold && netInvestmentIncome > 0
      ? rd(
          multiplyRate(
            minCents(netInvestmentIncome, adjustedGrossIncome - niitThreshold),
            config.niit.rate,
          ),
        )
      : 0;

  const earlyDistributions = rd(
    sumCents(
      model.retirement.filter((r) => r.distributionCode === "1").map((r) => r.taxableAmount),
    ),
  );
  const earlyDistributionTax =
    earlyDistributions > 0
      ? rd(multiplyRate(earlyDistributions, config.earlyDistributionPenaltyRate))
      : 0;
  if (earlyDistributionTax > 0) {
    trace.add({
      lineId: "federal.5329.earlyDistributionTax",
      label: "Additional tax on early distributions",
      valueCents: earlyDistributionTax,
      formula: "10% of taxable early distributions (code 1)",
      inputs: { earlyDistributions },
    });
  }

  // ---- Credits ------------------------------------------------------------
  let taxRemaining = incomeTax;

  const cdcc = dependentCareCredit({
    model,
    agi: adjustedGrossIncome,
    earnedIncomeTaxpayer,
    earnedIncomeSpouse,
    config,
  });
  const dependentCareAllowed = minCents(cdcc, taxRemaining);
  taxRemaining -= dependentCareAllowed;

  const education = educationCredits({
    model,
    magi: adjustedGrossIncome,
    filingStatus: status,
    config,
  });
  const educationNonrefundableAllowed = minCents(education.nonrefundable, taxRemaining);
  taxRemaining -= educationNonrefundableAllowed;

  const taxYear = model.taxYear;
  const qualifyingChildren = model.dependents.filter(
    (d) => d.eligibleForChildTaxCredit && ageAtYearEnd(d.dateOfBirth, taxYear) < 17,
  ).length;
  const otherDependents = model.dependents.filter((d) => d.eligibleForOtherDependentCredit).length;
  const ctc = childTaxCredit({
    qualifyingChildren,
    otherDependents,
    agi: adjustedGrossIncome,
    filingStatus: status,
    taxRemaining,
    earnedIncome,
    config,
  });
  taxRemaining -= ctc.nonrefundable;
  trace.add({
    lineId: "federal.8812.ctc",
    label: "Child tax credit / credit for other dependents (Schedule 8812)",
    valueCents: ctc.nonrefundable,
    formula: `${qualifyingChildren} qualifying children × $2,200 + ${otherDependents} other dependents × $500, phased out over AGI threshold, limited to tax`,
    inputs: { qualifyingChildren, otherDependents, agi: adjustedGrossIncome },
  });

  const totalNonrefundableCredits =
    dependentCareAllowed + educationNonrefundableAllowed + ctc.nonrefundable;

  // ---- EITC ---------------------------------------------------------------
  let earnedIncomeCreditAmount = 0;
  if (model.eitc.claiming && !model.eitc.disqualified) {
    const investmentIncome =
      taxableInterest + taxExemptInterest + ordinaryDividends + capitalGainDistributions;
    if (investmentIncome > config.eitc.investmentIncomeLimit) {
      diagnostics.push({
        code: DiagnosticCodes.EITC_INVESTMENT_INCOME_LIMIT,
        severity: "WARNING",
        message: "Investment income exceeds the EITC limit — EITC not allowed",
        jurisdiction: "FEDERAL",
      });
    }
    const eitcResult = earnedIncomeCredit({
      earnedIncome,
      agi: adjustedGrossIncome,
      investmentIncome,
      qualifyingChildren: model.dependents.filter((d) => d.eitcQualifyingChild).length,
      filingStatus: status,
      taxpayerAge: ageAtYearEnd(model.taxpayer.dateOfBirth, taxYear),
      spouseAge: model.spouse ? ageAtYearEnd(model.spouse.dateOfBirth, taxYear) : undefined,
      params: config.eitc,
    });
    earnedIncomeCreditAmount = eitcResult.credit;
    trace.add({
      lineId: "federal.1040.line27.eitc",
      label: "Earned income credit (line 27)",
      valueCents: earnedIncomeCreditAmount,
      formula: eitcResult.eligible
        ? "EITC table parameters: rate × earned income, phased out over threshold"
        : `Not eligible: ${eitcResult.ineligibleReason}`,
      inputs: { earnedIncome, agi: adjustedGrossIncome, investmentIncome },
    });
  } else if (model.eitc.claiming && model.eitc.disqualified) {
    diagnostics.push({
      code: DiagnosticCodes.EITC_DISQUALIFIED,
      severity: "WARNING",
      message: `EITC marked disqualified by preparer${model.eitc.disqualifiedReason ? `: ${model.eitc.disqualifiedReason}` : ""}`,
      jurisdiction: "FEDERAL",
    });
  }

  // ---- Total tax ----------------------------------------------------------
  const totalTaxBeforeCredits =
    incomeTax + se.seTax + additionalMedicareTax + netInvestmentIncomeTax + earlyDistributionTax;
  const totalTax = notLessThanZero(totalTaxBeforeCredits - totalNonrefundableCredits);
  trace.add({
    lineId: "federal.1040.line22.totalTax",
    label: "Total tax",
    valueCents: totalTax,
    formula:
      "Income tax + SE tax + additional Medicare + NIIT + early-distribution tax − nonrefundable credits",
    inputs: {
      incomeTax,
      seTax: se.seTax,
      additionalMedicareTax,
      netInvestmentIncomeTax,
      earlyDistributionTax,
      totalNonrefundableCredits,
    },
  });

  // ---- Payments -----------------------------------------------------------
  const federalWithholding = rd(
    sumCents([
      ...model.w2s.map((w) => w.federalWithholding),
      ...model.interest.map((i) => i.federalWithholding),
      ...model.dividends.map((d) => d.federalWithholding),
      ...model.retirement.map((r) => r.federalWithholding),
      ...model.socialSecurity.map((s) => s.federalWithholding),
      ...model.unemployment.map((u) => u.federalWithholding),
    ]),
  );
  const estimatedPayments =
    rd(sumCents(model.payments.federalEstimatedPayments.map((p) => p.amount))) +
    rd(model.payments.federalOverpaymentApplied);

  const totalPayments =
    federalWithholding +
    estimatedPayments +
    earnedIncomeCreditAmount +
    ctc.additional +
    education.refundable;
  trace.add({
    lineId: "federal.1040.line33.totalPayments",
    label: "Total payments (line 33)",
    valueCents: totalPayments,
    formula: "Withholding + estimated payments + refundable credits (EITC, ACTC, AOTC 40%)",
    inputs: {
      federalWithholding,
      estimatedPayments,
      eitc: earnedIncomeCreditAmount,
      actc: ctc.additional,
      aotcRefundable: education.refundable,
    },
  });

  const refund = notLessThanZero(totalPayments - totalTax);
  const balanceDue = notLessThanZero(totalTax - totalPayments);
  trace.add({
    lineId: refund > 0 ? "federal.1040.line34.refund" : "federal.1040.line37.balanceDue",
    label: refund > 0 ? "Overpayment / refund" : "Amount you owe",
    valueCents: refund > 0 ? refund : balanceDue,
    formula: "Total payments vs total tax",
    inputs: { totalPayments, totalTax },
  });

  return {
    taxYear: model.taxYear,
    ruleVersion: config.ruleVersion,
    wages,
    taxExemptInterest,
    taxableInterest,
    qualifiedDividends,
    ordinaryDividends,
    retirementGross,
    retirementTaxable,
    socialSecurityBenefits: netBenefits,
    socialSecurityTaxable,
    capitalGainDistributions,
    unemploymentCompensation,
    businessNetProfit,
    totalIncome,
    seTaxDeduction: se.halfSeTaxDeduction,
    totalAdjustments,
    adjustedGrossIncome,
    deductionTaken,
    standardDeduction,
    itemizedDeduction,
    deduction,
    qbiDeduction,
    taxableIncome,
    incomeTax,
    selfEmploymentTax: se.seTax,
    additionalMedicareTax,
    netInvestmentIncomeTax,
    earlyDistributionTax,
    totalTaxBeforeCredits,
    childTaxCredit: ctc.ctcPortion,
    otherDependentCredit: ctc.odcPortion,
    additionalChildTaxCredit: ctc.additional,
    dependentCareCredit: dependentCareAllowed,
    educationCreditsNonrefundable: educationNonrefundableAllowed,
    aotcRefundable: education.refundable,
    earnedIncomeCredit: earnedIncomeCreditAmount,
    totalNonrefundableCredits,
    totalTax,
    federalWithholding,
    estimatedPayments,
    totalPayments,
    refund,
    balanceDue,
    earnedIncome,
    qualifyingChildrenCount: qualifyingChildren,
    otherDependentsCount: otherDependents,
    diagnostics,
    trace: trace.build(),
  };
}
