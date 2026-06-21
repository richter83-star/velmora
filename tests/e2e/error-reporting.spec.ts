import { test, expect } from '@playwright/test';
import { stubFonts } from './helpers';

declare global {
  interface Window {
    __VELMORA_ERRORS?: () => { kind: string; message: string }[];
  }
}

test('error reporting is opt-in: off by default, records only when enabled', async ({ page }) => {
  await stubFonts(page);
  await page.goto('/');

  // Default OFF: a runtime error is not recorded.
  await page.evaluate(() =>
    window.dispatchEvent(new ErrorEvent('error', { message: 'ignored-while-off' })),
  );
  let log = await page.evaluate(() => window.__VELMORA_ERRORS?.() ?? []);
  expect(log.length).toBe(0);

  // Enable via Settings.
  await page.locator('#btn-settings').click();
  await page.locator('#set-errors').click();
  await expect(page.locator('#set-errors')).toHaveAttribute('aria-checked', 'true');
  await page.locator('#btn-settings-back').click();

  // Now errors are recorded on-device.
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', { message: 'boom-xyz' })));
  log = await page.evaluate(() => window.__VELMORA_ERRORS?.() ?? []);
  expect(log.some((e) => e.message.includes('boom-xyz'))).toBe(true);

  // The setting persists across reload (and the buffer resets — on-device only).
  await page.reload();
  await page.locator('#btn-settings').click();
  await expect(page.locator('#set-errors')).toHaveAttribute('aria-checked', 'true');
});
