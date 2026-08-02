import { describe, expect, it } from 'vitest';
import { runDiagnostics, summarizeDiagnostics } from './diagnostics.js';
import {
  FEDERAL_DIAGNOSTIC_RULES,
  assertUniqueRuleCodes,
  getRuleByCode,
} from './diagnostics/registry.js';
import { SEVERITY_RANK } from './diagnostics/types.js';
import type {
  DiagnosticReport,
  DiagnosticRule,
  RunDiagnosticsOptions,
} from './diagnostics/types.js';
import { dollars } from './money.js';
import type {
  BankAccount,
  Dependent,
  EFileSignature,
  FederalReturn,
  FormW2,
  Person,
  Preparer,
  RefundElection,
} from './types.js';

/**
 * The date every test runs "as of". Nothing in this suite may depend on the day
 * it happens to run: a signature-date rule that passes in March and fails in May
 * is worse than no rule at all.
 */
const AS_OF = '2026-03-01';

/**
 * The fixture is typed with its optional blocks made required, so a test can
 * reach into `ret.signature.taxpayerPin` without a non-null assertion on every
 * line. The value is still a perfectly ordinary `FederalReturn`.
 */
type CompleteReturn = FederalReturn & {
  signature: EFileSignature;
  refund: RefundElection & { account: BankAccount };
  preparer: Preparer;
};

/**
 * A W-2 with no defect of any kind.
 *
 * Box 4 is exactly 6.2% of box 3 and box 6 exactly 1.45% of box 5, written as
 * literal dollar figures rather than computed from the rate constants — a
 * fixture derived from the same constant the rule uses would agree with that
 * rule by construction and prove nothing.
 */
function cleanW2(): FormW2 {
  return {
    belongsTo: 'taxpayer',
    employerEin: '12-3456789',
    employerName: 'Jefferson Health System',
    wages: dollars(60_000),
    federalIncomeTaxWithheld: dollars(5_400),
    socialSecurityWages: dollars(60_000),
    socialSecurityTaxWithheld: dollars(3_720),
    medicareWages: dollars(60_000),
    medicareTaxWithheld: dollars(870),
  };
}

/** A W-2 carrying no money at all, which is a data-entry leftover, not a document. */
function emptyW2(): FormW2 {
  return {
    belongsTo: 'taxpayer',
    employerEin: '12-3456789',
    employerName: 'Jefferson Health System',
    wages: 0,
    federalIncomeTaxWithheld: 0,
    socialSecurityWages: 0,
    socialSecurityTaxWithheld: 0,
    medicareWages: 0,
    medicareTaxWithheld: 0,
  };
}

function dependent(overrides: Partial<Dependent> = {}): Dependent {
  return {
    firstName: 'Nia',
    lastName: 'Okonjo',
    tin: '223-45-6789',
    dateOfBirth: '2015-04-02',
    relationship: 'daughter',
    monthsLivedWithTaxpayer: 12,
    ...overrides,
  };
}

function spouse(overrides: Partial<Person> = {}): Person {
  return {
    firstName: 'Daniel',
    lastName: 'Okonjo',
    tin: '234-56-7890',
    dateOfBirth: '1983-09-04',
    ...overrides,
  };
}

/**
 * A single filer with one clean W-2, a valid address, a direct deposit to a
 * routing number that genuinely passes the ABA check digit (021000021 sums to
 * 30), and a Self-Select PIN signature backed by a prior-year AGI.
 */
function validReturn(): CompleteReturn {
  return {
    taxYear: 2025,
    filingStatus: 'single',
    taxpayer: {
      firstName: 'Amara',
      lastName: 'Okonjo',
      tin: '123-45-6789',
      dateOfBirth: '1985-06-15',
      occupation: 'Registered nurse',
    },
    address: {
      line1: '1400 Chestnut Street',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19102',
    },
    dependents: [],
    income: { w2s: [cleanW2()] },
    deduction: { method: 'standard' },
    refund: {
      method: 'directDeposit',
      account: {
        routingNumber: '021000021',
        accountNumber: '4417123098',
        accountType: 'checking',
      },
    },
    signature: {
      method: 'selfSelectPin',
      taxpayerPin: '24680',
      taxpayerPriorYearAgi: dollars(58_400),
      signatureDate: '2026-02-15',
    },
    preparer: {
      name: 'D. Ghimeray',
      ptin: 'P12345678',
      efin: '123456',
      firmName: 'GhimTech Tax',
    },
    filingMethod: 'efile',
  };
}

function run(ret: FederalReturn, options: RunDiagnosticsOptions = {}): DiagnosticReport {
  return runDiagnostics(ret, { asOfDate: AS_OF, ...options });
}

/** The codes a report raised, in report order, so assertions read as a list. */
function codes(report: DiagnosticReport): string[] {
  return report.diagnostics.map((diagnostic) => diagnostic.code);
}

// ---------------------------------------------------------------------------
// The baseline
// ---------------------------------------------------------------------------

