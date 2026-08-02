import { describe, expect, it } from 'vitest';
import {
  US_STATE_CODES,
  classifyTin,
  formatEin,
  formatTin,
  isDirectDepositRoutingNumber,
  isEmploymentAuthorizedTin,
  isValidAtin,
  isValidBankAccountNumber,
  isValidEin,
  isValidItin,
  isValidPin,
  isValidRoutingNumber,
  isValidSsn,
  isValidStateCode,
  isValidTin,
  isValidZipCode,
  maskTin,
  normalizeTin,
} from './identifiers.js';

describe('normalizeTin', () => {
  it('strips the formatting a preparer or a scanner may have left in', () => {
    expect(normalizeTin('123-45-6789')).toBe('123456789');
    expect(normalizeTin('123 45 6789')).toBe('123456789');
    expect(normalizeTin('123456789')).toBe('123456789');
  });
});

describe('isValidSsn', () => {
  it('accepts an ordinary issued number in any formatting', () => {
    expect(isValidSsn('123-45-6789')).toBe(true);
    expect(isValidSsn('123456789')).toBe(true);
    expect(isValidSsn('001-01-0001')).toBe(true);
  });

  it('rejects the area numbers the SSA never issued', () => {
    expect(isValidSsn('000-45-6789')).toBe(false);
    expect(isValidSsn('666-45-6789')).toBe(false);
    expect(isValidSsn('900-45-6789')).toBe(false);
    expect(isValidSsn('999-99-9999')).toBe(false);
  });

  it('accepts 899, the last area below the 9xx block', () => {
    // 899 is the boundary that a naive "reject anything starting with 8 or 9"
    // check gets wrong, and real taxpayers hold numbers in this area.
    expect(isValidSsn('899-45-6789')).toBe(true);
    expect(isValidSsn('898-45-6789')).toBe(true);
  });

  it('rejects a zero group or a zero serial', () => {
    expect(isValidSsn('123-00-6789')).toBe(false);
    expect(isValidSsn('123-45-0000')).toBe(false);
  });

  it('rejects anything that is not nine digits', () => {
    expect(isValidSsn('12345678')).toBe(false);
    expect(isValidSsn('1234567890')).toBe(false);
    expect(isValidSsn('12345678A')).toBe(false);
    expect(isValidSsn('')).toBe(false);
  });
});

describe('isValidItin', () => {
  it('accepts every published group range', () => {
    expect(isValidItin('900-50-1234')).toBe(true);
    expect(isValidItin('900-65-1234')).toBe(true);
    expect(isValidItin('900-70-1234')).toBe(true);
    expect(isValidItin('900-88-1234')).toBe(true);
    expect(isValidItin('900-90-1234')).toBe(true);
    expect(isValidItin('900-92-1234')).toBe(true);
    expect(isValidItin('900-94-1234')).toBe(true);
    expect(isValidItin('999-99-9999')).toBe(true);
  });

  it('rejects the gaps between the group ranges', () => {
    expect(isValidItin('900-49-1234')).toBe(false);
    expect(isValidItin('900-66-1234')).toBe(false);
    expect(isValidItin('900-69-1234')).toBe(false);
    expect(isValidItin('900-89-1234')).toBe(false);
    expect(isValidItin('900-93-1234')).toBe(false);
  });

  it('rejects an area below 900 and a zero serial', () => {
    expect(isValidItin('899-70-1234')).toBe(false);
    expect(isValidItin('900-70-0000')).toBe(false);
  });
});

describe('isValidAtin', () => {
  it('accepts group 93 in the 9xx block and nothing else', () => {
    expect(isValidAtin('900-93-1234')).toBe(true);
    expect(isValidAtin('999-93-0001')).toBe(true);
    expect(isValidAtin('900-92-1234')).toBe(false);
    expect(isValidAtin('900-94-1234')).toBe(false);
    expect(isValidAtin('899-93-1234')).toBe(false);
    expect(isValidAtin('900-93-0000')).toBe(false);
  });
});

