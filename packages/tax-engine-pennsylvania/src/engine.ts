/**
 * Pennsylvania PA-40 calculation engine. Deterministic and fully traced, like
 * the federal engine. PA taxes eight classes of income at a flat statutory
 * rate; losses in one class never offset income in another.
 *
 * Supported classes in this release: compensation, interest, dividends, and
 * net profits from a business. The capital-gain class exists architecturally
 * and is blocked with a diagnostic until PA Schedule D support lands.
 * Part-year and nonresident returns are modeled but blocked from filing.
 */
import {
  type Cents,
  type Diagnostic,
  DiagnosticCodes,
  type TaxReturnModel,
  centsToWholeDollars,
  multiplyRate,
  notLessThanZero,
  sumCents,
  TraceBuilder,
} from "@ghimtech/tax-domain";
import { getPennsylvaniaConfig } from "@ghimtech/tax-year-config";
import type { PaCalculationResult } from "./types.js";

const MODULE = "@ghimtech/tax-engine-pennsylvania";

function rd(cents: Cents): Cents {
  return centsToWholeDollars(cents) * 100;
}

export function calculatePennsylvania(model: TaxReturnModel): PaCalculationResult {
  const config = getPennsylvaniaConfig(model.taxYear);
  const trace = new TraceBuilder(model.taxYear, config.ruleVersion, MODULE);
  const diagnostics: Diagnostic[] = [];
  const pa = model.pennsylvania;

  if (!pa) {
    diagnostics.push({
      code: DiagnosticCodes.PA_RESIDENCY_CONFLICT,
      severity: "ERROR",
      message: "Pennsylvania return requested but no PA residency information is on file",
      jurisdiction: "PENNSYLVANIA",
      path: "/pennsylvania",
    });
  } else if (pa.residencyStatus !== "FULL_YEAR_RESIDENT") {
    diagnostics.push({
      code: DiagnosticCodes.UNSUPPORTED_PA_RESIDENCY,
      severity: "ERROR",
      message: `${pa.residencyStatus} PA returns are modeled but not yet supported for filing — full-year residents only in this release`,
      jurisdiction: "PENNSYLVANIA",
      path: "/pennsylvania/residencyStatus",
    });
  }
  if (pa && !pa.psdCode) {
    diagnostics.push({
      code: DiagnosticCodes.PA_LOCAL_TAX_INFO_MISSING,
      severity: "WARNING",
      message:
        "PSD code for local earned income tax is missing — capture it so the client can meet local filing obligations",
      jurisdiction: "PENNSYLVANIA",
      path: "/pennsylvania/psdCode",
    });
  }

  // ---- Class 1: Compensation ---------------------------------------------
  // W-2 state wages for PA. W-2s coded to another state are flagged.
  let compensation = 0;
  model.w2s.forEach((w2, i) => {
    if (w2.stateCode && w2.stateCode !== "PA") {
      diagnostics.push({
        code: DiagnosticCodes.PA_W2_STATE_MISMATCH,
        severity: "ERROR",
        message: `W-2 ${i + 1} (${w2.employerName}) reports wages for ${w2.stateCode}, not PA — multi-state returns are not supported in this release`,
        jurisdiction: "PENNSYLVANIA",
        path: `/w2s/${i}/stateCode`,
      });
      return;
    }
    compensation += w2.stateWages > 0 ? w2.stateWages : w2.wages;
  });

  // Retirement distributions from non-eligible plans need manual PA treatment.
  model.retirement.forEach((r, i) => {
    if (!r.paEligiblePlan && r.grossDistribution > 0) {
      diagnostics.push({
        code: DiagnosticCodes.UNSUPPORTED_SITUATION,
        severity: "ERROR",
        message: `1099-R ${i + 1} (${r.payerName}): distribution is not from a PA-eligible retirement plan — PA taxability requires manual determination, not supported in this release`,
        jurisdiction: "PENNSYLVANIA",
        path: `/retirement/${i}`,
      });
    }
  });
  compensation = rd(compensation);
  trace.add({
    lineId: "pa.pa40.line1a.compensation",
    label: "Gross compensation (PA-40 line 1a)",
    valueCents: compensation,
    formula: "Sum of W-2 box 16 PA state wages (box 1 when box 16 empty)",
    inputs: { w2Count: model.w2s.length },
  });

  // ---- Class 2: Interest --------------------------------------------------
  // US government interest is exempt from PA tax; municipal-bond interest may
  // be taxable depending on issuer — flagged for preparer verification.
  const interest = rd(sumCents(model.interest.map((i) => i.taxableInterest)));
  const exemptInterest = sumCents(model.interest.map((i) => i.taxExemptInterest));
  if (exemptInterest > 0) {
    diagnostics.push({
      code: DiagnosticCodes.UNSUPPORTED_SITUATION,
      severity: "WARNING",
      message:
        "Federally tax-exempt interest present — verify PA taxability (non-PA municipal bond interest is PA-taxable) and adjust before filing",
      jurisdiction: "PENNSYLVANIA",
      path: "/interest",
    });
  }
  trace.add({
    lineId: "pa.pa40.line2.interest",
    label: "Interest income (PA-40 line 2)",
    valueCents: interest,
    formula: "1099-INT box 1 (US government interest in box 3 is PA-exempt)",
    inputs: { payerCount: model.interest.length },
  });

  // ---- Class 3: Dividends -------------------------------------------------
  // Capital gain distributions from mutual funds are reported as PA dividend
  // income on PA Schedule B.
  const dividends = rd(
    sumCents(model.dividends.map((d) => d.ordinaryDividends + d.capitalGainDistributions)),
  );
  trace.add({
    lineId: "pa.pa40.line3.dividends",
    label: "Dividend income (PA-40 line 3)",
    valueCents: dividends,
    formula: "1099-DIV box 1a + box 2a capital gain distributions (PA Schedule B treatment)",
    inputs: { payerCount: model.dividends.length },
  });

  // ---- Class 4: Net profits -----------------------------------------------
  // A loss in this class cannot offset other classes; losses are blocked
  // federally as unsupported, so clamp to zero here as well.
  const businessIncome = rd(
    sumCents(
      model.selfEmployment.map((se) => notLessThanZero(se.grossReceipts - se.totalExpenses)),
    ),
  );
  trace.add({
    lineId: "pa.pa40.line4.businessIncome",
    label: "Net income from business (PA-40 line 4)",
    valueCents: businessIncome,
    formula: "Gross receipts − expenses per business; class losses never offset other classes",
    inputs: { businessCount: model.selfEmployment.length },
  });

  // ---- Class 5: Net gains — architecture only ----------------------------
  const netGains = 0;

  const totalTaxableIncome = compensation + interest + dividends + businessIncome + netGains;
  trace.add({
    lineId: "pa.pa40.line9.totalIncome",
    label: "Total PA taxable income (PA-40 line 9)",
    valueCents: totalTaxableIncome,
    formula: "Sum of positive income classes",
    inputs: { compensation, interest, dividends, businessIncome },
  });

  const taxLiability = rd(multiplyRate(totalTaxableIncome, config.taxRate));
  trace.add({
    lineId: "pa.pa40.line12.tax",
    label: "PA tax liability (PA-40 line 12)",
    valueCents: taxLiability,
    formula: `Total taxable income × ${(config.taxRate * 100).toFixed(2)}%`,
    inputs: { totalTaxableIncome, rate: config.taxRate },
  });

  // ---- Schedule SP: tax forgiveness --------------------------------------
  let forgivenessPercentage = 0;
  let taxForgiveness = 0;
  let eligibilityIncome = 0;
  if (pa?.claimTaxForgiveness) {
    const sp = config.taxForgiveness;
    const isMarried =
      model.filingStatus === "MARRIED_FILING_JOINTLY" ||
      model.filingStatus === "MARRIED_FILING_SEPARATELY";
    if (model.filingStatus === "MARRIED_FILING_SEPARATELY") {
      diagnostics.push({
        code: DiagnosticCodes.UNSUPPORTED_SITUATION,
        severity: "WARNING",
        message:
          "Married taxpayers must use joint eligibility income on Schedule SP — verify spouse income is included",
        jurisdiction: "PENNSYLVANIA",
      });
    }
    // Eligibility income = PA taxable income + nontaxable income captured in intake.
    eligibilityIncome = totalTaxableIncome + rd(pa.spEligibilityOtherIncome);
    const limit =
      sp.baseClaimant +
      (isMarried ? sp.marriedAddition : 0) +
      model.dependents.length * sp.perDependent;
    if (eligibilityIncome <= limit) {
      forgivenessPercentage = 1;
    } else {
      const over = eligibilityIncome - limit;
      const steps = Math.ceil(over / sp.phaseoutStep);
      forgivenessPercentage = Math.max(0, 1 - steps * sp.phaseoutStepPercentage);
      forgivenessPercentage = Math.round(forgivenessPercentage * 10) / 10;
    }
    taxForgiveness = rd(multiplyRate(taxLiability, forgivenessPercentage));
    trace.add({
      lineId: "pa.scheduleSP.forgiveness",
      label: "Tax forgiveness (PA Schedule SP)",
      valueCents: taxForgiveness,
      formula: `Forgiveness ${forgivenessPercentage * 100}% × tax liability (eligibility income vs limit)`,
      inputs: { eligibilityIncome, limit, dependents: model.dependents.length },
    });
  }

  const taxAfterForgiveness = notLessThanZero(taxLiability - taxForgiveness);

  // ---- Payments -----------------------------------------------------------
  const withholding = rd(
    sumCents([
      ...model.w2s
        .filter((w) => !w.stateCode || w.stateCode === "PA")
        .map((w) => w.stateWithholding),
      ...model.retirement.map((r) => r.stateWithholding),
    ]),
  );
  const estimatedPayments =
    rd(sumCents(model.payments.paEstimatedPayments.map((p) => p.amount))) +
    rd(model.payments.paOverpaymentApplied);
  const totalPayments = withholding + estimatedPayments;
  trace.add({
    lineId: "pa.pa40.line24.totalPayments",
    label: "Total payments and credits (PA-40)",
    valueCents: totalPayments,
    formula: "PA withholding + estimated payments + prior-year overpayment applied",
    inputs: { withholding, estimatedPayments },
  });

  const refund = notLessThanZero(totalPayments - taxAfterForgiveness);
  const balanceDue = notLessThanZero(taxAfterForgiveness - totalPayments);

  return {
    taxYear: model.taxYear,
    ruleVersion: config.ruleVersion,
    compensation,
    interest,
    dividends,
    businessIncome,
    netGains,
    totalTaxableIncome,
    taxLiability,
    eligibilityIncome,
    forgivenessPercentage,
    taxForgiveness,
    taxAfterForgiveness,
    withholding,
    estimatedPayments,
    totalPayments,
    refund,
    balanceDue,
    diagnostics,
    trace: trace.build(),
  };
}
