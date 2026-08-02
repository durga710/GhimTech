/**
 * Source-document and totals rules.
 *
 * A W-2 carries its own arithmetic — the FICA boxes are a fixed percentage of
 * the wage boxes — so most data-entry slips can be caught from the document
 * alone, without reference to anything else on the return. Those checks are
 * deliberately graded: a few dollars of drift is how payroll rounding looks,
 * while a large gap is a transposed figure.
 */
import {
  MEDICARE_RATE,
  SOCIAL_SECURITY_RATE,
  SOCIAL_SECURITY_WAGE_BASE,
  WITHHOLDING_TOLERANCE,
} from '../../constants/ty2025.js';
import { isValidEin } from '../../identifiers.js';
import { applyRate, difference, formatMoney, isValidMoney, sumMoney } from '../../money.js';
import type { Money } from '../../money.js';
import type { DiagnosticFinding, DiagnosticRule } from '../types.js';
import type { FederalReturn, FormW2 } from '../../types.js';

/** Beyond this proportion of the expected figure, drift is not rounding. */
const MATERIAL_VARIANCE = 0.05;

/** Withholding above this share of wages is unusual enough to mention. */
const HIGH_WITHHOLDING_RATIO = 0.6;

function w2Label(w2: FormW2, index: number): string {
  const name = w2.employerName.trim();
  return name.length > 0 ? name : `W-2 #${index + 1}`;
}

function w2Path(index: number, field: string): string {
  return `income.w2s[${index}].${field}`;
}

/** Every monetary box on a W-2, paired with its field path and box label. */
function w2Amounts(w2: FormW2): ReadonlyArray<{ field: string; label: string; value: Money }> {
  const entries: Array<{ field: string; label: string; value: Money | undefined }> = [
    { field: 'wages', label: 'box 1 wages', value: w2.wages },
    {
      field: 'federalIncomeTaxWithheld',
      label: 'box 2 federal withholding',
      value: w2.federalIncomeTaxWithheld,
    },
    {
      field: 'socialSecurityWages',
      label: 'box 3 Social Security wages',
      value: w2.socialSecurityWages,
    },
    {
      field: 'socialSecurityTaxWithheld',
      label: 'box 4 Social Security tax',
      value: w2.socialSecurityTaxWithheld,
    },
    { field: 'medicareWages', label: 'box 5 Medicare wages', value: w2.medicareWages },
    { field: 'medicareTaxWithheld', label: 'box 6 Medicare tax', value: w2.medicareTaxWithheld },
    { field: 'socialSecurityTips', label: 'box 7 Social Security tips', value: w2.socialSecurityTips },
    { field: 'allocatedTips', label: 'box 8 allocated tips', value: w2.allocatedTips },
    {
      field: 'dependentCareBenefits',
      label: 'box 10 dependent care benefits',
      value: w2.dependentCareBenefits,
    },
    { field: 'nonqualifiedPlans', label: 'box 11 nonqualified plans', value: w2.nonqualifiedPlans },
  ];
  return entries.flatMap((entry) =>
    entry.value === undefined
      ? []
      : [{ field: entry.field, label: entry.label, value: entry.value }],
  );
}

/** Total federal withholding reported across every source document. */
export function documentWithholding(ret: FederalReturn): Money {
  const { income, payments } = ret;
  return sumMoney([
    ...income.w2s.map((w2) => w2.federalIncomeTaxWithheld),
    ...(income.form1099Int ?? []).map((doc) => doc.federalIncomeTaxWithheld),
    ...(income.form1099Div ?? []).map((doc) => doc.federalIncomeTaxWithheld),
    ...(income.form1099R ?? []).map((doc) => doc.federalIncomeTaxWithheld),
    ...(income.form1099Nec ?? []).map((doc) => doc.federalIncomeTaxWithheld),
    ...(income.form1099G ?? []).map((doc) => doc.federalIncomeTaxWithheld),
    payments?.otherFederalWithholding,
  ]);
}

