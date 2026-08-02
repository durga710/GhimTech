/**
 * Form mappers: normalized model + engine results → structured form documents.
 */
import { maskSsn } from "@ghimtech/security";
import type { PersonName, TaxReturnModel } from "@ghimtech/tax-domain";
import type { FederalCalculationResult } from "@ghimtech/tax-engine-federal";
import type { PaCalculationResult } from "@ghimtech/tax-engine-pennsylvania";
import type { FormDocument, FormLine, ReturnPackage, Watermark } from "./types.js";
import { snapshotHash, type CalculationSnapshot } from "./snapshot.js";

function fullName(name: PersonName): string {
  return [name.firstName, name.middleInitial, name.lastName, name.suffix].filter(Boolean).join(" ");
}

function dollars(cents: number): number {
  return Math.round(cents / 100);
}

const FILING_STATUS_LABELS: Record<TaxReturnModel["filingStatus"], string> = {
  SINGLE: "Single",
  MARRIED_FILING_JOINTLY: "Married filing jointly",
  MARRIED_FILING_SEPARATELY: "Married filing separately",
  HEAD_OF_HOUSEHOLD: "Head of household",
  QUALIFYING_SURVIVING_SPOUSE: "Qualifying surviving spouse",
};

export function buildForm1040(
  model: TaxReturnModel,
  result: FederalCalculationResult,
  watermark: Watermark,
): FormDocument {
  const income: FormLine[] = [
    {
      line: "1a",
      label: "Total wages (Form W-2 box 1)",
      value: dollars(result.wages),
      traceLineId: "federal.1040.line1a.wages",
    },
    { line: "2a", label: "Tax-exempt interest", value: dollars(result.taxExemptInterest) },
    {
      line: "2b",
      label: "Taxable interest",
      value: dollars(result.taxableInterest),
      traceLineId: "federal.1040.line2b.taxableInterest",
    },
    { line: "3a", label: "Qualified dividends", value: dollars(result.qualifiedDividends) },
    {
      line: "3b",
      label: "Ordinary dividends",
      value: dollars(result.ordinaryDividends),
      traceLineId: "federal.1040.line3b.ordinaryDividends",
    },
    {
      line: "4a/5a",
      label: "Pension and IRA distributions",
      value: dollars(result.retirementGross),
    },
    { line: "4b/5b", label: "Taxable amount", value: dollars(result.retirementTaxable) },
    {
      line: "6a",
      label: "Social Security benefits",
      value: dollars(result.socialSecurityBenefits),
    },
    {
      line: "6b",
      label: "Taxable Social Security",
      value: dollars(result.socialSecurityTaxable),
      traceLineId: "federal.1040.line6b.taxableSocialSecurity",
    },
    {
      line: "7",
      label: "Capital gain distributions",
      value: dollars(result.capitalGainDistributions),
    },
    {
      line: "8",
      label: "Additional income (Schedule 1: business, unemployment)",
      value: dollars(result.businessNetProfit + result.unemploymentCompensation),
    },
    {
      line: "9",
      label: "Total income",
      value: dollars(result.totalIncome),
      traceLineId: "federal.1040.line9.totalIncome",
    },
    { line: "10", label: "Adjustments to income", value: dollars(result.totalAdjustments) },
    {
      line: "11",
      label: "Adjusted gross income",
      value: dollars(result.adjustedGrossIncome),
      traceLineId: "federal.1040.line11.agi",
    },
  ];

  const taxAndCredits: FormLine[] = [
    {
      line: "12",
      label:
        result.deductionTaken === "STANDARD"
          ? "Standard deduction"
          : "Itemized deductions (Schedule A)",
      value: dollars(result.deduction),
      traceLineId: "federal.1040.line12.standardDeduction",
    },
    {
      line: "13",
      label: "Qualified business income deduction",
      value: dollars(result.qbiDeduction),
    },
    {
      line: "15",
      label: "Taxable income",
      value: dollars(result.taxableIncome),
      traceLineId: "federal.1040.line15.taxableIncome",
    },
    {
      line: "16",
      label: "Tax",
      value: dollars(result.incomeTax),
      traceLineId: "federal.1040.line16.tax",
    },
    {
      line: "19",
      label: "Child tax credit / credit for other dependents",
      value: dollars(result.childTaxCredit + result.otherDependentCredit),
      traceLineId: "federal.8812.ctc",
    },
    {
      line: "20",
      label: "Other nonrefundable credits (Schedule 3)",
      value: dollars(result.dependentCareCredit + result.educationCreditsNonrefundable),
    },
    {
      line: "22",
      label: "Tax after credits",
      value: dollars(Math.max(0, result.incomeTax - result.totalNonrefundableCredits)),
    },
    {
      line: "23",
      label: "Other taxes (SE tax, additional Medicare, NIIT, early distributions)",
      value: dollars(
        result.selfEmploymentTax +
          result.additionalMedicareTax +
          result.netInvestmentIncomeTax +
          result.earlyDistributionTax,
      ),
    },
    {
      line: "24",
      label: "Total tax",
      value: dollars(result.totalTax),
      traceLineId: "federal.1040.line22.totalTax",
    },
  ];

  const payments: FormLine[] = [
    { line: "25", label: "Federal income tax withheld", value: dollars(result.federalWithholding) },
    {
      line: "26",
      label: "Estimated payments and prior-year overpayment applied",
      value: dollars(result.estimatedPayments),
    },
    {
      line: "27",
      label: "Earned income credit",
      value: dollars(result.earnedIncomeCredit),
      traceLineId: "federal.1040.line27.eitc",
    },
    {
      line: "28",
      label: "Additional child tax credit",
      value: dollars(result.additionalChildTaxCredit),
    },
    {
      line: "29",
      label: "American opportunity credit (refundable portion)",
      value: dollars(result.aotcRefundable),
    },
    {
      line: "33",
      label: "Total payments",
      value: dollars(result.totalPayments),
      traceLineId: "federal.1040.line33.totalPayments",
    },
  ];

  const bottomLine: FormLine[] =
    result.refund > 0
      ? [
          {
            line: "34",
            label: "Overpayment",
            value: dollars(result.refund),
            traceLineId: "federal.1040.line34.refund",
          },
          {
            line: "35a",
            label:
              model.payments.refundMethod === "DIRECT_DEPOSIT"
                ? `Refund by direct deposit to account ending ${model.payments.bankAccount?.accountLast4 ?? "----"}`
                : "Refund by check",
            value: dollars(result.refund),
          },
        ]
      : [
          {
            line: "37",
            label: "Amount you owe",
            value: dollars(result.balanceDue),
            traceLineId: "federal.1040.line37.balanceDue",
          },
        ];

  return {
    formId: "1040",
    title: `Form 1040 — U.S. Individual Income Tax Return (${model.taxYear})`,
    taxYear: model.taxYear,
    ruleVersion: result.ruleVersion,
    watermark,
    taxpayerName: fullName(model.taxpayer.name),
    taxpayerTinMasked: maskSsn(model.taxpayer.ssnLast4),
    spouseName: model.spouse ? fullName(model.spouse.name) : undefined,
    spouseTinMasked: model.spouse ? maskSsn(model.spouse.ssnLast4) : undefined,
    sections: [
      {
        title: "Filing information",
        lines: [
          { line: "-", label: "Filing status", text: FILING_STATUS_LABELS[model.filingStatus] },
          { line: "-", label: "Dependents", value: model.dependents.length },
        ],
      },
      { title: "Income", lines: income },
      { title: "Tax and credits", lines: taxAndCredits },
      { title: "Payments", lines: payments },
      { title: result.refund > 0 ? "Refund" : "Amount you owe", lines: bottomLine },
    ],
  };
}

