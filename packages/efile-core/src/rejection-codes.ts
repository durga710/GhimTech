/**
 * Human-readable explanations and corrective actions for common rejection
 * codes. Codes not in this table are shown verbatim with a generic
 * corrective-action prompt — never hidden.
 */

export interface RejectionExplanation {
  code: string;
  explanation: string;
  correctiveAction: string;
}

const EXPLANATIONS: Record<string, RejectionExplanation> = {
  "IND-031-04": {
    code: "IND-031-04",
    explanation:
      "The prior-year adjusted gross income used to verify the taxpayer's identity does not match IRS records.",
    correctiveAction:
      "Confirm the prior-year AGI or prior-year self-select PIN with the client, correct it, and resubmit.",
  },
  "IND-032-04": {
    code: "IND-032-04",
    explanation: "The prior-year AGI or PIN for the spouse does not match IRS records.",
    correctiveAction: "Confirm the spouse's prior-year AGI or PIN, correct it, and resubmit.",
  },
  "IND-181-01": {
    code: "IND-181-01",
    explanation: "The taxpayer's Identity Protection PIN (IP PIN) is missing.",
    correctiveAction: "Obtain the taxpayer's six-digit IP PIN and include it before resubmitting.",
  },
  "IND-516-02": {
    code: "IND-516-02",
    explanation:
      "The primary taxpayer's SSN has already been used as a dependent on another accepted return.",
    correctiveAction:
      "Verify the taxpayer's dependency status. If they can be claimed by someone else, mark the return accordingly; otherwise a paper return with documentation may be required.",
  },
  "R0000-500-01": {
    code: "R0000-500-01",
    explanation:
      "The primary taxpayer's name and SSN do not match Social Security Administration records.",
    correctiveAction:
      "Verify spelling of the legal name and the SSN against the Social Security card, correct, and resubmit.",
  },
  "R0000-504-02": {
    code: "R0000-504-02",
    explanation: "A dependent's name and SSN do not match Social Security Administration records.",
    correctiveAction:
      "Verify each dependent's name and SSN against their Social Security card, correct, and resubmit.",
  },
  "R0000-902-01": {
    code: "R0000-902-01",
    explanation:
      "A return with this taxpayer identification number has already been accepted for this tax year (possible duplicate filing or identity theft).",
    correctiveAction:
      "Confirm the client has not already filed. If they have not, follow the identity-theft procedure (Form 14039) and file on paper.",
  },
  "SEIC-F1040-501-02": {
    code: "SEIC-F1040-501-02",
    explanation:
      "A qualifying child claimed for the EITC does not match SSA records for name, SSN, or birth year.",
    correctiveAction: "Verify the child's name, SSN, and date of birth, correct, and resubmit.",
  },
  "F8962-070": {
    code: "F8962-070",
    explanation:
      "IRS records show Marketplace insurance (Form 1095-A) but the return has no premium tax credit reconciliation.",
    correctiveAction:
      "Obtain the client's Form 1095-A. Marketplace reconciliation is not supported in this release — the return must be completed outside the platform or held until support lands.",
  },
  "PA-001": {
    code: "PA-001",
    explanation: "Pennsylvania could not match the taxpayer's identity.",
    correctiveAction: "Verify name, SSN, and address against PA records and resubmit.",
  },
};

export function explainRejection(code: string): RejectionExplanation {
  return (
    EXPLANATIONS[code] ?? {
      code,
      explanation: `The filing agency rejected the submission with code ${code}.`,
      correctiveAction:
        "Review the full rejection text from the provider, correct the identified issue, and resubmit. Add this code to the rejection dictionary once understood.",
    }
  );
}

export function knownRejectionCodes(): string[] {
  return Object.keys(EXPLANATIONS);
}
