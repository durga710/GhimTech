/** Federal filing statuses. */
export const FILING_STATUSES = [
  "SINGLE",
  "MARRIED_FILING_JOINTLY",
  "MARRIED_FILING_SEPARATELY",
  "HEAD_OF_HOUSEHOLD",
  "QUALIFYING_SURVIVING_SPOUSE",
] as const;
export type FilingStatus = (typeof FILING_STATUSES)[number];

/** Pennsylvania residency status for the tax year. */
export const PA_RESIDENCY_STATUSES = [
  "FULL_YEAR_RESIDENT",
  "PART_YEAR_RESIDENT",
  "NONRESIDENT",
] as const;
export type PaResidencyStatus = (typeof PA_RESIDENCY_STATUSES)[number];

/** Relationship of a dependent to the taxpayer. */
export const DEPENDENT_RELATIONSHIPS = [
  "SON",
  "DAUGHTER",
  "STEPCHILD",
  "FOSTER_CHILD",
  "BROTHER",
  "SISTER",
  "HALF_BROTHER",
  "HALF_SISTER",
  "STEPBROTHER",
  "STEPSISTER",
  "PARENT",
  "GRANDPARENT",
  "GRANDCHILD",
  "NIECE",
  "NEPHEW",
  "AUNT",
  "UNCLE",
  "OTHER",
] as const;
export type DependentRelationship = (typeof DEPENDENT_RELATIONSHIPS)[number];

/** User roles. Mirrored in the database as an enum. */
export const ROLES = ["ADMIN", "PREPARER", "REVIEWER", "CLIENT", "AUDITOR"] as const;
export type Role = (typeof ROLES)[number];

/** Supported document categories for the vault and OCR pipeline. */
export const DOCUMENT_CATEGORIES = [
  "W2",
  "FORM_1099_INT",
  "FORM_1099_DIV",
  "FORM_1099_NEC",
  "FORM_1099_MISC",
  "FORM_1099_R",
  "SSA_1099",
  "FORM_1098",
  "FORM_1098_T",
  "FORM_1095_A",
  "PRIOR_YEAR_RETURN",
  "DRIVER_LICENSE",
  "STATE_ID",
  "SOCIAL_SECURITY_CARD",
  "CHILDCARE_STATEMENT",
  "ESTIMATED_PAYMENT_RECORD",
  "BUSINESS_RECORDS",
  "BANK_INFORMATION",
  "RECEIPT",
  "PA_TAX_DOCUMENT",
  "OTHER",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

/** Jurisdictions supported in the first release. */
export const JURISDICTIONS = ["FEDERAL", "PENNSYLVANIA"] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];

/** Bank account types for direct deposit / direct debit. */
export const BANK_ACCOUNT_TYPES = ["CHECKING", "SAVINGS"] as const;
export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[number];
