/**
 * Identity and address rules.
 *
 * These fire first and matter most: a defect in the return header is what the
 * MeF gateway checks before it looks at a single dollar figure, and a reject
 * here costs the preparer a full transmission cycle.
 */
import {
  classifyTin,
  isValidPin,
  isValidStateCode,
  isValidTin,
  isValidZipCode,
  maskTin,
  normalizeTin,
} from '../../identifiers.js';
import { ageOn, isAfter, isIsoDate } from '../../dates.js';
import { IP_PIN_LENGTH } from '../../constants/ty2025.js';
import type { DiagnosticContext, DiagnosticFinding, DiagnosticRule } from '../types.js';
import type { Person } from '../../types.js';

/** Oldest plausible living taxpayer. Anything beyond this is a typo. */
const MAX_PLAUSIBLE_AGE = 120;

function yearEnd(context: DiagnosticContext): string {
  return `${context.return.taxYear}-12-31`;
}

function hasName(person: Person): boolean {
  return person.firstName.trim().length > 0 && person.lastName.trim().length > 0;
}

const primaryTin: DiagnosticRule = {
  code: 'GT-ID-001',
  severity: 'reject',
  title: 'Primary taxpayer identification number is valid',
  form: 'Form 1040',
  irsBusinessRule: 'R0000-500-01',
  reference: 'IRC 6109',
  evaluate({ return: ret }) {
    const tin = ret.taxpayer.tin.trim();
    if (tin.length === 0) {
      return [
        {
          message: 'The primary taxpayer has no Social Security number.',
          field: 'taxpayer.tin',
          resolution: 'Enter the SSN or ITIN exactly as it appears on the card.',
        },
      ];
    }
    if (!isValidTin(tin)) {
      return [
        {
          message: `The primary taxpayer identification number ${maskTin(tin)} is not a validly issued SSN, ITIN or ATIN.`,
          field: 'taxpayer.tin',
          resolution:
            'Re-key the number from the Social Security card. Numbers beginning 000, 666 or 9xx outside the ITIN ranges were never issued.',
        },
      ];
    }
    return [];
  },
};

const primaryName: DiagnosticRule = {
  code: 'GT-ID-002',
  severity: 'reject',
  title: 'Primary taxpayer name is complete',
  form: 'Form 1040',
  irsBusinessRule: 'R0000-500-01',
  evaluate({ return: ret }) {
    if (hasName(ret.taxpayer)) return [];
    return [
      {
        message: 'The primary taxpayer is missing a first or last name.',
        field: 'taxpayer.lastName',
        resolution:
          'The name must match the Social Security card; the IRS matches the first four letters of the last name as a name control.',
      },
    ];
  },
};

const primaryDateOfBirth: DiagnosticRule = {
  code: 'GT-ID-003',
  severity: 'error',
  title: 'Primary date of birth is plausible',
  form: 'Form 1040',
  evaluate(context) {
    const { dateOfBirth } = context.return.taxpayer;
    if (!dateOfBirth || !isIsoDate(dateOfBirth)) {
      return [
        {
          message: 'The primary taxpayer has no usable date of birth.',
          field: 'taxpayer.dateOfBirth',
          resolution: 'Enter the date of birth as YYYY-MM-DD.',
        },
      ];
    }
    const end = yearEnd(context);
    if (isAfter(dateOfBirth, end)) {
      return [
        {
          message: `The primary taxpayer's date of birth (${dateOfBirth}) falls after the close of tax year ${context.return.taxYear}.`,
          field: 'taxpayer.dateOfBirth',
          resolution: 'Correct the year of birth.',
        },
      ];
    }
    const age = ageOn(dateOfBirth, end);
    if (age !== undefined && age > MAX_PLAUSIBLE_AGE) {
      return [
        {
          message: `The primary taxpayer's date of birth implies an age of ${age} at the close of the tax year.`,
          field: 'taxpayer.dateOfBirth',
          resolution: 'Check the year of birth for a transposition.',
          severity: 'warning',
        },
      ];
    }
    return [];
  },
};

