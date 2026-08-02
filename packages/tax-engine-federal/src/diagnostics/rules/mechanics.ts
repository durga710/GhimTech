/**
 * Banking, payment and electronic-signature rules.
 *
 * These are the checks that decide whether a finished return can actually be
 * transmitted and whether the money moves. They are worth separating from the
 * substantive tax rules because their failure mode is different: a wrong
 * deduction produces a wrong number, whereas a wrong routing number produces a
 * correct return whose refund silently turns into a paper cheque six weeks
 * later, and a missing shared secret produces a reject that costs the preparer a
 * whole transmission cycle for a reason nothing on the 1040 itself reveals.
 */
import { EFIN_LENGTH, PIN_LENGTH, RETURN_DUE_DATE } from '../../constants/ty2025.js';
import {
  isDirectDepositRoutingNumber,
  isValidBankAccountNumber,
  isValidPin,
  isValidRoutingNumber,
} from '../../identifiers.js';
import { isAfter, isIsoDate } from '../../dates.js';
import type { DiagnosticFinding, DiagnosticRule } from '../types.js';
import type { BankAccount, FederalReturn } from '../../types.js';

/** A Preparer Tax Identification Number: `P` followed by eight digits. */
const PTIN_SHAPE = /^P\d{8}$/;

const EFIN_SHAPE = new RegExp(`^\\d{${EFIN_LENGTH}}$`);

/** The account a refund would be deposited into, if one was elected. */
function depositAccount(ret: FederalReturn): BankAccount | undefined {
  return ret.refund?.method === 'directDeposit' ? ret.refund.account : undefined;
}

/** The account a balance due would be debited from, if one was elected. */
function debitAccount(ret: FederalReturn): BankAccount | undefined {
  return ret.balanceDue?.method === 'directDebit' ? ret.balanceDue.account : undefined;
}

/**
 * A return with no explicit filing method is transmitted electronically. Paper
 * is the deliberate exception, so the default has to be the strict one — the
 * alternative is that an omitted field quietly disables every e-file rule.
 */
function isElectronicallyFiled(ret: FederalReturn): boolean {
  return ret.filingMethod === undefined || ret.filingMethod === 'efile';
}

// ---------------------------------------------------------------------------
// Banking
// ---------------------------------------------------------------------------

const directDepositAccountPresent: DiagnosticRule = {
  code: 'GT-BANK-001',
  severity: 'reject',
  title: 'Direct deposit has an account to deposit into',
  form: 'Form 1040',
  reference: 'Form 1040 instructions, lines 35b-35d',
  evaluate({ return: ret }) {
    if (ret.refund?.method !== 'directDeposit') return [];
    if (ret.refund.account) return [];
    return [
      {
        message:
          'Direct deposit is elected for the refund but no routing number, account number or account type has been entered.',
        field: 'refund.account',
        resolution:
          'Enter the bank details from a cheque, not from a deposit slip — deposit slips often carry an internal routing number the IRS will not accept.',
      },
    ];
  },
};

const routingNumberChecksum: DiagnosticRule = {
  code: 'GT-BANK-002',
  severity: 'reject',
  title: 'Refund routing number passes the ABA check digit',
  form: 'Form 1040',
  irsBusinessRule: 'R0000-058-01',
  reference: 'Form 1040 instructions, line 35b',
  evaluate({ return: ret }) {
    const account = depositAccount(ret);
    if (!account) return [];
    if (isValidRoutingNumber(account.routingNumber)) return [];
    return [
      {
        message: `The refund routing number "${account.routingNumber}" is not nine digits or fails the ABA check digit.`,
        field: 'refund.account.routingNumber',
        resolution:
          'Re-key the nine digits printed in the lower left of a cheque. A single transposed digit almost always breaks the check digit, which is exactly what it exists to catch.',
      },
    ];
  },
};

