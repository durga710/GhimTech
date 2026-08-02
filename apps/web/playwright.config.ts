import { defineConfig, devices } from '@playwright/test';

/**
 * Visual and behavioural verification.
 *
 * The suite runs against a real production build rather than the dev server:
 * the dev overlay hides layout defects behind its own chrome, and the
 * unminified development output masks the loading behaviour we actually ship.
 *
 * The five projects below are the exact widths the product is required to
 * support. They are separate projects rather than one parameterised test so a
 * failure names the width it failed at.
 */
const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : [['list']],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'mobile-375',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'laptop-1024',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'wide-1920',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],

  webServer: {
    command: 'pnpm build && pnpm start',
    url: baseURL,
    timeout: 240_000,
    reuseExistingServer: !process.env['CI'],
  },
});
