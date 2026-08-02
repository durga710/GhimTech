/**
 * Filing status and dependent rules.
 *
 * Status and dependents are one subject, not two: head-of-household status
 * stands or falls on a qualifying person, qualifying surviving spouse status on
 * a dependent child, and the Child Tax Credit on a dependent's age and the kind
 * of identification number they hold. Splitting them across files would split
 * every interesting check in half.
 */
import { isEmploymentAuthorizedTin, isValidTin, maskTin, normalizeTin } from '../../identifiers.js';
import { ageOn, isAfter, isIsoDate, yearOf } from '../../dates.js';
import { CTC_MAX_AGE } from '../../constants/ty2025.js';
import type { DiagnosticContext, DiagnosticFinding, DiagnosticRule } from '../types.js';
import type { Dependent } from '../../types.js';

/** Relationships that can support head-of-household status. */
const HOH_QUALIFYING_RELATIONSHIPS: ReadonlySet<Dependent['relationship']> = new Set([
  'son',
  'daughter',
  'stepchild',
  'fosterChild',
  'grandchild',
  'brother',
  'sister',
  'halfBrother',
  'halfSister',
  'stepbrother',
  'stepsister',
  'nephew',
  'niece',
  'parent',
  'grandparent',
  'aunt',
  'uncle',
]);

/** Relationships that make a dependent a "qualifying child" for the CTC. */
const CHILD_RELATIONSHIPS: ReadonlySet<Dependent['relationship']> = new Set([
  'son',
  'daughter',
  'stepchild',
  'fosterChild',
  'grandchild',
  'brother',
  'sister',
  'halfBrother',
  'halfSister',
  'stepbrother',
  'stepsister',
  'nephew',
  'niece',
]);

function yearEnd(context: DiagnosticContext): string {
  return `${context.return.taxYear}-12-31`;
}

function dependentLabel(dependent: Dependent, index: number): string {
  const name = `${dependent.firstName} ${dependent.lastName}`.trim();
  return name.length > 0 ? name : `dependent ${index + 1}`;
}

// ---------------------------------------------------------------------------
// Filing status
// ---------------------------------------------------------------------------

const headOfHouseholdQualifyingPerson: DiagnosticRule = {
  code: 'GT-FS-001',
  severity: 'reject',
  title: 'Head of household has a qualifying person',
  form: 'Form 1040',
  reference: 'IRC 2(b); IRS Publication 501',
  evaluate(context) {
    const { return: ret } = context;
    if (ret.filingStatus !== 'headOfHousehold') return [];

    const designated = ret.dependents.filter((d) => d.isQualifyingPersonForHeadOfHousehold === true);
    const candidates = designated.length > 0 ? designated : ret.dependents;

    const qualifying = candidates.filter((dependent) => {
      if (!HOH_QUALIFYING_RELATIONSHIPS.has(dependent.relationship)) return false;
      // A dependent parent need not live with the taxpayer.
      if (dependent.relationship === 'parent') return true;
      return dependent.monthsLivedWithTaxpayer > 6 || dependent.absenceReason !== undefined;
    });

    if (qualifying.length > 0) return [];
    return [
      {
        message:
          'Head of household is claimed but no dependent qualifies: a qualifying person must be a related dependent who lived with the taxpayer more than half the year (a dependent parent is excepted).',
        field: 'filingStatus',
        resolution:
          'Designate the qualifying person, correct the months lived in the home, or change the filing status to single or married filing separately.',
      },
    ];
  },
};

const qualifyingSurvivingSpouse: DiagnosticRule = {
  code: 'GT-FS-002',
  severity: 'reject',
  title: 'Qualifying surviving spouse status is supported',
  form: 'Form 1040',
  reference: 'IRC 2(a)',
  evaluate(context) {
    const { return: ret } = context;
    if (ret.filingStatus !== 'qualifyingSurvivingSpouse') return [];

    const findings: DiagnosticFinding[] = [];
    const died = ret.deceasedSpouseDateOfDeath;
    const deathYear = died !== undefined && isIsoDate(died) ? yearOf(died) : undefined;

    if (deathYear === undefined) {
      findings.push({
        message:
          'Qualifying surviving spouse status is claimed but the deceased spouse date of death is missing or unusable.',
        field: 'deceasedSpouseDateOfDeath',
        resolution:
          'Enter the date of death. The status runs for the two years after the year of death.',
      });
    } else if (deathYear !== ret.taxYear - 1 && deathYear !== ret.taxYear - 2) {
      findings.push({
        message: `The spouse died in ${deathYear}, which does not support qualifying surviving spouse status for tax year ${ret.taxYear} — the status is available only for ${ret.taxYear - 2} and ${ret.taxYear - 1} deaths.`,
        field: 'deceasedSpouseDateOfDeath',
        resolution:
          deathYear === ret.taxYear
            ? 'A spouse who died during the tax year is generally reported as married filing jointly for that year.'
            : 'Change the filing status to single or head of household.',
      });
    }

    const hasQualifyingChild = ret.dependents.some(
      (dependent) =>
        (dependent.relationship === 'son' ||
          dependent.relationship === 'daughter' ||
          dependent.relationship === 'stepchild') &&
        (dependent.monthsLivedWithTaxpayer === 12 || dependent.absenceReason !== undefined),
    );
    if (!hasQualifyingChild) {
      findings.push({
        message:
          'Qualifying surviving spouse status requires a dependent child who lived in the taxpayer’s home for the whole year.',
        field: 'dependents',
      });
    }
    return findings;
  },
};