describe('classifyTin', () => {
  it('separates the three issuing schemes', () => {
    expect(classifyTin('123-45-6789')).toBe('ssn');
    expect(classifyTin('899-45-6789')).toBe('ssn');
    expect(classifyTin('900-70-1234')).toBe('itin');
    expect(classifyTin('900-93-1234')).toBe('atin');
    expect(classifyTin('900-89-1234')).toBe('invalid');
    expect(classifyTin('000-45-6789')).toBe('invalid');
    expect(classifyTin('666-45-6789')).toBe('invalid');
  });

  it('drives isValidTin', () => {
    expect(isValidTin('900-93-1234')).toBe(true);
    expect(isValidTin('900-89-1234')).toBe(false);
  });

  it('drives the employment-authorised test, which admits only a true SSN', () => {
    expect(isEmploymentAuthorizedTin('123-45-6789')).toBe(true);
    expect(isEmploymentAuthorizedTin('900-70-1234')).toBe(false);
    expect(isEmploymentAuthorizedTin('900-93-1234')).toBe(false);
  });
});

describe('formatTin and maskTin', () => {
  it('formats a well-formed number and leaves a malformed one alone', () => {
    expect(formatTin('123456789')).toBe('123-45-6789');
    expect(formatTin('123-45-6789')).toBe('123-45-6789');
    expect(formatTin('12345')).toBe('12345');
  });

  it('never lets more than the last four digits reach a log', () => {
    expect(maskTin('123-45-6789')).toBe('***-**-6789');
    expect(maskTin('123456789')).toBe('***-**-6789');
    expect(maskTin('12')).toBe('***-**-****');
    expect(maskTin('')).toBe('***-**-****');
  });
});

describe('isValidEin', () => {
  it('accepts a nine-digit number in either formatting', () => {
    expect(isValidEin('12-3456789')).toBe(true);
    expect(isValidEin('123456789')).toBe(true);
  });

  it('rejects the placeholder shapes that get typed into a W-2 by hand', () => {
    expect(isValidEin('00-1234567')).toBe(false);
    expect(isValidEin('111111111')).toBe(false);
    expect(isValidEin('000000000')).toBe(false);
    expect(isValidEin('12345678')).toBe(false);
    expect(isValidEin('')).toBe(false);
  });

  it('formats with the EIN hyphen position, not the SSN one', () => {
    expect(formatEin('123456789')).toBe('12-3456789');
    expect(formatEin('bad')).toBe('bad');
  });
});

describe('isValidRoutingNumber', () => {
  // Each of these was checked by hand against the 3-7-1 weighting:
  //   021000021 -> 0+14+1+0+0+0+0+14+1   = 30
  //   011000015 -> 0+7+1+0+0+0+0+7+5     = 20
  //   122105155 -> 3+14+2+3+0+5+3+35+5   = 70
  //   322271627 -> 9+14+2+6+49+1+18+14+7 = 120
  it('accepts numbers whose weighted digit sum is divisible by ten', () => {
    expect(isValidRoutingNumber('021000021')).toBe(true);
    expect(isValidRoutingNumber('011000015')).toBe(true);
    expect(isValidRoutingNumber('122105155')).toBe(true);
    expect(isValidRoutingNumber('322271627')).toBe(true);
  });

  it('rejects a single mistyped digit', () => {
    // 021000022 differs from a valid number in the check digit alone and sums
    // to 31 — precisely the error the check digit exists to catch.
    expect(isValidRoutingNumber('021000022')).toBe(false);
    expect(isValidRoutingNumber('012000021')).toBe(false);
  });

  it('rejects anything that is not nine digits', () => {
    expect(isValidRoutingNumber('02100002')).toBe(false);
    expect(isValidRoutingNumber('0210000211')).toBe(false);
    expect(isValidRoutingNumber('02100002X')).toBe(false);
  });
});