const spouseRequired: DiagnosticRule = {
  code: 'GT-ID-004',
  severity: 'reject',
  title: 'Spouse identity is present when the filing status requires it',
  form: 'Form 1040',
  irsBusinessRule: 'R0000-503-02',
  evaluate({ return: ret }) {
    const needsSpouse =
      ret.filingStatus === 'marriedFilingJointly' ||
      ret.filingStatus === 'marriedFilingSeparately';
    if (!needsSpouse) return [];

    const { spouse } = ret;
    if (!spouse) {
      const label =
        ret.filingStatus === 'marriedFilingJointly'
          ? 'married filing jointly'
          : 'married filing separately';
      return [
        {
          message: `Filing status is ${label} but no spouse has been entered.`,
          field: 'spouse',
          resolution:
            'Enter the spouse name and SSN. A separate return still reports the spouse identity in the header.',
        },
      ];
    }

    const findings: DiagnosticFinding[] = [];
    if (!isValidTin(spouse.tin.trim())) {
      findings.push({
        message: `The spouse identification number ${maskTin(spouse.tin)} is missing or not validly issued.`,
        field: 'spouse.tin',
        resolution: 'Re-key the number from the spouse Social Security card.',
      });
    }
    if (!hasName(spouse)) {
      findings.push({
        message: 'The spouse is missing a first or last name.',
        field: 'spouse.lastName',
      });
    }
    return findings;
  },
};

const spouseTinDistinct: DiagnosticRule = {
  code: 'GT-ID-005',
  severity: 'reject',
  title: 'Spouse identification number differs from the primary',
  form: 'Form 1040',
  evaluate({ return: ret }) {
    const spouse = ret.spouse;
    if (!spouse) return [];
    if (normalizeTin(spouse.tin) !== normalizeTin(ret.taxpayer.tin)) return [];
    return [
      {
        message: 'The spouse identification number is the same as the primary taxpayer.',
        field: 'spouse.tin',
        resolution: 'One of the two numbers has been entered twice. Correct the spouse SSN.',
      },
    ];
  },
};

const spouseNotAllowed: DiagnosticRule = {
  code: 'GT-ID-006',
  severity: 'error',
  title: 'No spouse is attached to a status that admits none',
  form: 'Form 1040',
  evaluate({ return: ret }) {
    if (!ret.spouse) return [];
    if (ret.filingStatus !== 'single' && ret.filingStatus !== 'qualifyingSurvivingSpouse') {
      return [];
    }
    return [
      {
        message: `Filing status is ${ret.filingStatus} but a spouse record is attached to the return.`,
        field: 'spouse',
        resolution:
          'Remove the spouse record, or change the filing status if the taxpayer was married at the close of the year.',
      },
    ];
  },
};

const identityProtectionPins: DiagnosticRule = {
  code: 'GT-ID-007',
  severity: 'reject',
  title: 'Identity Protection PINs are six digits',
  form: 'Form 1040',
  reference: 'IRS Publication 5027',
  evaluate({ return: ret }) {
    const findings: DiagnosticFinding[] = [];
    const check = (person: Person | undefined, field: string, who: string): void => {
      const pin = person?.identityProtectionPin;
      if (pin === undefined) return;
      if (isValidPin(pin, IP_PIN_LENGTH)) return;
      findings.push({
        message: `The ${who} Identity Protection PIN must be exactly ${IP_PIN_LENGTH} digits.`,
        field,
        resolution:
          'Use the IP PIN from the current-year CP01A notice. A prior-year IP PIN will be rejected.',
      });
    };
    check(ret.taxpayer, 'taxpayer.identityProtectionPin', 'primary taxpayer');
    check(ret.spouse, 'spouse.identityProtectionPin', 'spouse');
    for (const [index, dependent] of ret.dependents.entries()) {
      check(dependent, `dependents[${index}].identityProtectionPin`, `dependent ${index + 1}`);
    }
    return findings;
  },
};