describe('a return with no defects', () => {
  it('raises nothing at all and is eligible for e-file', () => {
    const report = run(validReturn());
    expect(codes(report)).toEqual([]);
    expect(report.blockingCount).toBe(0);
    expect(report.eFileEligible).toBe(true);
  });

  it('reports the tax year, the rule count and empty severity counts', () => {
    const report = run(validReturn());
    expect(report.taxYear).toBe(2025);
    expect(report.rulesEvaluated).toBe(FEDERAL_DIAGNOSTIC_RULES.length);
    expect(report.counts).toEqual({ reject: 0, error: 0, warning: 0, informational: 0 });
    expect(report.suppressedCodes).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

describe('identity rules', () => {
  it('GT-ID-001 fires on a taxpayer identification number that was never issued', () => {
    const ret = validReturn();
    ret.taxpayer.tin = '000-45-6789';
    expect(codes(run(ret))).toContain('GT-ID-001');
  });

  it('GT-ID-001 masks the offending number rather than repeating it', () => {
    const ret = validReturn();
    ret.taxpayer.tin = '666-45-6789';
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-ID-001');
    expect(finding?.message).toContain('***-**-6789');
    expect(finding?.message).not.toContain('666-45');
  });

  it('GT-ID-004 fires when a married status carries no spouse', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingJointly';
    expect(codes(run(ret))).toContain('GT-ID-004');
  });

  it('GT-ID-005 fires when the spouse repeats the primary identification number', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingJointly';
    ret.spouse = spouse({ tin: '123-45-6789' });
    expect(codes(run(ret))).toContain('GT-ID-005');
  });

  it('GT-ID-008 fires on a state code the IRS does not accept', () => {
    const ret = validReturn();
    ret.address.state = 'ZZ';
    expect(codes(run(ret))).toContain('GT-ID-008');
  });

  it('GT-ID-008 fires on a malformed ZIP code', () => {
    const ret = validReturn();
    ret.address.zip = '191';
    expect(codes(run(ret))).toContain('GT-ID-008');
  });
});

// ---------------------------------------------------------------------------
// Filing status and dependents
// ---------------------------------------------------------------------------

describe('filing status and dependent rules', () => {
  it('GT-FS-001 fires when head of household has no qualifying person', () => {
    const ret = validReturn();
    ret.filingStatus = 'headOfHousehold';
    expect(codes(run(ret))).toContain('GT-FS-001');
  });

  it('GT-FS-002 fires when qualifying surviving spouse status is unsupported', () => {
    const ret = validReturn();
    ret.filingStatus = 'qualifyingSurvivingSpouse';
    expect(codes(run(ret))).toContain('GT-FS-002');
  });

  it('GT-DEP-002 fires when a dependent carries the primary identification number', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ tin: '123-45-6789' })];
    expect(codes(run(ret))).toContain('GT-DEP-002');
  });

  it('GT-DEP-005 fires when a child claimed for the CTC is 17 at year end', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ dateOfBirth: '2008-06-15', claimedForChildTaxCredit: true })];
    expect(codes(run(ret))).toContain('GT-DEP-005');
  });

  it('GT-DEP-005 leaves a sixteen-year-old alone', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ dateOfBirth: '2009-06-15', claimedForChildTaxCredit: true })];
    expect(codes(run(ret))).not.toContain('GT-DEP-005');
  });

  it('GT-DEP-006 fires when a CTC child holds an ITIN rather than an SSN', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ tin: '900-70-1234', claimedForChildTaxCredit: true })];
    const raised = codes(run(ret));
    expect(raised).toContain('GT-DEP-006');
    // The ITIN is a validly issued number, so the identification rule stays quiet.
    expect(raised).not.toContain('GT-DEP-001');
  });
});

// ---------------------------------------------------------------------------
// Source documents and totals
// ---------------------------------------------------------------------------

