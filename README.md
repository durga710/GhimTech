<div align="center">

<img src="apps/web/src/app/icon.svg" width="72" height="72" alt="GhimTech Tax" />

# GhimTech Tax

**Federal and Pennsylvania tax preparation, diagnostics, and electronic filing.**

Built by GhimTech.

</div>

---

## What this is

Professional tax preparation software for a practice: guided taxpayer intake, source-document
handling, Federal Form 1040 and Pennsylvania PA-40 preparation, a diagnostics engine that catches
defects before transmission, reviewer sign-off, electronic authorization, and a client portal the
taxpayer actually uses.

The organising idea is that **a return should fail in your office, not at the gateway**. Most of the
engineering here goes into finding problems early — while the preparer still has the client on the
phone — rather than into transmitting fast and reconciling rejections later.

## Repository layout

```
ghimtech-tax/
├── apps/
│   └── web/                      Next.js application — public site, preparer
│                                 workspace, reviewer queue, client portal
└── packages/
    └── tax-engine-federal/       Form 1040 domain model + diagnostics engine
```

A pnpm workspace driven by Turborepo. Node 22+, pnpm 10+.

## The diagnostics engine

`packages/tax-engine-federal` is the core of the product and is independently testable — it has no
dependency on the web application, a database, or a network.

```ts
import { runDiagnostics, summarizeDiagnostics } from '@ghimtech-tax/tax-engine-federal';

const report = runDiagnostics(federalReturn, { asOfDate: '2026-03-01' });

report.eFileEligible;  // false when anything blocking remains
report.blockingCount;  // rejects + errors
summarizeDiagnostics(report);
// "2 rejects, 1 error, 3 warnings — not eligible for e-file"
```

Every finding carries a stable code, the form it belongs to, the field it points at, the authority
behind it, and — where one exists — the IRS Modernized e-File business rule it anticipates:

```
GT-BANK-002  reject   R0000-058-01
  The routing number 021000022 fails the ABA check-digit test.
  → refund.account.routingNumber
```

**Severity levels.** `reject` — the MeF gateway will refuse the transmission. `error` — the return is
internally inconsistent or arithmetically wrong. `warning` — a probable data-entry defect worth a
second look. `informational` — an election or opportunity worth the preparer's attention. The first
two block filing; the last two do not.

**Coverage today:** 55 rules across taxpayer identity, filing status and dependents, W-2 and totals
reconciliation, credit eligibility, banking, and e-file signature mechanics. 184 tests, 94.7%
statement and 90.1% branch coverage.

Rules are pure functions over a return. Adding one means adding a `DiagnosticRule` to a module under
`src/diagnostics/rules/` and registering it — the engine handles severity stamping, suppression,
ordering, and isolating a rule that throws so one bad rule cannot take down the whole report.

## Getting started

```bash
pnpm install
pnpm dev                                        # everything
pnpm --filter @ghimtech-tax/web dev             # the application, on :3100
pnpm --filter @ghimtech-tax/tax-engine-federal test
```

| Command | What it does |
| --- | --- |
| `pnpm build` | Build every package and app |
| `pnpm typecheck` | TypeScript across the workspace |
| `pnpm test` | Unit and integration tests |
| `pnpm verify` | Format check, lint, typecheck, test — run before opening a PR |
| `pnpm --filter @ghimtech-tax/web test:e2e` | Playwright, every route at 375 / 768 / 1024 / 1440 / 1920 |

## Accuracy and compliance

This section is deliberately at the top level rather than buried, because the claims a tax product
makes about itself matter as much as its code.

- **Tax-year parameters require reconciliation.** The figures in
  `packages/tax-engine-federal/src/constants/ty2025.ts` — the Social Security wage base, standard
  deduction table, credit thresholds — are copied published parameters. Each must be reconciled line
  by line against the IRS source of record (the applicable Rev. Proc., the Form 1040 instructions for
  the year, the SSA wage-base announcement) before the software is used to prepare a live return, and
  the reconciliation recorded in the release checklist.
- **IRS business rule identifiers require reconciliation.** Rules cite MeF business rules such as
  `R0000-500-01` to explain *why* a finding would be rejected. The MeF business-rules release changes
  every filing season and the citations must be re-checked against the current release.
- **No authorization is claimed.** GhimTech Tax does not describe itself as IRS approved, IRS
  certified, or an Authorized e-file Provider anywhere in this repository or in the product
  interface. Those statements may only appear after the corresponding authorization is granted in
  writing. The same applies to security certifications.
- **No guarantees.** The product does not promise refund amounts, filing acceptance, accuracy, or
  audit outcomes.

A test in the web application asserts these prohibitions against the rendered public pages, so a
forbidden claim fails the build rather than reaching production.

## Handling taxpayer data

- Taxpayer identification numbers are **never rendered in full** in any interface, log, or support
  view. They are masked to `***-**-6789` at the presentation layer, and an end-to-end test asserts
  that no unmasked identifier appears on any authenticated route.
- Monetary amounts are integer cents throughout. Floating-point dollars produce off-by-a-penny
  totals, and a return that is off by a penny fails gateway totals-consistency checks.
- Calendar dates are plain `YYYY-MM-DD` strings compared by component, never timestamps — so no time
  zone can shift a date of birth across a year boundary and silently change a taxpayer's age, and
  with it their credit eligibility.

## Security

Please do not open a public issue for a security problem. See [SECURITY.md](SECURITY.md) for how to
report one privately.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: every rule needs a test that drives its exact code,
every screen needs its loading, empty, error and success states, and no claim ships that the company
cannot substantiate.

---

<div align="center">
<sub>GhimTech Tax — Built by GhimTech</sub>
</div>