const separateReturnCredits: DiagnosticRule = {
  code: 'GT-FS-003',
  severity: 'informational',
  title: 'Married filing separately forfeits credits',
  form: 'Form 1040',
  reference: 'IRC 21(e)(2), 25A(g)(6), 32(d)',
  evaluate({ return: ret }) {
    if (ret.filingStatus !== 'marriedFilingSeparately') return [];
    return [
      {
        message:
          'Filing separately disallows the education credits and the child and dependent care credit, and disallows the Earned Income Credit unless the separated-spouse election applies.',
        field: 'filingStatus',
        resolution:
          'Compare against a joint return before filing; separate filing is rarely the cheaper outcome.',
      },
    ];
  },
};

const itemizedElection: DiagnosticRule = {
  code: 'GT-FS-004',
  severity: 'warning',
  title: 'Itemized election matches the entered deductions',
  form: 'Schedule A',
  evaluate({ return: ret }) {
    if (ret.deduction.method !== 'itemized') return [];
    const itemized = ret.deduction.itemized;
    const total = itemized
      ? Object.values(itemized).reduce<number>((sum, value) => sum + (value ?? 0), 0)
      : 0;
    if (total > 0) return [];
    return [
      {
        message: 'Itemized deductions are elected but Schedule A has no amounts.',
        field: 'deduction.itemized',
        resolution: 'Enter the Schedule A detail, or switch the return to the standard deduction.',
      },
    ];
  },
};

// ---------------------------------------------------------------------------
// Dependents
// ---------------------------------------------------------------------------

const dependentIdentification: DiagnosticRule = {
  code: 'GT-DEP-001',
  severity: 'reject',
  title: 'Every dependent has a valid identification number and name',
  form: 'Form 1040',
  irsBusinessRule: 'R0000-504-02',
  reference: 'IRC 151(e)',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, dependent] of ret.dependents.entries()) {
      const label = dependentLabel(dependent, index);
      if (!isValidTin(dependent.tin.trim())) {
        findings.push({
          message: `${label} has no valid identification number (${maskTin(dependent.tin)}).`,
          field: `dependents[${index}].tin`,
          resolution:
            'A dependent must have an SSN, ITIN or ATIN issued on or before the due date of the return.',
        });
      }
      if (dependent.firstName.trim().length === 0 || dependent.lastName.trim().length === 0) {
        findings.push({
          message: `Dependent ${index + 1} is missing a first or last name.`,
          field: `dependents[${index}].lastName`,
        });
      }
    }
    return findings;
  },
};

const dependentTinCollision: DiagnosticRule = {
  code: 'GT-DEP-002',
  severity: 'reject',
  title: 'Dependent identification numbers are unique on the return',
  form: 'Form 1040',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    const filerTins = new Map<string, string>();
    filerTins.set(normalizeTin(ret.taxpayer.tin), 'the primary taxpayer');
    if (ret.spouse) filerTins.set(normalizeTin(ret.spouse.tin), 'the spouse');

    const seen = new Map<string, number>();
    for (const [index, dependent] of ret.dependents.entries()) {
      const tin = normalizeTin(dependent.tin);
      if (tin.length === 0) continue;
      const label = dependentLabel(dependent, index);

      const filer = filerTins.get(tin);
      if (filer !== undefined) {
        findings.push({
          message: `${label} is listed with the same identification number as ${filer}.`,
          field: `dependents[${index}].tin`,
          resolution: 'A filer cannot also be their own dependent. Correct the number.',
        });
        continue;
      }
      const firstIndex = seen.get(tin);
      if (firstIndex !== undefined) {
        findings.push({
          message: `${label} repeats the identification number already used by dependent ${firstIndex + 1}.`,
          field: `dependents[${index}].tin`,
          resolution: 'Remove the duplicate entry or correct the number.',
        });
        continue;
      }
      seen.set(tin, index);
    }
    return findings;
  },
};

