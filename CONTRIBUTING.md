# Contributing to GhimTech Tax

## Before you start

```bash
pnpm install
pnpm verify     # format check, lint, typecheck, test — the same gate CI runs
```

Node 22+, pnpm 10+.

## The rules that are actually enforced

**A diagnostic rule needs a test that drives its exact code.** Not "the engine returns findings" — a
test that constructs a return with one specific defect and asserts that `GT-W2-004` fires and its
neighbours do not. A rule with no test is a rule nobody can safely change later.

**A screen is not finished until it has four states.** Loading, empty, error, and success. An empty
client list that says "no data" and nothing else has told the preparer nothing they had not already
worked out — give them the next action.

**No claim ships that the company cannot substantiate.** "IRS approved", "IRS certified",
"Authorized e-file Provider", "guaranteed refund", "guaranteed acceptance", "audit proof", "100%
accurate", and security certification badges are prohibited until the corresponding authorization
exists in writing. Where a trust claim needs a fact we do not have, describe the mechanism instead.
An end-to-end test asserts these phrases are absent from every public page, so a forbidden claim
fails the build.

**A taxpayer identification number is never rendered in full.** Mask to `***-**-6789` everywhere,
including tables, drawers, logs, and support views. This is also covered by a test.

**Money is integer cents. Dates are `YYYY-MM-DD` strings.** Never floating-point dollars, never a
timestamp for a calendar date. Both rules exist because the alternative silently produces wrong
returns rather than loud failures.

## Tax-year parameters

Figures in `packages/tax-engine-federal/src/constants/ty2025.ts` are copied published parameters.
Changing one means citing the IRS source of record in the pull request — the applicable Rev. Proc.,
the Form 1040 instructions for that year, or the SSA wage-base announcement. A threshold changed
without a citation will be sent back.

The same applies to the MeF business rule identifiers cited by diagnostics. They change every filing
season.

## Adding a diagnostic rule

1. Pick the module under `packages/tax-engine-federal/src/diagnostics/rules/` that owns the subject.
2. Declare a `DiagnosticRule` with a stable `GT-`-prefixed code, its severity, the form it belongs
   to, and the authority behind it. Cite `irsBusinessRule` only when you are confident the rule
   exists in the current MeF release — a wrong citation is worse than none.
3. Return `DiagnosticFinding[]`. The engine stamps identity, applies suppression, sorts, and
   isolates a rule that throws, so a rule only has to answer one question.
4. Add it to the array exported at the bottom of the module. Codes are asserted unique at module
   load; a duplicate throws rather than silently breaking suppression.
5. Write the test.

## Commits and pull requests

Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`.

A pull request should say what changed, why, and how it was verified. If it touches a screen, say
which widths you checked — 375, 768, 1024, 1440 and 1920 are the supported set. If it touches a tax
rule, cite the authority.

`pnpm verify` must pass before review.