describe('income rules', () => {
  it('GT-W2-001 fires on an employer identification number that cannot exist', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), employerEin: '00-1234567' }];
    expect(codes(run(ret))).toContain('GT-W2-001');
  });

  it('GT-W2-003 fires when withholding exceeds the wages it came from', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), federalIncomeTaxWithheld: dollars(70_000) }];
    expect(codes(run(ret))).toContain('GT-W2-003');
  });

  it('GT-W2-004 fires above the Social Security wage base', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), socialSecurityWages: dollars(200_000) }];
    expect(codes(run(ret))).toContain('GT-W2-004');
  });

  it('GT-W2-005 escalates to an error when the FICA gap is far beyond rounding', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), socialSecurityTaxWithheld: dollars(2_000) }];
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-W2-005');
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('error');
  });

  it('GT-W2-005 says nothing at all about a gap inside the rounding tolerance', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), socialSecurityTaxWithheld: dollars(3_719) }];
    expect(codes(run(ret))).not.toContain('GT-W2-005');
  });

  it('GT-W2-005 warns, without escalating, on a gap between tolerance and materiality', () => {
    // $20 off the expected $3,720 clears the $2 payroll-rounding tolerance but
    // stays well under the 5% that marks a transposition rather than rounding.
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), socialSecurityTaxWithheld: dollars(3_700) }];
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-W2-005');
    expect(finding?.severity).toBe('warning');
  });

  it('GT-INC-001 fires when line 1a disagrees with the W-2s', () => {
    const report = run(validReturn(), { computed: { totalWages: dollars(75_000) } });
    expect(codes(report)).toContain('GT-INC-001');
  });

  it('GT-INC-002 fires when claimed withholding exceeds the documents', () => {
    const report = run(validReturn(), {
      computed: { totalFederalWithholding: dollars(9_000) },
    });
    expect(codes(report)).toContain('GT-INC-002');
  });

  it('stays quiet when the computed totals agree with the documents', () => {
    const report = run(validReturn(), {
      computed: { totalWages: dollars(60_000), totalFederalWithholding: dollars(5_400) },
    });
    expect(codes(report)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

describe('credit rules', () => {
  it('GT-EIC-001 fires on a separate return without the separated-spouse election', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingSeparately';
    ret.spouse = spouse();
    ret.credits = { earnedIncomeCredit: true };
    expect(codes(run(ret))).toContain('GT-EIC-001');
  });

  it('GT-EIC-004 fires above the disqualifying investment income ceiling', () => {
    const ret = validReturn();
    ret.credits = { earnedIncomeCredit: true };
    const report = run(ret, { computed: { investmentIncome: dollars(20_000) } });
    expect(codes(report)).toContain('GT-EIC-004');
  });

  it('GT-EIC-004 stays quiet just under the ceiling', () => {
    const ret = validReturn();
    ret.credits = { earnedIncomeCredit: true };
    const report = run(ret, { computed: { investmentIncome: dollars(11_000) } });
    expect(codes(report)).not.toContain('GT-EIC-004');
  });
});

// ---------------------------------------------------------------------------
// Banking, payment and signature
// ---------------------------------------------------------------------------

describe('mechanics rules', () => {
  it('GT-BANK-001 fires when direct deposit has no account', () => {
    const ret = validReturn();
    ret.refund = { method: 'directDeposit' } as CompleteReturn['refund'];
    expect(codes(run(ret))).toContain('GT-BANK-001');
  });

  it('GT-BANK-002 fires on a routing number that fails the ABA check digit', () => {
    const ret = validReturn();
    ret.refund.account.routingNumber = '021000022';
    const raised = codes(run(ret));
    expect(raised).toContain('GT-BANK-002');
    // The prefix rule stays silent so the preparer sees one problem, not two.
    expect(raised).not.toContain('GT-BANK-003');
  });

  it('GT-BANK-003 fires on a valid check digit with an ineligible prefix', () => {
    const ret = validReturn();
    ret.refund.account.routingNumber = '400000008';
    const raised = codes(run(ret));
    expect(raised).toContain('GT-BANK-003');
    expect(raised).not.toContain('GT-BANK-002');
  });

  it('GT-BANK-004 fires on an account number carrying separators', () => {
    const ret = validReturn();
    ret.refund.account.accountNumber = '4417-1230-98';
    expect(codes(run(ret))).toContain('GT-BANK-004');
  });

  it('GT-BANK-005 applies the same account edits to a direct debit', () => {
    const ret = validReturn();
    ret.balanceDue = {
      method: 'directDebit',
      amount: dollars(1_200),
      account: {
        routingNumber: '021000022',
        accountNumber: '4417123098',
        accountType: 'checking',
      },
    };
    expect(codes(run(ret))).toContain('GT-BANK-005');
  });

  it('GT-BANK-005 fires when direct debit has no account at all', () => {
    const ret = validReturn();
    ret.balanceDue = { method: 'directDebit', amount: dollars(1_200) };
    expect(codes(run(ret))).toContain('GT-BANK-005');
  });

  it('GT-PAY-001 fires on a settlement date that has already passed', () => {
    const ret = validReturn();
    ret.balanceDue = {
      method: 'directDebit',
      amount: dollars(1_200),
      requestedPaymentDate: '2026-02-01',
      account: {
        routingNumber: '021000021',
        accountNumber: '4417123098',
        accountType: 'checking',
      },
    };
    expect(codes(run(ret))).toContain('GT-PAY-001');
  });

  it('GT-PAY-001 fires on a settlement date after the return due date', () => {
    const ret = validReturn();
    ret.balanceDue = {
      method: 'directDebit',
      amount: dollars(1_200),
      requestedPaymentDate: '2026-05-01',
      account: {
        routingNumber: '021000021',
        accountNumber: '4417123098',
        accountType: 'checking',
      },
    };
    expect(codes(run(ret))).toContain('GT-PAY-001');
  });

  it('GT-PAY-001 accepts a date between today and the due date', () => {
    const ret = validReturn();
    ret.balanceDue = {
      method: 'directDebit',
      amount: dollars(1_200),
      requestedPaymentDate: '2026-04-10',
      account: {
        routingNumber: '021000021',
        accountNumber: '4417123098',
        accountType: 'checking',
      },
    };
    expect(codes(run(ret))).toEqual([]);
  });

  it('GT-EF-001 fires when a Self-Select PIN has no prior-year shared secret', () => {
    const ret = validReturn();
    delete ret.signature.taxpayerPriorYearAgi;
    expect(codes(run(ret))).toContain('GT-EF-001');
  });

  it('GT-EF-001 accepts a prior-year PIN in place of the prior-year AGI', () => {
    const ret = validReturn();
    delete ret.signature.taxpayerPriorYearAgi;
    ret.signature.taxpayerPriorYearPin = '13579';
    expect(codes(run(ret))).not.toContain('GT-EF-001');
  });

  it('GT-EF-002 fires on a signature PIN of the wrong length', () => {
    const ret = validReturn();
    ret.signature.taxpayerPin = '123';
    expect(codes(run(ret))).toContain('GT-EF-002');
  });

  it('GT-EF-002 requires a spouse PIN on a joint return', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingJointly';
    ret.spouse = spouse();
    ret.signature.spousePriorYearAgi = dollars(58_400);
    expect(codes(run(ret))).toContain('GT-EF-002');
  });

  it('GT-EF-003 fires on a signature dated into the future', () => {
    const ret = validReturn();
    ret.signature.signatureDate = '2026-06-01';
    expect(codes(run(ret))).toContain('GT-EF-003');
  });

  it('GT-EF-004 fires on a third party designee with no telephone number', () => {
    const ret = validReturn();
    ret.thirdPartyDesignee = { allow: true, name: 'R. Mensah', pin: '11223' };
    expect(codes(run(ret))).toContain('GT-EF-004');
  });

  it('GT-EF-005 fires on a malformed PTIN', () => {
    const ret = validReturn();
    ret.preparer.ptin = '12345678';
    expect(codes(run(ret))).toContain('GT-EF-005');
  });

  it('GT-EF-005 fires on an EFIN that is not six digits', () => {
    const ret = validReturn();
    ret.preparer.efin = '12345';
    expect(codes(run(ret))).toContain('GT-EF-005');
  });

  it('GT-EF-006 fires when an electronic return has no signature block', () => {
    const ret: FederalReturn = validReturn();
    delete ret.signature;
    expect(codes(run(ret))).toContain('GT-EF-006');
  });

  it('GT-EF-006 treats an unset filing method as electronic', () => {
    const ret: FederalReturn = validReturn();
    delete ret.filingMethod;
    delete ret.signature;
    expect(codes(run(ret))).toContain('GT-EF-006');
  });

  it('GT-EF-006 leaves a paper return alone', () => {
    const ret: FederalReturn = validReturn();
    ret.filingMethod = 'paper';
    delete ret.signature;
    expect(codes(run(ret))).not.toContain('GT-EF-006');
  });
});

// ---------------------------------------------------------------------------
// The remaining rule families
//
// One driven defect each. These are the rules a preparer meets less often, and
// they are exactly the ones that rot unnoticed when nothing exercises them.
// ---------------------------------------------------------------------------

describe('the remaining identity rules', () => {
  it('GT-ID-003 fires on a date of birth that is not a date', () => {
    const ret = validReturn();
    ret.taxpayer.dateOfBirth = 'sometime in June';
    expect(codes(run(ret))).toContain('GT-ID-003');
  });

  it('GT-ID-003 fires on a birth after the close of the tax year', () => {
    const ret = validReturn();
    ret.taxpayer.dateOfBirth = '2026-01-05';
    expect(codes(run(ret))).toContain('GT-ID-003');
  });

  it('GT-ID-003 downgrades an implausible age to a warning', () => {
    const ret = validReturn();
    ret.taxpayer.dateOfBirth = '1880-03-02';
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-ID-003');
    expect(finding?.severity).toBe('warning');
  });

  it('GT-ID-006 fires when a spouse is attached to a single return', () => {
    const ret = validReturn();
    ret.spouse = spouse();
    expect(codes(run(ret))).toContain('GT-ID-006');
  });

  it('GT-ID-007 fires on an Identity Protection PIN that is not six digits', () => {
    const ret = validReturn();
    ret.taxpayer.identityProtectionPin = '1234';
    expect(codes(run(ret))).toContain('GT-ID-007');
  });

  it('GT-ID-007 accepts a six-digit IP PIN', () => {
    const ret = validReturn();
    ret.taxpayer.identityProtectionPin = '123456';
    expect(codes(run(ret))).not.toContain('GT-ID-007');
  });

  it('GT-ID-009 flags a decedent return as a warning', () => {
    const ret = validReturn();
    ret.taxpayer.dateOfDeath = '2025-08-01';
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-ID-009');
    expect(finding?.severity).toBe('warning');
    expect(finding?.resolution).toContain('Form 1310');
  });

  it('GT-ID-009 escalates a death before the tax year began', () => {
    const ret = validReturn();
    ret.taxpayer.dateOfDeath = '2024-08-01';
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-ID-009');
    expect(finding?.severity).toBe('error');
  });

  it('GT-ID-010 notes that the taxpayer is claimed elsewhere', () => {
    const ret = validReturn();
    ret.taxpayerClaimedAsDependent = true;
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-ID-010');
    expect(finding?.severity).toBe('informational');
  });

  it('GT-ID-011 notes the credit limits an ITIN filer faces', () => {
    const ret = validReturn();
    ret.taxpayer.tin = '900-70-1234';
    const raised = codes(run(ret));
    expect(raised).toContain('GT-ID-011');
    // An ITIN is validly issued, so the identification rule must stay quiet.
    expect(raised).not.toContain('GT-ID-001');
  });
});

describe('the remaining household rules', () => {
  it('GT-FS-003 notes what a separate return forfeits', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingSeparately';
    ret.spouse = spouse();
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-FS-003');
    expect(finding?.severity).toBe('informational');
  });

  it('GT-FS-004 fires when itemising is elected with an empty Schedule A', () => {
    const ret = validReturn();
    ret.deduction = { method: 'itemized' };
    expect(codes(run(ret))).toContain('GT-FS-004');
  });

  it('GT-FS-004 stays quiet once Schedule A carries an amount', () => {
    const ret = validReturn();
    ret.deduction = { method: 'itemized', itemized: { charitableCash: dollars(5_000) } };
    expect(codes(run(ret))).not.toContain('GT-FS-004');
  });

  it('GT-DEP-001 fires on a dependent identification number that was never issued', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ tin: '900-89-1234' })];
    expect(codes(run(ret))).toContain('GT-DEP-001');
  });

  it('GT-DEP-001 fires on a dependent with no surname', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ lastName: '  ' })];
    expect(codes(run(ret))).toContain('GT-DEP-001');
  });

  it('GT-DEP-003 fires on a child born after the tax year ended', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ dateOfBirth: '2026-02-10' })];
    expect(codes(run(ret))).toContain('GT-DEP-003');
  });

  it('GT-DEP-004 fires on a months-in-home figure outside 0 through 12', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ monthsLivedWithTaxpayer: 13 })];
    expect(codes(run(ret))).toContain('GT-DEP-004');
  });

  it('GT-DEP-004 warns when a child fails the residency test with no explanation', () => {
    const ret = validReturn();
    ret.dependents = [dependent({ monthsLivedWithTaxpayer: 3 })];
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-DEP-004');
    expect(finding?.severity).toBe('warning');
  });

  it('GT-DEP-004 accepts a recorded reason for the absence', () => {
    const ret = validReturn();
    ret.dependents = [
      dependent({ monthsLivedWithTaxpayer: 3, absenceReason: 'temporaryAbsence' }),
    ];
    expect(codes(run(ret))).not.toContain('GT-DEP-004');
  });

  it('GT-DEP-005 fires when the CTC is claimed on a non-child relationship', () => {
    const ret = validReturn();
    ret.dependents = [
      dependent({ relationship: 'parent', dateOfBirth: '1955-02-02', claimedForChildTaxCredit: true }),
    ];
    expect(codes(run(ret))).toContain('GT-DEP-005');
  });

  it('GT-DEP-005 fires when both dependent credits are claimed at once', () => {
    const ret = validReturn();
    ret.dependents = [
      dependent({ claimedForChildTaxCredit: true, claimedForOtherDependentCredit: true }),
    ];
    expect(codes(run(ret))).toContain('GT-DEP-005');
  });
});

