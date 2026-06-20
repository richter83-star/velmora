import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors } from './helpers';

test('the Almanac opens from the title, lists the systems, and closes back', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');

  await page.locator('#btn-codex').click();
  await expect(page.locator('#screen-codex.active')).toBeVisible();

  // Multiple reference sections render.
  expect(
    await page.locator('#codex-mount .cdx-sec').count(),
    'codex has several sections',
  ).toBeGreaterThanOrEqual(5);

  // Data-driven cards for factions (3/path), advisors (4/path), and traits (4).
  expect(
    await page.locator('#codex-mount .cdx-card').count(),
    'codex lists factions, advisors, and traits',
  ).toBeGreaterThanOrEqual(18);

  // Back returns to the title and the Almanac button is re-focused.
  await page.locator('#btn-codex-back').click();
  await expect(page.locator('#screen-title.active')).toBeVisible();
  await expect(page.locator('#btn-codex')).toBeFocused();

  expect(errors, `errors:\n${errors.join('\n')}`).toEqual([]);
});
