/**
 * Credit eligibility rules.
 *
 * The Earned Income Credit dominates this file for the reason it dominates
 * examination statistics: it is refundable, it turns on facts the return itself
 * only partly evidences, and a wrongly claimed credit exposes the taxpayer to a
 * two-year ban under IRC 32(k). Every check here is one a preparer is required
 * to make under the due-diligence rules of IRC 6695(g).
 */
import {
  EITC_INVESTMENT_INCOME_LIMIT,
  EITC_NO_CHILD_MAX_AGE,
  EITC_NO_CHILD_MIN_AGE,
} from '../../constants/ty2025.js';
import { isEmploymentAuthorizedTin } from '../../identifiers.js';
import { ageOn, isIsoDate } from '../../dates.js';
import { formatMoney } from '../../money.js';
import type { DiagnosticContext, DiagnosticFinding, DiagnosticRule } from '../types.js';
import type { Dependent } from '../../types.js';

function claimsEarnedIncomeCredit(context: DiagnosticContext): boolean {
  return context.return.credits?.earnedIncomeCredit === true;
}

function eicChildren(context: DiagnosticContext): Dependent[] {
  return context.return.dependents.filter((d) => d.qualifiesForEarnedIncomeCredit === true);
}

function yearEnd(context: DiagnosticContext): string {
  return `${context.return.taxYear}-12-31`;
}

const separateFilingBar: DiagnosticRule = {
  code: 'GT-EIC-001',
  severity: 'reject',
  title: 'Earned Income Credit is not claimed on a separate return',
  form: 'Schedule EIC',
  reference: 'IRC 32(d)',
  evaluate(context) {
    if (!claimsEarnedIncomeCredit(context)) return [];
    const { return: ret } = context;
    if (ret.filingStatus !== 'marriedFilingSeparately') return [];
    if (ret.credits?.eicSeparatedSpouseElection === true) {
      if (ret.livedApartFromSpouseLastSixMonths === true) return [];
      return [
        {
          message:
            'The separated-spouse election is used to claim the Earned Income Credit on a separate return, but the return does not record that the taxpayer lived apart from the spouse for the last six months of the year.',
          field: 'livedApartFromSpouseLastSixMonths',
          resolution:
            'The election requires either a separation decree or living apart for the last six months of the year with a qualifying child in the home.',
        },
      ];
    }
    return [
      {
        message:
          'The Earned Income Credit is claimed on a married filing separately return without the separated-spouse election.',
        field: 'credits.earnedIncomeCredit',
        resolution:
          'Remove the credit, or record the separated-spouse election if the taxpayer qualifies under IRC 32(d)(2).',
      },
    ];
  },
};

const filerSocialSecurityNumber: DiagnosticRule = {
  code: 'GT-EIC-002',
  severity: 'reject',
  title: 'Earned Income Credit filers hold an SSN valid for employment',
  form: 'Schedule EIC',
  reference: 'IRC 32(m)',
  evaluate(context) {
    if (!claimsEarnedIncomeCredit(context)) return [];
    const { return: ret } = context;
    const findings: DiagnosticFinding[] = [];

    if (!isEmploymentAuthorizedTin(ret.taxpayer.tin)) {
      findings.push({
        message:
          'The Earned Income Credit is claimed but the primary taxpayer does not hold a Social Security number valid for employment.',
        field: 'taxpayer.tin',
        resolution: 'An ITIN filer cannot claim the credit. Remove it.',
      });
    }
    if (
      ret.filingStatus === 'marriedFilingJointly' &&
      ret.spouse &&
      !isEmploymentAuthorizedTin(ret.spouse.tin)
    ) {
      findings.push({
        message:
          'The Earned Income Credit is claimed on a joint return but the spouse does not hold a Social Security number valid for employment.',
        field: 'spouse.tin',
      });
    }
    return findings;
  },
};

const qualifyingChildSocialSecurityNumber: DiagnosticRule = {
  code: 'GT-EIC-003',
  severity: 'reject',
  title: 'Earned Income Credit children hold an SSN valid for employment',
  form: 'Schedule EIC',
  irsBusinessRule: 'SEIC-F1040-501-02',
  reference: 'IRC 32(c)(3)(D)',
  evaluate(context) {
    if (!claimsEarnedIncomeCredit(context)) return [];
    const findings: DiagnosticFinding[] = [];
    for (const [index, dependent] of context.return.dependents.entries()) {
      if (dependent.qualifiesForEarnedIncomeCredit !== true) continue;
      if (isEmploymentAuthorizedTin(dependent.tin)) continue;
      const name = `${dependent.firstName} ${dependent.lastName}`.trim();
      findings.push({
        message: `${name.length > 0 ? name : `Dependent ${index + 1}`} is listed as an Earned Income Credit qualifying child but does not hold a Social Security number valid for employment.`,
        field: `dependents[${index}].tin`,
        resolution:
          'A child with an ITIN cannot be a qualifying child for this credit. Remove the child from Schedule EIC.',
      });
    }
    return findings;
  },
};