describe('the remaining income rules', () => {
  it('GT-W2-002 fires on a negative box', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), dependentCareBenefits: dollars(-500) }];
    expect(codes(run(ret))).toContain('GT-W2-002');
  });

  it('GT-W2-006 fires when Medicare tax falls short of the statutory rate', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), medicareTaxWithheld: dollars(100) }];
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-W2-006');
    expect(finding?.severity).toBe('error');
  });

  it('GT-W2-006 accepts withholding above the base rate, which is the surtax', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), medicareTaxWithheld: dollars(1_200) }];
    expect(codes(run(ret))).not.toContain('GT-W2-006');
  });

  it('GT-W2-007 fires when uncapped Medicare wages are the smaller figure', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), medicareWages: dollars(50_000) }];
    expect(codes(run(ret))).toContain('GT-W2-007');
  });

  it('GT-W2-009 fires on a document assigned to a spouse who is not on the return', () => {
    const ret = validReturn();
    ret.income.w2s = [{ ...cleanW2(), belongsTo: 'spouse' }];
    expect(codes(run(ret))).toContain('GT-W2-009');
  });

  it('GT-INC-003 fires when a 1099-R taxable amount exceeds the gross', () => {
    const ret = validReturn();
    ret.income.form1099R = [
      {
        belongsTo: 'taxpayer',
        payerName: 'Vanguard Fiduciary Trust',
        grossDistribution: dollars(10_000),
        taxableAmount: dollars(12_000),
        distributionCode: '7',
      },
    ];
    expect(codes(run(ret))).toContain('GT-INC-003');
  });

  it('GT-INC-004 fires when qualified dividends exceed ordinary dividends', () => {
    const ret = validReturn();
    ret.income.form1099Div = [
      {
        belongsTo: 'taxpayer',
        payerName: 'Fidelity Investments',
        ordinaryDividends: dollars(500),
        qualifiedDividends: dollars(800),
      },
    ];
    expect(codes(run(ret))).toContain('GT-INC-004');
  });

  it('GT-INC-005 notes that nonemployee compensation carries self-employment tax', () => {
    const ret = validReturn();
    ret.income.form1099Nec = [
      {
        belongsTo: 'taxpayer',
        payerName: 'Keystone Consulting',
        nonemployeeCompensation: dollars(9_000),
      },
    ];
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-INC-005');
    expect(finding?.severity).toBe('informational');
  });
});

