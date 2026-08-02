import { describe, expect, it } from "vitest";
import { fixtureChild, fixtureW2, mfjFamilyReturn, singleW2Return } from "@ghimtech/testing";
import { hasBlockingDiagnostics } from "@ghimtech/tax-domain";
import { calculateFederal } from "./engine.js";

const D = 100;

describe("federal engine — single W-2 filer (2025)", () => {
  const result = calculateFederal(singleW2Return());

  it("computes AGI and taxable income", () => {
    expect(result.wages).toBe(60_000 * D);
    expect(result.adjustedGrossIncome).toBe(60_000 * D);
    expect(result.standardDeduction).toBe(15_750 * D);
    expect(result.taxableIncome).toBe(44_250 * D);
  });

  it("computes tax from the tax-table emulation", () => {
    // Midpoint 44,275: 10% × 11,925 + 12% × 32,350 = 5,074.50 → $5,075
    expect(result.incomeTax).toBe(5_075 * D);
  });

  it("produces a refund when withholding exceeds tax", () => {
    expect(result.totalTax).toBe(5_075 * D);
    expect(result.federalWithholding).toBe(6_000 * D);
    expect(result.refund).toBe(925 * D);
    expect(result.balanceDue).toBe(0);
  });

  it("is deterministic and fully traced", () => {
    const again = calculateFederal(singleW2Return());
    expect(again).toEqual(result);
    const agiTrace = result.trace.entries.find((e) => e.lineId === "federal.1040.line11.agi");
    expect(agiTrace).toBeDefined();
    expect(agiTrace!.ruleVersion).toBe("2025.1");
    expect(agiTrace!.taxYear).toBe(2025);
    expect(agiTrace!.sourceModule).toBe("@ghimtech/tax-engine-federal");
  });

  it("has no blocking diagnostics", () => {
    expect(hasBlockingDiagnostics(result.diagnostics)).toBe(false);
  });
});

describe("federal engine — married filing jointly with children (2025)", () => {
  const result = calculateFederal(mfjFamilyReturn());

  it("computes joint income and deduction", () => {
    expect(result.wages).toBe(115_000 * D);
    expect(result.standardDeduction).toBe(31_500 * D);
    expect(result.taxableIncome).toBe(83_500 * D);
  });

  it("computes tax and full child tax credit", () => {
    // Midpoint 83,525 MFJ: 10% × 23,850 + 12% × 59,675 = 9,546
    expect(result.incomeTax).toBe(9_546 * D);
    expect(result.qualifyingChildrenCount).toBe(2);
    expect(result.childTaxCredit).toBe(4_400 * D);
    expect(result.additionalChildTaxCredit).toBe(0);
    expect(result.totalTax).toBe((9_546 - 4_400) * D);
  });

  it("produces the correct refund", () => {
    expect(result.federalWithholding).toBe(11_500 * D);
    expect(result.refund).toBe((11_500 - 5_146) * D);
  });
});

describe("federal engine — head of household EITC + ACTC (2025)", () => {
  const model = singleW2Return({
    filingStatus: "HEAD_OF_HOUSEHOLD",
    dependents: [fixtureChild()],
    w2s: [fixtureW2({ wages: 25_000 * D, federalWithholding: 500 * D })],
  });
  const result = calculateFederal(model);

  it("computes the small residual tax", () => {
    expect(result.standardDeduction).toBe(23_625 * D);
    expect(result.taxableIncome).toBe(1_375 * D);
    // Midpoint 1,387.50 × 10% = 138.75 → $139
    expect(result.incomeTax).toBe(139 * D);
  });

  it("computes EITC from the table emulation", () => {
    // 1 child, mid 25,025: 4,328 − (25,025 − 23,350) × 15.98% = 4,060.33 → $4,060
    expect(result.earnedIncomeCredit).toBe(4_060 * D);
  });

  it("limits nonrefundable CTC to tax and pays ACTC up to the refundable cap", () => {
    expect(result.childTaxCredit).toBe(139 * D);
    expect(result.additionalChildTaxCredit).toBe(1_700 * D);
    expect(result.totalTax).toBe(0);
  });

  it("total payments include refundable credits", () => {
    expect(result.totalPayments).toBe((500 + 4_060 + 1_700) * D);
    expect(result.refund).toBe((500 + 4_060 + 1_700) * D);
  });
});

describe("federal engine — self-employment (2025)", () => {
  const model = singleW2Return({
    w2s: [],
    selfEmployment: [
      {
        id: "se-1",
        businessName: "Synthetic Consulting",
        description: "Consulting",
        grossReceipts: 30_000 * D,
        totalExpenses: 5_000 * D,
        requiresComplexSchedule: false,
        belongsToSpouse: false,
      },
    ],
  });
  const result = calculateFederal(model);

  it("computes SE tax and the half-SE-tax deduction", () => {
    expect(result.businessNetProfit).toBe(25_000 * D);
    // Net earnings 25,000 × 0.9235 = 23,087.50 → 23,088
    // SS 12.4% = 2,863; Medicare 2.9% = 670 → 3,533
    expect(result.selfEmploymentTax).toBe(3_533 * D);
    expect(result.seTaxDeduction).toBe(1_767 * D);
    expect(result.adjustedGrossIncome).toBe((25_000 - 1_767) * D);
  });

  it("applies the simplified QBI deduction", () => {
    // Taxable before QBI: 23,233 − 15,750 = 7,483; QBI deduction 20% = 1,497
    expect(result.qbiDeduction).toBe(1_497 * D);
    expect(result.taxableIncome).toBe(5_986 * D);
  });

  it("computes a balance due with no withholding", () => {
    // Tax at midpoint 5,975 × 10% = 598 (rounded)
    expect(result.incomeTax).toBe(598 * D);
    expect(result.totalTax).toBe((598 + 3_533) * D);
    expect(result.balanceDue).toBe((598 + 3_533) * D);
    expect(result.refund).toBe(0);
  });

  it("denies EITC above the phase-out (no qualifying children)", () => {
    expect(result.earnedIncomeCredit).toBe(0);
  });
});

