import { defineConfig } from 'vitest/config';

/**
 * Test configuration for the federal engine.
 *
 * The coverage floor is set at 80% across all four measures rather than lines
 * alone. A diagnostics package is almost entirely branches — every rule is a
 * decision — so line coverage on its own would report a comfortable number
 * while whole classes of finding went untested.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // index.ts and types.ts are re-exports and type declarations with no
      // executable statement between them. Counting them would report a 0%
      // row that no test could ever raise, and invite someone to write a
      // meaningless test to clear it.
      exclude: ['src/**/*.test.ts', 'src/index.ts', 'src/types.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