describe('the remaining credit rules', () => {
  it('GT-EIC-001 accepts the separated-spouse election when the taxpayer lived apart', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingSeparately';
    ret.spouse = spouse();
    ret.credits = { earnedIncomeCredit: true, eicSeparatedSpouseElection: true };
    ret.livedApartFromSpouseLastSixMonths = true;
    expect(codes(run(ret))).not.toContain('GT-EIC-001');
  });

  it('GT-EIC-001 still fires when the election is made without living apart', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingSeparately';
    ret.spouse = spouse();
    ret.credits = { earnedIncomeCredit: true, eicSeparatedSpouseElection: true };
    expect(codes(run(ret))).toContain('GT-EIC-001');
  });

  it('GT-EIC-002 fires when an ITIN filer claims the credit', () => {
    const ret = validReturn();
    ret.taxpayer.tin = '900-70-1234';
    ret.credits = { earnedIncomeCredit: true };
    expect(codes(run(ret))).toContain('GT-EIC-002');
  });

  it('GT-EIC-003 fires when a qualifying child holds an ITIN', () => {
    const ret = validReturn();
    ret.credits = { earnedIncomeCredit: true };
    ret.dependents = [dependent({ tin: '900-70-1234', qualifiesForEarnedIncomeCredit: true })];
    expect(codes(run(ret))).toContain('GT-EIC-003');
  });

  it('GT-EIC-005 fires when a childless claimant is outside the age band', () => {
    const ret = validReturn();
    ret.taxpayer.dateOfBirth = '1950-05-05';
    ret.credits = { earnedIncomeCredit: true };
    expect(codes(run(ret))).toContain('GT-EIC-005');
  });

  it('GT-EIC-006 fires when the credit is claimed with no earned income', () => {
    const ret = validReturn();
    ret.credits = { earnedIncomeCredit: true };
    const report = run(ret, { computed: { earnedIncome: 0 } });
    expect(codes(report)).toContain('GT-EIC-006');
  });

  it('GT-CR-001 fires when the care credit has no qualifying person', () => {
    const ret = validReturn();
    ret.credits = { childAndDependentCareCredit: true };
    expect(codes(run(ret))).toContain('GT-CR-001');
  });

  it('GT-CR-001 accepts a dependent recorded as permanently disabled', () => {
    const ret = validReturn();
    ret.credits = { childAndDependentCareCredit: true };
    ret.dependents = [dependent({ dateOfBirth: '1998-01-05', isPermanentlyDisabled: true })];
    expect(codes(run(ret))).not.toContain('GT-CR-001');
  });

  it('GT-CR-002 fires when a dependent claims the saver’s credit', () => {
    const ret = validReturn();
    ret.credits = { retirementSavingsContributionsCredit: true };
    ret.taxpayerClaimedAsDependent = true;
    expect(codes(run(ret))).toContain('GT-CR-002');
  });
});