const investmentIncomeCeiling: DiagnosticRule = {
  code: 'GT-EIC-004',
  severity: 'error',
  title: 'Investment income stays under the Earned Income Credit ceiling',
  form: 'Schedule EIC',
  reference: 'IRC 32(i)',
  evaluate(context) {
    if (!claimsEarnedIncomeCredit(context)) return [];
    const investment = context.computed?.investmentIncome;
    if (investment === undefined) return [];
    if (investment <= EITC_INVESTMENT_INCOME_LIMIT) return [];
    return [
      {
        message: `Investment income of ${formatMoney(investment)} exceeds the ${formatMoney(EITC_INVESTMENT_INCOME_LIMIT)} ceiling for the Earned Income Credit in ${context.return.taxYear}.`,
        field: 'credits.earnedIncomeCredit',
        resolution: 'The credit is disallowed outright above the ceiling. Remove it.',
      },
    ];
  },
};

const childlessAgeBand: DiagnosticRule = {
  code: 'GT-EIC-005',
  severity: 'error',
  title: 'A childless Earned Income Credit claimant is within the age band',
  form: 'Schedule EIC',
  reference: 'IRC 32(c)(1)(A)(ii)',
  evaluate(context) {
    if (!claimsEarnedIncomeCredit(context)) return [];
    if (eicChildren(context).length > 0) return [];

    const { return: ret } = context;
    const end = yearEnd(context);
    const ages = [ret.taxpayer, ret.spouse]
      .filter((person): person is NonNullable<typeof person> => person !== undefined)
      .map((person) => (isIsoDate(person.dateOfBirth) ? ageOn(person.dateOfBirth, end) : undefined))
      .filter((age): age is number => age !== undefined);

    if (ages.length === 0) return [];
    const inBand = ages.some((age) => age >= EITC_NO_CHILD_MIN_AGE && age <= EITC_NO_CHILD_MAX_AGE);
    if (inBand) return [];

    const oldest = Math.max(...ages);
    return [
      {
        message: `The Earned Income Credit is claimed with no qualifying child, but no filer is between ${EITC_NO_CHILD_MIN_AGE} and ${EITC_NO_CHILD_MAX_AGE} at the close of the year (age ${oldest}).`,
        field: 'credits.earnedIncomeCredit',
        resolution: 'Remove the credit, or list the qualifying child on Schedule EIC.',
      },
    ];
  },
};

const earnedIncomeRequired: DiagnosticRule = {
  code: 'GT-EIC-006',
  severity: 'error',
  title: 'The Earned Income Credit requires earned income',
  form: 'Schedule EIC',
  reference: 'IRC 32(c)(2)',
  evaluate(context) {
    if (!claimsEarnedIncomeCredit(context)) return [];
    const earned = context.computed?.earnedIncome;
    if (earned === undefined || earned > 0) return [];
    return [
      {
        message: 'The Earned Income Credit is claimed but the return reports no earned income.',
        field: 'credits.earnedIncomeCredit',
        resolution:
          'Wages, salary, tips and net self-employment earnings are the only sources that count. Investment and retirement income do not.',
      },
    ];
  },
};

const dependentCareQualifyingPerson: DiagnosticRule = {
  code: 'GT-CR-001',
  severity: 'error',
  title: 'The child and dependent care credit has a qualifying person',
  form: 'Form 2441',
  reference: 'IRC 21(b)(1)',
  evaluate(context) {
    const { return: ret } = context;
    if (ret.credits?.childAndDependentCareCredit !== true) return [];
    const end = yearEnd(context);

    const qualifies = ret.dependents.some((dependent) => {
      if (dependent.isPermanentlyDisabled === true) return true;
      const age = isIsoDate(dependent.dateOfBirth) ? ageOn(dependent.dateOfBirth, end) : undefined;
      return age !== undefined && age < 13;
    });
    if (qualifies) return [];

    return [
      {
        message:
          'The child and dependent care credit is claimed but no dependent is under 13 or recorded as permanently and totally disabled.',
        field: 'credits.childAndDependentCareCredit',
        resolution:
          'A qualifying person must be a dependent under 13, or a spouse or dependent incapable of self-care.',
      },
    ];
  },
};

const saversCreditEligibility: DiagnosticRule = {
  code: 'GT-CR-002',
  severity: 'error',
  title: 'The saver’s credit is not claimed by a dependent',
  form: 'Form 8880',
  reference: 'IRC 25B(c)',
  evaluate({ return: ret }) {
    if (ret.credits?.retirementSavingsContributionsCredit !== true) return [];
    if (ret.taxpayerClaimedAsDependent !== true) return [];
    return [
      {
        message:
          'The retirement savings contributions credit is claimed, but the taxpayer can be claimed as a dependent on another return, which disqualifies them.',
        field: 'credits.retirementSavingsContributionsCredit',
        resolution: 'Remove the credit.',
      },
    ];
  },
};

export const creditRules: readonly DiagnosticRule[] = [
  separateFilingBar,
  filerSocialSecurityNumber,
  qualifyingChildSocialSecurityNumber,
  investmentIncomeCeiling,
  childlessAgeBand,
  earnedIncomeRequired,
  dependentCareQualifyingPerson,
  saversCreditEligibility,
];
