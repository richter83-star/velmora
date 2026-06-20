import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors } from './helpers';

test('settings: toggles apply, persist across reload, and are keyboard-operable', async ({
  page,
}) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  // Opens from the title.
  await page.locator('#btn-settings').click();
  await expect(page.locator('#screen-settings.active')).toBeVisible();

  // Reduce motion: switch flips and the body class is applied.
  const reduce = page.locator('#set-reduce');
  await expect(reduce).toHaveAttribute('aria-checked', 'false');
  await reduce.click();
  await expect(reduce).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('body')).toHaveClass(/force-reduce-motion/);

  // High contrast is keyboard-operable (role=switch, Space toggles).
  const high = page.locator('#set-high');
  await high.focus();
  await page.keyboard.press(' ');
  await expect(high).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('body')).toHaveClass(/high-contrast/);

  // Persists across a reload (localStorage/in-memory fallback).
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/force-reduce-motion/);
  await expect(page.locator('body')).toHaveClass(/high-contrast/);

  // Back returns to the title and re-focuses the Settings button.
  await page.locator('#btn-settings').click();
  await page.locator('#btn-settings-back').click();
  await expect(page.locator('#screen-title.active')).toBeVisible();
  await expect(page.locator('#btn-settings')).toBeFocused();

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
