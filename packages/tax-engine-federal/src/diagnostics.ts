/**
 * Federal structural diagnostics. These run before and during calculation and
 * are the mechanism that blocks unsupported or inconsistent returns from
 * being filed (ERROR severity blocks e-filing).
 */
import {
  type Diagnostic,
  DiagnosticCodes,
  type TaxReturnModel,
  multiplyRate,
} from "@ghimtech/tax-domain";
import type { FederalYearConfig } from "@ghimtech/tax-year-config";

function err(code: string, message: string, path?: string): Diagnostic {
  return { code, severity: "ERROR", message, path, jurisdiction: "FEDERAL" };
}
function warn(code: string, message: string, path?: string): Diagnostic {
  return { code, severity: "WARNING", message, path, jurisdiction: "FEDERAL" };
}
function info(code: string, message: string, path?: string): Diagnostic {
  return { code, severity: "INFO", message, path, jurisdiction: "FEDERAL" };
}

export function ageAtYearEnd(dateOfBirth: string, taxYear: number): number {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  const yearEnd = Date.UTC(taxYear, 11, 31);
  let age = taxYear - dob.getUTCFullYear();
  const birthdayThisYear = Date.UTC(taxYear, dob.getUTCMonth(), dob.getUTCDate());
  if (birthdayThisYear > yearEnd) age -= 1;
  return age;
}