const employerIdentification: DiagnosticRule = {
  code: 'GT-W2-001',
  severity: 'reject',
  title: 'Each W-2 identifies its employer',
  form: 'Form W-2',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      if (!isValidEin(w2.employerEin)) {
        findings.push({
          message: `${w2Label(w2, index)} has an employer identification number ("${w2.employerEin}") that is not a validly formed EIN.`,
          field: w2Path(index, 'employerEin'),
          resolution: 'Copy the nine-digit EIN from box b of the W-2.',
        });
      }
      if (w2.employerName.trim().length === 0) {
        findings.push({
          message: `The W-2 at position ${index + 1} has no employer name.`,
          field: w2Path(index, 'employerName'),
        });
      }
    }
    return findings;
  },
};

const amountsWellFormed: DiagnosticRule = {
  code: 'GT-W2-002',
  severity: 'error',
  title: 'W-2 amounts are non-negative whole cents',
  form: 'Form W-2',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      for (const amount of w2Amounts(w2)) {
        if (!isValidMoney(amount.value)) {
          findings.push({
            message: `${w2Label(w2, index)} has a ${amount.label} that is not a usable amount.`,
            field: w2Path(index, amount.field),
          });
          continue;
        }
        if (amount.value < 0) {
          findings.push({
            message: `${w2Label(w2, index)} reports a negative ${amount.label} (${formatMoney(amount.value)}). A W-2 never carries a negative box.`,
            field: w2Path(index, amount.field),
            resolution: 'Correct the entry, or use the corrected W-2c if the employer issued one.',
          });
        }
      }
    }
    return findings;
  },
};

const withholdingAgainstWages: DiagnosticRule = {
  code: 'GT-W2-003',
  severity: 'error',
  title: 'Federal withholding is consistent with wages',
  form: 'Form W-2',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      const { wages, federalIncomeTaxWithheld: withheld } = w2;
      if (wages < 0 || withheld < 0) continue;

      if (withheld > wages) {
        findings.push({
          message: `${w2Label(w2, index)} withheld ${formatMoney(withheld)} of federal tax on ${formatMoney(wages)} of wages — withholding cannot exceed the wages it was taken from.`,
          field: w2Path(index, 'federalIncomeTaxWithheld'),
          resolution: 'Check box 2 against the W-2; boxes 1 and 2 are frequently transposed.',
        });
        continue;
      }
      if (wages > 0 && withheld > applyRate(wages, HIGH_WITHHOLDING_RATIO)) {
        findings.push({
          message: `${w2Label(w2, index)} shows federal withholding of ${formatMoney(withheld)} against ${formatMoney(wages)} of wages, an unusually high proportion.`,
          field: w2Path(index, 'federalIncomeTaxWithheld'),
          severity: 'warning',
          resolution: 'Confirm the figure against box 2. A refund of this size invites review.',
        });
      }
    }
    return findings;
  },
};

const socialSecurityWageBase: DiagnosticRule = {
  code: 'GT-W2-004',
  severity: 'error',
  title: 'Social Security wages stay within the annual wage base',
  form: 'Form W-2',
  reference: 'IRC 3121(a)(1)',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      const covered = w2.socialSecurityWages + (w2.socialSecurityTips ?? 0);
      if (covered <= SOCIAL_SECURITY_WAGE_BASE) continue;
      findings.push({
        message: `${w2Label(w2, index)} reports ${formatMoney(covered)} of Social Security wages and tips, above the ${formatMoney(SOCIAL_SECURITY_WAGE_BASE)} wage base for ${ret.taxYear}.`,
        field: w2Path(index, 'socialSecurityWages'),
        resolution:
          'A single employer cannot report more than the wage base. Re-key box 3, or confirm the constant for this tax year.',
      });
    }
    return findings;
  },
};

