# ESLint CLI Tooling Design

## Context

The app is a Next.js 15.5.18 App Router project using TypeScript, Tailwind, and npm. `npm run type-check` passes, but `npm run lint` currently runs `next lint`, which is deprecated and opens an interactive setup prompt because no ESLint config exists. That makes linting unsuitable for automation and weakens the local quality gate.

## Goal

Restore non-interactive linting with the ESLint CLI while staying aligned with the installed Next.js version and preparing the project for Next.js 16, where `next lint` is removed.

## Approach

Add a root `eslint.config.mjs` flat config. Because the installed `eslint-config-next@15.5.18` exposes its recommended configs as legacy shareable configs, bridge them through ESLint's `FlatCompat`. Extend `next/core-web-vitals` and `next/typescript`, then preserve the standard generated-output ignores.

Update `package.json` so `npm run lint` executes `eslint .`. Add `@eslint/eslintrc` as a direct dev dependency because `eslint.config.mjs` imports it.

## Files

- `eslint.config.mjs`: new ESLint flat config.
- `package.json`: replace the lint script and declare `@eslint/eslintrc`.
- `package-lock.json`: reflect the direct dev dependency.
- `docs/superpowers/plans/2026-06-08-eslint-cli.md`: implementation plan.

## Verification

Run `npm run lint` to confirm it is non-interactive and exits cleanly. Run `npm run type-check` to confirm the tooling change does not affect TypeScript validity.

## Scope

This change does not introduce new application behavior, change UI, or refactor source files except for any lint fixes required to make the new command pass.
