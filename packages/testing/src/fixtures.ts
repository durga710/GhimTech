/**
 * Synthetic taxpayer fixtures.
 *
 * Every identity here is fabricated. SSN references are opaque fixture tokens,
 * names are obviously synthetic, and amounts are chosen to exercise specific
 * rules. Real taxpayer data must never appear in fixtures or tests.
 */
import {
  type Dependent,
  type TaxReturnModel,
  type TaxpayerIdentity,
  type W2Income,
  emptyReturnModel,
} from "@ghimtech/tax-domain";

const D = 100; // dollars → cents

export function fixtureIdentity(overrides: Partial<TaxpayerIdentity> = {}): TaxpayerIdentity {
  return {
    name: { firstName: "Avery", lastName: "Testcase" },
    ssnRef: "fixture-ssn-taxpayer",
    ssnLast4: "0001",
    dateOfBirth: "1985-06-15",
    isBlind: false,
    ...overrides,
  };
}

export function fixtureSpouse(overrides: Partial<TaxpayerIdentity> = {}): TaxpayerIdentity {
  return {
    name: { firstName: "Jordan", lastName: "Testcase" },
    ssnRef: "fixture-ssn-spouse",
    ssnLast4: "0002",
    dateOfBirth: "1986-03-20",
    isBlind: false,
    ...overrides,
  };
}

export function fixtureChild(overrides: Partial<Dependent> = {}): Dependent {
  return {
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
    qualifiesForDependentCare: true,
    ...overrides,
  };
}

export function fixtureW2(overrides: Partial<W2Income> = {}): W2Income {
  const wages = overrides.wages ?? 60_000 * D;
  return {
    id: "w2-1",
    employerName: "Synthetic Employer LLC",
    employerEin: "00-0000000",
    wages,
    federalWithholding: 6_000 * D,
    socialSecurityWages: wages,
    medicareWages: wages,
    stateWages: wages,
    stateWithholding: Math.round(wages * 0.0307),
    stateCode: "PA",
    localWithholding: 0,
    belongsToSpouse: false,
    ...overrides,
  };
}

/** A baseline single filer with one W-2, PA full-year resident. */
export function singleW2Return(overrides: Partial<TaxReturnModel> = {}): TaxReturnModel {
  const model = emptyReturnModel({
    returnId: "fixture-return-1",
    taxYear: 2025,
    filingStatus: "SINGLE",
    taxpayer: fixtureIdentity(),
    address: { line1: "100 Synthetic St", city: "Harrisburg", state: "PA", zip: "17101" },
  });
  model.w2s = [fixtureW2()];
  model.eitc = { claiming: true, disqualified: false };
  model.pennsylvania = {
    residencyStatus: "FULL_YEAR_RESIDENT",
    schoolDistrict: "Harrisburg SD",
    psdCode: "220402",
    claimTaxForgiveness: true,
    spEligibilityOtherIncome: 0,
  };
  return { ...model, ...overrides };
}

/** Married filing jointly with two W-2s and two children. */
export function mfjFamilyReturn(overrides: Partial<TaxReturnModel> = {}): TaxReturnModel {
  const model = singleW2Return();
  model.filingStatus = "MARRIED_FILING_JOINTLY";
  model.spouse = fixtureSpouse();
  model.w2s = [
    fixtureW2({ id: "w2-1", wages: 70_000 * D, federalWithholding: 7_500 * D }),
    fixtureW2({
      id: "w2-2",
      wages: 45_000 * D,
      federalWithholding: 4_000 * D,
      belongsToSpouse: true,
      employerName: "Second Synthetic Inc",
    }),
  ];
  model.dependents = [
    fixtureChild(),
    fixtureChild({
      name: { firstName: "Casey", lastName: "Testcase" },
      ssnRef: "fixture-ssn-child-2",
      ssnLast4: "0004",
      dateOfBirth: "2020-09-01",
    }),
  ];
  return { ...model, ...overrides };
}