const dependentDateOfBirth: DiagnosticRule = {
  code: 'GT-DEP-003',
  severity: 'error',
  title: 'Dependent dates of birth fall within a claimable range',
  form: 'Form 1040',
  evaluate(context) {
    const { return: ret } = context;
    const end = yearEnd(context);
    const findings: DiagnosticFinding[] = [];

    for (const [index, dependent] of ret.dependents.entries()) {
      const label = dependentLabel(dependent, index);
      const field = `dependents[${index}].dateOfBirth`;
      if (!dependent.dateOfBirth || !isIsoDate(dependent.dateOfBirth)) {
        findings.push({
          message: `${label} has no usable date of birth.`,
          field,
        });
        continue;
      }
      if (isAfter(dependent.dateOfBirth, end)) {
        findings.push({
          message: `${label} was born on ${dependent.dateOfBirth}, after tax year ${ret.taxYear} ended, and cannot be claimed on this return.`,
          field,
          resolution: 'Claim the child on next year’s return, or correct the date.',
        });
      }
    }
    return findings;
  },
};

const dependentResidency: DiagnosticRule = {
  code: 'GT-DEP-004',
  severity: 'error',
  title: 'Months lived in the home are recorded consistently',
  form: 'Form 1040',
  reference: 'IRC 152(c)(1)(B)',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, dependent] of ret.dependents.entries()) {
      const months = dependent.monthsLivedWithTaxpayer;
      const label = dependentLabel(dependent, index);
      const field = `dependents[${index}].monthsLivedWithTaxpayer`;

      if (!Number.isInteger(months) || months < 0 || months > 12) {
        findings.push({
          message: `${label} shows ${months} months lived in the home; the value must be a whole number from 0 through 12.`,
          field,
        });
        continue;
      }
      const isChild = CHILD_RELATIONSHIPS.has(dependent.relationship);
      if (isChild && months <= 6 && dependent.absenceReason === undefined) {
        findings.push({
          message: `${label} lived in the home ${months} months, which fails the residency test for a qualifying child, and no reason for the absence was given.`,
          field,
          severity: 'warning',
          resolution:
            'Record a temporary absence, birth or death, or a divorce or separation release (Form 8332), or claim the dependent as a qualifying relative instead.',
        });
      }
    }
    return findings;
  },
};

const childTaxCreditEligibility: DiagnosticRule = {
  code: 'GT-DEP-005',
  severity: 'error',
  title: 'Child Tax Credit elections match the dependent facts',
  form: 'Schedule 8812',
  reference: 'IRC 24',
  evaluate(context) {
    const { return: ret } = context;
    const end = yearEnd(context);
    const findings: DiagnosticFinding[] = [];

    for (const [index, dependent] of ret.dependents.entries()) {
      if (dependent.claimedForChildTaxCredit !== true) continue;
      const label = dependentLabel(dependent, index);
      const age = isIsoDate(dependent.dateOfBirth) ? ageOn(dependent.dateOfBirth, end) : undefined;

      if (age !== undefined && age >= CTC_MAX_AGE) {
        findings.push({
          message: `${label} is ${age} at the close of the tax year, so the Child Tax Credit does not apply — a child must be under ${CTC_MAX_AGE}.`,
          field: `dependents[${index}].claimedForChildTaxCredit`,
          resolution: 'Claim the Credit for Other Dependents instead.',
        });
      }
      if (!CHILD_RELATIONSHIPS.has(dependent.relationship)) {
        findings.push({
          message: `${label} is claimed for the Child Tax Credit but the relationship "${dependent.relationship}" is not a qualifying child relationship.`,
          field: `dependents[${index}].relationship`,
          resolution: 'Claim the Credit for Other Dependents instead.',
        });
      }
      if (dependent.claimedForOtherDependentCredit === true) {
        findings.push({
          message: `${label} is claimed for both the Child Tax Credit and the Credit for Other Dependents.`,
          field: `dependents[${index}].claimedForOtherDependentCredit`,
          resolution: 'A dependent supports one credit or the other, never both.',
        });
      }
    }
    return findings;
  },
};

const childTaxCreditSsn: DiagnosticRule = {
  code: 'GT-DEP-006',
  severity: 'reject',
  title: 'Child Tax Credit children hold an SSN valid for employment',
  form: 'Schedule 8812',
  reference: 'IRC 24(h)(7)',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    for (const [index, dependent] of ret.dependents.entries()) {
      if (dependent.claimedForChildTaxCredit !== true) continue;
      if (isEmploymentAuthorizedTin(dependent.tin)) continue;
      findings.push({
        message: `${dependentLabel(dependent, index)} is claimed for the Child Tax Credit but does not hold a Social Security number valid for employment.`,
        field: `dependents[${index}].tin`,
        resolution:
          'A child with an ITIN or ATIN supports the $500 Credit for Other Dependents, not the Child Tax Credit.',
      });
    }
    return findings;
  },
};

export const householdRules: readonly DiagnosticRule[] = [
  headOfHouseholdQualifyingPerson,
  qualifyingSurvivingSpouse,
  separateReturnCredits,
  itemizedElection,
  dependentIdentification,
  dependentTinCollision,
  dependentDateOfBirth,
  dependentResidency,
  childTaxCreditEligibility,
  childTaxCreditSsn,
];