export function structuralDiagnostics(
  model: TaxReturnModel,
  config: FederalYearConfig,
): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const isJoint = model.filingStatus === "MARRIED_FILING_JOINTLY";

  // Identity
  if (!model.taxpayer.ssnRef) {
    diags.push(
      err(
        DiagnosticCodes.MISSING_TIN,
        "Taxpayer identification number is missing",
        "/taxpayer/ssnRef",
      ),
    );
  }
  if (isJoint && !model.spouse) {
    diags.push(
      err(
        DiagnosticCodes.MISSING_SPOUSE,
        "Married filing jointly requires spouse information",
        "/spouse",
      ),
    );
  }
  if (!isJoint && model.filingStatus !== "MARRIED_FILING_SEPARATELY" && model.spouse) {
    diags.push(
      err(
        DiagnosticCodes.FILING_STATUS_INCONSISTENT,
        `Filing status ${model.filingStatus} does not allow spouse information`,
        "/spouse",
      ),
    );
  }
  if (model.spouse && !model.spouse.ssnRef) {
    diags.push(
      err(DiagnosticCodes.MISSING_TIN, "Spouse identification number is missing", "/spouse/ssnRef"),
    );
  }

  // Head of household requires a qualifying person.
  if (model.filingStatus === "HEAD_OF_HOUSEHOLD" && model.dependents.length === 0) {
    diags.push(
      err(
        DiagnosticCodes.HOH_NO_QUALIFYING_PERSON,
        "Head of household requires a qualifying person; no dependents are listed",
        "/dependents",
      ),
    );
  }

  // Dependent consistency
  model.dependents.forEach((dep, i) => {
    if (!dep.ssnRef) {
      diags.push(
        err(
          DiagnosticCodes.MISSING_TIN,
          `Dependent ${i + 1} is missing an SSN/ITIN`,
          `/dependents/${i}/ssnRef`,
        ),
      );
    }
    const age = ageAtYearEnd(dep.dateOfBirth, model.taxYear);
    if (dep.eligibleForChildTaxCredit && age >= 17) {
      diags.push(
        err(
          DiagnosticCodes.DEPENDENT_CONFLICT,
          `Dependent ${i + 1} is marked CTC-eligible but was ${age} at year end (must be under 17)`,
          `/dependents/${i}/eligibleForChildTaxCredit`,
        ),
      );
    }
    if (dep.eligibleForChildTaxCredit && dep.eligibleForOtherDependentCredit) {
      diags.push(
        err(
          DiagnosticCodes.DEPENDENT_CONFLICT,
          `Dependent ${i + 1} cannot be eligible for both the CTC and the ODC`,
          `/dependents/${i}`,
        ),
      );
    }
    if (dep.qualifiesAsQualifyingChild && dep.providedOwnSupport) {
      diags.push(
        err(
          DiagnosticCodes.DEPENDENT_CONFLICT,
          `Dependent ${i + 1} cannot be a qualifying child while providing more than half of their own support`,
          `/dependents/${i}`,
        ),
      );
    }
  });

  // W-2 sanity: withholding above 50% of wages is almost always a data-entry error.
  model.w2s.forEach((w2, i) => {
    if (w2.wages > 0 && w2.federalWithholding > multiplyRate(w2.wages, 0.5)) {
      diags.push(
        warn(
          DiagnosticCodes.W2_WITHHOLDING_SUSPICIOUS,
          `W-2 ${i + 1} (${w2.employerName}): federal withholding exceeds 50% of wages — verify boxes 1 and 2`,
          `/w2s/${i}`,
        ),
      );
    }
  });

  // 1099-R with undetermined taxable amount must be resolved by the preparer.
  model.retirement.forEach((r, i) => {
    if (r.taxableAmountNotDetermined) {
      diags.push(
        err(
          DiagnosticCodes.RETIREMENT_TAXABLE_UNRESOLVED,
          `1099-R ${i + 1} (${r.payerName}): taxable amount not determined — preparer must resolve box 2a before filing`,
          `/retirement/${i}`,
        ),
      );
    }
  });

  // Unsupported self-employment complexity.
  model.selfEmployment.forEach((se, i) => {
    if (se.requiresComplexSchedule) {
      diags.push(
        err(
          DiagnosticCodes.UNSUPPORTED_COMPLEX_SCHEDULE_C,
          `Business "${se.businessName}" requires inventory, depreciation, employees, or accrual accounting — not supported in this release`,
          `/selfEmployment/${i}`,
        ),
      );
    }
    if (se.totalExpenses > se.grossReceipts) {
      diags.push(
        err(
          DiagnosticCodes.UNSUPPORTED_SITUATION,
          `Business "${se.businessName}" reports a net loss — Schedule C losses are not supported in this release`,
          `/selfEmployment/${i}`,
        ),
      );
    }
  });

  // Itemized components we cannot yet support.
  if (model.itemized) {
    if (model.itemized.mortgageOverLimit) {
      diags.push(
        err(
          DiagnosticCodes.UNSUPPORTED_ITEMIZED_COMPONENT,
          "Mortgage principal above the interest-deduction limit requires the Form 936 worksheet — not supported in this release",
          "/itemized/mortgageOverLimit",
        ),
      );
    }
    if (model.itemized.charitableNonCash > 500 * 100) {
      diags.push(
        err(
          DiagnosticCodes.UNSUPPORTED_ITEMIZED_COMPONENT,
          "Non-cash charitable contributions over $500 require Form 8283 — not supported in this release",
          "/itemized/charitableNonCash",
        ),
      );
    }
  }

  // Marketplace insurance requires premium tax credit reconciliation (Form 8962), unsupported.
  if (model.preparerFlags.includes("HAS_1095_A")) {
    diags.push(
      err(
        DiagnosticCodes.MISSING_1095A_RECONCILIATION,
        "Marketplace insurance (Form 1095-A) requires premium tax credit reconciliation — not supported in this release",
        "/preparerFlags",
      ),
    );
  }

  // Banking
  if (
    model.payments.refundMethod === "DIRECT_DEPOSIT" ||
    model.payments.balanceDueMethod === "DIRECT_DEBIT"
  ) {
    if (!model.payments.bankAccount) {
      diags.push(
        err(
          DiagnosticCodes.DIRECT_DEPOSIT_MISSING_BANK,
          "Direct deposit/debit selected but no bank account is on file",
          "/payments/bankAccount",
        ),
      );
    } else if (!model.payments.bankAccount.routingNumberValid) {
      diags.push(
        err(
          DiagnosticCodes.BANK_ROUTING_INVALID,
          "Bank routing number failed validation",
          "/payments/bankAccount",
        ),
      );
    }
  }

  // MFS Social Security is unsupported (living-apart rules need extra data).
  if (
    model.filingStatus === "MARRIED_FILING_SEPARATELY" &&
    model.socialSecurity.some((s) => s.netBenefits > 0)
  ) {
    diags.push(
      err(
        DiagnosticCodes.UNSUPPORTED_SITUATION,
        "Social Security benefits with married-filing-separately status are not supported in this release",
        "/socialSecurity",
      ),
    );
  }

  // SALT cap phase-down for very high incomes is unsupported for 2025.
  const wages = model.w2s.reduce((s, w) => s + w.wages, 0);
  if (model.itemized && wages > 500_000 * 100) {
    diags.push(
      err(
        DiagnosticCodes.UNSUPPORTED_SITUATION,
        "Itemized SALT deduction with income above $500,000 requires the SALT-cap phase-down computation — not supported in this release",
        "/itemized",
      ),
    );
  }

  // Schedule B informational requirement.
  const totalInterest = model.interest.reduce(
    (s, x) => s + x.taxableInterest + x.usGovernmentInterest,
    0,
  );
  const totalDividends = model.dividends.reduce((s, x) => s + x.ordinaryDividends, 0);
  if (totalInterest > config.scheduleBThreshold || totalDividends > config.scheduleBThreshold) {
    diags.push(
      info(
        DiagnosticCodes.SCHEDULE_B_REQUIRED,
        "Interest or dividends exceed $1,500 — Schedule B payer detail will be included",
      ),
    );
  }

  return diags;
}
