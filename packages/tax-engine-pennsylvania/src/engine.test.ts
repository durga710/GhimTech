import { describe, expect, it } from "vitest";
import { fixtureW2, singleW2Return } from "@ghimtech/testing";
import { hasBlockingDiagnostics } from "@ghimtech/tax-domain";
import { calculatePennsylvania } from "./engine.js";

const D = 100;

describe("PA engine — full-year resident W-2 (2025)", () => {
  const result = calculatePennsylvania(singleW2Return());

  it("taxes compensation at the flat 3.07% rate", () => {
    expect(result.compensation).toBe(60_000 * D);
    expect(result.totalTaxableIncome).toBe(60_000 * D);
    expect(result.taxLiability).toBe(1_842 * D);
  });

  it("credits PA withholding and balances to zero", () => {
    expect(result.withholding).toBe(1_842 * D);
    expect(result.refund).toBe(0);
    expect(result.balanceDue).toBe(0);
  });

  it("denies tax forgiveness at this income", () => {
    expect(result.forgivenessPercentage).toBe(0);
    expect(result.taxForgiveness).toBe(0);
  });

  it("is deterministic and traced with the PA rule version", () => {
    const again = calculatePennsylvania(singleW2Return());
    expect(again).toEqual(result);
    const taxTrace = result.trace.entries.find((e) => e.lineId === "pa.pa40.line12.tax");
    expect(taxTrace?.ruleVersion).toBe("2025.1");
    expect(taxTrace?.sourceModule).toBe("@ghimtech/tax-engine-pennsylvania");
  });

  it("has no blocking diagnostics", () => {
    expect(hasBlockingDiagnostics(result.diagnostics)).toBe(false);
  });
});

describe("PA engine — Schedule SP tax forgiveness", () => {
  it("grants partial forgiveness just over the limit", () => {
    const model = singleW2Return({
      w2s: [fixtureW2({ wages: 8_000 * D, federalWithholding: 0, stateWithholding: 0 })],
    });
    const result = calculatePennsylvania(model);
    // Tax: 8,000 × 3.07% = 245.60 → $246
    expect(result.taxLiability).toBe(246 * D);
    // Eligibility 8,000 vs limit 6,500 → over 1,500 → 6 steps of $250 → 40% forgiveness
    expect(result.forgivenessPercentage).toBe(0.4);
    expect(result.taxForgiveness).toBe(98 * D); // 40% × 246 = 98.4 → 98
    expect(result.taxAfterForgiveness).toBe(148 * D);
  });

  it("grants 100% forgiveness under the limit with dependents", () => {
    const base = singleW2Return({
      filingStatus: "MARRIED_FILING_JOINTLY",
      w2s: [fixtureW2({ wages: 20_000 * D, federalWithholding: 0, stateWithholding: 614 * D })],
    });
    base.dependents = [
      {
        name: { firstName: "Riley", lastName: "Testcase" },
        ssnRef: "fixture-ssn-child",
        ssnLast4: "0003",
        dateOfBirth: "2018-04-10",
        relationship: "DAUGHTER",
        monthsLivedWithTaxpayer: 12,
        isStudent: false,
        isPermanentlyDisabled: false,
        providedOwnSupport: false,
        qualifiesAsQualifyingChild: true,
        eligibleForChildTaxCredit: true,
        eligibleForOtherDependentCredit: false,
        eitcQualifyingChild: true,
        qualifiesForDependentCare: false,
      },
    ];
    const result = calculatePennsylvania(base);
    // Limit: 6,500 + 6,500 + 9,500 = 22,500 ≥ 20,000 → 100%
    expect(result.forgivenessPercentage).toBe(1);
    expect(result.taxAfterForgiveness).toBe(0);
    expect(result.refund).toBe(614 * D);
  });
});

describe("PA engine — class rules and diagnostics", () => {
  it("excludes US government interest and includes capital gain distributions as dividends", () => {
    const model = singleW2Return({
      interest: [
        {
          id: "int-1",
          payerName: "Synthetic Bank",
          taxableInterest: 800 * D,
          usGovernmentInterest: 500 * D,
          taxExemptInterest: 0,
          federalWithholding: 0,
          belongsToSpouse: false,
        },
      ],
      dividends: [
        {
          id: "div-1",
          payerName: "Synthetic Funds",
          ordinaryDividends: 1_000 * D,
          qualifiedDividends: 800 * D,
          capitalGainDistributions: 200 * D,
          federalWithholding: 0,
          belongsToSpouse: false,
        },
      ],
    });
    const result = calculatePennsylvania(model);
    expect(result.interest).toBe(800 * D);
    expect(result.dividends).toBe(1_200 * D);
  });

  it("does not tax unemployment or social security", () => {
    const model = singleW2Return({
      unemployment: [
        {
          id: "u-1",
          payerName: "PA UC",
          compensation: 5_000 * D,
          federalWithholding: 0,
          belongsToSpouse: false,
        },
      ],
      socialSecurity: [
        { id: "ssa-1", netBenefits: 15_000 * D, federalWithholding: 0, belongsToSpouse: false },
      ],
    });
    const result = calculatePennsylvania(model);
    expect(result.totalTaxableIncome).toBe(60_000 * D);
  });

  it("blocks part-year residency as unsupported for filing", () => {
    const model = singleW2Return();
    model.pennsylvania!.residencyStatus = "PART_YEAR_RESIDENT";
    const result = calculatePennsylvania(model);
    expect(hasBlockingDiagnostics(result.diagnostics)).toBe(true);
    expect(result.diagnostics.some((d) => d.code === "UNSUPPORTED_PA_RESIDENCY")).toBe(true);
  });

  it("blocks multi-state W-2s", () => {
    const model = singleW2Return({ w2s: [fixtureW2({ stateCode: "NJ" })] });
    const result = calculatePennsylvania(model);
    expect(
      result.diagnostics.some((d) => d.code === "PA_W2_STATE_MISMATCH" && d.severity === "ERROR"),
    ).toBe(true);
  });

  it("blocks non-eligible retirement plan distributions", () => {
    const model = singleW2Return({
      retirement: [
        {
          id: "r-1",
          payerName: "Synthetic Annuity",
          grossDistribution: 10_000 * D,
          taxableAmount: 10_000 * D,
          taxableAmountNotDetermined: false,
          federalWithholding: 0,
          distributionCode: "7",
          isIra: false,
          paEligiblePlan: false,
          stateWithholding: 0,
          belongsToSpouse: false,
        },
      ],
    });
    const result = calculatePennsylvania(model);
    expect(hasBlockingDiagnostics(result.diagnostics)).toBe(true);
  });

  it("warns when the PSD code is missing", () => {
    const model = singleW2Return();
    model.pennsylvania!.psdCode = undefined;
    const result = calculatePennsylvania(model);
    expect(result.diagnostics.some((d) => d.code === "PA_LOCAL_TAX_INFO_MISSING")).toBe(true);
  });

  it("supports a PA balance due", () => {
    const model = singleW2Return({
      w2s: [fixtureW2({ stateWithholding: 1_000 * D })],
    });
    const result = calculatePennsylvania(model);
    expect(result.balanceDue).toBe(842 * D);
    expect(result.refund).toBe(0);
  });
});