const routingNumberPrefix: DiagnosticRule = {
  code: 'GT-BANK-003',
  severity: 'reject',
  title: 'Refund routing number is eligible for direct deposit',
  form: 'Form 1040',
  reference: 'Form 1040 instructions, line 35b',
  evaluate({ return: ret }) {
    const account = depositAccount(ret);
    if (!account) return [];
    // Only report the prefix once the number is otherwise well formed.
    // GT-BANK-002 already owns the malformed case, and telling a preparer the
    // same digits are wrong twice for two different reasons helps nobody.
    if (!isValidRoutingNumber(account.routingNumber)) return [];
    if (isDirectDepositRoutingNumber(account.routingNumber)) return [];
    return [
      {
        message: `The refund routing number "${account.routingNumber}" begins ${account.routingNumber.slice(0, 2)}, which is outside the Federal Reserve (01-12) and thrift (21-32) ranges the IRS accepts for direct deposit.`,
        field: 'refund.account.routingNumber',
        resolution:
          'Prefixes outside those ranges belong to electronic-payment-only and traveller’s cheque institutions. Use a deposit account at a bank or credit union, or take the refund by cheque.',
      },
    ];
  },
};

const depositAccountNumber: DiagnosticRule = {
  code: 'GT-BANK-004',
  severity: 'reject',
  title: 'Refund account number is well formed',
  form: 'Form 1040',
  reference: 'Form 1040 instructions, line 35d',
  evaluate({ return: ret }) {
    const account = depositAccount(ret);
    if (!account) return [];
    if (isValidBankAccountNumber(account.accountNumber)) return [];
    return [
      {
        message: `The refund account number "${account.accountNumber}" is not one to seventeen letters or digits.`,
        field: 'refund.account.accountNumber',
        resolution:
          'Remove hyphens, spaces and any leading branch code. Only the account number itself is transmitted.',
      },
    ];
  },
};

const directDebitAccount: DiagnosticRule = {
  code: 'GT-BANK-005',
  severity: 'reject',
  title: 'Direct debit account is complete and well formed',
  form: 'Form 1040',
  reference: 'Form 1040 instructions, "Amount you owe"',
  evaluate({ return: ret }) {
    if (ret.balanceDue?.method !== 'directDebit') return [];
    const account = debitAccount(ret);
    if (!account) {
      return [
        {
          message:
            'Direct debit is elected for the balance due but no bank account has been entered.',
          field: 'balanceDue.account',
          resolution: 'Enter the routing number, account number and account type.',
        },
      ];
    }

    // The gateway applies the identical account edits to a debit as to a
    // deposit, so a preparer who carefully fixed the refund side gains nothing
    // if the payment side goes unchecked.
    const findings: DiagnosticFinding[] = [];
    if (!isValidRoutingNumber(account.routingNumber)) {
      findings.push({
        message: `The direct debit routing number "${account.routingNumber}" is not nine digits or fails the ABA check digit.`,
        field: 'balanceDue.account.routingNumber',
        resolution: 'Re-key the nine digits printed in the lower left of a cheque.',
      });
    } else if (!isDirectDepositRoutingNumber(account.routingNumber)) {
      findings.push({
        message: `The direct debit routing number "${account.routingNumber}" begins ${account.routingNumber.slice(0, 2)}, outside the Federal Reserve (01-12) and thrift (21-32) ranges the IRS accepts.`,
        field: 'balanceDue.account.routingNumber',
        resolution: 'Use a deposit account at a bank or credit union, or pay by another method.',
      });
    }
    if (!isValidBankAccountNumber(account.accountNumber)) {
      findings.push({
        message: `The direct debit account number "${account.accountNumber}" is not one to seventeen letters or digits.`,
        field: 'balanceDue.account.accountNumber',
        resolution: 'Remove hyphens, spaces and any leading branch code.',
      });
    }
    return findings;
  },
};

const requestedPaymentDate: DiagnosticRule = {
  code: 'GT-PAY-001',
  severity: 'error',
  title: 'Requested payment date is in the future and on or before the due date',
  form: 'Form 1040',
  reference: 'IRS Publication 4163',
  evaluate({ return: ret, asOfDate }) {
    if (ret.balanceDue?.method !== 'directDebit') return [];
    const requested = ret.balanceDue.requestedPaymentDate;
    if (requested === undefined) return [];

    if (!isIsoDate(requested)) {
      return [
        {
          message: `The requested payment date "${requested}" is not a valid calendar date.`,
          field: 'balanceDue.requestedPaymentDate',
          resolution: 'Enter the settlement date as YYYY-MM-DD.',
        },
      ];
    }
    if (isAfter(asOfDate, requested)) {
      return [
        {
          message: `The requested payment date ${requested} has already passed as of ${asOfDate}.`,
          field: 'balanceDue.requestedPaymentDate',
          resolution:
            'A debit cannot be scheduled into the past. Move the date forward, or pay at IRS Direct Pay instead.',
        },
      ];
    }
    if (isAfter(requested, RETURN_DUE_DATE)) {
      return [
        {
          message: `The requested payment date ${requested} falls after the ${RETURN_DUE_DATE} due date, so interest and the failure-to-pay penalty will run from the due date.`,
          field: 'balanceDue.requestedPaymentDate',
          resolution:
            'Settle on or before the due date, or arrange an instalment agreement on Form 9465.',
        },
      ];
    }
    return [];
  },
};

