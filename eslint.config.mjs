import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import next from "@next/eslint-plugin-next";
export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/.next/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    settings: { next: { rootDir: fileURLToPath(new URL("./apps/web", import.meta.url)) } },
    languageOptions: { globals: { URL: "readonly" } },
    plugins: { "@next/next": next },
    rules: { ...next.configs.recommended.rules, ...next.configs["core-web-vitals"].rules },
  },
);
