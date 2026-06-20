import { test, expect } from '@playwright/test';
import { stubFonts, captureErrors, startCareer, playToEnding } from './helpers';

const PATHS = ['ballot', 'vanguard'] as const;

for (const path of PATHS) {
  test(`plays the ${path} path to an ending with zero console/runtime errors`, async ({ page }) => {
    const errors = captureErrors(page);
    await stubFonts(page);
    await page.addInitScript(() => {
      window.__VELMORA_SEED = `velmora-smoke-${location.hash || 'x'}`;
    });

    await page.goto('/');
    await expect(page.locator('#screen-title.active')).toBeVisible();

    await startCareer(page, path);
    const rank = await playToEnding(page);

    expect(rank.length, 'ending should display a rank').toBeGreaterThan(0);
    expect(
      await page.locator('#over-mount .epi-beat').count(),
      'ending should show personalized epilogue beats',
    ).toBeGreaterThan(0);
    expect(errors, `errors during ${path} run:\n${errors.join('\n')}`).toEqual([]);
  });
}

test('renders the title screen with the emblem and both path choices', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');
  await expect(page.locator('#btn-new')).toBeVisible();
  await page.locator('#btn-new').click();
  await expect(page.locator('.path-card[data-path="ballot"]')).toBeVisible();
  await expect(page.locator('.path-card[data-path="vanguard"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the headline ticker renders fictional flavor news on the game screen', async ({ page }) => {
  const errors = captureErrors(page);
  await stubFonts(page);
  await page.goto('/');
  await startCareer(page, 'ballot');
  const items = page.locator('#ticker .tk-item');
  await expect(items.first()).toBeVisible();
  expect(await items.count(), 'ticker should show several headlines').toBeGreaterThan(3);
  expect(errors).toEqual([]);
});