// ---------------------------------------------------------------------------
// Electronic signature
// ---------------------------------------------------------------------------

const selfSelectSharedSecret: DiagnosticRule = {
  code: 'GT-EF-001',
  severity: 'reject',
  title: 'Self-Select PIN carries a prior-year shared secret',
  form: 'Form 1040',
  irsBusinessRule: 'IND-031-04',
  reference: 'IRS Publication 1345',
  evaluate({ return: ret }) {
    const signature = ret.signature;
    if (!signature || signature.method !== 'selfSelectPin') return [];

    const findings: DiagnosticFinding[] = [];
    const hasTaxpayerSecret =
      signature.taxpayerPriorYearAgi !== undefined || signature.taxpayerPriorYearPin !== undefined;
    if (!hasTaxpayerSecret) {
      findings.push({
        message:
          'The Self-Select PIN method is used but neither the primary taxpayer’s prior-year adjusted gross income nor their prior-year PIN has been entered.',
        field: 'signature.taxpayerPriorYearAgi',
        resolution:
          'The IRS authenticates the signature against one of those two values. Take the AGI from last year’s line 11 or from a transcript; it must be the originally filed figure, not an amended one.',
      });
    }
    if (ret.filingStatus === 'marriedFilingJointly') {
      const hasSpouseSecret =
        signature.spousePriorYearAgi !== undefined || signature.spousePriorYearPin !== undefined;
      if (!hasSpouseSecret) {
        // The gateway raises IND-032 for the spouse and IND-031 for the
        // primary. A preparer chasing a reject needs to know which of the two
        // signers failed, so the spouse citation is carried in the message.
        findings.push({
          message:
            'This is a joint return signed with Self-Select PINs, but neither the spouse’s prior-year adjusted gross income nor their prior-year PIN has been entered (IND-032-04).',
          field: 'signature.spousePriorYearAgi',
          resolution:
            'Both signers are authenticated separately. If the couple filed jointly last year, each uses the same joint AGI.',
        });
      }
    }
    return findings;
  },
};

const signaturePins: DiagnosticRule = {
  code: 'GT-EF-002',
  severity: 'reject',
  title: 'Electronic signature PINs are five digits',
  form: 'Form 1040',
  reference: 'IRS Publication 1345',
  evaluate({ return: ret }) {
    const signature = ret.signature;
    if (!signature) return [];

    const findings: DiagnosticFinding[] = [];
    if (!isValidPin(signature.taxpayerPin ?? '', PIN_LENGTH)) {
      findings.push({
        message: `The primary taxpayer signature PIN must be exactly ${PIN_LENGTH} digits and cannot be all zeros.`,
        field: 'signature.taxpayerPin',
        resolution: 'The taxpayer chooses any five digits; they need not match a prior year.',
      });
    }
    if (ret.filingStatus === 'marriedFilingJointly') {
      const spousePin = signature.spousePin;
      if (spousePin === undefined) {
        findings.push({
          message: 'A joint return requires a signature PIN for the spouse as well as the primary.',
          field: 'signature.spousePin',
          resolution: 'Both spouses sign a joint return, electronically or on paper.',
        });
      } else if (!isValidPin(spousePin, PIN_LENGTH)) {
        findings.push({
          message: `The spouse signature PIN must be exactly ${PIN_LENGTH} digits and cannot be all zeros.`,
          field: 'signature.spousePin',
        });
      }
    }
    return findings;
  },
};

