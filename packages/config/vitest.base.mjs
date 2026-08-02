import { defineConfig } from "vitest/config";

export const baseTestConfig = defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});

export default baseTestConfig;
