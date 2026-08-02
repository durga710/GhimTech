# Pennsylvania rules — tax year 2025 (rule version 2025.1)

Configuration lives in `packages/tax-year-config/src/pennsylvania-2025.ts`. Sources: 72 P.S. § 7302 (3.07% rate), the 2025 PA-40 instruction booklet, and the PA Schedule SP instructions.

> **Verification checklist**: re-verify against the final 2025 PA-40 booklet before filing season; bump `ruleVersion` on any change.

## Values in force

- **Rate**: flat **3.07%** on the sum of positive income classes. No standard deduction, no exemptions. A loss in one class never offsets another.
- **Supported classes**: compensation (W-2 box 16 PA wages), interest (1099-INT box 1; US-government interest exempt), dividends (1099-DIV box 1a **plus** box 2a capital-gain distributions per PA Schedule B treatment), net profits from business.
- **Not PA-taxable**: Social Security, unemployment compensation, distributions from PA-eligible retirement plans.
- **Tax forgiveness (Schedule SP)**: 100% forgiveness at eligibility income ≤ $6,500 (single) / $13,000 (married), + $9,500 per dependent; decreasing 10 percentage points per $250 (or part) over. Eligibility income = PA taxable income + captured nontaxable income. Married filers use joint eligibility income.
- **Payments**: PA withholding (W-2 box 17, 1099-R box 14), estimated payments, prior-year overpayment applied.
- **Local EIT**: PSD code and school district captured for the client's local filing obligation; a missing PSD code raises a warning. Local tax is not calculated in this release.

## Architecture present, not yet filable (blocking diagnostics)

Part-year resident and nonresident returns (modeled in the residency status and date fields; blocked from filing); PA Schedule D net gains class (always zero with the federal Schedule D gap); non-eligible retirement plan distributions (manual PA taxability determination required); multi-state W-2s; federally tax-exempt interest triggers a verification warning (out-of-state municipal interest is PA-taxable).