describe('isDirectDepositRoutingNumber', () => {
  it('accepts the Federal Reserve and thrift prefixes', () => {
    expect(isDirectDepositRoutingNumber('011000015')).toBe(true);
    expect(isDirectDepositRoutingNumber('021000021')).toBe(true);
    expect(isDirectDepositRoutingNumber('122105155')).toBe(true);
    expect(isDirectDepositRoutingNumber('322271627')).toBe(true);
  });

  it('rejects a checksum-valid number whose prefix is outside those ranges', () => {
    // 130000006 sums to 30 and 400000008 to 20, so both pass the check digit;
    // only the prefix disqualifies them.
    expect(isValidRoutingNumber('130000006')).toBe(true);
    expect(isDirectDepositRoutingNumber('130000006')).toBe(false);
    expect(isValidRoutingNumber('400000008')).toBe(true);
    expect(isDirectDepositRoutingNumber('400000008')).toBe(false);
  });

  it('rejects a number that fails the check digit regardless of prefix', () => {
    expect(isDirectDepositRoutingNumber('021000022')).toBe(false);
  });
});

describe('isValidBankAccountNumber', () => {
  it('accepts one to seventeen alphanumeric characters', () => {
    expect(isValidBankAccountNumber('4')).toBe(true);
    expect(isValidBankAccountNumber('4417123098')).toBe(true);
    expect(isValidBankAccountNumber('ABC123456789')).toBe(true);
    expect(isValidBankAccountNumber('12345678901234567')).toBe(true);
    expect(isValidBankAccountNumber('  4417123098  ')).toBe(true);
  });

  it('rejects separators, emptiness and anything over seventeen characters', () => {
    expect(isValidBankAccountNumber('4417-1230-98')).toBe(false);
    expect(isValidBankAccountNumber('4417 1230 98')).toBe(false);
    expect(isValidBankAccountNumber('')).toBe(false);
    expect(isValidBankAccountNumber('123456789012345678')).toBe(false);
  });
});

describe('isValidZipCode', () => {
  it('accepts five digits and both ZIP+4 spellings', () => {
    expect(isValidZipCode('19102')).toBe(true);
    expect(isValidZipCode('19102-1234')).toBe(true);
    expect(isValidZipCode('191021234')).toBe(true);
    expect(isValidZipCode(' 19102 ')).toBe(true);
  });

  it('rejects short, long and non-numeric codes', () => {
    expect(isValidZipCode('1910')).toBe(false);
    expect(isValidZipCode('19102-12')).toBe(false);
    expect(isValidZipCode('ABCDE')).toBe(false);
    expect(isValidZipCode('')).toBe(false);
  });
});

describe('isValidStateCode', () => {
  it('accepts states, the District, territories and military posts', () => {
    expect(isValidStateCode('PA')).toBe(true);
    expect(isValidStateCode('DC')).toBe(true);
    expect(isValidStateCode('PR')).toBe(true);
    expect(isValidStateCode('AE')).toBe(true);
    expect(isValidStateCode('AP')).toBe(true);
  });

  it('is case and whitespace tolerant, since preparers type these by hand', () => {
    expect(isValidStateCode('pa')).toBe(true);
    expect(isValidStateCode(' Pa ')).toBe(true);
  });

  it('rejects codes that are not on the MeF list', () => {
    expect(isValidStateCode('ZZ')).toBe(false);
    expect(isValidStateCode('Pennsylvania')).toBe(false);
    expect(isValidStateCode('')).toBe(false);
  });

  it('publishes the full code set', () => {
    expect(US_STATE_CODES.has('WY')).toBe(true);
    expect(US_STATE_CODES.has('ZZ')).toBe(false);
  });
});

describe('isValidPin', () => {
  it('accepts exactly the requested number of digits', () => {
    expect(isValidPin('12345', 5)).toBe(true);
    expect(isValidPin('123456', 6)).toBe(true);
    expect(isValidPin('00001', 5)).toBe(true);
  });

  it('rejects the wrong length, non-digits and an all-zero PIN', () => {
    expect(isValidPin('1234', 5)).toBe(false);
    expect(isValidPin('123456', 5)).toBe(false);
    expect(isValidPin('12a45', 5)).toBe(false);
    expect(isValidPin('00000', 5)).toBe(false);
    expect(isValidPin('000000', 6)).toBe(false);
    expect(isValidPin('', 5)).toBe(false);
  });
});
