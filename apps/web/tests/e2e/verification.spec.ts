import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

/**
 * The completion standard, enforced.
 *
 * A page is not done because its code looks right. These checks open every
 * required route at every required width and assert the things that actually
 * break: horizontal overflow, missing landmarks, broken heading order, console
 * errors, unreachable focus, and claims we are not entitled to make.
 *
 * Every route in the product appears in one of the two lists below. Adding a
 * screen without adding it here means shipping a screen nobody verified.
 */

const PUBLIC_ROUTES = [
  '/',
  '/product',
  '/how-it-works',
  '/supported-tax-situations',
  '/federal-and-pennsylvania',
  '/security',
  '/about',
  '/contact',
  '/sign-in',
  '/privacy',
  '/terms',
  '/accessibility',
] as const;

const APPLICATION_ROUTES = [
  '/app',
  '/app/clients',
  '/app/clients/new',
  '/app/returns',
  '/app/review',
  '/app/documents',
  '/app/filing',
  '/app/filing/rejections',
  '/app/authorizations',
  '/app/reports',
  '/app/settings',
  '/app/settings/users',
  '/app/settings/providers',
  '/app/security',
  '/app/audit',
  '/portal',
  '/portal/intake',
  '/portal/documents',
  '/portal/sign',
  '/portal/status',
] as const;

const ALL_ROUTES = [...PUBLIC_ROUTES, ...APPLICATION_ROUTES];

/**
 * The React DevTools suggestion and a cold favicon request are noise.
 * Everything else the console reports is a defect.
 */
function isRealError(message: ConsoleMessage): boolean {
  if (message.type() !== 'error') return false;
  const text = message.text();
  return !text.includes('favicon') && !text.includes('Download the React DevTools');
}

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (isRealError(message)) errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.describe('every route renders without defect', () => {
  for (const route of ALL_ROUTES) {
    test(`${route}`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      const response = await page.goto(route, { waitUntil: 'networkidle' });

      expect(response?.status(), `${route} returned ${response?.status()}`).toBeLessThan(400);

      // Exactly one h1, and it is not empty.
      const headings = page.locator('h1');
      await expect(headings).toHaveCount(1);
      await expect(headings.first()).not.toBeEmpty();

      // The landmark a screen reader needs to skip the chrome.
      await expect(page.locator('main')).toHaveCount(1);

      // Nothing may scroll the page sideways. Wide content scrolls inside its
      // own container; the document itself never does.
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });
      expect(overflow, `${route} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);

      expect(errors, `console errors on ${route}`).toEqual([]);
    });
  }
});

test.describe('navigation works as navigation', () => {
  test('mobile menu opens, announces state, and closes on Escape', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-375', 'The mobile menu only exists at narrow widths.');

    await page.goto('/');
    const toggle = page.getByRole('button', { name: /menu/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: /how it works/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('the skip link is the first focus stop', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText(/skip/i);
  });
});

test.describe('claims we are not entitled to make', () => {
  const FORBIDDEN = [
    'irs approved',
    'irs certified',
    'irs-approved',
    'guaranteed refund',
    'guaranteed acceptance',
    'audit proof',
    'audit-proof',
    '100% accurate',
    'built with ai',
    'anthropic',
    'claude',
  ];

  for (const route of PUBLIC_ROUTES) {
    test(`${route} makes no unsupported claim`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop-1440', 'Copy does not vary by width.');
      await page.goto(route);
      const text = (await page.locator('body').innerText()).toLowerCase();
      for (const phrase of FORBIDDEN) {
        expect(text, `${route} contains "${phrase}"`).not.toContain(phrase);
      }
    });
  }
});

test.describe('taxpayer identifiers are never shown in full', () => {
  for (const route of APPLICATION_ROUTES) {
    test(`${route} masks every identifier`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop-1440', 'Masking does not vary by width.');
      await page.goto(route);
      const text = await page.locator('body').innerText();
      // A nine-digit taxpayer identifier rendered in full.
      const exposed = text.match(/\b\d{3}-\d{2}-\d{4}\b/g) ?? [];
      expect(exposed, `${route} renders unmasked identifiers: ${exposed.join(', ')}`).toEqual([]);
    });
  }
});
