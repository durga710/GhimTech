# ADR 0002 — Integer cents everywhere; printed-table emulation

**Status**: accepted · **Date**: 2026-08-02

## Decision

All money is integer cents; form lines round to whole dollars with IRS rounding (≥ 50¢ up) at each worksheet line. Below $100,000 the federal engine computes tax by emulating the printed Tax Table's generation rule (midpoint of $25/$50 ranges) rather than applying the rate schedule directly; the EITC uses the published table's $50-midpoint rule the same way.

## Rationale

Floating point cannot appear in a tax calculation (rule: reproducibility). Rate application uses fixed-precision integer math (`multiplyRate` scales rates to micro-units). Emulating the printed tables matters because the IRS requires table lookup below $100k and the table's midpoint construction differs from the continuous formula by up to a few dollars — an engine that "computes correctly" but disagrees with the published table produces returns that don't match what the agency expects.

## Consequences

Engine tests assert exact hand-computed dollar values; any rule change is visible as a test diff plus a `ruleVersion` bump. Rounding-order choices are documented in worksheet code and locked by regression tests.