const mailingAddress: DiagnosticRule = {
  code: 'GT-ID-008',
  severity: 'error',
  title: 'Mailing address is complete and well-formed',
  form: 'Form 1040',
  evaluate({ return: ret }) {
    const address = ret.address;
    const findings: DiagnosticFinding[] = [];
    const isForeign = address.foreignCountry !== undefined;

    if (address.line1.trim().length === 0) {
      findings.push({ message: 'The mailing address has no street line.', field: 'address.line1' });
    }
    if (address.city.trim().length === 0) {
      findings.push({ message: 'The mailing address has no city.', field: 'address.city' });
    }
    if (isForeign) return findings;

    if (!address.state || !isValidStateCode(address.state)) {
      findings.push({
        message: `"${address.state ?? ''}" is not a state, territory or military post code the IRS accepts.`,
        field: 'address.state',
        resolution:
          'Use a two-letter code such as PA, DC, PR, or AE for an overseas military address.',
      });
    }
    if (!address.zip || !isValidZipCode(address.zip)) {
      findings.push({
        message: `"${address.zip ?? ''}" is not a valid ZIP or ZIP+4 code.`,
        field: 'address.zip',
      });
    }
    return findings;
  },
};

const decedentReturn: DiagnosticRule = {
  code: 'GT-ID-009',
  severity: 'warning',
  title: 'Decedent return is handled correctly',
  form: 'Form 1040',
  reference: 'Form 1310; IRS Publication 559',
  evaluate(context) {
    const { return: ret } = context;
    const findings: DiagnosticFinding[] = [];
    const start = `${ret.taxYear}-01-01`;

    const check = (person: Person | undefined, field: string, who: string): void => {
      const died = person?.dateOfDeath;
      if (!died) return;
      if (!isIsoDate(died)) {
        findings.push({
          message: `The ${who} date of death is not a valid date.`,
          field,
          severity: 'error',
        });
        return;
      }
      if (!isAfter(died, start) && died !== start) {
        findings.push({
          message: `The ${who} died on ${died}, before tax year ${ret.taxYear} began — this return covers a year the taxpayer did not live to see.`,
          field,
          severity: 'error',
          resolution: 'Check the date, or file for the correct year.',
        });
        return;
      }
      findings.push({
        message: `This is a decedent return: the ${who} died on ${died}.`,
        field,
        resolution:
          'A personal representative must sign. If a refund is claimed and no court-appointed representative is filing, attach Form 1310.',
      });
    };

    check(ret.taxpayer, 'taxpayer.dateOfDeath', 'primary taxpayer');
    check(ret.spouse, 'spouse.dateOfDeath', 'spouse');
    return findings;
  },
};

const claimedAsDependent: DiagnosticRule = {
  code: 'GT-ID-010',
  severity: 'informational',
  title: 'Taxpayer claimed as a dependent elsewhere',
  form: 'Form 1040',
  reference: 'IRC 63(c)(5)',
  evaluate({ return: ret }) {
    if (ret.taxpayerClaimedAsDependent !== true) return [];
    return [
      {
        message:
          'The taxpayer can be claimed as a dependent on another return, so the standard deduction is limited.',
        field: 'taxpayerClaimedAsDependent',
        resolution:
          'Confirm the limited standard deduction was applied and that no credit requiring an unclaimed filer was taken.',
      },
    ];
  },
};

const itinCredits: DiagnosticRule = {
  code: 'GT-ID-011',
  severity: 'informational',
  title: 'ITIN filer credit limitations',
  form: 'Form 1040',
  reference: 'IRC 24(h)(7), 32(m)',
  evaluate({ return: ret }) {
    if (classifyTin(ret.taxpayer.tin) !== 'itin') return [];
    return [
      {
        message:
          'The primary taxpayer files with an ITIN, which bars the Earned Income Credit and the refundable Child Tax Credit.',
        field: 'taxpayer.tin',
        resolution: 'Verify that no credit requiring an SSN valid for employment has been claimed.',
      },
    ];
  },
};

export const identityRules: readonly DiagnosticRule[] = [
  primaryTin,
  primaryName,
  primaryDateOfBirth,
  spouseRequired,
  spouseTinDistinct,
  spouseNotAllowed,
  identityProtectionPins,
  mailingAddress,
  decedentReturn,
  claimedAsDependent,
  itinCredits,
];