const socialSecurityTaxRate: DiagnosticRule = {
  code: 'GT-W2-005',
  severity: 'warning',
  title: 'Social Security tax matches the statutory rate',
  form: 'Form W-2',
  reference: 'IRC 3101(a)',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      const covered = w2.socialSecurityWages + (w2.socialSecurityTips ?? 0);
      if (covered <= 0) continue;
      const expected = applyRate(covered, SOCIAL_SECURITY_RATE);
      const variance = difference(expected, w2.socialSecurityTaxWithheld);
      if (variance <= WITHHOLDING_TOLERANCE) continue;

      const material = variance > applyRate(expected, MATERIAL_VARIANCE);
      findings.push({
        message: `${w2Label(w2, index)} withheld ${formatMoney(w2.socialSecurityTaxWithheld)} of Social Security tax; ${(SOCIAL_SECURITY_RATE * 100).toFixed(2)}% of ${formatMoney(covered)} is ${formatMoney(expected)}.`,
        field: w2Path(index, 'socialSecurityTaxWithheld'),
        severity: material ? 'error' : 'warning',
        resolution: material
          ? 'Re-key boxes 3, 4 and 7. A gap this size is a transposition, not payroll rounding.'
          : 'Small differences are normal where an employer rounds each pay period.',
      });
    }
    return findings;
  },
};

const medicareTaxRate: DiagnosticRule = {
  code: 'GT-W2-006',
  severity: 'warning',
  title: 'Medicare tax is at least the statutory rate',
  form: 'Form W-2',
  reference: 'IRC 3101(b)',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      if (w2.medicareWages <= 0) continue;
      const expected = applyRate(w2.medicareWages, MEDICARE_RATE);
      // Withholding above the base rate is normal: high earners also pay the
      // 0.9% Additional Medicare Tax. Only a shortfall is a defect.
      const shortfall = expected - w2.medicareTaxWithheld;
      if (shortfall <= WITHHOLDING_TOLERANCE) continue;

      const material = shortfall > applyRate(expected, MATERIAL_VARIANCE);
      findings.push({
        message: `${w2Label(w2, index)} withheld ${formatMoney(w2.medicareTaxWithheld)} of Medicare tax, below the ${formatMoney(expected)} implied by ${(MEDICARE_RATE * 100).toFixed(2)}% of ${formatMoney(w2.medicareWages)}.`,
        field: w2Path(index, 'medicareTaxWithheld'),
        severity: material ? 'error' : 'warning',
        resolution: 'Re-key boxes 5 and 6.',
      });
    }
    return findings;
  },
};

const medicareAgainstSocialSecurity: DiagnosticRule = {
  code: 'GT-W2-007',
  severity: 'warning',
  title: 'Medicare wages are not below Social Security wages',
  form: 'Form W-2',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      const covered = w2.socialSecurityWages + (w2.socialSecurityTips ?? 0);
      if (w2.medicareWages >= covered) continue;
      findings.push({
        message: `${w2Label(w2, index)} reports ${formatMoney(w2.medicareWages)} of Medicare wages against ${formatMoney(covered)} of Social Security wages and tips. Medicare wages are uncapped and are rarely the smaller figure.`,
        field: w2Path(index, 'medicareWages'),
        resolution: 'Check boxes 3, 5 and 7.',
      });
    }
    return findings;
  },
};

const emptyDocument: DiagnosticRule = {
  code: 'GT-W2-008',
  severity: 'warning',
  title: 'No W-2 is entirely empty',
  form: 'Form W-2',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      const total = sumMoney(w2Amounts(w2).map((entry) => entry.value));
      if (total !== 0) continue;
      findings.push({
        message: `${w2Label(w2, index)} carries no wages and no withholding.`,
        field: `income.w2s[${index}]`,
        resolution: 'Remove the empty document, or enter the amounts from the form.',
      });
    }
    return findings;
  },
};

const documentOwnership: DiagnosticRule = {
  code: 'GT-W2-009',
  severity: 'reject',
  title: 'Source documents belong to a filer on the return',
  form: 'Form W-2',
  evaluate({ return: ret }) {
    if (ret.spouse) return [];
    const findings: DiagnosticFinding[] = [];
    for (const [index, w2] of ret.income.w2s.entries()) {
      if (w2.belongsTo !== 'spouse') continue;
      findings.push({
        message: `${w2Label(w2, index)} is assigned to a spouse, but this return has no spouse.`,
        field: w2Path(index, 'belongsTo'),
        resolution: 'Reassign the document to the taxpayer, or add the spouse to the return.',
      });
    }
    return findings;
  },
};

