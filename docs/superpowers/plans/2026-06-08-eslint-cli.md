# ESLint CLI Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the deprecated interactive `next lint` flow with a non-interactive ESLint CLI command.

**Architecture:** Add a root flat ESLint config that bridges the installed Next.js 15 legacy configs through `FlatCompat`. Keep the script and dependency changes small so linting becomes automatable without changing application behavior.

**Tech Stack:** Next.js 15.5.18, ESLint 9.39.4, eslint-config-next 15.5.18, TypeScript, npm.

---

### Task 1: Add ESLint Flat Config

**Files:**
- Create: `eslint.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add the direct compat dependency**

Run: `npm install --save-dev @eslint/eslintrc@^3.3.5`

Expected: `package.json` includes `@eslint/eslintrc` in `devDependencies`, and `package-lock.json` is updated without changing runtime dependencies.

- [ ] **Step 2: Create `eslint.config.mjs`**

Use this file content:

```js
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);
```

- [ ] **Step 3: Update the lint script**

Change `package.json`:

```json
"lint": "eslint ."
```

Expected: `npm run lint` uses ESLint CLI directly and never opens the Next.js setup prompt.

- [ ] **Step 4: Verify lint**

Run: `npm run lint`

Expected: the command exits successfully. If lint reports source issues, fix only the blocking lint issues introduced or revealed by enabling the command.

- [ ] **Step 5: Verify TypeScript**

Run: `npm run type-check`

Expected: the command exits successfully.

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/superpowers/specs/2026-06-08-eslint-cli-design.md docs/superpowers/plans/2026-06-08-eslint-cli.md eslint.config.mjs package.json package-lock.json
git commit -m "chore: migrate lint to eslint cli"
```

Expected: one commit records the tooling repair.