export function buildPa40(
  model: TaxReturnModel,
  result: PaCalculationResult,
  watermark: Watermark,
): FormDocument {
  return {
    formId: "PA-40",
    title: `PA-40 — Pennsylvania Income Tax Return (${model.taxYear})`,
    taxYear: model.taxYear,
    ruleVersion: result.ruleVersion,
    watermark,
    taxpayerName: fullName(model.taxpayer.name),
    taxpayerTinMasked: maskSsn(model.taxpayer.ssnLast4),
    spouseName: model.spouse ? fullName(model.spouse.name) : undefined,
    spouseTinMasked: model.spouse ? maskSsn(model.spouse.ssnLast4) : undefined,
    sections: [
      {
        title: "Residency",
        lines: [
          {
            line: "-",
            label: "Residency status",
            text: model.pennsylvania?.residencyStatus ?? "UNKNOWN",
          },
          { line: "-", label: "School district", text: model.pennsylvania?.schoolDistrict ?? "" },
          { line: "-", label: "PSD code", text: model.pennsylvania?.psdCode ?? "" },
        ],
      },
      {
        title: "Income classes",
        lines: [
          {
            line: "1a",
            label: "Gross compensation",
            value: dollars(result.compensation),
            traceLineId: "pa.pa40.line1a.compensation",
          },
          {
            line: "2",
            label: "Interest income",
            value: dollars(result.interest),
            traceLineId: "pa.pa40.line2.interest",
          },
          {
            line: "3",
            label: "Dividend income",
            value: dollars(result.dividends),
            traceLineId: "pa.pa40.line3.dividends",
          },
          {
            line: "4",
            label: "Net income from business",
            value: dollars(result.businessIncome),
            traceLineId: "pa.pa40.line4.businessIncome",
          },
          { line: "5", label: "Net gains from sale of property", value: dollars(result.netGains) },
          {
            line: "9",
            label: "Total PA taxable income",
            value: dollars(result.totalTaxableIncome),
            traceLineId: "pa.pa40.line9.totalIncome",
          },
        ],
      },
      {
        title: "Tax and forgiveness",
        lines: [
          {
            line: "12",
            label: "PA tax liability (3.07%)",
            value: dollars(result.taxLiability),
            traceLineId: "pa.pa40.line12.tax",
          },
          {
            line: "19a",
            label: "Tax forgiveness credit (Schedule SP)",
            value: dollars(result.taxForgiveness),
            traceLineId: "pa.scheduleSP.forgiveness",
          },
          { line: "-", label: "Tax after forgiveness", value: dollars(result.taxAfterForgiveness) },
        ],
      },
      {
        title: "Payments and balance",
        lines: [
          { line: "13", label: "PA tax withheld", value: dollars(result.withholding) },
          {
            line: "14-17",
            label: "Estimated payments and credits",
            value: dollars(result.estimatedPayments),
          },
          {
            line: "24",
            label: "Total payments",
            value: dollars(result.totalPayments),
            traceLineId: "pa.pa40.line24.totalPayments",
          },
          ...(result.refund > 0
            ? [{ line: "30", label: "Refund", value: dollars(result.refund) }]
            : [{ line: "28", label: "Balance due", value: dollars(result.balanceDue) }]),
        ],
      },
    ],
  };
}