const signatureDate: DiagnosticRule = {
  code: 'GT-EF-003',
  severity: 'error',
  title: 'Signature dates are real and not in the future',
  form: 'Form 1040',
  reference: 'IRS Publication 1345',
  evaluate({ return: ret, asOfDate }) {
    const signature = ret.signature;
    if (!signature) return [];

    const findings: DiagnosticFinding[] = [];
    const check = (value: string | undefined, field: string, who: string): void => {
      if (value === undefined || value.trim().length === 0) {
        findings.push({
          message: `The ${who} signature date is missing.`,
          field,
          resolution: 'A return cannot be transmitted before it has been signed.',
        });
        return;
      }
      if (!isIsoDate(value)) {
        findings.push({
          message: `The ${who} signature date "${value}" is not a valid calendar date.`,
          field,
          resolution: 'Enter the date as YYYY-MM-DD.',
        });
        return;
      }
      if (isAfter(value, asOfDate)) {
        findings.push({
          message: `The ${who} signature date ${value} is after today (${asOfDate}).`,
          field,
          resolution: 'A signature cannot be dated forward. Correct the date to the day signed.',
        });
      }
    };

    check(signature.signatureDate, 'signature.signatureDate', 'primary taxpayer');
    if (signature.spouseSignatureDate !== undefined) {
      check(signature.spouseSignatureDate, 'signature.spouseSignatureDate', 'spouse');
    }
    return findings;
  },
};

const thirdPartyDesignee: DiagnosticRule = {
  code: 'GT-EF-004',
  severity: 'error',
  title: 'Third party designee is fully identified',
  form: 'Form 1040',
  reference: 'Form 1040 instructions, "Third Party Designee"',
  evaluate({ return: ret }) {
    const designee = ret.thirdPartyDesignee;
    if (!designee || designee.allow !== true) return [];

    const findings: DiagnosticFinding[] = [];
    if (!designee.name || designee.name.trim().length === 0) {
      findings.push({
        message: 'A third party designee is authorised but no designee name was entered.',
        field: 'thirdPartyDesignee.name',
      });
    }
    if (!designee.phone || designee.phone.trim().length === 0) {
      findings.push({
        message:
          'A third party designee is authorised but no designee telephone number was entered.',
        field: 'thirdPartyDesignee.phone',
      });
    }
    if (!designee.pin || !isValidPin(designee.pin, PIN_LENGTH)) {
      findings.push({
        message: `The third party designee personal identification number must be exactly ${PIN_LENGTH} digits.`,
        field: 'thirdPartyDesignee.pin',
        resolution:
          'The IRS uses this number to authenticate the designee on the telephone. Any five digits the designee will remember will do.',
      });
    }
    return findings;
  },
};

const preparerIdentifiers: DiagnosticRule = {
  code: 'GT-EF-005',
  severity: 'error',
  title: 'Paid preparer identifiers are well formed',
  form: 'Form 1040',
  reference: 'IRC 6109(a)(4); IRS Publication 1345',
  evaluate({ return: ret }) {
    const preparer = ret.preparer;
    if (!preparer) return [];

    const findings: DiagnosticFinding[] = [];
    if (!PTIN_SHAPE.test(preparer.ptin.trim())) {
      findings.push({
        message: `The preparer tax identification number "${preparer.ptin}" is not the letter P followed by eight digits.`,
        field: 'preparer.ptin',
        resolution:
          'Every paid preparer must sign with a current PTIN. Renew it in the IRS Tax Professional PTIN System if it has lapsed.',
      });
    }
    if (preparer.efin !== undefined && !EFIN_SHAPE.test(preparer.efin.trim())) {
      findings.push({
        message: `The electronic filing identification number "${preparer.efin}" is not ${EFIN_LENGTH} digits.`,
        field: 'preparer.efin',
        resolution:
          'The EFIN is assigned to the firm rather than the individual, and is always six digits.',
      });
    }
    return findings;
  },
};

const signatureRequired: DiagnosticRule = {
  code: 'GT-EF-006',
  severity: 'reject',
  title: 'An electronically filed return is signed',
  form: 'Form 1040',
  reference: 'IRS Publication 1345',
  evaluate({ return: ret }) {
    if (!isElectronicallyFiled(ret)) return [];
    if (ret.signature) return [];
    return [
      {
        message:
          'This return is set to be filed electronically but carries no signature block at all.',
        field: 'signature',
        resolution:
          'Capture a Self-Select PIN with the prior-year shared secret, or a Practitioner PIN with a signed Form 8879 on file.',
      },
    ];
  },
};

export const mechanicsRules: readonly DiagnosticRule[] = [
  directDepositAccountPresent,
  routingNumberChecksum,
  routingNumberPrefix,
  depositAccountNumber,
  directDebitAccount,
  requestedPaymentDate,
  selfSelectSharedSecret,
  signaturePins,
  signatureDate,
  thirdPartyDesignee,
  preparerIdentifiers,
  signatureRequired,
];