describe('the remaining mechanics rules', () => {
  it('GT-BANK-005 rejects an ineligible prefix on the debit account', () => {
    const ret = validReturn();
    ret.balanceDue = {
      method: 'directDebit',
      amount: dollars(1_200),
      account: {
        routingNumber: '400000008',
        accountNumber: '4417123098',
        accountType: 'checking',
      },
    };
    expect(codes(run(ret))).toContain('GT-BANK-005');
  });

  it('GT-PAY-001 fires on a settlement date that is not a real calendar date', () => {
    const ret = validReturn();
    ret.balanceDue = {
      method: 'directDebit',
      amount: dollars(1_200),
      requestedPaymentDate: '2026-02-30',
    };
    expect(codes(run(ret))).toContain('GT-PAY-001');
  });

  it('GT-EF-001 fires for the spouse alone on a joint return', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingJointly';
    ret.spouse = spouse();
    ret.signature.spousePin = '13579';
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-EF-001');
    expect(finding?.message).toContain('IND-032-04');
  });

  it('GT-EF-002 fires on a spouse PIN of the wrong length', () => {
    const ret = validReturn();
    ret.filingStatus = 'marriedFilingJointly';
    ret.spouse = spouse();
    ret.signature.spousePin = '1';
    ret.signature.spousePriorYearAgi = dollars(58_400);
    expect(codes(run(ret))).toContain('GT-EF-002');
  });

  it('GT-EF-003 fires on a missing signature date', () => {
    const ret = validReturn();
    ret.signature.signatureDate = '';
    expect(codes(run(ret))).toContain('GT-EF-003');
  });

  it('GT-EF-003 fires on a signature date that is not a real calendar date', () => {
    const ret = validReturn();
    ret.signature.signatureDate = '2026-02-30';
    expect(codes(run(ret))).toContain('GT-EF-003');
  });

  it('GT-EF-003 checks the spouse signature date too', () => {
    const ret = validReturn();
    ret.signature.spouseSignatureDate = '2026-06-01';
    expect(codes(run(ret))).toContain('GT-EF-003');
  });

  it('GT-EF-004 fires on a designee with no name', () => {
    const ret = validReturn();
    ret.thirdPartyDesignee = { allow: true, phone: '215-555-0100', pin: '11223' };
    expect(codes(run(ret))).toContain('GT-EF-004');
  });

  it('GT-EF-004 accepts a fully identified designee', () => {
    const ret = validReturn();
    ret.thirdPartyDesignee = {
      allow: true,
      name: 'R. Mensah',
      phone: '215-555-0100',
      pin: '11223',
    };
    expect(codes(run(ret))).not.toContain('GT-EF-004');
  });

  it('GT-EF-004 stays quiet when no designee is authorised', () => {
    const ret = validReturn();
    ret.thirdPartyDesignee = { allow: false };
    expect(codes(run(ret))).not.toContain('GT-EF-004');
  });

  it('accepts a Practitioner PIN with no prior-year shared secret', () => {
    // The Practitioner PIN method authenticates through a signed Form 8879 held
    // by the preparer, so GT-EF-001 has nothing to check.
    const ret = validReturn();
    ret.signature.method = 'practitionerPin';
    delete ret.signature.taxpayerPriorYearAgi;
    expect(codes(run(ret))).not.toContain('GT-EF-001');
  });
});