/** The filing-authorization document the client signs (Form 8879 analogue for provider filing). */
export function buildAuthorizationDocument(
  model: TaxReturnModel,
  federal: FederalCalculationResult,
  pennsylvania: PaCalculationResult | undefined,
  hash: string,
): FormDocument {
  const lines: FormLine[] = [
    {
      line: "1",
      label: "Federal adjusted gross income",
      value: dollars(federal.adjustedGrossIncome),
    },
    { line: "2", label: "Federal total tax", value: dollars(federal.totalTax) },
    {
      line: "3",
      label: federal.refund > 0 ? "Federal refund" : "Federal balance due",
      value: dollars(federal.refund > 0 ? federal.refund : federal.balanceDue),
    },
  ];
  if (pennsylvania) {
    lines.push(
      { line: "4", label: "PA taxable income", value: dollars(pennsylvania.totalTaxableIncome) },
      {
        line: "5",
        label: pennsylvania.refund > 0 ? "PA refund" : "PA balance due",
        value: dollars(pennsylvania.refund > 0 ? pennsylvania.refund : pennsylvania.balanceDue),
      },
    );
  }
  lines.push({ line: "-", label: "Return snapshot hash", text: hash });
  return {
    formId: "GHIMTECH-AUTH",
    title: `E-file Authorization (${model.taxYear})`,
    taxYear: model.taxYear,
    ruleVersion: federal.ruleVersion,
    watermark: "FILING_COPY",
    taxpayerName: fullName(model.taxpayer.name),
    taxpayerTinMasked: maskSsn(model.taxpayer.ssnLast4),
    spouseName: model.spouse ? fullName(model.spouse.name) : undefined,
    spouseTinMasked: model.spouse ? maskSsn(model.spouse.ssnLast4) : undefined,
    sections: [
      { title: "Amounts you are authorizing for electronic filing", lines },
      {
        title: "Declaration",
        lines: [
          {
            line: "-",
            label:
              "Under penalties of perjury, I declare that I have examined this return and accompanying schedules and, to the best of my knowledge and belief, they are true, correct, and complete. I authorize GhimTech to transmit this return to the applicable agencies through its authorized e-file provider.",
            text: "",
          },
        ],
      },
    ],
  };
}

/** Assemble the full package for a given audience. */
export function buildReturnPackage(
  snapshot: CalculationSnapshot,
  watermark: Watermark,
): ReturnPackage {
  const hash = snapshotHash(snapshot);
  const documents: FormDocument[] = [buildForm1040(snapshot.model, snapshot.federal, watermark)];
  if (snapshot.pennsylvania) {
    documents.push(buildPa40(snapshot.model, snapshot.pennsylvania, watermark));
  }
  documents.push(
    buildAuthorizationDocument(snapshot.model, snapshot.federal, snapshot.pennsylvania, hash),
  );
  return { snapshotHash: hash, watermark, documents };
}
