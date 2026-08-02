# AI usage policy

## AI must never

- Calculate tax liability or any tax-form value — the engines are deterministic code with versioned rules, and this is architectural, not aspirational: nothing in the calculation path can call a model.
- Determine final eligibility for a credit, deduction, or filing status.
- File, transmit, or approve a return autonomously, or modify a signed return.
- Receive unredacted taxpayer data through public AI APIs. Restricted-class data (docs/data-classification.md) never leaves the platform boundary for inference.

## AI may assist (with mandatory human review)

Document classification hints, OCR cleanup suggestions, plain-language explanations of diagnostics, missing-document checklists, inconsistency flags, drafts of client communications, and summaries of agency notices — provided the deployment uses either local models or a vendor under a data-processing agreement with redaction at the boundary.

Every AI-assisted output must be visibly labeled as a suggestion and pass through human confirmation before it affects a return (the OCR verification workflow is the template: extracted values are suggestions until a human verifies each field).

## Current implementation status

The shipped platform uses **no AI at runtime**. The OCR engine interface exists so a document-AI backend can be added under the rules above; the development engine is deterministic pattern matching.