const wagesReconcile: DiagnosticRule = {
  code: 'GT-INC-001',
  severity: 'error',
  title: 'Wages on Form 1040 equal the sum of the W-2s',
  form: 'Form 1040',
  evaluate({ return: ret, computed }) {
    const reported = computed?.totalWages;
    if (reported === undefined) return [];
    const documented = sumMoney(ret.income.w2s.map((w2) => w2.wages));
    if (reported === documented) return [];
    return [
      {
        message: `Line 1a reports ${formatMoney(reported)} of wages, but the W-2s on the return total ${formatMoney(documented)}.`,
        field: 'income.w2s',
        resolution:
          'A difference here means a W-2 is missing, duplicated, or that an override is in place on line 1a.',
      },
    ];
  },
};

const withholdingReconciles: DiagnosticRule = {
  code: 'GT-INC-002',
  severity: 'error',
  title: 'Federal withholding equals the sum of the source documents',
  form: 'Form 1040',
  evaluate({ return: ret, computed }) {
    const reported = computed?.totalFederalWithholding;
    if (reported === undefined) return [];
    const documented = documentWithholding(ret);
    if (reported === documented) return [];
    return [
      {
        message: `Line 25d reports ${formatMoney(reported)} of federal withholding against ${formatMoney(documented)} across the W-2s, 1099s and other withholding entered.`,
        field: 'payments',
        resolution:
          'Withholding claimed without a matching document is the most common cause of a refund being held.',
      },
    ];
  },
};

const retirementDistributions: DiagnosticRule = {
  code: 'GT-INC-003',
  severity: 'error',
  title: 'Taxable retirement distributions do not exceed the gross',
  form: 'Form 1099-R',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, doc] of (ret.income.form1099R ?? []).entries()) {
      const taxable = doc.taxableAmount;
      if (taxable === undefined) continue;
      if (taxable <= doc.grossDistribution) continue;
      findings.push({
        message: `The 1099-R from ${doc.payerName} shows a taxable amount of ${formatMoney(taxable)} against a gross distribution of ${formatMoney(doc.grossDistribution)}.`,
        field: `income.form1099R[${index}].taxableAmount`,
        resolution: 'Box 2a cannot exceed box 1.',
      });
    }
    return findings;
  },
};

const qualifiedDividends: DiagnosticRule = {
  code: 'GT-INC-004',
  severity: 'error',
  title: 'Qualified dividends are a subset of ordinary dividends',
  form: 'Form 1099-DIV',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, doc] of (ret.income.form1099Div ?? []).entries()) {
      const qualified = doc.qualifiedDividends;
      if (qualified === undefined) continue;
      if (qualified <= doc.ordinaryDividends) continue;
      findings.push({
        message: `The 1099-DIV from ${doc.payerName} reports ${formatMoney(qualified)} of qualified dividends against ${formatMoney(doc.ordinaryDividends)} of total ordinary dividends.`,
        field: `income.form1099Div[${index}].qualifiedDividends`,
        resolution: 'Box 1b is included in box 1a and can never be larger.',
      });
    }
    return findings;
  },
};

const nonemployeeCompensation: DiagnosticRule = {
  code: 'GT-INC-005',
  severity: 'informational',
  title: 'Nonemployee compensation carries self-employment tax',
  form: 'Form 1099-NEC',
  reference: 'IRC 1401',
  evaluate({ return: ret }) {
    const documents = ret.income.form1099Nec ?? [];
    if (documents.length === 0) return [];
    const total = sumMoney(documents.map((doc) => doc.nonemployeeCompensation));
    if (total <= 0) return [];
    return [
      {
        message: `${formatMoney(total)} of nonemployee compensation was entered on ${documents.length} Form 1099-NEC.`,
        field: 'income.form1099Nec',
        resolution:
          'Confirm Schedule C and Schedule SE were prepared, and that deductible business expenses were captured.',
      },
    ];
  },
};

export const incomeRules: readonly DiagnosticRule[] = [
  employerIdentification,
  amountsWellFormed,
  withholdingAgainstWages,
  socialSecurityWageBase,
  socialSecurityTaxRate,
  medicareTaxRate,
  medicareAgainstSocialSecurity,
  emptyDocument,
  documentOwnership,
  wagesReconcile,
  withholdingReconciles,
  retirementDistributions,
  qualifiedDividends,
  nonemployeeCompensation,
];
