# Federal rules — tax year 2025 (rule version 2025.1)

Configuration lives in `packages/tax-year-config/src/federal-2025.ts`. Sources: Rev. Proc. 2024-40 (2025 inflation adjustments) as modified by Public Law 119-21 (July 2025 — standard deduction, child tax credit, and SALT-cap changes effective 2025), and the 2025 Form 1040 instruction set.

> **Verification checklist**: before the 2025 filing season opens, every value below must be re-verified line-by-line against the final published IRS instructions and the config's `ruleVersion` bumped if anything changes. Calculation snapshots record the rule version used.

## Values in force

- **Standard deduction**: Single/MFS $15,750 · MFJ/QSS $31,500 · HoH $23,625. Additional (each instance of 65+/blind): $1,600 married, $2,000 unmarried. Dependent limitation: greater of $1,350 or earned income + $450, capped at the normal amount.
- **Brackets**: seven rates 10–37% with 2025 thresholds per status (see config).
- **Tax computation**: printed Tax Table emulation below $100,000 (midpoint-of-range rule: $25 ranges under $3,000, $50 ranges to $100,000), Tax Computation Worksheet above. Preferential 0/15/20% rates via the Qualified Dividends and Capital Gain Tax Worksheet (2025 breakpoints in config).
- **Child Tax Credit**: $2,200 per qualifying child under 17; ODC $500; phase-out $50 per $1,000 over $200k/$400k MFJ; ACTC refundable up to $1,700 per child, limited to 15% of earned income over $2,500.
- **EITC**: 2025 parameters (earned income amounts $8,490/$12,730/$17,880; rates 7.65/34/40/45%; phase-out 7.65/15.98/21.06/21.06% from $10,620–$23,350, +$7,110 MFJ; investment income limit $11,950). Computed with the published table's $50-midpoint generation rule. Age 25–64 test without children; MFS ineligible.
- **Education**: AOTC (100% of first $2,000 + 25% of next $2,000; 40% refundable; 4-year and half-time gates) and LLC (20% of up to $10,000), shared MAGI phase-out $80–90k / $160–180k MFJ; MFS ineligible.
- **Dependent care credit**: 20–35% of up to $3,000/$6,000, limited by lower-earning spouse's earned income.
- **Self-employment**: Schedule SE at 92.35% × 15.3%/2.9% with the $176,100 wage base; half-SE-tax adjustment; Form 8995 simplified QBI (20%) below the $197,300/$394,600 threshold.
- **Social Security taxability**: 50%/85% provisional-income worksheet ($25k/$34k; $32k/$44k MFJ).
- **Other taxes**: Additional Medicare 0.9% over $200k/$250k/$125k; NIIT 3.8%; 10% early-distribution tax (code 1).
- **Itemized (Schedule A)**: medical over 7.5% AGI; SALT capped at $40,000 ($20,000 MFS); mortgage interest; charitable cash limited to 60% AGI.

## Unsupported for 2025 (blocking diagnostics)

Schedule C losses or complex businesses (inventory, depreciation, employees, accrual); Form 8995-A QBI (above-threshold); marketplace insurance / Form 8962 reconciliation; non-cash charitable > $500 (Form 8283); mortgage principal above the interest-deduction limit; SALT phase-down incomes (> $500k with itemizing); MFS with Social Security benefits; capital gains beyond 1099-DIV distributions (no Schedule D); unresolved 1099-R box 2a; tax years other than 2025.