// ---------------------------------------------------------------------------
// The engine itself
// ---------------------------------------------------------------------------

describe('suppression', () => {
  it('skips the suppressed rule and reports it back', () => {
    const ret = validReturn();
    ret.taxpayer.tin = '000-45-6789';

    const report = run(ret, { suppress: ['GT-ID-001'] });
    expect(codes(report)).not.toContain('GT-ID-001');
    expect(report.suppressedCodes).toEqual(['GT-ID-001']);
    expect(report.rulesEvaluated).toBe(FEDERAL_DIAGNOSTIC_RULES.length - 1);
  });

  it('does not echo back a suppression code that names no rule', () => {
    // A typo in a suppression list must not look as though it took effect.
    const report = run(validReturn(), { suppress: ['GT-NOT-A-RULE', 'GT-ID-001'] });
    expect(report.suppressedCodes).toEqual(['GT-ID-001']);
  });

  it('returns suppressed codes in sorted order', () => {
    const report = run(validReturn(), { suppress: ['GT-W2-001', 'GT-ID-001', 'GT-EF-006'] });
    expect(report.suppressedCodes).toEqual(['GT-EF-006', 'GT-ID-001', 'GT-W2-001']);
  });
});

describe('minimum severity', () => {
  it('drops everything below the requested floor', () => {
    const ret = validReturn();
    ret.taxpayer.tin = '000-45-6789';
    ret.income.w2s = [emptyW2()];

    const everything = run(ret);
    expect(codes(everything)).toContain('GT-ID-001');
    expect(codes(everything)).toContain('GT-W2-008');

    const rejectsOnly = run(ret, { minimumSeverity: 'reject' });
    expect(codes(rejectsOnly)).toContain('GT-ID-001');
    expect(codes(rejectsOnly)).not.toContain('GT-W2-008');
    expect(rejectsOnly.counts.warning).toBe(0);
    expect(rejectsOnly.diagnostics.every((d) => d.severity === 'reject')).toBe(true);
  });

  it('counts only what survived the filter', () => {
    const ret = validReturn();
    ret.taxpayer.tin = '000-45-6789';
    ret.income.w2s = [emptyW2()];

    const filtered = run(ret, { minimumSeverity: 'error' });
    const summed =
      filtered.counts.reject +
      filtered.counts.error +
      filtered.counts.warning +
      filtered.counts.informational;
    expect(summed).toBe(filtered.diagnostics.length);
    expect(filtered.counts.warning).toBe(0);
  });
});

describe('ordering', () => {
  function messyReturn(): FederalReturn {
    const ret = validReturn();
    ret.taxpayer.tin = '000-45-6789';
    ret.address.state = 'ZZ';
    ret.address.zip = '191';
    ret.refund.account.routingNumber = '021000022';
    ret.refund.account.accountNumber = '4417-1230-98';
    ret.signature.taxpayerPin = '123';
    ret.income.w2s = [{ ...cleanW2(), employerEin: '00-1234567' }, emptyW2()];
    ret.taxpayerClaimedAsDependent = true;
    return ret;
  }

  it('produces identical reports for identical input', () => {
    expect(run(messyReturn())).toEqual(run(messyReturn()));
  });

  it('sorts by severity, then code, then field', () => {
    const report = run(messyReturn());
    expect(report.diagnostics.length).toBeGreaterThan(3);

    for (let index = 1; index < report.diagnostics.length; index += 1) {
      const previous = report.diagnostics[index - 1]!;
      const current = report.diagnostics[index]!;
      const previousRank = SEVERITY_RANK[previous.severity];
      const currentRank = SEVERITY_RANK[current.severity];
      expect(previousRank).toBeLessThanOrEqual(currentRank);
      if (previousRank === currentRank) {
        expect(previous.code <= current.code).toBe(true);
      }
    }
  });

  it('places a fieldless diagnostic after the ones that name a field', () => {
    const fieldless: DiagnosticRule = {
      code: 'GT-TEST-001',
      severity: 'warning',
      title: 'Fieldless finding',
      evaluate() {
        return [{ message: 'no field' }, { message: 'a field', field: 'taxpayer.tin' }];
      },
    };
    const report = run(validReturn(), { rules: [fieldless] });
    expect(report.diagnostics.map((d) => d.field)).toEqual(['taxpayer.tin', undefined]);
  });
});