describe("federal engine — qualified dividends preferential rates (2025)", () => {
  const model = singleW2Return({
    dividends: [
      {
        id: "div-1",
        payerName: "Synthetic Brokerage",
        ordinaryDividends: 10_000 * D,
        qualifiedDividends: 10_000 * D,
        capitalGainDistributions: 0,
        federalWithholding: 0,
        belongsToSpouse: false,
      },
    ],
  });
  const result = calculateFederal(model);

  it("taxes qualified dividends at 15% when above the 0% breakpoint", () => {
    // Taxable income 54,250; ordinary portion 44,250 → same $5,075 as base case;
    // 0% up to 48,350: qualified 4,100 at 0%, remaining 5,900 at 15% = 885.
    expect(result.taxableIncome).toBe(54_250 * D);
    expect(result.incomeTax).toBe((5_075 + 885) * D);
  });
});

describe("federal engine — diagnostics and blocking", () => {
  it("blocks unresolved 1099-R taxable amounts", () => {
    const model = singleW2Return({
      retirement: [
        {
          id: "r-1",
          payerName: "Synthetic Pension Trust",
          grossDistribution: 20_000 * D,
          taxableAmount: 0,
          taxableAmountNotDetermined: true,
          federalWithholding: 0,
          distributionCode: "7",
          isIra: false,
          paEligiblePlan: true,
          stateWithholding: 0,
          belongsToSpouse: false,
        },
      ],
    });
    const result = calculateFederal(model);
    expect(hasBlockingDiagnostics(result.diagnostics)).toBe(true);
    expect(result.diagnostics.some((d) => d.code === "RETIREMENT_TAXABLE_UNRESOLVED")).toBe(true);
  });

  it("blocks Schedule C losses as unsupported", () => {
    const model = singleW2Return({
      selfEmployment: [
        {
          id: "se-1",
          businessName: "Lossy LLC",
          description: "test",
          grossReceipts: 1_000 * D,
          totalExpenses: 5_000 * D,
          requiresComplexSchedule: false,
          belongsToSpouse: false,
        },
      ],
    });
    const result = calculateFederal(model);
    expect(hasBlockingDiagnostics(result.diagnostics)).toBe(true);
  });

  it("blocks missing spouse on a joint return", () => {
    const model = mfjFamilyReturn({ spouse: undefined });
    const result = calculateFederal(model);
    expect(
      result.diagnostics.some((d) => d.code === "MISSING_SPOUSE" && d.severity === "ERROR"),
    ).toBe(true);
  });

  it("blocks direct deposit without a bank account", () => {
    const base = singleW2Return();
    base.payments.refundMethod = "DIRECT_DEPOSIT";
    const result = calculateFederal(base);
    expect(result.diagnostics.some((d) => d.code === "DIRECT_DEPOSIT_MISSING_BANK")).toBe(true);
  });

  it("applies the early distribution penalty", () => {
    const model = singleW2Return({
      retirement: [
        {
          id: "r-1",
          payerName: "Synthetic 401k",
          grossDistribution: 10_000 * D,
          taxableAmount: 10_000 * D,
          taxableAmountNotDetermined: false,
          federalWithholding: 2_000 * D,
          distributionCode: "1",
          isIra: false,
          paEligiblePlan: false,
          stateWithholding: 0,
          belongsToSpouse: false,
        },
      ],
    });
    const result = calculateFederal(model);
    expect(result.earlyDistributionTax).toBe(1_000 * D);
  });

  it("rejects unsupported tax years", () => {
    expect(() => calculateFederal(singleW2Return({ taxYear: 2023 }))).toThrow(/not supported/i);
  });
});

describe("federal engine — social security worksheet (2025)", () => {
  it("taxes up to 85% for higher incomes and 0% below the base", () => {
    const highIncome = singleW2Return({
      socialSecurity: [
        { id: "ssa-1", netBenefits: 20_000 * D, federalWithholding: 0, belongsToSpouse: false },
      ],
    });
    const high = calculateFederal(highIncome);
    // Provisional = 60,000 + 10,000 = 70,000 → well over adjusted base → 85% cap
    expect(high.socialSecurityTaxable).toBe(17_000 * D);

    const lowIncome = singleW2Return({
      w2s: [fixtureW2({ wages: 10_000 * D, federalWithholding: 0 })],
      socialSecurity: [
        { id: "ssa-1", netBenefits: 12_000 * D, federalWithholding: 0, belongsToSpouse: false },
      ],
    });
    const low = calculateFederal(lowIncome);
    // Provisional = 10,000 + 6,000 = 16,000 ≤ 25,000 → none taxable
    expect(low.socialSecurityTaxable).toBe(0);
  });
});