describe('a rule that throws', () => {
  const exploding: DiagnosticRule = {
    code: 'GT-TEST-BOOM',
    severity: 'warning',
    title: 'A rule that throws',
    evaluate() {
      throw new Error('synthetic rule failure');
    },
  };

  const working: DiagnosticRule = {
    code: 'GT-TEST-OK',
    severity: 'warning',
    title: 'A rule that reports',
    evaluate() {
      return [{ message: 'this finding survived', field: 'taxpayer.tin' }];
    },
  };

  it('reports GT-ENGINE-001 without losing the other diagnostics', () => {
    const report = run(validReturn(), { rules: [exploding, working] });
    const raised = codes(report);
    expect(raised).toContain('GT-ENGINE-001');
    expect(raised).toContain('GT-TEST-OK');
    expect(report.rulesEvaluated).toBe(2);
  });

  it('names the failing rule and the thrown message', () => {
    const report = run(validReturn(), { rules: [exploding] });
    const failure = report.diagnostics.find((d) => d.code === 'GT-ENGINE-001');
    expect(failure?.severity).toBe('error');
    expect(failure?.message).toContain('GT-TEST-BOOM');
    expect(failure?.message).toContain('synthetic rule failure');
  });

  it('handles a rule that throws something that is not an Error', () => {
    const oddball: DiagnosticRule = {
      code: 'GT-TEST-ODD',
      severity: 'warning',
      title: 'A rule that throws a string',
      evaluate(): never {
        throw 'just a string';
      },
    };
    const report = run(validReturn(), { rules: [oddball] });
    expect(report.diagnostics[0]?.message).toContain('just a string');
  });

  it('blocks e-file, because a rule that did not run reviewed nothing', () => {
    const report = run(validReturn(), { rules: [exploding] });
    expect(report.eFileEligible).toBe(false);
    expect(report.blockingCount).toBe(1);
  });
});

describe('the rule registry', () => {
  it('has no duplicate codes', () => {
    const unique = new Set(FEDERAL_DIAGNOSTIC_RULES.map((rule) => rule.code));
    expect(unique.size).toBe(FEDERAL_DIAGNOSTIC_RULES.length);
  });

  it('refuses to accept a rule set with a collision', () => {
    const rule = FEDERAL_DIAGNOSTIC_RULES[0]!;
    expect(() => assertUniqueRuleCodes([rule, rule])).toThrow(/Duplicate diagnostic rule codes/);
    expect(() => assertUniqueRuleCodes([rule])).not.toThrow();
  });

  it('prefixes every code so it can never be mistaken for an IRS code', () => {
    for (const rule of FEDERAL_DIAGNOSTIC_RULES) {
      expect(rule.code.startsWith('GT-')).toBe(true);
      expect(rule.title.length).toBeGreaterThan(0);
    }
  });

  it('looks a rule up by code', () => {
    expect(getRuleByCode('GT-BANK-002')?.title).toContain('ABA check digit');
    expect(getRuleByCode('GT-EF-006')?.severity).toBe('reject');
    expect(getRuleByCode('GT-NOT-A-RULE')).toBeUndefined();
  });

  it('carries the rule identity onto every diagnostic it produces', () => {
    const ret = validReturn();
    ret.refund.account.routingNumber = '021000022';
    const finding = run(ret).diagnostics.find((d) => d.code === 'GT-BANK-002');
    expect(finding?.form).toBe('Form 1040');
    expect(finding?.irsBusinessRule).toBe('R0000-058-01');
    expect(finding?.severity).toBe('reject');
  });

  it('omits optional keys rather than setting them to undefined', () => {
    const bare: DiagnosticRule = {
      code: 'GT-TEST-BARE',
      severity: 'informational',
      title: 'A rule with no form and no citation',
      evaluate() {
        return [{ message: 'bare finding' }];
      },
    };
    const diagnostic = run(validReturn(), { rules: [bare] }).diagnostics[0]!;
    expect(Object.keys(diagnostic).sort()).toEqual(['code', 'message', 'severity']);
  });
});

describe('summarizeDiagnostics', () => {
  it('states eligibility even when there is nothing to report', () => {
    expect(summarizeDiagnostics(run(validReturn()))).toBe('No diagnostics — eligible for e-file.');
  });

  it('counts each severity and pluralises it', () => {
    const ret = validReturn();
    ret.taxpayer.tin = '000-45-6789';
    ret.address.state = 'ZZ';
    ret.income.w2s = [emptyW2()];
    ret.taxpayerClaimedAsDependent = true;

    const summary = summarizeDiagnostics(run(ret));
    expect(summary).toContain('1 reject');
    expect(summary).toContain('not eligible for e-file');
  });

  it('uses the singular for a single finding', () => {
    const single: DiagnosticRule = {
      code: 'GT-TEST-ONE',
      severity: 'warning',
      title: 'One warning',
      evaluate() {
        return [{ message: 'the only finding' }];
      },
    };
    const report = run(validReturn(), { rules: [single] });
    expect(summarizeDiagnostics(report)).toBe('1 warning — eligible for e-file.');
  });
});

describe('the as-of date', () => {
  it('defaults to today when the caller does not supply one', () => {
    // Nothing in the fixture depends on today's date, so the default path must
    // still produce a clean report whenever the suite happens to run.
    const report = runDiagnostics(validReturn());
    expect(report.eFileEligible).toBe(true);
  });

  it('changes what counts as a future signature date', () => {
    const ret = validReturn();
    ret.signature.signatureDate = '2026-02-15';
    expect(codes(runDiagnostics(ret, { asOfDate: '2026-02-14' }))).toContain('GT-EF-003');
    expect(codes(runDiagnostics(ret, { asOfDate: '2026-02-15' }))).not.toContain('GT-EF-003');
  });
});
